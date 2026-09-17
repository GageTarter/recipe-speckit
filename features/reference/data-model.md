# Data Model Reference

**Living snapshot** of the schema on `dev`. Update this file when schema changes.

Sequelize adds `id` (INTEGER, PK, auto-increment) plus `createdAt` and
`updatedAt` (DATETIME) to every table below.

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

## Associations

| From | To | Rule |
|------|----|------|
| `users` | `recipes` | One-to-many. `recipes.userId` is `NOT NULL`; deleting a user deletes their recipes. |
| `recipes` | `recipeSteps` | One-to-many. `recipeSteps.recipeId` is `NOT NULL`; deleting a recipe deletes its steps. |
| `recipes` | `recipeIngredients` | One-to-many. `recipeIngredients.recipeId` is `NOT NULL`; deleting a recipe deletes its measured ingredients. |
| `ingredients` | `recipeIngredients` | One-to-many |
| `recipeSteps` | `recipeIngredients` | One-to-many; `recipeStepId` may be null until a cook attaches the ingredient |

Associations are declared in `backend/app/models/index.js`.

## Not yet documented

`users`, `sessions`, and `ingredients` have shipped columns. Their full lists
belong to the features that own them.

## Provenance

| Area | Introduced in |
|------|---------------|
| `recipes` table | Feature 2 — Recipe Management |
| Recipe foreign keys set `NOT NULL` with `ON DELETE CASCADE` | Feature 2 — Recipe Management |
| `recipeIngredients` and `recipeSteps` tables | Feature 3 — Recipe List Item Management |
