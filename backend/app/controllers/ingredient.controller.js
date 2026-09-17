const db = require("../models");
const Ingredient = db.ingredient;
const {
  getAccessibleIngredientOrNull,
} = require("../authorization/ingredientAccess");

function parseIngredientId(param) {
  const id = parseInt(param, 10);
  return Number.isNaN(id) ? null : id;
}

function validateIngredientFields(body) {
  const name = typeof body.name === "string" ? body.name.trim() : body.name;
  const unit = typeof body.unit === "string" ? body.unit.trim() : body.unit;
  const rawPrice = body.pricePerUnit;

  if (name === undefined || name === "") {
    return { error: "Name cannot be empty for ingredient!" };
  }
  if (typeof name === "string" && name.length > 100) {
    return { error: "Ingredient name must be 100 characters or fewer." };
  }
  if (unit === undefined || unit === "") {
    return { error: "Unit cannot be empty for ingredient!" };
  }
  if (typeof unit === "string" && unit.length > 100) {
    return { error: "Ingredient unit must be 100 characters or fewer." };
  }
  if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
    return { error: "Price per unit cannot be empty for ingredient!" };
  }
  const pricePerUnit = Number(rawPrice);
  if (Number.isNaN(pricePerUnit)) {
    return { error: "Ingredient price per unit must be a number." };
  }

  return { name, unit, pricePerUnit };
}

function notFound(res, id) {
  return res.status(404).send({
    message: `Ingredient with id=${id} not found.`,
  });
}

// Create and Save a new Ingredient
exports.create = (req, res) => {
  const parsed = validateIngredientFields(req.body);
  if (parsed.error) {
    return res.status(400).send({ message: parsed.error });
  }

  Ingredient.create({
    name: parsed.name,
    unit: parsed.unit,
    pricePerUnit: parsed.pricePerUnit,
    userId: req.user.id,
  })
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Ingredient.",
      });
    });
};

// Retrieve all Ingredients owned by the authenticated user
exports.findAll = (req, res) => {
  Ingredient.findAll({
    where: { userId: req.user.id },
    order: [["name", "ASC"]],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ingredients.",
      });
    });
};

// Find a single Ingredient with an id
exports.findOne = async (req, res) => {
  const id = parseIngredientId(req.params.id);
  if (id === null) {
    return res.status(400).send({ message: "Invalid ingredientId." });
  }

  try {
    const data = await getAccessibleIngredientOrNull(req, id);
    if (!data) {
      return notFound(res, id);
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Ingredient with id=" + id,
    });
  }
};

// Update a Ingredient by the id in the request
exports.update = async (req, res) => {
  const id = parseIngredientId(req.params.id);
  if (id === null) {
    return res.status(400).send({ message: "Invalid ingredientId." });
  }

  const parsed = validateIngredientFields(req.body);
  if (parsed.error) {
    return res.status(400).send({ message: parsed.error });
  }

  try {
    const existing = await getAccessibleIngredientOrNull(req, id);
    if (!existing) {
      return notFound(res, id);
    }

    const number = await Ingredient.update(
      {
        name: parsed.name,
        unit: parsed.unit,
        pricePerUnit: parsed.pricePerUnit,
      },
      { where: { id, userId: req.user.id } }
    );

    if (number == 1) {
      res.send({
        message: "Ingredient was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update Ingredient with id=${id}. Maybe Ingredient was not found or req.body is empty!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Ingredient with id=" + id,
    });
  }
};

// Delete a Ingredient with the specified id in the request
exports.delete = async (req, res) => {
  const id = parseIngredientId(req.params.id);
  if (id === null) {
    return res.status(400).send({ message: "Invalid ingredientId." });
  }

  try {
    const existing = await getAccessibleIngredientOrNull(req, id);
    if (!existing) {
      return notFound(res, id);
    }

    const number = await Ingredient.destroy({
      where: { id, userId: req.user.id },
    });

    if (number == 1) {
      res.send({
        message: "Ingredient was deleted successfully!",
      });
    } else {
      return notFound(res, id);
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Ingredient with id=" + id,
    });
  }
};

// Delete all Ingredients for the authenticated user
exports.deleteAll = (req, res) => {
  Ingredient.destroy({
    where: { userId: req.user.id },
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} Ingredients were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all ingredients.",
      });
    });
};
