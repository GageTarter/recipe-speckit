# API Reference

**Living snapshot** of routes on `dev`. Update this file when endpoints change.

All recipe routes are mounted at `/recipeapi` (see `backend/app/routes/recipe.routes.js`).

## Recipes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/recipeapi/recipes/` | Yes | Create a recipe owned by the session user |
| GET | `/recipeapi/recipes/user/:userId` | Yes | List the session user's recipes, A→Z |
| GET | `/recipeapi/recipes/:id` | Yes | Read one of the session user's recipes |
| PUT | `/recipeapi/recipes/:id` | Yes | Update one of the session user's recipes |
| DELETE | `/recipeapi/recipes/:id` | Yes | Delete one of the session user's recipes |

### POST `/recipeapi/recipes/`

Request:

```json
{ "name": "Chili", "description": "Weeknight chili", "servings": 4, "time": 45 }
```

`isPublished` is optional and defaults to `false`. Any `userId` in the body is
ignored — the owner is always taken from the session.

Responds `200` with the created recipe (not `201`):

```json
{
  "id": 1,
  "name": "Chili",
  "description": "Weeknight chili",
  "servings": 4,
  "time": 45,
  "isPublished": false,
  "userId": 7,
  "createdAt": "2026-09-16T21:00:00.000Z",
  "updatedAt": "2026-09-16T21:00:00.000Z"
}
```

`400` when `name`, `description`, `servings`, or `time` is missing, or when
`servings` / `time` is not a positive integer.

### GET `/recipeapi/recipes/user/:userId`

Responds `200` with an array of recipes sorted by `name` ASC, each including
nested `recipeStep` (sorted by `stepNumber` ASC) → `recipeIngredient` →
`ingredient`. Responds `404` when `:userId` is not the session user.

### GET `/recipeapi/recipes/:id`

Responds `200` with a **single-element array** (`[recipe]`) using the same nested
shape as the list route. Responds `404` when the recipe does not exist or belongs
to another user.

### PUT `/recipeapi/recipes/:id`

Accepts any of `name`, `description`, `servings`, `time`, `isPublished`. Other
fields in the body — including `userId` — are ignored, so ownership cannot be
reassigned.

Responds `200` with `{ "message": "Recipe was updated successfully." }`, `400`
when `servings` / `time` is present but not a positive integer, and `404` when
the recipe does not exist or belongs to another user.

### DELETE `/recipeapi/recipes/:id`

Responds `200` with `{ "message": "Recipe was deleted successfully!" }`, and
`404` when the recipe does not exist or belongs to another user. Deleting a
recipe also deletes its steps and measured ingredients.

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`; missing or expired
  tokens get `401`.
- A recipe belonging to another user answers `404`, never `403`.

## Shipped but not covered by a feature spec

These routes exist on the recipe router and are reachable, but no feature spec
or test covers them yet:

| Method | Path | Auth | Note |
|--------|------|------|------|
| GET | `/recipeapi/recipes/` | No | Lists all recipes where `isPublished` is true |
| DELETE | `/recipeapi/recipes/` | Yes | Deletes **every** recipe for **every** user — not owner-scoped |

Routes for auth, users, ingredients, recipe steps, and recipe ingredients are
also mounted in `backend/server.js` but are not yet documented here; they belong
to features that have not been specified.

## Provenance

| Area | Introduced in |
|------|---------------|
| Recipe create / list / read / update / delete | Feature 2 — Recipe Management |
