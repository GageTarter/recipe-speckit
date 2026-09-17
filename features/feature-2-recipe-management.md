# Feature: Recipe Management

**Feature ID:** 2
**Branch pattern:** `feature/2-recipe-management`
**Status:** Ready
**Created:** 2026-09-16
**Input:** Let a signed-in cook record, review, revise, and remove their own recipes.
**Depends on:** [Feature 1 — User Authentication & Session Management](./feature-list.md)
**Related:** [Feature 3 — Recipe List Item Management](./feature-list.md) owns the ingredients and steps inside a recipe.

---

## User Stories

### US-2.1: Create a recipe
**As a** signed-in user
**I want to** create a recipe with a name, description, servings, and time to make
**So that** I have somewhere to record a dish I cook

**Priority:** P1
**Independent test:** Submit the Add Recipe dialog and see the new recipe on the Recipes page
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: See only my own recipes
**As a** signed-in user
**I want to** see just the recipes I created on the Recipes page
**So that** my recipes stay separate from other users' recipes

**Priority:** P1
**Independent test:** Sign in as one user and confirm the page lists only that user's recipes
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: Review a recipe's details
**As a** user viewing the Recipes page
**I want to** expand a recipe card to read its ingredients and steps
**So that** I can cook from it without opening the edit screen

**Priority:** P1
**Independent test:** Expand one recipe card and confirm its ingredients and steps are displayed
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Update a recipe's details
**As a** signed-in user
**I want to** change a recipe's name, servings, time, or description
**So that** the recipe reflects how I actually make the dish now

**Priority:** P1
**Independent test:** Change the servings on Edit Recipe, save, and confirm the new value persists after reload
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria

### US-2.5: Delete a recipe
**As a** signed-in user
**I want to** delete a recipe I no longer want
**So that** my Recipes page stays limited to dishes I still cook

**Priority:** P2
**Independent test:** Delete one recipe and confirm it disappears from the Recipes page
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: Users MUST be signed in to create, update, or delete a recipe.
- **FR-002**: System MUST require `name`, `description`, `servings`, and `time` when creating a recipe.
- **FR-003**: System MUST reject a create request that omits a required field with `400` and a message naming that field (for example `"Name cannot be empty for recipe!"`).
- **FR-004**: System MUST set a new recipe's owner from the authenticated session — never from a `userId` supplied in the request body.
- **FR-005**: `servings` and `time` MUST be stored as integers greater than zero; `time` is a count of minutes.
- **FR-006**: A new recipe MUST default to unpublished when the request supplies no publish choice.
- **FR-007**: The Recipes page MUST list only recipes owned by the signed-in user.
- **FR-008**: Recipe lists MUST be ordered by `name` ascending, and each recipe's steps MUST be ordered by `stepNumber` ascending.
- **FR-009**: Users MUST be able to update `name`, `description`, `servings`, and `time` on a recipe they own.
- **FR-010**: System MUST NOT let a user read, update, or delete a recipe owned by another user; such a request MUST return `404` with `` `Cannot find Recipe with id=${id}.` `` rather than `403`.
- **FR-011**: A recipe card MUST show the recipe's name, servings, and time, and MUST expand on demand to show its ingredients and steps.
- **FR-012**: Deleting a recipe MUST also remove that recipe's steps and measured ingredients, leaving no orphaned rows.
- **FR-013**: System MUST return `404` with `` `Cannot find Recipe with id=${id}.` `` when the requested recipe does not exist.

---

## Assumptions

- Feature 1 authentication is already shipped: a signed-in user's session token is sent as `Authorization: Bearer <token>` and `req.user` is populated by `authenticateRoute`.
- The shared ingredient list (Feature 4) and the ingredients and steps inside a recipe (Feature 3) are managed elsewhere. This feature only **reads** them for the expandable card in US-2.3.
- Publishing is deliberately out of this feature. The `isPublished` flag is persisted here because the column is `NOT NULL`, but the publish/unpublish capability and the public browsing screen are a separate feature.
- Recipe names are not required to be unique, either globally or per user.

