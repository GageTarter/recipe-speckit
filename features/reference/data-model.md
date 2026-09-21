# Data Model Reference

**Living snapshot** of the schema after Features 1–6. Update this file when schema changes.

Sequelize adds `id` (INTEGER, PK, auto-increment) plus `createdAt` and
`updatedAt` (DATETIME) to every table below unless noted.

## Tables

### `recipes`

| Field | Type | Rules |
|-------|------|-------|
| `name` | STRING | Required |
| `description` | STRING | Required |
| `servings` | INTEGER | Required, positive |
| `time` | INTEGER | Required, positive; minutes |
| `isPublished` | BOOLEAN | Required; defaults to `false` on create |
| `userId` | INTEGER | Required, FK → `users.id`, `ON DELETE CASCADE` |

`servings` and `time` are enforced as positive in the controller, not by a
column constraint.

### `recipeIngredients`

| Field | Type | Rules |
|-------|------|-------|
| `quantity` | FLOAT | Required; greater than zero (enforced in the controller) |
| `recipeId` | INTEGER | Required, FK → `recipes.id` |
| `ingredientId` | INTEGER | Required, FK → `ingredients.id` |
| `recipeStepId` | INTEGER | Optional, FK → `recipeSteps.id` |

### `recipeSteps`

| Field | Type | Rules |
|-------|------|-------|
| `stepNumber` | INTEGER | Required; greater than zero (enforced in the controller) |
| `instruction` | STRING(5000) | Required |
| `recipeId` | INTEGER | Required, FK → `recipes.id` |

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

| From | To | Rule |
|------|----|------|
| `users` | `recipes` | One-to-many. `recipes.userId` is `NOT NULL`; deleting a user deletes their recipes. |
| `users` | `ingredients` | One-to-many. Unique (`userId`, `name`); deleting a user deletes their catalogue ingredients. |
| `recipes` | `recipeSteps` | One-to-many. `recipeSteps.recipeId` is `NOT NULL`; deleting a recipe deletes its steps. |
| `recipes` | `recipeIngredients` | One-to-many. `recipeIngredients.recipeId` is `NOT NULL`; deleting a recipe deletes its measured ingredients. |
| `ingredients` | `recipeIngredients` | One-to-many |
| `recipeSteps` | `recipeIngredients` | One-to-many; `recipeStepId` may be null until a cook attaches the ingredient |

Associations are declared in `backend/app/models/index.js`.

## Not yet documented

`users` and `sessions` have shipped columns. Their full lists belong to Feature 1.

## Provenance

| Area | Introduced in |
|------|---------------|
| `recipes` table | Feature 2 — Recipe Management |
| Recipe foreign keys set `NOT NULL` with `ON DELETE CASCADE` | Feature 2 — Recipe Management |
| `recipeIngredients` and `recipeSteps` tables | Feature 3 — Recipe List Item Management |
| `ingredients` table and `userId` uniqueness | Feature 4 — Ingredient Catalogue Management; Feature 5 — Ingredients Management |
