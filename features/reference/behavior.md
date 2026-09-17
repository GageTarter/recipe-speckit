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
| A recipe is private to the user who created it | `getOwnedRecipeOrNull` in `backend/app/authorization/recipeScope.js` | Feature 2 |
| The owner of a new recipe comes from the session, never the request body | `recipe.controller.js` `create` sets `userId: req.user.id` | Feature 2 |
| Update cannot reassign a recipe to another user | `recipe.controller.js` `update` writes only `name`, `description`, `servings`, `time`, `isPublished` | Feature 2 |
| Requesting another user's recipe list answers `404` | `recipe.controller.js` `findAllForUser` compares `:userId` to the session user | Feature 2 |
| A recipe owned by someone else is indistinguishable from one that does not exist — both answer `404`, never `403` | Same `404` message from the ownership check | Feature 2 |
| Recipe ingredients and steps inherit ownership from the parent recipe | `getOwnedRecipeIngredientOrNull` / `getOwnedRecipeStepOrNull` | Feature 3 |
| Creating an item on another user's recipe answers `404` | Create handlers call `getOwnedRecipeOrNull` | Feature 3 |

## Validation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| `name`, `description`, `servings`, and `time` are required to create a recipe | `recipe.controller.js` `create` returns `400` | Feature 2 |
| `servings` and `time` must be positive integers on create and update | `positiveIntOrNull` in `recipe.controller.js` | Feature 2 |
| A new recipe is unpublished unless told otherwise | `create` defaults `isPublished` to `false` | Feature 2 |
| `quantity`, `recipeId`, and `ingredientId` are required to create a recipe ingredient | `recipeIngredient.controller.js` `create` returns `400` | Feature 3 |
| `quantity` must be greater than zero | `positiveQuantityOrNull` | Feature 3 |
| `stepNumber`, `instruction`, and `recipeId` are required to create a recipe step | `recipeStep.controller.js` `create` returns `400` | Feature 3 |
| `stepNumber` must be a positive integer | `positiveIntOrNull` | Feature 3 |

## Sort & display

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| A user's recipes are listed alphabetically by name | `order: [["name", "ASC"]]` in `findAllForUser` | Feature 2 |
| Steps are listed in step-number order | `order: [["stepNumber", "ASC"]]` | Feature 2, Feature 3 |
| A user with no recipes sees "No recipes yet. Add your first recipe." | `frontend/src/views/RecipeList.vue` | Feature 2 |
| Recipe cards show the summary collapsed and reveal ingredients and steps when clicked | `frontend/src/components/RecipeCardComponent.vue` | Feature 2 |
| Edit Recipe shows measured ingredients and steps for the recipe being edited | `frontend/src/views/EditRecipe.vue` | Feature 3 |
| Attached ingredients appear as chips on the step row | `step.recipeIngredient` rendered as `v-chip` | Feature 3 |

## Deletion

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Deleting a recipe deletes its steps and measured ingredients | `ON DELETE CASCADE` on the recipe foreign keys | Feature 2 |
| Delete-all removes only the session user's recipes | `recipe.controller.js` `deleteAll` filters on `userId: req.user.id` | Feature 2 |
| Deleting from the Recipes page requires a confirmation dialog that names the recipe | `RecipeCardComponent` emits `requestDelete`; `RecipeList.vue` owns the dialog | Feature 2 |
| Cancelling the delete dialog sends no request | `cancelDelete` clears `recipeToDelete` | Feature 2 |

## Known gaps

| Gap | Where |
|-----|-------|
| Unscoped list-all and delete-all routes for ingredients and steps are not owner-filtered | `recipeIngredient.controller.js` / `recipeStep.controller.js` `findAll` and `deleteAll` |
| GET `/recipeapi/recipes/` lists published recipes with no auth | Publishing feature not yet specified |
