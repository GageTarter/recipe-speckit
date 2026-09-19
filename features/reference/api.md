# API Reference

**Status:** Feature 5 ingredients management (this branch). Mount: `/recipeapi`.

## Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/recipeapi/ingredients` | Yes | Caller’s ingredients, `name` ASC |
| `POST` | `/recipeapi/ingredients` | Yes | Create; `201`; `userId` from session |
| `PUT` | `/recipeapi/ingredients/:id` | Yes | Update owned row; `200` + success message |
| `DELETE` | `/recipeapi/ingredients/:id` | Yes | Delete owned row; `200` or `204` |

Starter `GET /recipeapi/ingredients/:id` and `DELETE /recipeapi/ingredients` (delete-all) remain authenticated and owner-scoped; they are not Feature 5 Gherkin.

**Create body:** `{ "name": "Butter", "unit": "sticks", "pricePerUnit": 1.5 }`

**Create `201`:** `{ "id": 1, "name": "Butter", "unit": "sticks", "pricePerUnit": 1.5, "userId": 42 }` (timestamps may also be present)

**Update `200`:** `{ "message": "Ingredient was updated successfully." }`

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`.
- Not found / not owned: `404` (not `403`).
- Quoted validation: name &gt; 100 chars → `Ingredient name must be 100 characters or fewer.`; non-numeric price → `Ingredient price per unit must be a number.`
