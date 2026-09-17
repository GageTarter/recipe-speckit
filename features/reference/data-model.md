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

## Associations

| From | To | Rule |
|------|----|------|
| `users` | `recipes` | One-to-many. `recipes.userId` is `NOT NULL`; deleting a user deletes their recipes. |
| `recipes` | `recipeSteps` | One-to-many. `recipeSteps.recipeId` is `NOT NULL`; deleting a recipe deletes its steps. |
| `recipes` | `recipeIngredients` | One-to-many. `recipeIngredients.recipeId` is `NOT NULL`; deleting a recipe deletes its measured ingredients. |

Associations are declared in `backend/app/models/index.js`.

## Not yet documented

`users`, `sessions`, `ingredients`, `recipeSteps`, and `recipeIngredients` have
shipped columns, but only their recipe-side foreign keys are recorded above.
Their full column lists belong to the features that own them, which have not
been specified yet.

## Provenance

| Area | Introduced in |
|------|---------------|
| `recipes` table | Feature 2 — Recipe Management |
| Recipe foreign keys set `NOT NULL` with `ON DELETE CASCADE` | Feature 2 — Recipe Management |
