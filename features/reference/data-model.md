# Data Model Reference

**Status:** Feature 5 ingredients management (this branch).

## Tables

### `ingredients`

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER | PK, auto-increment |
| `userId` | INTEGER | Required, FK → `users.id`, `ON DELETE CASCADE` |
| `name` | STRING(100) | Required; unique per (`userId`, `name`); stored as typed |
| `unit` | STRING(100) | Required; stored as typed |
| `pricePerUnit` | DECIMAL(10, 2) | Required; numeric |
| `createdAt` | DATE | Sequelize timestamp |
| `updatedAt` | DATE | Sequelize timestamp |

## Associations

*   `User` hasMany `Ingredient` (`userId`, `ON DELETE CASCADE`)
*   `Ingredient` belongsTo `User`
*   Unique (`userId`, `name`)
*   Existing `Ingredient` hasMany `RecipeIngredient` (recipe linking is not Feature 5)