## Edge Cases

- Create request missing `name`, `description`, `servings`, or `time` → `400` naming the field.
- `servings` or `time` sent as zero, negative, or non-numeric → `400`.
- Update or delete aimed at another user's recipe id → `404`, and the row is unchanged.
- Update or delete aimed at an id that does not exist → `404`.
- Signed-in user with no recipes yet → Recipes page renders an empty state rather than an error.
- Recipe with no ingredients and no steps → the card still expands, with both sections empty.

## Success Criteria

- **SC-001**: Every Gherkin scenario in this file has at least one automated test before merge.
- **SC-002**: A signed-in user can create a recipe and see it on the Recipes page without reloading the browser.
- **SC-003**: No request can read, change, or delete a recipe owned by another user.

---

## Key Entities

- **User**: registered account from Feature 1; owns zero or more recipes.
- **Recipe**: one dish recorded by a user — its name, description, servings, time to make, and publish flag. Belongs to exactly one user. Has many steps and many measured ingredients.
- **RecipeStep** *(read-only here; owned by Feature 3)*: a numbered instruction belonging to one recipe.
- **RecipeIngredient** *(read-only here; owned by Feature 3)*: a quantity of a shared ingredient, belonging to one recipe.

### Data Ownership & Isolation

- A recipe is readable and writable only by the user whose `userId` is on the row.
- `userId` is assigned from the session on create and is never accepted from the client.
- Ownership failures return `404`, not `403`, so the existence of another user's recipe is not disclosed.

---

## Data Model Requirements

### `recipes` table

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `name` | STRING(255) | Required |
| `description` | STRING(255) | Required |
| `servings` | INTEGER | Required; greater than zero |
| `time` | INTEGER | Required; greater than zero; minutes |
| `isPublished` | BOOLEAN | Required; defaults to `false` |
| `userId` | INTEGER FK | Required; references `users.id`; `ON DELETE CASCADE` |
| `createdAt` | DATETIME | Managed by Sequelize |
| `updatedAt` | DATETIME | Managed by Sequelize |

### Associations

- `users` 1 — many `recipes` (`recipes.userId` → `users.id`)
- `recipes` 1 — many `recipeSteps` (`recipeSteps.recipeId` → `recipes.id`), cascade on delete
- `recipes` 1 — many `recipeIngredients` (`recipeIngredients.recipeId` → `recipes.id`), cascade on delete

### Changes from the shipped schema

Two deviations exist in the running app and must be corrected by this feature so FR-004, FR-010, and FR-012 can hold:

| Field / behavior | Shipped now | Required |
|---|---|---|
| `recipes.userId` | Nullable, `ON DELETE SET NULL` | Required, `ON DELETE CASCADE` |
| `recipeSteps.recipeId`, `recipeIngredients.recipeId` | `ON DELETE SET NULL` | `ON DELETE CASCADE` |

---

## Acceptance Criteria

### US-2.1 — Create a recipe

#### Scenario: User creates a recipe with all required details
*   **Given** I am signed in and on the Recipes page
*   **When** I open the Add Recipe dialog and enter name `Chili`, servings `4`, time `45`, and a description
*   **And** I click **Add Recipe**
*   **Then** the API returns `200` with the created recipe including an `id` and my `userId`
*   **And** `Chili` appears on the Recipes page without a browser reload

#### Scenario: New recipe defaults to unpublished
*   **Given** I am signed in on the Recipes page
*   **When** I add a recipe without turning the publish switch on
*   **Then** the stored recipe has `isPublished` set to `false`

#### Scenario: Create is rejected when the name is missing
*   **Given** I am signed in
*   **When** I send `POST /recipeapi/recipes/` with a description, servings, and time but no `name`
*   **Then** the API returns `400` with `"Name cannot be empty for recipe!"`
*   **And** no recipe is stored

