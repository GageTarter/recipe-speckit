/**
 * Feature 3 — Recipe List Item Management
 * Spec: features/feature-3-recipe-list-item-management.md
 */
const request = require("supertest");
const app = require("../server");
const db = require("../app/models");
const { getSalt, hashPassword, encrypt } = require("../app/authentication/crypto");

const Recipe = db.recipe;
const RecipeIngredient = db.recipeIngredient;
const Ingredient = db.ingredient;

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

const createRecipeFor = (userId) =>
  Recipe.create({
    name: "Chili",
    description: "Weeknight chili",
    servings: 4,
    time: 45,
    isPublished: false,
    userId: userId,
  });

let owner;
let ownerToken;
let otherUser;
let beans;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  const signedIn = await createSignedInUser("owner@example.com");
  owner = signedIn.user;
  ownerToken = signedIn.token;
  otherUser = (await createSignedInUser("other@example.com")).user;
  beans = await Ingredient.create({
    name: "Beans",
    unit: "cup",
    pricePerUnit: 1.5,
  });
});

afterEach(async () => {
  await RecipeIngredient.destroy({ where: {} });
  await Recipe.destroy({ where: {} });
});

describe("Feature 3 — Recipe List Item Management", () => {
  describe("US-3.1 — Add a measured ingredient to a recipe", () => {
    it("User adds a measured ingredient to a recipe", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          quantity: 2,
          recipeId: recipe.id,
          ingredientId: beans.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(2);
      expect(response.body.recipeId).toBe(recipe.id);
      expect(response.body.ingredientId).toBe(beans.id);

      const listed = await request(app)
        .get(`/recipeapi/recipes/${recipe.id}/recipeIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`);
      expect(listed.status).toBe(200);
      expect(listed.body).toHaveLength(1);
      expect(listed.body[0].ingredient.name).toBe("Beans");
      expect(listed.body[0].quantity).toBe(2);
    });

    it("Create is rejected when quantity is missing", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ recipeId: recipe.id, ingredientId: beans.id });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Quantity cannot be empty for recipe ingredient!"
      );
      expect(await RecipeIngredient.count()).toBe(0);
    });

    it("Create is rejected when quantity is not a positive number", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          quantity: 0,
          recipeId: recipe.id,
          ingredientId: beans.id,
        });

      expect(response.status).toBe(400);
      expect(await RecipeIngredient.count()).toBe(0);
    });

    it("Create is rejected when the ingredient does not exist", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          quantity: 2,
          recipeId: recipe.id,
          ingredientId: 9999,
        });

      expect(response.status).toBe(404);
      expect(await RecipeIngredient.count()).toBe(0);
    });

    it("Create is rejected without a session", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeIngredients/`)
        .send({
          quantity: 2,
          recipeId: recipe.id,
          ingredientId: beans.id,
        });

      expect(response.status).toBe(401);
      expect(await RecipeIngredient.count()).toBe(0);
    });

    it("Create is rejected for another user's recipe", async () => {
      const recipe = await createRecipeFor(otherUser.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          quantity: 2,
          recipeId: recipe.id,
          ingredientId: beans.id,
        });

      expect(response.status).toBe(404);
      expect(await RecipeIngredient.count()).toBe(0);
    });

    it("Listing another user's recipe ingredients is rejected", async () => {
      const recipe = await createRecipeFor(otherUser.id);
      await RecipeIngredient.create({
        quantity: 2,
        recipeId: recipe.id,
        ingredientId: beans.id,
      });

      const response = await request(app)
        .get(`/recipeapi/recipes/${recipe.id}/recipeIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("US-3.2 — Adjust a recipe's ingredient", () => {
    it("Owner updates a recipe ingredient's quantity", async () => {
      const recipe = await createRecipeFor(owner.id);
      const row = await RecipeIngredient.create({
        quantity: 2,
        recipeId: recipe.id,
        ingredientId: beans.id,
      });

      const response = await request(app)
        .put(`/recipeapi/recipes/${recipe.id}/recipeIngredients/${row.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ quantity: 3 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "RecipeIngredient was updated successfully."
      );
      const reloaded = await RecipeIngredient.findByPk(row.id);
      expect(reloaded.quantity).toBe(3);
    });

    it("Update is rejected for another user's recipe ingredient", async () => {
      const recipe = await createRecipeFor(otherUser.id);
      const row = await RecipeIngredient.create({
        quantity: 2,
        recipeId: recipe.id,
        ingredientId: beans.id,
      });

      const response = await request(app)
        .put(`/recipeapi/recipes/${recipe.id}/recipeIngredients/${row.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ quantity: 9 });

      expect(response.status).toBe(404);
      const reloaded = await RecipeIngredient.findByPk(row.id);
      expect(reloaded.quantity).toBe(2);
    });

    it("Update is rejected without a session", async () => {
      const recipe = await createRecipeFor(owner.id);
      const row = await RecipeIngredient.create({
        quantity: 2,
        recipeId: recipe.id,
        ingredientId: beans.id,
      });

      const response = await request(app)
        .put(`/recipeapi/recipes/${recipe.id}/recipeIngredients/${row.id}`)
        .send({ quantity: 3 });

      expect(response.status).toBe(401);
    });
  });

  describe("US-3.3 — Remove an ingredient from a recipe", () => {
    it("Owner removes a recipe ingredient", async () => {
      const recipe = await createRecipeFor(owner.id);
      const row = await RecipeIngredient.create({
        quantity: 2,
        recipeId: recipe.id,
        ingredientId: beans.id,
      });

      const response = await request(app)
        .delete(`/recipeapi/recipes/${recipe.id}/recipeIngredients/${row.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "RecipeIngredient was deleted successfully!"
      );
      expect(await RecipeIngredient.findByPk(row.id)).toBeNull();
    });

    it("Delete is rejected for another user's recipe ingredient", async () => {
      const recipe = await createRecipeFor(otherUser.id);
      const row = await RecipeIngredient.create({
        quantity: 2,
        recipeId: recipe.id,
        ingredientId: beans.id,
      });

      const response = await request(app)
        .delete(`/recipeapi/recipes/${recipe.id}/recipeIngredients/${row.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
      expect(await RecipeIngredient.findByPk(row.id)).not.toBeNull();
    });
  });
});
