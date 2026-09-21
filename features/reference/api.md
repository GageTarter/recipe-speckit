# API Reference

**Living snapshot** of routes after Features 1–6. Update this file when endpoints change.

All routes below are mounted at `/recipeapi`.

## Recipes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/recipeapi/recipes/` | Yes | Create a recipe owned by the session user |
| GET | `/recipeapi/recipes/user/:userId` | Yes | List the session user's recipes, A→Z |
| GET | `/recipeapi/recipes/:id` | Yes | Read one of the session user's recipes |
| PUT | `/recipeapi/recipes/:id` | Yes | Update one of the session user's recipes |
| DELETE | `/recipeapi/recipes/:id` | Yes | Delete one of the session user's recipes |
| DELETE | `/recipeapi/recipes/` | Yes | Delete all of the session user's recipes |

### POST `/recipeapi/recipes/`

Request:

```json
{ "name": "Chili", "description": "Weeknight chili", "servings": 4, "time": 45 }
```

`isPublished` is optional and defaults to `false`. Any `userId` in the body is
ignored — the owner is always taken from the session.

Responds `200` with the created recipe (not `201`). `400` when `name`,
`description`, `servings`, or `time` is missing, or when `servings` / `time` is
not a positive integer.

### GET `/recipeapi/recipes/user/:userId`

Responds `200` with an array of recipes sorted by `name` ASC. Responds `404`
when `:userId` is not the session user.

### GET `/recipeapi/recipes/:id`

Responds `200` with a **single-element array** (`[recipe]`). Responds `404` when
the recipe does not exist or belongs to another user.

### PUT `/recipeapi/recipes/:id`

Accepts any of `name`, `description`, `servings`, `time`, `isPublished`. Other
fields — including `userId` — are ignored.

Responds `200` with `{ "message": "Recipe was updated successfully." }`.

### DELETE `/recipeapi/recipes/:id`

Responds `200` with `{ "message": "Recipe was deleted successfully!" }`. Deleting
a recipe also deletes its steps and measured ingredients.

### DELETE `/recipeapi/recipes/`

Deletes every recipe owned by the session user. Other users' recipes are
untouched. No screen calls this route.

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

`recipeStepId` is optional. Create responds `200`. Missing `quantity` returns
`400` with `"Quantity cannot be empty for recipe ingredient!"`. A recipe that is
missing or owned by someone else returns `404`.

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

Create responds `200`. Missing `instruction` returns `400` with
`"Description cannot be empty for recipe step!"`.

## Ingredients

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/recipeapi/ingredients` | Yes | Caller's ingredients, `name` ASC |
| `POST` | `/recipeapi/ingredients` | Yes | Create; `201`; `userId` from session |
| `PUT` | `/recipeapi/ingredients/:id` | Yes | Update owned row; `200` + success message |
| `DELETE` | `/recipeapi/ingredients/:id` | Yes | Delete owned row; `200` or `204` |

Starter `GET /recipeapi/ingredients/:id` and `DELETE /recipeapi/ingredients` (delete-all) remain authenticated and owner-scoped; they are not Feature 4/5 Gherkin.

**Create body:** `{ "name": "Butter", "unit": "sticks", "pricePerUnit": 1.5 }`

**Create `201`:** `{ "id": 1, "name": "Butter", "unit": "sticks", "pricePerUnit": 1.5, "userId": 42 }` (timestamps may also be present)

**Update `200`:** `{ "message": "Ingredient was updated successfully." }`

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`; missing or expired
  tokens get `401`.
- Another user's recipe, recipe item, or catalogue ingredient answers `404`, never `403`.
- Ingredient name &gt; 100 chars → `Ingredient name must be 100 characters or fewer.`
- Non-numeric `pricePerUnit` → `Ingredient price per unit must be a number.`

## Shipped but not covered by a feature spec

| Method | Path | Auth | Note |
|--------|------|------|------|
| GET | `/recipeapi/recipes/` | No | Lists all recipes where `isPublished` is true |

Unscoped list-all and delete-all routes for recipe ingredients and steps still exist
on the routers.

## Provenance

| Area | Introduced in |
|------|---------------|
| Recipe create / list / read / update / delete | Feature 2 — Recipe Management |
| Recipe ingredient and step CRUD on a recipe | Feature 3 — Recipe List Item Management |
| Catalogue ingredient create / list / update / delete | Feature 4 — Ingredient Catalogue Management; Feature 5 — Ingredients Management |