#### Scenario: Create is rejected when servings is not a positive number
*   **Given** I am signed in
*   **When** I send `POST /recipeapi/recipes/` with `servings` set to `0`
*   **Then** the API returns `400`
*   **And** no recipe is stored

#### Scenario: Create is rejected without a session
*   **Given** I am not signed in
*   **When** I send `POST /recipeapi/recipes/` with a complete recipe body
*   **Then** the API returns `401`
*   **And** no recipe is stored

#### Scenario: Owner comes from the session, not the request body
*   **Given** I am signed in as the user with id `1`
*   **When** I send `POST /recipeapi/recipes/` with a complete recipe body and `userId` set to `2`
*   **Then** the stored recipe's `userId` is `1`

### US-2.2 — See only my own recipes

#### Scenario: Recipes page lists the signed-in user's recipes
*   **Given** I am signed in and I own recipes `Chili` and `Waffles`
*   **And** another user owns a recipe named `Gumbo`
*   **When** I open the Recipes page
*   **Then** I see `Chili` and `Waffles`
*   **And** I do not see `Gumbo`

#### Scenario: Recipes are listed in alphabetical order
*   **Given** I am signed in and I own recipes `Waffles`, `Chili`, and `Ramen`
*   **When** I open the Recipes page
*   **Then** the recipes appear in the order `Chili`, `Ramen`, `Waffles`

#### Scenario: Another user's recipes cannot be requested
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns a recipe
*   **When** I send `GET /recipeapi/recipes/user/2`
*   **Then** the API returns `404`
*   **And** no recipe belonging to user id `2` is returned

#### Scenario: A user with no recipes sees an empty page
*   **Given** I am signed in and own no recipes
*   **When** I open the Recipes page
*   **Then** no recipe cards are shown
*   **And** no error message is displayed

### US-2.3 — Review a recipe's details

#### Scenario: Card shows the recipe summary
*   **Given** I am on the Recipes page and I own a recipe `Chili` with `4` servings and a time of `45` minutes
*   **When** the page loads
*   **Then** the `Chili` card shows `4 Servings` and `45 minutes`

#### Scenario: Expanding a card reveals ingredients and steps
*   **Given** I am on the Recipes page and `Chili` has two measured ingredients and three steps
*   **When** I click the `Chili` card
*   **Then** its ingredients are listed with quantity, unit, and price per unit
*   **And** its steps are listed in ascending step number

#### Scenario: Expanding a recipe with no ingredients or steps
*   **Given** I am on the Recipes page and `Chili` has no ingredients and no steps
*   **When** I click the `Chili` card
*   **Then** the ingredients and steps sections are empty
*   **And** no error message is displayed

### US-2.4 — Update a recipe's details

#### Scenario: Owner updates a recipe's servings
*   **Given** I am signed in and own a recipe `Chili` with `4` servings
*   **When** I change servings to `6` on the Edit Recipe screen and click **Update Recipe**
*   **Then** the API returns `200` with `{ "message": "Recipe was updated successfully." }`
*   **And** reloading the recipe shows `6` servings

#### Scenario: Update is rejected for another user's recipe
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns the recipe with id `9`
*   **When** I send `PUT /recipeapi/recipes/9` with a new name
*   **Then** the API returns `404` with `{ "message": "Cannot find Recipe with id=9." }`
*   **And** recipe `9` keeps its original name

#### Scenario: Update is rejected for a recipe that does not exist
*   **Given** I am signed in
*   **When** I send `PUT /recipeapi/recipes/9999` with a new name
*   **Then** the API returns `404` with `{ "message": "Cannot find Recipe with id=9999." }`

#### Scenario: Update is rejected without a session
*   **Given** I am not signed in
*   **When** I send `PUT /recipeapi/recipes/1` with a new name
*   **Then** the API returns `401`
*   **And** recipe `1` is unchanged

### US-2.5 — Delete a recipe

