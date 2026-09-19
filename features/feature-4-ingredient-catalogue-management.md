# Feature: Ingredient Catalogue Management

**Feature ID:** 4
**Branch Pattern:** `feature/4-ingredient-catalogue-management`
**Status:** Ready
**Created:** 2026-9-16
**Input:** Ingredients created and managed by the user currently signed in
**Depends on:** [Feature 1 — User Authentication](feature-1-user-authentification.md)
**Related:** [features/reference/api.md](./reference/api.md), [features/reference/data-model.md](./reference/data-model.md), [features/reference/behavior.md](./reference/behavior.md)

---

# User Stories

### US-4.1 Add a catalogue ingredient
**As a** signed-in user
**I want to** add an ingredient with a name, a unit of measure, and a price per unit
**So that** I can reuse it across any recipe without retyping its details
**Priority:** P1
**Independent test:** Submit the Add Ingredient dialogue and see the ingredient in the Ingredients table
**Acceptance scenarios:** see ### US-4.1 under Acceptance Criteria

### US-4.2 Browse the ingredient catalogue
**As a** signed-in user
**I want to** see every catalogue ingredient with its unit and price
**So that** I know what is already available before adding a duplicate
**Priority:** P1
**Independent test:** Open the Ingredients page and confirm each row shows name, unit, and price
**Acceptance scenarios:** see ### US-4.2 under Acceptance Criteria

### US-4.3 Correct an ingredient's unit or price
**As a** signed-in user
**I want to** edit a catalogue ingredient's unit or price per unit
**So that** recipe costs stay accurate when prices change
**Priority:** P2
**Independent test:** Edit one ingredient's price and confirm the table shows the new value
**Acceptance scenarios:** see ### US-4.3 under Acceptance Criteria

### US-4.4 Remove a catalogue ingredient
**As a** signed-in user
**I want to** remove an ingredient I no longer stock
**So that** the catalogue does not fill up with things I cannot buy
**Priority:** P3
**Independent test:** Delete an unused ingredient and confirm it leaves the Ingredients table
**Acceptance scenarios:** see ### US-4.4 under Acceptance Criteria

---

## Requirements

## Functional Requirements

-- **FR-001:** User must fill all fields, including the name, unit of measurement, and price per unit.
-- **FR-002:** Created ingredients must be stored for each user so that they can view and manage them whenever they are signed in.
-- **FR-003:** Created ingredients must be accessible only by the user who created them.
-- **FR-004:** User must fill all fields when making edits to an existing ingredient.
-- **FR-005:** Edited information must be updated in the affected ingredient when a user makes a change.
-- **FR-006:** Ingredient must be completely erased when the delete option is selected by the user.
-- **FR-007:** Created ingredients must be listed in alphabetical order.

---

## Assumptions

- Feature 1 auth and session handling MUST be merged to `dev` before implementing this feature.

## Edge Cases
- Empty or whitespace-only ingredient data fields → `400`.
- Name or unit longer than 100 characters → `400`.
- `pricePerUnit` that is not a number → `400`.
- Invalid `ingredientId` → `400`.

## Success Criteria
- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: Signed-in user can create, view, edit, and delete ingredients on one screen without being able to access other users' private recipes and ingredients.
- **SC-003**: `npm test` passes for ingredient API and dashboard ingredients-view behavior.

## Data Ownership & Isolation

Each user owns their catalogue ingredients exclusively. List, create, update, and delete operate only on the signed-in user's rows (**FR-002**, **FR-003**, **SC-002**).

