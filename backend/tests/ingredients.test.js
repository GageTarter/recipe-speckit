/**
 * Feature 5 — Ingredients Management
 * Spec: features/feature-5-ingredients-management.md
 * Feature 4 — Ingredient Catalogue Management
 * Spec: features/feature-4-ingredient-catalogue-management.md
 */

if (!process.env.SECRET_KEY) {
  process.env.SECRET_KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
}

const request = require("supertest");
const mysql = require("mysql2/promise");
const app = require("../server");
const db = require("../app/models");

async function ensureTestDatabase() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT || 3306);
  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PW ?? "",
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await connection.end();
  } catch (err) {
    const reason = err.errors ? err.errors.map((e) => e.message).join("; ") : err.message;
    throw new Error(
      `Could not connect to MySQL at ${host}:${port} as ${process.env.DB_USER}. ${reason}. Start XAMPP MySQL and set DB_PORT in backend/.env.test to the port shown in XAMPP.`
    );
  }
}

async function registerUser(overrides = {}) {
  const email = overrides.email || `cook-${Date.now()}-${Math.random()}@example.com`;
  const res = await request(app).post("/recipeapi/users/").send({
    firstName: overrides.firstName || "Test",
    lastName: overrides.lastName || "Cook",
    email,
    password: overrides.password || "password123",
  });
  expect(res.status).toBe(200);
  expect(res.body.token).toBeTruthy();
  return res.body;
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

describe("Feature 5 — Ingredients Management", () => {
  beforeAll(async () => {
    await ensureTestDatabase();
    db.sequelize.options.logging = false;
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.sequelize.sync({ force: true });
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
describe("Feature 4 — Ingredient Catalogue Management", () => {
  beforeAll(async () => {
    await ensureTestDatabase();
    db.sequelize.options.logging = false;
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    await db.recipeIngredient.destroy({ where: {} });
    await db.ingredient.destroy({ where: {} });
  });
  
  describe("US-5.1 — Add a catalogue ingredient", () => {
    it("User creates a new ingredient", async () => {
      const user = await registerUser();
      const res = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 1.5 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: "Butter",
          unit: "sticks",
          userId: user.id,
        })
      );
      expect(Number(res.body.pricePerUnit)).toBeCloseTo(1.5);
    });

  describe("US-4.1 — Add a catalogue ingredient", () => {
    it("User creates a new ingredient", async () => {
      const user = await registerUser();
      const res = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 1.5 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: "Butter",
          unit: "sticks",
          userId: user.id,
        })
      );
      expect(Number(res.body.pricePerUnit)).toBeCloseTo(1.5);
    });

    it("User creates an ingredient with a name that is too long", async () => {
      const user = await registerUser();
      const res = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({
          name: "a".repeat(101),
          unit: "sticks",
          pricePerUnit: 1.5,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "Ingredient name must be 100 characters or fewer.",
      });
    });

    it("User creates an ingredient with a non-numeric price per unit", async () => {
      const user = await registerUser();
      const res = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({
          name: "Butter",
          unit: "sticks",
          pricePerUnit: "abc",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "Ingredient price per unit must be a number.",
      });
    });
  });

  describe("US-5.2 — Browse the Ingredient Catalogue", () => {
    it("User views existing ingredients", async () => {
      const user = await registerUser();
      const other = await registerUser();

      await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(other.token))
        .send({ name: "Salt", unit: "tsp", pricePerUnit: 0.1 });

      await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Zucchini", unit: "piece", pricePerUnit: 1 });
      await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Apple", unit: "piece", pricePerUnit: 0.5 });

      const res = await request(app)
        .get("/recipeapi/ingredients")
        .set(bearer(user.token));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.map((row) => row.name)).toEqual(["Apple", "Zucchini"]);
      expect(res.body.every((row) => row.userId === user.id)).toBe(true);
    });

  describe("US-4.2 — Browse the Ingredient Catalogue", () => {
    it("User views existing ingredients", async () => {
      const user = await registerUser();
      const other = await registerUser();

      await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(other.token))
        .send({ name: "Salt", unit: "tsp", pricePerUnit: 0.1 });

      await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Zucchini", unit: "piece", pricePerUnit: 1 });
      await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Apple", unit: "piece", pricePerUnit: 0.5 });

      const res = await request(app)
        .get("/recipeapi/ingredients")
        .set(bearer(user.token));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.map((row) => row.name)).toEqual(["Apple", "Zucchini"]);
      expect(res.body.every((row) => row.userId === user.id)).toBe(true);
    });
/*
    it("User has no existing ingredients", async () => {
      const user = await registerUser();
      const res = await request(app)
        .get("/recipeapi/ingredients")
        .set(bearer(user.token));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual([]);
    });
  });
*/
  describe("US-5.3 — Correct an ingredient's unit or price", () => {
    it("User edits an ingredient's information", async () => {
      const user = await registerUser();
      const created = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 1.5 });

      const res = await request(app)
        .put(`/recipeapi/ingredients/${created.body.id}`)
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 2.0 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Ingredient was updated successfully.",
      });
    });

  describe("US-4.3 — Correct an ingredient's unit or price", () => {
    it("User edits an ingredient's information", async () => {
      const user = await registerUser();
      const created = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 1.5 });

      const res = await request(app)
        .put(`/recipeapi/ingredients/${created.body.id}`)
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 2.0 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Ingredient was updated successfully.",
      });
    });

    it("User edits an ingredient with a name that is too long", async () => {
      const user = await registerUser();
      const created = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 1.5 });

      const res = await request(app)
        .put(`/recipeapi/ingredients/${created.body.id}`)
        .set(bearer(user.token))
        .send({
          name: "a".repeat(101),
          unit: "sticks",
          pricePerUnit: 1.5,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "Ingredient name must be 100 characters or fewer.",
      });
    });

    it("User edits an ingredient with a non-numeric price per unit", async () => {
      const user = await registerUser();
      const created = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 1.5 });

      const res = await request(app)
        .put(`/recipeapi/ingredients/${created.body.id}`)
        .set(bearer(user.token))
        .send({
          name: "Butter",
          unit: "sticks",
          pricePerUnit: "abc",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "Ingredient price per unit must be a number.",
      });
    });
  });

  describe("US-5.4 Remove an ingredient", () => {
    it("User removes an ingredient", async () => {
      const user = await registerUser();
      const created = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 1.5 });

      const res = await request(app)
        .delete(`/recipeapi/ingredients/${created.body.id}`)
        .set(bearer(user.token));

      expect([200, 204]).toContain(res.status);

      const list = await request(app)
        .get("/recipeapi/ingredients")
        .set(bearer(user.token));
      expect(list.body.find((row) => row.name === "Butter")).toBeUndefined();
    });
  });
});

  describe("US-4.4 Remove a catalogue ingredient", () => {
    it("User removes an ingredient", async () => {
      const user = await registerUser();
      const created = await request(app)
        .post("/recipeapi/ingredients")
        .set(bearer(user.token))
        .send({ name: "Butter", unit: "sticks", pricePerUnit: 1.5 });

      const res = await request(app)
        .delete(`/recipeapi/ingredients/${created.body.id}`)
        .set(bearer(user.token));

      expect([200, 204]).toContain(res.status);

      const list = await request(app)
        .get("/recipeapi/ingredients")
        .set(bearer(user.token));
      expect(list.body.find((row) => row.name === "Butter")).toBeUndefined();
    });
  });
});