#### Scenario: Owner deletes a recipe
*   **Given** I am signed in and own a recipe `Chili`
*   **When** I delete `Chili`
*   **Then** the API returns `200` with `{ "message": "Recipe was deleted successfully!" }`
*   **And** `Chili` no longer appears on the Recipes page

#### Scenario: Deleting a recipe removes its steps and ingredients
*   **Given** I am signed in and own a recipe `Chili` with two measured ingredients and three steps
*   **When** I delete `Chili`
*   **Then** no step or measured ingredient rows remain for that recipe

#### Scenario: Delete is rejected for another user's recipe
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns the recipe with id `9`
*   **When** I send `DELETE /recipeapi/recipes/9`
*   **Then** the API returns `404` with `{ "message": "Cannot find Recipe with id=9." }`
*   **And** recipe `9` still exists

#### Scenario: Delete is rejected without a session
*   **Given** I am not signed in
*   **When** I send `DELETE /recipeapi/recipes/1`
*   **Then** the API returns `401`
*   **And** recipe `1` still exists

---

## Data Ownership & Isolation

Each user owns their recipes exclusively. Recipes are private to their owner in this feature; making a recipe visible to anyone else is Feature 6's publishing capability.

| Rule | Requirement |
|------|-------------|
| **Read scope** | Recipe reads return only rows where `userId = req.user.id` |
| **Write scope** | `PUT` / `DELETE` succeed only when the row matches both `id` and `req.user.id` |
| **Create scope** | New recipes are owned by the authenticated user; a `userId` in the request body is ignored |
| **Cross-user access** | Another user's recipe → `404` (never `403`, so existence is not disclosed) |
| **UI scope** | The Recipes page renders only what the scoped API returned; it never filters unscoped data client-side |
| **Implementation** | Put the ownership lookup in a shared helper under `backend/app/authorization/` — do not repeat the scope check in each controller method |

See [security.mdc](../.cursor/rules/security.mdc) for the app-wide pattern.

---

## API Requirements

