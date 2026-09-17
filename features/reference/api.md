# API Reference

**Living snapshot** of routes on `dev`. Update this file when endpoints change.

All recipe-item routes are mounted at `/recipeapi`.

## Recipe ingredients

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/recipeapi/recipes/:recipeId/recipeIngredients/` | Yes | Add a measured ingredient to the session user's recipe |
| GET | `/recipeapi/recipes/:recipeId/recipeIngredients/` | Yes | List that recipe's measured ingredients, with nested `ingredient` |
| PUT | `/recipeapi/recipes/:recipeId/recipeIngredients/:id` | Yes | Update quantity, ingredient, or attached step |
| DELETE | `/recipeapi/recipes/:recipeId/recipeIngredients/:id` | Yes | Remove a measured ingredient |

Create request:

```json
{ "quantity": 2, "recipeId": 7, "ingredientId": 3 }
```

`recipeStepId` is optional. Create responds `200` with the stored row. Missing `quantity` returns `400` with `"Quantity cannot be empty for recipe ingredient!"`. A recipe that is missing or owned by someone else returns `404`.

## Recipe steps

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/recipeapi/recipes/:recipeId/recipeSteps/` | Yes | Add a numbered step to the session user's recipe |
| GET | `/recipeapi/recipes/:recipeId/recipeStepsWithIngredients/` | Yes | List that recipe's steps in `stepNumber` ASC, with attached ingredients |
| PUT | `/recipeapi/recipes/:recipeId/recipeSteps/:id` | Yes | Update number or instruction |
| DELETE | `/recipeapi/recipes/:recipeId/recipeSteps/:id` | Yes | Delete a step |

Create request:

```json
{ "stepNumber": 1, "instruction": "Simmer the beans", "recipeId": 7 }
```

Create responds `200`. Missing `instruction` returns `400` with `"Description cannot be empty for recipe step!"`.

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`; missing or expired tokens get `401`.
- Another user's recipe or its items answers `404`, never `403`.

## Shipped but not covered by this feature

Unscoped list-all and delete-all routes for ingredients and steps still exist on the routers. Auth, users, recipes, and the shared ingredient catalog belong to other features.

## Provenance

| Area | Introduced in |
|------|---------------|
| Recipe ingredient and step CRUD on a recipe | Feature 3 — Recipe List Item Management |
