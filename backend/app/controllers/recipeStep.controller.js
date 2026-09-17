const db = require("../models");
const RecipeStep = db.recipeStep;
const RecipeIngredient = db.recipeIngredient;
const Ingredient = db.ingredient;
const Op = db.Sequelize.Op;
const { getOwnedRecipeOrNull, getOwnedRecipeStepOrNull } = require("../authorization/recipeScope");

const positiveIntOrNull = (value) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }
  return number;
};

// Create and Save a new RecipeStep
exports.create = async (req, res) => {
  // Validate request
  if (req.body.stepNumber === undefined) {
    return res.status(400).send({
      message: "Step number cannot be empty for recipe step!",
    });
  } else if (req.body.instruction === undefined) {
    return res.status(400).send({
      message: "Description cannot be empty for recipe step!",
    });
  } else if (req.body.recipeId === undefined) {
    return res.status(400).send({
      message: "Recipe ID cannot be empty for recipe step!",
    });
  }

  const stepNumber = positiveIntOrNull(req.body.stepNumber);
  if (stepNumber === null) {
    return res.status(400).send({
      message: "Step number cannot be empty for recipe step!",
    });
  }

  const recipe = await getOwnedRecipeOrNull(req, req.body.recipeId);
  if (recipe === null) {
    return res.status(404).send({
      message: `Cannot find Recipe with id=${req.body.recipeId}.`,
    });
  }

  const recipeStep = {
    stepNumber: stepNumber,
    instruction: req.body.instruction,
    recipeId: recipe.id,
  };
  RecipeStep.create(recipeStep)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the RecipeStep.",
      });
    });
};
// Retrieve all RecipeSteps from the database.
exports.findAll = (req, res) => {
  const recipeStepId = req.query.recipeStepId;
  var condition = recipeStepId
    ? {
        id: {
          [Op.like]: `%${recipeStepId}%`,
        },
      }
    : null;

  RecipeStep.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving recipeSteps.",
      });
    });
};

// Retrieve all RecipeSteps for a recipe from the database.
exports.findAllForRecipe = (req, res) => {
  const recipeId = req.params.recipeId;

  RecipeStep.findAll({
    where: { recipeId: recipeId },
    order: [["stepNumber", "ASC"]],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving recipeSteps for a recipe.",
      });
    });
};

// Find all RecipeSteps for a recipe and include the ingredients
exports.findAllForRecipeWithIngredients = async (req, res) => {
  const recipeId = req.params.recipeId;
  if ((await getOwnedRecipeOrNull(req, recipeId)) === null) {
    return res.status(404).send({
      message: `Cannot find Recipe with id=${recipeId}.`,
    });
  }
  RecipeStep.findAll({
    where: { recipeId: recipeId },
    include: [
      {
        model: RecipeIngredient,
        as: "recipeIngredient",
        required: false,
        include: [
          {
            model: Ingredient,
            as: "ingredient",
            required: false,
          },
        ],
      },
    ],
    order: [["stepNumber", "ASC"]],
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

// Find a single RecipeStep with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  RecipeStep.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find RecipeStep with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving RecipeStep with id=" + id,
      });
    });
};
// Update a RecipeStep by the id in the request
// Update a RecipeStep by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const existing = await getOwnedRecipeStepOrNull(req, id);
  if (existing === null) {
    return res.status(404).send({
      message: `Cannot find RecipeStep with id=${id}.`,
    });
  }
  if (req.body.stepNumber !== undefined) {
    const stepNumber = positiveIntOrNull(req.body.stepNumber);
    if (stepNumber === null) {
      return res.status(400).send({
        message: "Step number cannot be empty for recipe step!",
      });
    }
    req.body.stepNumber = stepNumber;
  }
  RecipeStep.update(req.body, {
    where: { id: existing.id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "RecipeStep was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update RecipeStep with id=${id}. Maybe RecipeStep was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating RecipeStep with id=" + id,
      });
    });
};
// Delete a RecipeStep with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  const existing = await getOwnedRecipeStepOrNull(req, id);
  if (existing === null) {
    return res.status(404).send({
      message: `Cannot find RecipeStep with id=${id}.`,
    });
  }
  RecipeStep.destroy({
    where: { id: existing.id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "RecipeStep was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete RecipeStep with id=${id}. Maybe RecipeStep was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete RecipeStep with id=" + id,
      });
    });
};
// Delete all RecipeSteps from the database.
exports.deleteAll = (req, res) => {
  RecipeStep.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} RecipeSteps were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all recipeSteps.",
      });
    });
};
