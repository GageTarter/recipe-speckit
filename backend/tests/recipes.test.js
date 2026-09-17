/**
 * Feature 2 — Recipe Management
 * Spec: features/feature-2-recipe-management.md
 */
const request = require("supertest");
const app = require("../server");
const db = require("../app/models");
const { getSalt, hashPassword, encrypt } = require("../app/authentication/crypto");

const Recipe = db.recipe;
const RecipeStep = db.recipeStep;
const RecipeIngredient = db.recipeIngredient;
const Ingredient = db.ingredient;

// Creates a user plus a live session, and returns the Bearer token for it
const createSignedInUser = async (email) => {
  const salt = await getSalt();
  const password = await hashPassword("secret123", salt);
  const user = await db.user.create({
    firstName: "Test",
    lastName: "Cook",
    email: email,
    password: password,
    salt: salt,
  });
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 1);
  const session = await db.session.create({
    email: email,
    userId: user.id,
    expirationDate: expirationDate,
  });
  return { user, token: await encrypt(session.id) };
};

const validRecipe = {
  name: "Chili",
  description: "Weeknight chili",
  servings: 4,
  time: 45,
  isPublished: false,
};

const createRecipeFor = (userId, overrides = {}) =>
  Recipe.create({ ...validRecipe, userId: userId, ...overrides });

let owner;
let ownerToken;
let otherUser;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  const signedIn = await createSignedInUser("owner@example.com");
  owner = signedIn.user;
  ownerToken = signedIn.token;
  otherUser = (await createSignedInUser("other@example.com")).user;
});

