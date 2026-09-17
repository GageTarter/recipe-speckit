const db = require("../models");
const Recipe = db.recipe;

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

module.exports = { getOwnedRecipeOrNull };