Mount prefix is `/recipeapi/` (see [reference/api.md](./reference/api.md)).

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/recipeapi/recipes/` | Yes | Create a recipe owned by the signed-in user |
| `GET` | `/recipeapi/recipes/user/:userId` | Yes | List the signed-in user's recipes, with nested steps and ingredients |
| `GET` | `/recipeapi/recipes/:id` | Yes | Read one recipe the signed-in user owns |
| `PUT` | `/recipeapi/recipes/:id` | Yes | Update a recipe the signed-in user owns |
| `DELETE` | `/recipeapi/recipes/:id` | Yes | Delete a recipe the signed-in user owns |

**Create request body** — `userId` is not accepted; the owner comes from the session:

```json
{ "name": "Chili", "description": "Weeknight chili", "servings": 4, "time": 45, "isPublished": false }
```

**Create success response** (`200`):

```json
{ "id": 7, "name": "Chili", "description": "Weeknight chili", "servings": 4, "time": 45, "isPublished": false, "userId": 1, "createdAt": "…", "updatedAt": "…" }
```

**Update success response** (`200`): `{ "message": "Recipe was updated successfully." }`
**Delete success response** (`200`): `{ "message": "Recipe was deleted successfully!" }`
**Error response:** `{ "message": "Human-readable explanation." }`
**Validation failure:** `400` — for example `{ "message": "Name cannot be empty for recipe!" }`
**Unauthenticated:** `401`
**Missing or not owned:** `404` with `` { "message": `Cannot find Recipe with id=${id}.` } `` — never `403`

### Changes to shipped behavior

| Endpoint | Shipped now | Required by this spec | Authorized by |
|---|---|---|---|
| `POST /recipes/` | Takes `userId` from the request body | Takes the owner from the session | FR-004 |
| `POST /recipes/` | Validates with a synchronous `throw`, so the `400` body is not JSON | Returns `400` with a JSON `{ message }` | FR-003 |
| `GET /recipes/user/:userId` | Filters on the URL parameter, so any signed-in user can read another user's recipes | Returns `404` when `:userId` is not the session user | FR-007, FR-010 |
| `GET /recipes/:id` | No auth and no ownership check | Requires a session and owner match | FR-010 |
| `DELETE /recipes/:id` | No ownership check at all | Owner match required, else `404` | FR-010 |

`GET /recipeapi/recipes/` (published recipes, unauthenticated) is untouched by this feature — see Out of Scope.

**Convention note:** create returns `200`, matching the shipped controller, rather than the `201` in [api-conventions.mdc](../.cursor/rules/api-conventions.mdc). Change both this section and the US-2.1 scenarios together if the team wants `201`.

---

## Screen Requirements

### [View: RecipeList] — route name `recipes`

*   Heading: **Recipes**
*   Primary action: **Add** (opens the Add Recipe dialog; primary labeled CTA per [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc))
*   Shown only when signed in; a signed-out visitor sees the published list instead (Feature 6)
*   One `RecipeCardComponent` per recipe, ordered by name ascending
*   **Add Recipe dialog** — fields **Name**, **Number of Servings**, **Time to Make (in minutes)**, **Description**, and a **Publish?** switch reading `Publish? Yes` / `Publish? No`; actions **Close** and **Add Recipe**
*   **Success feedback:** snackbar `"<name> added successfully!"`
*   **Empty state:** `"No recipes yet. Add your first recipe."`
*   **Loading / error:** error responses surface the API `message` in a snackbar; a failed load must not leave the page blank with no explanation

### [Component: RecipeCardComponent]

*   Shows the recipe name plus chips `"<servings> Servings"` and `"<time> minutes"`
*   Clicking the card expands it to show **Ingredients** (quantity, unit, name, price per unit) and **Recipe Steps** (step number, instruction, attached ingredient chips), steps ordered by step number
*   Expanded sections render empty rather than erroring when the recipe has no ingredients or steps
*   Icon actions need accessible names: `aria-label` **Edit recipe** (`mdi-pencil`, routes to `editRecipe`). The PDF icon belongs to Feature 7.

### [View: EditRecipe] — route name `editRecipe`, `props: true` on `/recipe/:id`

*   Heading: **Edit Recipe**
*   Recipe detail card with the same four fields as the Add dialog plus the **Publish?** switch
*   Primary action: **Update Recipe**
*   **Success feedback:** snackbar `"<name> updated successfully!"`
*   **Not owned / missing:** the `404` from the API surfaces as an error message; the form does not silently render an empty recipe
*   The Ingredients and Steps cards on this screen belong to [Feature 3](./feature-list.md) — this feature only owns the recipe detail card

---

## Test Coverage Map

Each scenario in Acceptance Criteria maps to at least one automated test.

| Story | Scenario | Test file | Test name |
|-------|----------|-----------|-----------|
| US-2.1 | User creates a recipe with all required details | `backend/tests/recipes.test.js` | `User creates a recipe with all required details` |
| US-2.1 | New recipe defaults to unpublished | `backend/tests/recipes.test.js` | `New recipe defaults to unpublished` |
| US-2.1 | Create is rejected when the name is missing | `backend/tests/recipes.test.js` | `Create is rejected when the name is missing` |
| US-2.1 | Create is rejected when servings is not a positive number | `backend/tests/recipes.test.js` | `Create is rejected when servings is not a positive number` |
| US-2.1 | Create is rejected without a session | `backend/tests/recipes.test.js` | `Create is rejected without a session` |
| US-2.1 | Owner comes from the session, not the request body | `backend/tests/recipes.test.js` | `Owner comes from the session, not the request body` |
| US-2.2 | Recipes page lists the signed-in user's recipes | `frontend/tests/RecipeList.test.js` | `Recipes page lists the signed-in user's recipes` |
| US-2.2 | Recipes are listed in alphabetical order | `backend/tests/recipes.test.js` | `Recipes are listed in alphabetical order` |
| US-2.2 | Another user's recipes cannot be requested | `backend/tests/recipes.test.js` | `Another user's recipes cannot be requested` |
| US-2.2 | A user with no recipes sees an empty page | `frontend/tests/RecipeList.test.js` | `A user with no recipes sees an empty page` |
| US-2.3 | Card shows the recipe summary | `frontend/tests/RecipeCardComponent.test.js` | `Card shows the recipe summary` |
| US-2.3 | Expanding a card reveals ingredients and steps | `frontend/tests/RecipeCardComponent.test.js` | `Expanding a card reveals ingredients and steps` |
| US-2.3 | Expanding a recipe with no ingredients or steps | `frontend/tests/RecipeCardComponent.test.js` | `Expanding a recipe with no ingredients or steps` |
| US-2.4 | Owner updates a recipe's servings | `backend/tests/recipes.test.js` | `Owner updates a recipe's servings` |
| US-2.4 | Update is rejected for another user's recipe | `backend/tests/recipes.test.js` | `Update is rejected for another user's recipe` |
| US-2.4 | Update is rejected for a recipe that does not exist | `backend/tests/recipes.test.js` | `Update is rejected for a recipe that does not exist` |
| US-2.4 | Update is rejected without a session | `backend/tests/recipes.test.js` | `Update is rejected without a session` |
| US-2.5 | Owner deletes a recipe | `backend/tests/recipes.test.js` | `Owner deletes a recipe` |
| US-2.5 | Deleting a recipe removes its steps and ingredients | `backend/tests/recipes.test.js` | `Deleting a recipe removes its steps and ingredients` |
| US-2.5 | Delete is rejected for another user's recipe | `backend/tests/recipes.test.js` | `Delete is rejected for another user's recipe` |
| US-2.5 | Delete is rejected without a session | `backend/tests/recipes.test.js` | `Delete is rejected without a session` |

