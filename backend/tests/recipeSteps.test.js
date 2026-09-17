/**
 * Feature 3 — Recipe List Item Management
 * Spec: features/feature-3-recipe-list-item-management.md
 */
const request = require("supertest");
const app = require("../server");
const db = require("../app/models");
const { getSalt, hashPassword, encrypt } = require("../app/authentication/crypto");

const Recipe = db.recipe;
const RecipeStep = db.recipeStep;
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
let rice;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  const signedIn = await createSignedInUser("owner-steps@example.com");
  owner = signedIn.user;
  ownerToken = signedIn.token;
  otherUser = (await createSignedInUser("other-steps@example.com")).user;
  beans = await Ingredient.create({
    name: "Beans",
    unit: "cup",
    pricePerUnit: 1.5,
  });
  rice = await Ingredient.create({
    name: "Rice",
    unit: "cup",
    pricePerUnit: 1.0,
  });
});

afterEach(async () => {
  await RecipeIngredient.destroy({ where: {} });
  await RecipeStep.destroy({ where: {} });
  await Recipe.destroy({ where: {} });
});

describe("Feature 3 — Recipe List Item Management", () => {
  describe("US-3.4 — Add a numbered step", () => {
    it("Owner adds a numbered step", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeSteps/`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          stepNumber: 1,
          instruction: "Simmer the beans",
          recipeId: recipe.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.stepNumber).toBe(1);
      expect(response.body.instruction).toBe("Simmer the beans");
      expect(response.body.recipeId).toBe(recipe.id);
    });

    it("Create is rejected when instruction is missing", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeSteps/`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ stepNumber: 1, recipeId: recipe.id });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Description cannot be empty for recipe step!"
      );
      expect(await RecipeStep.count()).toBe(0);
    });

    it("Create is rejected without a session", async () => {
      const recipe = await createRecipeFor(owner.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeSteps/`)
        .send({
          stepNumber: 1,
          instruction: "Simmer the beans",
          recipeId: recipe.id,
        });

      expect(response.status).toBe(401);
      expect(await RecipeStep.count()).toBe(0);
    });

    it("Create is rejected for another user's recipe", async () => {
      const recipe = await createRecipeFor(otherUser.id);

      const response = await request(app)
        .post(`/recipeapi/recipes/${recipe.id}/recipeSteps/`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          stepNumber: 1,
          instruction: "Simmer the beans",
          recipeId: recipe.id,
        });

      expect(response.status).toBe(404);
      expect(await RecipeStep.count()).toBe(0);
    });

    it("Steps are listed in step-number order", async () => {
      const recipe = await createRecipeFor(owner.id);
      await RecipeStep.create({
        stepNumber: 3,
        instruction: "Serve",
        recipeId: recipe.id,
      });
      await RecipeStep.create({
        stepNumber: 1,
        instruction: "Simmer the beans",
        recipeId: recipe.id,
      });
      await RecipeStep.create({
        stepNumber: 2,
        instruction: "Add rice",
        recipeId: recipe.id,
      });

      const response = await request(app)
        .get(`/recipeapi/recipes/${recipe.id}/recipeStepsWithIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.map((step) => step.stepNumber)).toEqual([1, 2, 3]);
    });
  });

  describe("US-3.5 — Attach ingredients to a step", () => {
    it("Owner attaches ingredients to a step", async () => {
      const recipe = await createRecipeFor(owner.id);
      const beansRow = await RecipeIngredient.create({
        quantity: 2,
        recipeId: recipe.id,
        ingredientId: beans.id,
      });
      const riceRow = await RecipeIngredient.create({
        quantity: 1,
        recipeId: recipe.id,
        ingredientId: rice.id,
      });
      const step = await RecipeStep.create({
        stepNumber: 1,
        instruction: "Simmer the beans",
        recipeId: recipe.id,
      });

      await request(app)
        .put(`/recipeapi/recipes/${recipe.id}/recipeIngredients/${beansRow.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ recipeStepId: step.id });
      await request(app)
        .put(`/recipeapi/recipes/${recipe.id}/recipeIngredients/${riceRow.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ recipeStepId: step.id });

      expect((await RecipeIngredient.findByPk(beansRow.id)).recipeStepId).toBe(
        step.id
      );
      expect((await RecipeIngredient.findByPk(riceRow.id)).recipeStepId).toBe(
        step.id
      );

      const listed = await request(app)
        .get(`/recipeapi/recipes/${recipe.id}/recipeStepsWithIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`);
      const names = listed.body[0].recipeIngredient.map(
        (item) => item.ingredient.name
      );
      expect(names).toEqual(expect.arrayContaining(["Beans", "Rice"]));
    });

    it("A step with no attached ingredients", async () => {
      const recipe = await createRecipeFor(owner.id);
      await RecipeStep.create({
        stepNumber: 1,
        instruction: "Simmer the beans",
        recipeId: recipe.id,
      });

      const response = await request(app)
        .get(`/recipeapi/recipes/${recipe.id}/recipeStepsWithIngredients/`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].recipeIngredient).toEqual([]);
    });
  });

  describe("US-3.6 — Edit a step", () => {
    it("Owner updates a step's instruction", async () => {
      const recipe = await createRecipeFor(owner.id);
      const step = await RecipeStep.create({
        stepNumber: 1,
        instruction: "Simmer the beans",
        recipeId: recipe.id,
      });

      const response = await request(app)
        .put(`/recipeapi/recipes/${recipe.id}/recipeSteps/${step.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ instruction: "Drain, then simmer the beans" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("RecipeStep was updated successfully.");
      const reloaded = await RecipeStep.findByPk(step.id);
      expect(reloaded.instruction).toBe("Drain, then simmer the beans");
    });

    it("Update is rejected for another user's step", async () => {
      const recipe = await createRecipeFor(otherUser.id);
      const step = await RecipeStep.create({
        stepNumber: 1,
        instruction: "Simmer the beans",
        recipeId: recipe.id,
      });

      const response = await request(app)
        .put(`/recipeapi/recipes/${recipe.id}/recipeSteps/${step.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ instruction: "Stolen" });

      expect(response.status).toBe(404);
      const reloaded = await RecipeStep.findByPk(step.id);
      expect(reloaded.instruction).toBe("Simmer the beans");
    });
  });

  describe("US-3.7 — Delete a step", () => {
    it("Owner deletes a step", async () => {
      const recipe = await createRecipeFor(owner.id);
      const step = await RecipeStep.create({
        stepNumber: 1,
        instruction: "Simmer the beans",
        recipeId: recipe.id,
      });

      const response = await request(app)
        .delete(`/recipeapi/recipes/${recipe.id}/recipeSteps/${step.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("RecipeStep was deleted successfully!");
      expect(await RecipeStep.findByPk(step.id)).toBeNull();
    });

    it("Delete is rejected without a session", async () => {
      const recipe = await createRecipeFor(owner.id);
      const step = await RecipeStep.create({
        stepNumber: 1,
        instruction: "Simmer the beans",
        recipeId: recipe.id,
      });

      const response = await request(app).delete(
        `/recipeapi/recipes/${recipe.id}/recipeSteps/${step.id}`
      );

      expect(response.status).toBe(401);
      expect(await RecipeStep.findByPk(step.id)).not.toBeNull();
    });
  });
});