afterEach(async () => {
  await RecipeIngredient.destroy({ where: {} });
  await RecipeStep.destroy({ where: {} });
  await Recipe.destroy({ where: {} });
  await Ingredient.destroy({ where: {} });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 2 — Recipe Management", () => {
  describe("US-2.1 — Create a recipe", () => {
    it("User creates a recipe with all required details", async () => {
      const response = await request(app)
        .post("/recipeapi/recipes/")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(validRecipe);

      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe("Chili");
      expect(response.body.servings).toBe(4);
      expect(response.body.time).toBe(45);
      expect(response.body.userId).toBe(owner.id);

      const stored = await Recipe.findByPk(response.body.id);
      expect(stored.name).toBe("Chili");
    });

    it("New recipe defaults to unpublished", async () => {
      const { isPublished, ...withoutPublishFlag } = validRecipe;

      const response = await request(app)
        .post("/recipeapi/recipes/")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(withoutPublishFlag);

      expect(response.status).toBe(200);
      const stored = await Recipe.findByPk(response.body.id);
      expect(stored.isPublished).toBe(false);
    });

    it("Create is rejected when the name is missing", async () => {
      const { name, ...withoutName } = validRecipe;

      const response = await request(app)
        .post("/recipeapi/recipes/")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(withoutName);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Name cannot be empty for recipe!");
      expect(await Recipe.count()).toBe(0);
    });

    it("Create is rejected when servings is not a positive number", async () => {
      const response = await request(app)
        .post("/recipeapi/recipes/")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ ...validRecipe, servings: 0 });

      expect(response.status).toBe(400);
      expect(await Recipe.count()).toBe(0);
    });

    it("Create is rejected without a session", async () => {
      const response = await request(app)
        .post("/recipeapi/recipes/")
        .send(validRecipe);

      expect(response.status).toBe(401);
      expect(await Recipe.count()).toBe(0);
    });

    it("Owner comes from the session, not the request body", async () => {
      const response = await request(app)
        .post("/recipeapi/recipes/")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ ...validRecipe, userId: otherUser.id });

      expect(response.status).toBe(200);
      const stored = await Recipe.findByPk(response.body.id);
      expect(stored.userId).toBe(owner.id);
    });
  });

  describe("US-2.2 — See only my own recipes", () => {
    it("Recipes are listed in alphabetical order", async () => {
      await createRecipeFor(owner.id, { name: "Waffles" });
      await createRecipeFor(owner.id, { name: "Chili" });
      await createRecipeFor(owner.id, { name: "Ramen" });

      const response = await request(app)
        .get(`/recipeapi/recipes/user/${owner.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.map((recipe) => recipe.name)).toEqual([
        "Chili",
        "Ramen",
        "Waffles",
      ]);
    });

    it("Another user's recipes cannot be requested", async () => {
      await createRecipeFor(otherUser.id, { name: "Gumbo" });

      const response = await request(app)
        .get(`/recipeapi/recipes/user/${otherUser.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
      expect(JSON.stringify(response.body)).not.toContain("Gumbo");
    });
  });

  // No Gherkin scenario covers the read-one route directly; these guard
  // FR-007 and SC-003.
  describe("FR-007 — Reading one recipe is owner-scoped", () => {
    it("Owner reads their own recipe", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .get(`/recipeapi/recipes/${recipe.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("Chili");
    });

    it("Reading another user's recipe is rejected", async () => {
      const recipe = await createRecipeFor(otherUser.id, { name: "Gumbo" });

      const response = await request(app)
        .get(`/recipeapi/recipes/${recipe.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
      expect(JSON.stringify(response.body)).not.toContain("Gumbo");
    });

    it("Reading a recipe without a session is rejected", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app).get(
        `/recipeapi/recipes/${recipe.id}`
      );

      expect(response.status).toBe(401);
    });
  });

  describe("US-2.4 — Update a recipe's details", () => {
    it("Owner updates a recipe's servings", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .put(`/recipeapi/recipes/${recipe.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ servings: 6 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Recipe was updated successfully.");

      const reloaded = await Recipe.findByPk(recipe.id);
      expect(reloaded.servings).toBe(6);
    });

    it("Update is rejected for another user's recipe", async () => {
      const recipe = await createRecipeFor(otherUser.id, { name: "Gumbo" });

      const response = await request(app)
        .put(`/recipeapi/recipes/${recipe.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Stolen" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        `Cannot find Recipe with id=${recipe.id}.`
      );

      const reloaded = await Recipe.findByPk(recipe.id);
      expect(reloaded.name).toBe("Gumbo");
    });

    it("Update is rejected for a recipe that does not exist", async () => {
      const response = await request(app)
        .put("/recipeapi/recipes/9999")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Ghost" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Cannot find Recipe with id=9999.");
    });

    it("Update is rejected without a session", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .put(`/recipeapi/recipes/${recipe.id}`)
        .send({ name: "Anonymous edit" });

      expect(response.status).toBe(401);

      const reloaded = await Recipe.findByPk(recipe.id);
      expect(reloaded.name).toBe("Chili");
    });
  });

  describe("US-2.5 — Delete a recipe", () => {
    it("Owner deletes a recipe", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .delete(`/recipeapi/recipes/${recipe.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Recipe was deleted successfully!");
      expect(await Recipe.findByPk(recipe.id)).toBeNull();
    });

    it("Deleting a recipe removes its steps and ingredients", async () => {
      const recipe = await createRecipeFor(owner.id);
      const ingredient = await Ingredient.create({
        name: "Beans",
        unit: "cup",
        pricePerUnit: 1.5,
      });
      const step = await RecipeStep.create({
        stepNumber: 1,
        instruction: "Simmer the beans",
        recipeId: recipe.id,
      });
      await RecipeIngredient.create({
        quantity: 2,
        recipeId: recipe.id,
        recipeStepId: step.id,
        ingredientId: ingredient.id,
      });

      const response = await request(app)
        .delete(`/recipeapi/recipes/${recipe.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(await RecipeStep.count({ where: { recipeId: recipe.id } })).toBe(0);
      expect(
        await RecipeIngredient.count({ where: { recipeId: recipe.id } })
      ).toBe(0);
    });

    it("Delete is rejected for another user's recipe", async () => {
      const recipe = await createRecipeFor(otherUser.id, { name: "Gumbo" });

      const response = await request(app)
        .delete(`/recipeapi/recipes/${recipe.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        `Cannot find Recipe with id=${recipe.id}.`
      );
      expect(await Recipe.findByPk(recipe.id)).not.toBeNull();
    });

    it("Delete is rejected without a session", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app).delete(
        `/recipeapi/recipes/${recipe.id}`
      );

      expect(response.status).toBe(401);
      expect(await Recipe.findByPk(recipe.id)).not.toBeNull();
    });
  });
});
