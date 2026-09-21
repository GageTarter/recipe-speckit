module.exports = (app) => {
  const Ingredient = require("../controllers/ingredient.controller.js");
  var router = require("express").Router();
  const { authenticateRoute } = require("../authentication/authentication");

  // Create a new Ingredient
  router.post("/ingredients/", [authenticateRoute], Ingredient.create);

  // Retrieve all Ingredient for the signed-in user
  router.get("/ingredients/", [authenticateRoute], Ingredient.findAll);

  // Retrieve a single Ingredient with ingredientId
  router.get("/ingredients/:id", [authenticateRoute], Ingredient.findOne);

  // Update an Ingredient with ingredientId
  router.put("/ingredients/:id", [authenticateRoute], Ingredient.update);

  // Delete an Ingredient with ingredientId
  router.delete("/ingredients/:id", [authenticateRoute], Ingredient.delete);

  // Create a new Ingredient
  router.delete("/ingredients/", [authenticateRoute], Ingredient.deleteAll);

  app.use("/recipeapi", router);
};