| Rule | Requirement |
|------|-------------|
| **Read scope** | `GET /recipeapi/ingredients` returns only rows where `userId = req.user.id`, ordered by `name` ascending (**FR-007**) |
| **Write scope** | `PUT` / `DELETE /recipeapi/ingredients/:id` succeed only when the row matches `id` and `req.user.id` |
| **Create scope** | New rows are owned by the authenticated user; set `userId` from the session (`req.user.id`), never from the request body |
| **Cross-user access** | Another user's ingredient, or a missing id → `404` (not `403`) |
| **UI scope** | `IngredientList.vue` shows only the array returned for the signed-in user; do not filter unsafe extra rows in the client |
| **Implementation** | Protect mutating and list routes with `authenticateRoute`. Scope queries by `req.user.id` the same way recipe update already checks `existing.userId !== req.user?.id` — do not duplicate ad-hoc ownership rules in the Vue view |

Unauthenticated callers → `401`.

## Key Entities

-- **Ingredient** named group belonging to one user.
-- **User** owns many ingredients (from Feature 1).

## API Requirements

Mount prefix is `/recipeapi` (existing `server.js` + `IngredientServices.js`). Paths below match `backend/app/routes/ingredient.routes.js`. All four endpoints require `Authorization: Bearer <token>`.

