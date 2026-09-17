const db = require("../models");
const Ingredient = db.ingredient;

async function getAccessibleIngredientOrNull(req, ingredientId) {
  const row = await Ingredient.findOne({
    where: { id: ingredientId, userId: req.user.id },
  });
  return row ?? null;
}

module.exports = { getAccessibleIngredientOrNull };
