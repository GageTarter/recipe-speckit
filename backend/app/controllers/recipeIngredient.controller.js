const db = require("../models");
const RecipeIngredient = db.recipeIngredient;
const Ingredient = db.ingredient;
const Op = db.Sequelize.Op;
const { getOwnedRecipeOrNull, getOwnedRecipeIngredientOrNull } = require("../authorization/recipeScope");

const positiveQuantityOrNull = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }
  return number;
};

// Create and Save a new RecipeIngredient
exports.create = async (req, res) => {
  // Validate request
  if (req.body.quantity === undefined) {
    return res.status(400).send({
      message: "Quantity cannot be empty for recipe ingredient!",
    });
  } else if (req.body.recipeId === undefined) {
    return res.status(400).send({
      message: "Recipe ID cannot be empty for recipe ingredient!",
    });
  } else if (req.body.ingredientId === undefined) {
    return res.status(400).send({
      message: "Ingredient ID cannot be empty for recipe ingredient!",
    });
  }

  const quantity = positiveQuantityOrNull(req.body.quantity);
  if (quantity === null) {
    return res.status(400).send({
      message: "Quantity cannot be empty for recipe ingredient!",
    });
  }

  try {
    const recipe = await getOwnedRecipeOrNull(req, req.body.recipeId);
    if (recipe === null) {
      return res.status(404).send({
        message: `Cannot find Recipe with id=${req.body.recipeId}.`,
      });
    }

    const catalogItem = await Ingredient.findByPk(req.body.ingredientId);
    if (catalogItem === null) {
      return res.status(404).send({
        message: `Cannot find Ingredient with id=${req.body.ingredientId}.`,
      });
    }

    const recipeIngredient = {
      quantity: quantity,
      recipeId: recipe.id,
      recipeStepId: req.body.recipeStepId ? req.body.recipeStepId : null,
      ingredientId: req.body.ingredientId,
    };
    const data = await RecipeIngredient.create(recipeIngredient);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Some error occurred while creating the RecipeIngredient.",
    });
  }
};

// Retrieve all RecipeIngredients from the database.
exports.findAll = (req, res) => {
  const recipeIngredientId = req.query.recipeIngredientId;
  var condition = recipeIngredientId
    ? {
        id: {
          [Op.like]: `%${recipeIngredientId}%`,
        },
      }
    : null;

  RecipeIngredient.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving recipeIngredients.",
      });
    });
};

exports.findAllForRecipe = async (req, res) => {
  const recipeId = req.params.recipeId;
  if ((await getOwnedRecipeOrNull(req, recipeId)) === null) {
    return res.status(404).send({
      message: `Cannot find Recipe with id=${recipeId}.`,
    });
  }
  RecipeIngredient.findAll({
    where: { recipeId: recipeId },
    include: [
      {
        model: Ingredient,
        as: "ingredient",
        required: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })

    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving recipeIngredients for a recipe.",
      });
    });
};

// Find all RecipeIngredients for a recipe step and include the ingredients
exports.findAllForRecipeStepWithIngredients = (req, res) => {
  const recipeStepId = req.params.recipeStepId;
  RecipeIngredient.findAll({
    where: { recipeStepId: recipeStepId },
    include: [
      {
        model: Ingredient,
        as: "ingredient",
        required: true,
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving recipeIngredients for a recipe step.",
      });
    });
};

// Find a single RecipeIngredient with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  RecipeIngredient.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving RecipeIngredient with id=" + id,
      });
    });
};

// Update a RecipeIngredient by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const existing = await getOwnedRecipeIngredientOrNull(req, id);
  if (existing === null) {
    return res.status(404).send({
      message: `Cannot find RecipeIngredient with id=${id}.`,
    });
  }
  if (req.body.quantity !== undefined) {
    const quantity = positiveQuantityOrNull(req.body.quantity);
    if (quantity === null) {
      return res.status(400).send({
        message: "Quantity cannot be empty for recipe ingredient!",
      });
    }
    req.body.quantity = quantity;
  }

  RecipeIngredient.update(req.body, {
    where: { id: existing.id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "RecipeIngredient was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update RecipeIngredient with id=${id}. Maybe RecipeIngredient was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating RecipeIngredient with id=" + id,
      });
    });
};

// Delete a RecipeIngredient with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  const existing = await getOwnedRecipeIngredientOrNull(req, id);
  if (existing === null) {
    return res.status(404).send({
      message: `Cannot find RecipeIngredient with id=${id}.`,
    });
  }

  RecipeIngredient.destroy({
    where: { id: existing.id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "RecipeIngredient was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete RecipeIngredient with id=${id}. Maybe RecipeIngredient was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Could not delete RecipeIngredient with id=" + id,
      });
    });
};

// Delete all RecipeIngredients from the database.
exports.deleteAll = (req, res) => {
  RecipeIngredient.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({
        message: `${number} RecipeIngredients were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all recipeIngredients.",
      });
    });
};