JSON property `unit` matches the running app, the Data Model column `unit`, and Gherkin.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/recipeapi/ingredients` | Yes | List the caller's catalogue, alphabetical by `name` (**FR-007**, US-4.2) |
| `POST` | `/recipeapi/ingredients` | Yes | Create a catalogue ingredient (**FR-001**, US-4.1) |
| `PUT` | `/recipeapi/ingredients/:id` | Yes | Replace name, unit, and price on an owned ingredient (**FR-004**, **FR-005**, US-4.3) |
| `DELETE` | `/recipeapi/ingredients/:id` | Yes | Erase an owned ingredient (**FR-006**, US-4.4) |

`:id` is the ingredient primary key. Non-numeric / invalid `ingredientId` → `400` (Edge Cases).

This feature does **not** add `GET /recipeapi/ingredients/:id` or `DELETE /recipeapi/ingredients` (delete-all). Those exist in the current backend but are not authorized by these FRs/Gherkin.

**Create request body:**
```json
{ "name": "Butter", "unit": "sticks", "pricePerUnit": 1.50 }
```

**Create success** (`201`):
```json
{ "id": 1, "name": "Butter", "unit": "sticks", "pricePerUnit": 1.50, "userId": 42 }
```

Returned `userId` MUST match the authenticated user.

**Update request body:** same three fields as create (all required — **FR-004**).

**Update success** (`200`) — same body the running app returns today:
```json
{ "message": "Ingredient was updated successfully." }
```

**Delete success:** `200` or `204` (US-4.4). No requirement to return a message body.

**List success** (`200`): array of ingredient objects for the caller only, sorted by `name` ascending. Empty catalogue → `[]`.

**Error response:** `{ "message": "Human-readable explanation." }`  
**Quoted validation (AC):**
- Name longer than 100 characters → `400` `{ "message": "Ingredient name must be 100 characters or fewer." }`
- `pricePerUnit` not a number → `400` `{ "message": "Ingredient price per unit must be a number." }`

**Other errors:** empty or whitespace-only fields on a request that reaches the API → `400`; unauthenticated → `401`; missing or not owned → `404` (do not use `403`). Flat JSON — no `{ success, data }` envelope.

## Screen Requirements

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled CTAs use class `oc-cta`. Errors that Gherkin names use `<v-alert type="error">`.

### [View: Ingredients] — route name `ingredients`

*   **Route:** `/ingredients` → `frontend/src/views/IngredientList.vue` (existing `router.js`).
*   **Heading:** **Ingredients**
*   **Purpose:** One screen to create, browse, edit, and delete the signed-in user's catalogue (**SC-002**).
*   **Primary action:** **+ New Ingredient** (`oc-cta`) — opens the add dialog (US-4.1).
*   **Table columns:** Name, Unit, Price Per Unit, Actions. Each row shows that ingredient's name, unit, and price (US-4.2).
*   **Row actions (icon-only, `size="small"`):**
    *   **Edit Ingredient** — `aria-label="Edit Ingredient"`; opens the edit dialog (US-4.3).
    *   Delete icon on the row — `aria-label` **Delete ingredient**; opens the delete confirm dialog (US-4.4).
*   **Add dialog:** fields Name, Unit, and Price Per Unit, all required. Confirm submits create; **Close** dismisses without saving (existing dialog chrome). Dialog closes after a successful create.
*   **Edit dialog:** same three fields, prefilled from the row. Confirm submits update; **Close** dismisses. Dialog closes after a successful update. Click target and title use **Edit Ingredient**.
*   **Delete dialog:** confirm then call `DELETE`; cancel/close leaves the row in place.
*   **Inline validation** (no API request) — exact AC copy:
    *   **"Ingredient name is required."**
    *   **"Ingredient unit is required."**
    *   **"Ingredient price per unit is required."**
*   **Empty state:** when the caller has no ingredients, the table shows no ingredient rows (US-4.2 — "no ingredients should be displayed").
*   **Loading:** table or page loading indicator while `getIngredients` is in flight.
*   **Error:** API failures and quoted `400` messages display in `<v-alert type="error">`.

Unit of measure is a required field the user fills (Gherkin example `sticks`). This feature does not require a fixed unit dropdown.

**App chrome**

*   Existing `MenuBar` **Ingredients** button (`:to="{ name: 'ingredients' }"`) is how US-4.2 "open the ingredients menu" is reached. This feature does not add a new nav item.
*   MenuBar stays hidden on login (Feature 1). Recipes navigation stays on Feature 2.

## Data Model Requirements

### `ingredients` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER | PK, auto-increment |
| `userId` | INTEGER | Required, FK → `users.id`, `ON DELETE CASCADE` |
| `name` | STRING(100) | Required; unique per (`userId`, `name`); stored and displayed as typed |
| `unit` | STRING(100) | Required; stored and displayed as typed |
| `pricePerUnit` | DECIMAL(10, 2) | Required; numeric |
| `createdAt` | DATE | Sequelize timestamp |
| `updatedAt` | DATE | Sequelize timestamp |

### Associations

*   **User** hasMany **Ingredient**
*   **Ingredient** belongsTo **User** (`userId`)
*   Unique constraint on (`userId`, `name`): two users may both own `Butter`; the same user may not.
*   The running app already has **Ingredient** hasMany **RecipeIngredient**; attaching ingredients to recipes is Out of Scope for this feature — do not drop that association.

## Acceptance Criteria (Gherkin)

### US-4.1 — Add a catalogue ingredient

#### Scenario: User creates a new ingredient
*   **Given** I am signed in on the dashboard
*   **When** I click **+ New Ingredient**
*   **And** I enter ingredient name `Butter`
*   **And** I enter unit `sticks`
*   **And** I enter price per unit `1.50`
*   **And** I confirm the dialog
*   **Then** the API returns `201` with an ingredient object containing `id`, `name`, `unit`, `pricePerUnit`, and `userId`
*   **And** the returned `userId` matches my authenticated user ID
*   **And** `Butter` appears in the ingredients view
*   **And** the add-ingredient dialog closes

#### Scenario: User creates an ingredient with an empty name
*   **Given** I am signed in on the dashboard
*   **When** I open the new ingredient dialog
*   **And** I leave the name field empty or whitespace only
*   **And** I attempt to confirm
*   **Then** inline validation blocks the request
*   **And** I see the message **"Ingredient name is required."**
*   **And** no API request is sent

#### Scenario: User creates an ingredient with an empty unit
*   **Given** I am signed in on the dashboard
*   **When** I open the new ingredient dialog
*   **And** I leave the unit field empty or whitespace only
*   **And** I attempt to confirm
*   **Then** inline validation blocks the request
*   **And** I see the message **"Ingredient unit is required."**
*   **And** no API request is sent

#### Scenario: User creates an ingredient with an empty price per unit
*   **Given** I am signed in on the dashboard
*   **When** I open the new ingredient dialog
*   **And** I leave the price per unit field empty or whitespace only
*   **And** I attempt to confirm
*   **Then** inline validation blocks the request
*   **And** I see the message **"Ingredient price per unit is required."**
*   **And** no API request is sent

#### Scenario: User creates an ingredient with a name that is too long
*   **Given** I am signed in on the dashboard
*   **When** I submit an ingredient name longer than 100 characters
*   **Then** the API returns `400` with `{ "message": "Ingredient name must be 100 characters or fewer." }`
*   **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: User creates an ingredient with a non-numeric price per unit
*   **Given** I am signed in on the dashboard
*   **When** I submit an ingredient price per unit that is not a number
*   **Then** the API returns `400` with `{ "message": "Ingredient price per unit must be a number." }`
*   **And** the error is displayed in a `<v-alert type="error">`

---

### US-4.2 — Browse the Ingredient Catalogue

#### Scenario: User views existing ingredients
*   **Given** I am signed in on the dashboard
*   **When** I open the ingredients menu
*   **Then** ingredients created by me are displayed in alphabetical order

#### Scenario: User has no existing ingredients
*   **Given** I am signed in on the dashboard
*   **When** I open the ingredients menu
*   **Then** no ingredients should be displayed

### US-4.3 — Correct an ingredient's unit or price

### Scenario: User edits an ingredient's information
*   **Given** I am signed in on the dashboard
*   **When** I click **Edit Ingredient** on an existing ingredient
*   **And** I change any of the original values
*   **And** I confirm the dialog
*   **Then** the API returns `200` with `{ "message": "Ingredient was updated successfully." }`
*   **And** the ingredient is visible with updated information in the ingredients view
*   **And** the edit-ingredient dialog closes

#### Scenario: User edits an ingredient with an empty name
*   **Given** I am signed in on the dashboard
*   **When** I open the edit ingredient dialog
*   **And** I leave the name field empty or whitespace only
*   **And** I attempt to confirm
*   **Then** inline validation blocks the request
*   **And** I see the message **"Ingredient name is required."**
*   **And** no API request is sent

#### Scenario: User edits an ingredient with an empty unit
*   **Given** I am signed in on the dashboard
*   **When** I open the edit ingredient dialog
*   **And** I leave the unit field empty or whitespace only
*   **And** I attempt to confirm
*   **Then** inline validation blocks the request
*   **And** I see the message **"Ingredient unit is required."**
*   **And** no API request is sent

#### Scenario: User edits an ingredient with an empty price per unit
*   **Given** I am signed in on the dashboard
*   **When** I open the edit ingredient dialog
*   **And** I leave the price per unit field empty or whitespace only
*   **And** I attempt to confirm
*   **Then** inline validation blocks the request
*   **And** I see the message **"Ingredient price per unit is required."**
*   **And** no API request is sent

#### Scenario: User edits an ingredient with a name that is too long
*   **Given** I am signed in on the dashboard
*   **When** I submit an ingredient name longer than 100 characters
*   **Then** the API returns `400` with `{ "message": "Ingredient name must be 100 characters or fewer." }`
*   **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: User edits an ingredient with a non-numeric price per unit
*   **Given** I am signed in on the dashboard
*   **When** I submit an ingredient price per unit that is not a number
*   **Then** the API returns `400` with `{ "message": "Ingredient price per unit must be a number." }`
*   **And** the error is displayed in a `<v-alert type="error">`

### US-4.4 Remove a catalogue ingredient

#### Scenario: User removes an ingredient
*   **Given** I am signed in
*   **And** I own an ingredient named `Butter`
*   **When** I click the delete icon on the `Butter` row
*   **And** I confirm the delete dialog
*   **Then** the API returns `200` or `204`
*   **And** the ingredient is removed from the ingredients view

## Test Coverage Map

Each scenario above must map to at least one automated test.

| Story | Scenario | Test file | Test name |
|-------|----------|-----------|-----------|
| US-4.1 | User creates a new ingredient | `backend/tests/ingredients.test.js`; `frontend/tests/IngredientList.test.js` | `it("User creates a new ingredient")` |
| US-4.1 | User creates an ingredient with an empty name | `frontend/tests/IngredientList.test.js` | `it("User creates an ingredient with an empty name")` |
| US-4.1 | User creates an ingredient with an empty unit | `frontend/tests/IngredientList.test.js` | `it("User creates an ingredient with an empty unit")` |
| US-4.1 | User creates an ingredient with an empty price per unit | `frontend/tests/IngredientList.test.js` | `it("User creates an ingredient with an empty price per unit")` |
| US-4.1 | User creates an ingredient with a name that is too long | `backend/tests/ingredients.test.js`; `frontend/tests/IngredientList.test.js` | `it("User creates an ingredient with a name that is too long")` |
| US-4.1 | User creates an ingredient with a non-numeric price per unit | `backend/tests/ingredients.test.js`; `frontend/tests/IngredientList.test.js` | `it("User creates an ingredient with a non-numeric price per unit")` |
| US-4.2 | User views existing ingredients | `backend/tests/ingredients.test.js`; `frontend/tests/IngredientList.test.js` | `it("User views existing ingredients")` |
| US-4.2 | User has no existing ingredients | `frontend/tests/IngredientList.test.js` | `it("User has no existing ingredients")` |
| US-4.3 | User edits an ingredient's information | `backend/tests/ingredients.test.js`; `frontend/tests/IngredientList.test.js` | `it("User edits an ingredient's information")` |
| US-4.3 | User edits an ingredient with an empty name | `frontend/tests/IngredientList.test.js` | `it("User edits an ingredient with an empty name")` |
| US-4.3 | User edits an ingredient with an empty unit | `frontend/tests/IngredientList.test.js` | `it("User edits an ingredient with an empty unit")` |
| US-4.3 | User edits an ingredient with an empty price per unit | `frontend/tests/IngredientList.test.js` | `it("User edits an ingredient with an empty price per unit")` |
| US-4.3 | User edits an ingredient with a name that is too long | `backend/tests/ingredients.test.js`; `frontend/tests/IngredientList.test.js` | `it("User edits an ingredient with a name that is too long")` |
| US-4.3 | User edits an ingredient with a non-numeric price per unit | `backend/tests/ingredients.test.js`; `frontend/tests/IngredientList.test.js` | `it("User edits an ingredient with a non-numeric price per unit")` |
| US-4.4 | User removes an ingredient | `backend/tests/ingredients.test.js`; `frontend/tests/IngredientList.test.js` | `it("User removes an ingredient")` |

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 4 from @features/feature-4-ingredient-catalogue-management.md on branch `feature/4-ingredient-catalogue-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-00N** satisfied)
*   [ ] **Success Criteria (SC-00N)** met
*   [ ] All mapped tests pass (`npm test`)
*   [ ] Test Coverage Map complete
*   [ ] `features/reference/data-model.md` updated (if schema changed)
*   [ ] `features/reference/api.md` updated (if API changed)
*   [ ] `features/reference/behavior.md` updated (if product rules changed)

## Out of Scope

*   Register, sign in, session persistence, and logout ([Feature 1](feature-1-user-authentification.md))
*   Recipe create / browse / edit / delete ([Feature 2 — Recipe Management](./feature-list.md))
*   Attaching catalogue ingredients to a recipe with a quantity (`recipeIngredient` on Edit Recipe)
*   Bulk `DELETE /recipeapi/ingredients` (delete-all) and `GET /recipeapi/ingredients/:id`
*   A shared or public ingredient catalogue (current unscoped `findAll` is not the product rule)
*   Restricting units to a preset dropdown list
*   Profile management
