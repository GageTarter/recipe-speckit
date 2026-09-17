# Behavior & Rules Reference

**Living snapshot** of product rules currently in force on `dev`.

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md`.

| File | Role |
|------|------|
| [api.md](./api.md) | Routes / payloads |
| [data-model.md](./data-model.md) | Tables / columns |
| **This file** | Ownership, sort, validation, UI rules |

## Ownership & isolation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Recipe ingredients and steps inherit ownership from the parent recipe | `getOwnedRecipeOrNull` / child helpers in `backend/app/authorization/recipeScope.js` | Feature 3 |
| Creating an item on another user's recipe answers `404` | Create handlers call `getOwnedRecipeOrNull` | Feature 3 |
| Updating or deleting another user's item answers `404`, never `403` | `getOwnedRecipeIngredientOrNull` / `getOwnedRecipeStepOrNull` | Feature 3 |

## Validation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| `quantity`, `recipeId`, and `ingredientId` are required to create a recipe ingredient | `recipeIngredient.controller.js` `create` returns `400` | Feature 3 |
| `quantity` must be greater than zero | `positiveQuantityOrNull` | Feature 3 |
| `stepNumber`, `instruction`, and `recipeId` are required to create a recipe step | `recipeStep.controller.js` `create` returns `400` | Feature 3 |
| `stepNumber` must be a positive integer | `positiveIntOrNull` | Feature 3 |

## Sort & display

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Steps are listed in step-number order | `order: [["stepNumber", "ASC"]]` in `findAllForRecipeWithIngredients` | Feature 3 |
| Edit Recipe shows measured ingredients and steps for the recipe being edited | `frontend/src/views/EditRecipe.vue` | Feature 3 |
| Attached ingredients appear as chips on the step row | `step.recipeIngredient` rendered as `v-chip` | Feature 3 |

## Known gaps

| Gap | Where |
|-----|-------|
| Unscoped list-all and delete-all routes for ingredients and steps are not owner-filtered | `recipeIngredient.controller.js` / `recipeStep.controller.js` `findAll` and `deleteAll` |