No Gherkin scenario exercises `GET /recipeapi/recipes/:id` directly, so
`backend/tests/recipes.test.js` adds three tests beyond the map — `Owner reads
their own recipe`, `Reading another user's recipe is rejected`, and `Reading a
recipe without a session is rejected` — to hold **FR-007** and **SC-003**. A
fourth, `Delete all leaves other users' recipes untouched`, holds **SC-003** for
the delete-all route.

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 2 from @features/feature-2-recipe-management.md on branch `feature/2-recipe-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/api.md` (recipe endpoints and auth), `features/reference/data-model.md` (`recipes` ownership and cascade), `features/reference/behavior.md` (recipe ownership rules).

---

## Definition of Done

*   [x] Backend and frontend implemented per this spec (**FR-001** through **FR-013** satisfied)
*   [x] **Success Criteria SC-001 through SC-003** met
*   [x] All 21 mapped tests pass (`cd backend && npx jest tests/recipes.test.js`, `cd frontend && npx vitest run tests/RecipeList.test.js tests/RecipeCardComponent.test.js`)
*   [x] Test Coverage Map complete, with one `it` per scenario using the exact scenario title
*   [x] `features/reference/data-model.md` updated for the `recipes` ownership and cascade changes
*   [x] `features/reference/api.md` updated for the recipe endpoints and their auth requirements
*   [x] `features/reference/behavior.md` updated for the recipe ownership rules
*   [x] Catalog row present in [project README §2.3](../README.md#23-feature-catalog)

---

## Out of Scope

*   Publishing, unpublishing, and the public published-recipe browsing screen, including `GET /recipeapi/recipes/` — a later publishing feature
*   Measured ingredients and numbered steps inside a recipe ([Feature 3 — Recipe List Item Management](./feature-list.md))
*   The shared ingredient list with units and prices ([Feature 4 — Ingredients Management](./feature-list.md))
*   Exporting a recipe to PDF
*   Recipe search, filtering, tags, and images
*   Exposing `DELETE /recipeapi/recipes/` (delete-all) in the UI — no story here needs it. The route itself was scoped to the session user under **SC-003**, because it previously deleted every user's recipes.
