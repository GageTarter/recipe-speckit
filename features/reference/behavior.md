# Behavior & Rules Reference

Living snapshot of product rules in force for ingredients on this branch. Specs still authorize new work.

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Catalogue ingredients belong to the signed-in user | `userId` set from `req.user.id` on create; list/update/delete scoped via `getAccessibleIngredientOrNull` / `userId` | Feature 5 |
| Cross-user ingredient access | `404` (not `403`) | Feature 5 |
| List sort | `name` ASC | Feature 5 |
| Name max 100 characters | `400` `{ "message": "Ingredient name must be 100 characters or fewer." }` | Feature 5 |
| `pricePerUnit` must be numeric | `400` `{ "message": "Ingredient price per unit must be a number." }` | Feature 5 |
| Name and unit stored as typed | No case fold or unit enum on write | Feature 5 |
| Ingredients screen CTA | **+ New Ingredient**; edit/delete icon `aria-label`s | Feature 5 |
| Required-field copy | Inline: `Ingredient name is required.` / unit / price per unit | Feature 5 |
| API errors on Ingredients | `<v-alert type="error">` | Feature 5 |
