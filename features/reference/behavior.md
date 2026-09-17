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
| A recipe is private to the user who created it | `getOwnedRecipeOrNull` in `backend/app/authorization/recipeScope.js`, used by read-one, update, and delete | Feature 2 |
| The owner of a new recipe comes from the session, never the request body | `recipe.controller.js` `create` sets `userId: req.user.id` | Feature 2 |
| Update cannot reassign a recipe to another user | `recipe.controller.js` `update` writes only `name`, `description`, `servings`, `time`, `isPublished` | Feature 2 |
| Requesting another user's recipe list answers `404` | `recipe.controller.js` `findAllForUser` compares `:userId` to the session user | Feature 2 |
| A recipe owned by someone else is indistinguishable from one that does not exist — both answer `404`, never `403` | Same `404` message from the ownership check | Feature 2 |

## Validation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| `name`, `description`, `servings`, and `time` are required to create a recipe | `recipe.controller.js` `create` returns `400` with a per-field message | Feature 2 |
| `servings` and `time` must be positive integers on create and update | `positiveIntOrNull` in `recipe.controller.js` returns `400` | Feature 2 |
| A new recipe is unpublished unless told otherwise | `create` defaults `isPublished` to `false` | Feature 2 |

## Sort & display

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| A user's recipes are listed alphabetically by name | `order: [["name", "ASC"]]` in `findAllForUser` | Feature 2 |
| Steps within a recipe are returned in step-number order | `order: [[RecipeStep, "stepNumber", "ASC"]]` in `findAllForUser` and `findOne` | Feature 2 |
| A user with no recipes sees "No recipes yet. Add your first recipe." rather than an empty page | `frontend/src/views/RecipeList.vue` | Feature 2 |
| Recipe cards show the summary collapsed and reveal ingredients and steps when clicked | `frontend/src/components/RecipeCardComponent.vue` | Feature 2 |

## Deletion

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Deleting a recipe deletes its steps and measured ingredients | `ON DELETE CASCADE` on the recipe foreign keys in `backend/app/models/index.js` | Feature 2 |
| Delete-all removes only the session user's recipes | `recipe.controller.js` `deleteAll` filters on `userId: req.user.id` | Feature 2 |

## Known gaps

| Gap | Where |
|-----|-------|
| There is no UI control for deleting a recipe, so US-2.5 is only exercised through the API | `frontend/src/views/RecipeList.vue` |
