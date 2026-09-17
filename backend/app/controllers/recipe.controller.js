const db = require("../models");
const Recipe = db.recipe;
const RecipeStep = db.recipeStep;
const RecipeIngredient = db.recipeIngredient;
const Ingredient = db.ingredient;
const Op = db.Sequelize.Op;
const { getOwnedRecipeOrNull } = require("../authorization/recipeScope");

// Returns the value as a positive integer, or null when it is not one
const positiveIntOrNull = (value) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }
  return number;
};

// Create and Save a new Recipe
exports.create = (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    return res
      .status(400)
      .send({ message: "Name cannot be empty for recipe!" });
  } else if (req.body.description === undefined) {
    return res
      .status(400)
      .send({ message: "Description cannot be empty for recipe!" });
  } else if (req.body.servings === undefined) {
    return res
      .status(400)
      .send({ message: "Servings cannot be empty for recipe!" });
  } else if (req.body.time === undefined) {
    return res
      .status(400)
      .send({ message: "Time cannot be empty for recipe!" });
  }

  const servings = positiveIntOrNull(req.body.servings);
  if (servings === null) {
    return res
      .status(400)
      .send({ message: "Servings must be a positive number for recipe!" });
  }
  const time = positiveIntOrNull(req.body.time);
  if (time === null) {
    return res
      .status(400)
      .send({ message: "Time must be a positive number for recipe!" });
  }

  // Create a Recipe. The owner comes from the session, never the request body.
  const recipe = {
    name: req.body.name,
    description: req.body.description,
    servings: servings,
    time: time,
    isPublished: req.body.isPublished ? req.body.isPublished : false,
    userId: req.user.id,
  };
  // Save Recipe in the database
  Recipe.create(recipe)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Recipe.",
      });
    });
};

// Find all Recipes for a user
exports.findAllForUser = (req, res) => {
  const userId = req.params.userId;
  // Only the signed-in user's own list may be requested
  if (parseInt(userId, 10) !== req.user.id) {
    return res.status(404).send({
      message: `Cannot find Recipes for user with id=${userId}.`,
    });
  }
  Recipe.findAll({
    where: { userId: userId },
    include: [
      {
        model: RecipeStep,
        as: "recipeStep",
        required: false,
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
      },
    ],
    order: [
      ["name", "ASC"],
      [RecipeStep, "stepNumber", "ASC"],
    ],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Recipes for user with id=${userId}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error retrieving Recipes for user with id=" + userId,
      });
    });
};

// Find all Published Recipes
exports.findAllPublished = (req, res) => {
  Recipe.findAll({
    where: { isPublished: true },
    include: [
      {
        model: RecipeStep,
        as: "recipeStep",
        required: false,
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
      },
    ],
    order: [
      ["name", "ASC"],
      [RecipeStep, "stepNumber", "ASC"],
    ],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Published Recipes.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Published Recipes.",
      });
    });
};

// Find a single Recipe with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;
  if ((await getOwnedRecipeOrNull(req, id)) === null) {
    return res.status(404).send({
      message: `Cannot find Recipe with id=${id}.`,
    });
  }
  Recipe.findAll({
    where: { id: id },
    include: [
      {
        model: RecipeStep,
        as: "recipeStep",
        required: false,
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
      },
    ],
    order: [[RecipeStep, "stepNumber", "ASC"]],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Recipe with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Recipe with id=" + id,
      });
    });
};
// Update a Recipe by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const existing = await getOwnedRecipeOrNull(req, id);
    if (existing === null) {
      return res.status(404).send({
        message: `Cannot find Recipe with id=${id}.`,
      });
    }
    // Only recipe detail fields are writable; ownership is never reassigned
    const changes = {};
    ["name", "description", "isPublished"].forEach((field) => {
      if (req.body[field] !== undefined) {
        changes[field] = req.body[field];
      }
    });
    for (const field of ["servings", "time"]) {
      if (req.body[field] !== undefined) {
        const number = positiveIntOrNull(req.body[field]);
        if (number === null) {
          return res.status(400).send({
            message: `${
              field === "servings" ? "Servings" : "Time"
            } must be a positive number for recipe!`,
          });
        }
        changes[field] = number;
      }
    }
    const number = await Recipe.update(changes, {
      where: { id: existing.id, userId: req.user.id },
    });
    if (number == 1) {
      res.send({
        message: "Recipe was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update Recipe with id=${id}. Maybe Recipe was not found or req.body is empty!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Recipe with id=" + id,
    });
  }
};
// Delete a Recipe with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const existing = await getOwnedRecipeOrNull(req, id);
    if (existing === null) {
      return res.status(404).send({
        message: `Cannot find Recipe with id=${id}.`,
      });
    }
    const number = await Recipe.destroy({
      where: { id: existing.id, userId: req.user.id },
    });
    if (number == 1) {
      res.send({
        message: "Recipe was deleted successfully!",
      });
    } else {
      res.send({
        message: `Cannot delete Recipe with id=${id}. Maybe Recipe was not found!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Recipe with id=" + id,
    });
  }
};
// Delete all Recipes from the database.
exports.deleteAll = (req, res) => {
  Recipe.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} Recipes were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all recipes.",
      });
    });
};
