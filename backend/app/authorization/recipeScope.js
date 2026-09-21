const db = require("../models");
const Recipe = db.recipe;
const RecipeIngredient = db.recipeIngredient;
const RecipeStep = db.recipeStep;

/**
 * Loads a recipe only when it belongs to the authenticated user.
 * Returns null for a missing id, a malformed id, or another user's recipe so
 * callers answer 404 without disclosing that the row exists.
 */
const getOwnedRecipeOrNull = async (req, id) => {
  const recipeId = parseInt(id, 10);
  if (Number.isNaN(recipeId)) {
    return null;
  }
  const recipe = await Recipe.findOne({
    where: { id: recipeId, userId: req.user.id },
  });
  return recipe === null ? null : recipe;
};

const getOwnedRecipeIngredientOrNull = async (req, id) => {
  const rowId = parseInt(id, 10);
  if (Number.isNaN(rowId)) {
    return null;
  }
  const row = await RecipeIngredient.findByPk(rowId);
  if (row === null) {
    return null;
  }
  const recipe = await getOwnedRecipeOrNull(req, row.recipeId);
  return recipe === null ? null : row;
};

const getOwnedRecipeStepOrNull = async (req, id) => {
  const rowId = parseInt(id, 10);
  if (Number.isNaN(rowId)) {
    return null;
  }
  const row = await RecipeStep.findByPk(rowId);
  if (row === null) {
    return null;
  }
  const recipe = await getOwnedRecipeOrNull(req, row.recipeId);
  return recipe === null ? null : row;
};

module.exports = {
  getOwnedRecipeOrNull,
  getOwnedRecipeIngredientOrNull,
  getOwnedRecipeStepOrNull,
};
