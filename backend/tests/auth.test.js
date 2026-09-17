/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 */
const request = require("supertest");
const app = require("../server");
const db = require("../app/models");
const { encrypt } = require("../app/authentication/crypto");

const User = db.user;
const Session = db.session;

function basicAuth(email, password) {
  return `Basic ${Buffer.from(`${email}:${password}`).toString("base64")}`;
}

function uniqueEmail(label) {
  return `${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
}

async function registerUser(overrides = {}) {
  const payload = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: uniqueEmail("user"),
    password: "secure-password",
    ...overrides,
  };
  const res = await request(app).post("/recipeapi/users/").send(payload);
  return { payload, res };
}

/** Fail fast if a handler throws without sending an HTTP response. */
function withResponseTimeout(requestPromise, ms = 5000) {
  return Promise.race([
    requestPromise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Timed out after ${ms}ms waiting for HTTP response (handler may have thrown without sending a status)`
            )
          ),
        ms
      )
    ),
  ]);
}

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 1 — User Authentication & Session Management", () => {
  describe("US-1.1 — Create an account", () => {
    it("Successfully create an account", async () => {
      const email = uniqueEmail("register-ok");
      const res = await request(app).post("/recipeapi/users/").send({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password: "secure-password",
      });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        email,
        firstName: "Ada",
        lastName: "Lovelace",
      });
      expect(res.body.id).toEqual(expect.any(Number));
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.password).toBeUndefined();
      expect(res.body.salt).toBeUndefined();

      const user = await User.findByPk(res.body.id);
      expect(user).not.toBeNull();
      expect(Buffer.isBuffer(user.password) || user.password).toBeTruthy();
      expect(user.password.toString()).not.toBe("secure-password");

      const sessions = await Session.findAll({ where: { userId: res.body.id } });
      expect(sessions.length).toBeGreaterThanOrEqual(1);
    });

    it("Create an account with an existing email", async () => {
      const email = uniqueEmail("dup");
      await request(app).post("/recipeapi/users/").send({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password: "secure-password",
      });

      const res = await request(app).post("/recipeapi/users/").send({
        firstName: "Other",
        lastName: "Person",
        email,
        password: "another-password",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already in use/i);
    });

    it("Create an account with missing required information", async () => {
      const res = await withResponseTimeout(
        request(app).post("/recipeapi/users/").send({
          firstName: "Ada",
          lastName: "Lovelace",
          email: uniqueEmail("missing"),
        })
      );

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });
  });

  describe("US-1.2 — Login", () => {
    it("Successfully login", async () => {
      const email = uniqueEmail("login-ok");
      const password = "secure-password";
      await request(app).post("/recipeapi/users/").send({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password,
      });

      const res = await request(app)
        .post("/recipeapi/login")
        .set("Authorization", basicAuth(email, password));

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        email,
        firstName: "Ada",
        lastName: "Lovelace",
      });
      expect(res.body.id).toEqual(expect.any(Number));
      expect(res.body.token).toEqual(expect.any(String));

      const sessions = await Session.findAll({ where: { userId: res.body.id } });
      expect(sessions.length).toBeGreaterThanOrEqual(1);
    });

    it("Login with an unknown email", async () => {
      const res = await request(app)
        .post("/recipeapi/login")
        .set(
          "Authorization",
          basicAuth(uniqueEmail("unknown"), "whatever-password")
        );

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/not found/i);
    });

    it("Login with an incorrect password", async () => {
      const email = uniqueEmail("bad-pw");
      await request(app).post("/recipeapi/users/").send({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password: "correct-password",
      });

      const res = await request(app)
        .post("/recipeapi/login")
        .set("Authorization", basicAuth(email, "wrong-password"));

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid password/i);
    });
  });

  describe("US-1.3 — Authenticate protected requests", () => {
    it("Access a protected request with a valid session", async () => {
      const { res: created } = await registerUser({
        email: uniqueEmail("protected-ok"),
      });
      expect(created.status).toBe(200);

      const res = await request(app)
        .get(`/recipeapi/recipes/user/${created.body.id}`)
        .set("Authorization", `Bearer ${created.body.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("Access a protected request with an invalid token", async () => {
      const { res: created } = await registerUser({
        email: uniqueEmail("protected-bad"),
      });
      // Encrypted session id that does not exist — invalid for authentication
      const invalidToken = await encrypt(999999999);

      const res = await withResponseTimeout(
        request(app)
          .get(`/recipeapi/recipes/user/${created.body.id}`)
          .set("Authorization", `Bearer ${invalidToken}`)
      );

      expect(res.status).toBe(401);
    });

    it("Access a protected request with an expired session", async () => {
      const { res: created } = await registerUser({
        email: uniqueEmail("protected-expired"),
      });
      expect(created.status).toBe(200);

      const sessions = await Session.findAll({
        where: { userId: created.body.id },
      });
      const session = sessions[sessions.length - 1];
      await session.update({
        expirationDate: new Date(Date.now() - 60 * 1000),
      });

      const res = await request(app)
        .get(`/recipeapi/recipes/user/${created.body.id}`)
        .set("Authorization", `Bearer ${created.body.token}`);

      expect(res.status).toBe(401);
    });
  });

  describe("US-1.4 — Sign out", () => {
    it("Successfully sign out", async () => {
      const { res: created } = await registerUser({
        email: uniqueEmail("logout-ok"),
      });
      expect(created.status).toBe(200);
      const token = created.body.token;
      const userId = created.body.id;

      const res = await request(app)
        .post("/recipeapi/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/logged out successfully/i);

      const sessions = await Session.findAll({ where: { userId } });
      expect(sessions.length).toBe(0);

      const protectedRes = await request(app)
        .get(`/recipeapi/recipes/user/${userId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(protectedRes.status).toBe(401);
    });

    it("Sign out without authentication", async () => {
      const res = await request(app).post("/recipeapi/logout");

      expect(res.status).toBe(401);
    });

    it("Sign out with an invalid token", async () => {
      // Malformed Bearer token must not authenticate sign-out (401)
      const res = await withResponseTimeout(
        request(app)
          .post("/recipeapi/logout")
          .set("Authorization", "Bearer not-a-valid-token")
      );

      expect(res.status).toBe(401);
    });
  });
});
