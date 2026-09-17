module.exports = (sequelize, Sequelize) => {
  const Ingredient = sequelize.define(
    "ingredient",
    {
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      pricePerUnit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["userId", "name"],
        },
      ],
    }
  );
  return Ingredient;
};
