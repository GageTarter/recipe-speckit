# Data Model Reference

**Living snapshot** of the schema on `dev`. Update this file when schema changes.

Sequelize adds `id` (INTEGER, PK, auto-increment) plus `createdAt` and
`updatedAt` (DATETIME) to every table below.

## Tables

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
| `recipes` | `recipeIngredients` | One-to-many |
| `ingredients` | `recipeIngredients` | One-to-many |
| `recipeSteps` | `recipeIngredients` | One-to-many; `recipeStepId` may be null until a cook attaches the ingredient |
| `recipes` | `recipeSteps` | One-to-many |

## Not yet documented

`users`, `sessions`, `recipes`, and `ingredients` have shipped columns. Their full lists belong to the features that own them.

## Provenance

| Area | Introduced in |
|------|---------------|
| `recipeIngredients` and `recipeSteps` tables | Feature 3 — Recipe List Item Management |
