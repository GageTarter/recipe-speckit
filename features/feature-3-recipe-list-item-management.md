# Feature: Recipe List Item Management

**Feature ID:** 3
**Branch pattern:** `feature/3-recipe-list-item-management`
**Status:** Ready
**Created:** 2026-09-17
**Input:** Let a signed-in cook add, revise, and remove the measured ingredients and numbered steps inside one of their recipes.
**Depends on:** [Feature 2 — Recipe Management](./feature-list.md), [Feature 4 — Ingredients Management](./feature-list.md)
**Related:** Feature 2 owns the recipe itself (name, servings, time, description). Feature 4 owns the shared ingredient catalog this feature picks from.

---

## User Stories

### US-3.1: Add a measured ingredient to a recipe
**As a** signed-in user
**I want to** add a quantity of an existing ingredient to one of my recipes
**So that** the recipe records how much of each item it needs

**Priority:** P1
**Independent test:** Add one quantity plus ingredient on Edit Recipe and see it in that recipe's ingredient list
**Acceptance scenarios:** see ### US-3.1 under Acceptance Criteria

### US-3.2: Adjust a recipe's ingredient
**As a** signed-in user
**I want to** change the quantity of a recipe ingredient or swap it for a different one
**So that** I can tune the recipe after cooking it

**Priority:** P2
**Independent test:** Change one recipe ingredient's quantity and confirm the recipe shows the new amount
**Acceptance scenarios:** see ### US-3.2 under Acceptance Criteria

### US-3.3: Remove an ingredient from a recipe
**As a** signed-in user
**I want to** remove an ingredient from a recipe
**So that** the recipe stops listing something the dish does not use

**Priority:** P2
**Independent test:** Delete one recipe ingredient and confirm it leaves that recipe's list
**Acceptance scenarios:** see ### US-3.3 under Acceptance Criteria

### US-3.4: Add a numbered step
**As a** signed-in user
**I want to** add a step with a number and written instructions to my recipe
**So that** someone can follow the dish in order

**Priority:** P1
**Independent test:** Add one step on Edit Recipe and see it in that recipe's step table
**Acceptance scenarios:** see ### US-3.4 under Acceptance Criteria

### US-3.5: Attach ingredients to a step
**As a** signed-in user
**I want to** mark which of the recipe's ingredients a given step uses
**So that** a cook knows what to have ready before starting that step

**Priority:** P1
**Independent test:** Attach two ingredients to one step and confirm both appear on that step's row
**Acceptance scenarios:** see ### US-3.5 under Acceptance Criteria

### US-3.6: Edit a step
**As a** signed-in user
**I want to** change a step's number or its instructions
**So that** I can fix mistakes or reorder the method

**Priority:** P2
**Independent test:** Edit one step's instruction and confirm the step table shows the new text
**Acceptance scenarios:** see ### US-3.6 under Acceptance Criteria

### US-3.7: Delete a step
**As a** signed-in user
**I want to** delete a step from my recipe
**So that** the method does not include instructions I no longer follow

**Priority:** P2
**Independent test:** Delete one step and confirm it leaves that recipe's step table
**Acceptance scenarios:** see ### US-3.7 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: Users MUST be signed in to create, update, or delete a recipe ingredient or a recipe step.
- **FR-002**: System MUST require `quantity`, `recipeId`, and `ingredientId` when creating a recipe ingredient.
- **FR-003**: `quantity` MUST be a number greater than zero.
- **FR-004**: A recipe ingredient's `ingredientId` MUST refer to an existing shared ingredient (Feature 4). This feature MUST NOT create a shared ingredient.
- **FR-005**: System MUST require `stepNumber`, `instruction`, and `recipeId` when creating a recipe step.
- **FR-006**: `stepNumber` MUST be an integer greater than zero.
- **FR-007**: A recipe ingredient MAY be attached to at most one step of the same recipe by storing that step's id on `recipeStepId`; `recipeStepId` MAY be empty until the cook attaches it.
- **FR-008**: Listing a recipe's steps MUST return them ordered by `stepNumber` ascending.
- **FR-009**: System MUST NOT let a user read, create, update, or delete ingredients or steps on a recipe they do not own; such a request MUST return `404` rather than `403`.
- **FR-010**: Create, update, and delete of a recipe ingredient or step MUST return `400` with a JSON `{ "message" }` when a required field is missing, and `401` when there is no session.
- **FR-011**: The Edit Recipe screen MUST show the recipe's measured ingredients and its steps, and MUST let the owner add, edit, and remove both.

---

## Assumptions

- Feature 1 authentication is already shipped: a signed-in user's session token is sent as `Authorization: Bearer <token>` and `req.user` is populated by `authenticateRoute`.
- Feature 2 recipes already exist. This feature only adds items *inside* a recipe. The recipe detail card (name, servings, time, description, publish) is owned by Feature 2.
- Feature 4's shared ingredient catalog already exists in the running app even if its spec is still pending. This feature only **selects** from that catalog.
- Attaching ingredients to a step uses recipe ingredients already on that recipe, not a second copy of the shared catalog.
- Step numbers are not required to be unique within a recipe.
- Deleting a recipe ingredient or step does not use a confirmation dialog in the running app.

## Edge Cases

- Create recipe ingredient missing `quantity`, `recipeId`, or `ingredientId` → `400` naming the field.
- Create recipe step missing `stepNumber`, `instruction`, or `recipeId` → `400` naming the field.
- `quantity` or `stepNumber` sent as zero or negative → `400`.
- Create / update / delete aimed at another user's recipe → `404`, and the row is unchanged.
- A recipe with no ingredients and no steps → Edit Recipe still renders both cards, with empty lists.
- A step with no attached ingredients → the step row still shows; the chip list is empty.

## Success Criteria

- **SC-001**: Every Gherkin scenario in this file has at least one automated test before merge.
- **SC-002**: A signed-in user can add a measured ingredient and a numbered step to their own recipe and see both on Edit Recipe without a browser reload.
- **SC-003**: No request can read, change, or delete ingredients or steps on a recipe owned by another user.

---

## Key Entities

- **User**: registered account from Feature 1; owns recipes.
- **Recipe** *(owned by Feature 2)*: the parent dish; this feature only reads it to know which recipe the items belong to.
- **Ingredient** *(owned by Feature 4)*: a shared catalog item with a name, unit, and price per unit. This feature only references it.
- **RecipeIngredient**: a measured amount of one shared ingredient, belonging to one recipe. Optionally attached to one step of that recipe.
- **RecipeStep**: a numbered instruction belonging to one recipe. May reference zero or more of that recipe's measured ingredients.

---

## Data Model Requirements

### `recipeIngredients` table

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `quantity` | FLOAT | Required; greater than zero |
| `recipeId` | INTEGER FK | Required; references `recipes.id`; `ON DELETE CASCADE` |
| `ingredientId` | INTEGER FK | Required; references `ingredients.id` |
| `recipeStepId` | INTEGER FK | Optional; references `recipeSteps.id`; `ON DELETE SET NULL` or cascade from the step as shipped |
| `createdAt` | DATETIME | Managed by Sequelize |
| `updatedAt` | DATETIME | Managed by Sequelize |

### `recipeSteps` table

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `stepNumber` | INTEGER | Required; greater than zero |
| `instruction` | STRING(5000) | Required |
| `recipeId` | INTEGER FK | Required; references `recipes.id`; `ON DELETE CASCADE` |
| `createdAt` | DATETIME | Managed by Sequelize |
| `updatedAt` | DATETIME | Managed by Sequelize |

### Associations

- `recipes` 1 — many `recipeIngredients` (`recipeIngredients.recipeId` → `recipes.id`)
- `ingredients` 1 — many `recipeIngredients` (`recipeIngredients.ingredientId` → `ingredients.id`)
- `recipeSteps` 1 — many `recipeIngredients` (`recipeIngredients.recipeStepId` → `recipeSteps.id`), optional on the ingredient
- `recipes` 1 — many `recipeSteps` (`recipeSteps.recipeId` → `recipes.id`)

### Changes from the shipped schema

No new tables. This feature uses the shipped `recipeIngredients` and `recipeSteps` tables. Ownership is enforced through the parent recipe's `userId`, not a `userId` column on these tables.

---

## Acceptance Criteria

### US-3.1 — Add a measured ingredient to a recipe

#### Scenario: User adds a measured ingredient to a recipe
*   **Given** I am signed in and I own a recipe `Chili`
*   **And** the shared catalog has an ingredient `Beans` with unit `cup`
*   **When** I add quantity `2` of `Beans` to `Chili`
*   **Then** the API returns `200` with a recipe ingredient whose `quantity` is `2` and whose `recipeId` is `Chili`
*   **And** `Chili`'s ingredient list includes `2 cups of Beans`

#### Scenario: Create is rejected when quantity is missing
*   **Given** I am signed in and I own a recipe
*   **When** I send `POST /recipeapi/recipes/:recipeId/recipeIngredients/` with an `ingredientId` and `recipeId` but no `quantity`
*   **Then** the API returns `400` with `"Quantity cannot be empty for recipe ingredient!"`
*   **And** no recipe ingredient is stored

#### Scenario: Create is rejected when quantity is not a positive number
*   **Given** I am signed in and I own a recipe
*   **When** I send `POST /recipeapi/recipes/:recipeId/recipeIngredients/` with `quantity` set to `0`
*   **Then** the API returns `400`
*   **And** no recipe ingredient is stored

#### Scenario: Create is rejected when the ingredient does not exist
*   **Given** I am signed in and I own a recipe
*   **When** I add a recipe ingredient with an `ingredientId` that is not in the catalog
*   **Then** the API returns `404`
*   **And** no recipe ingredient is stored

#### Scenario: Create is rejected without a session
*   **Given** I am not signed in
*   **When** I send `POST /recipeapi/recipes/:recipeId/recipeIngredients/` with a complete body
*   **Then** the API returns `401`
*   **And** no recipe ingredient is stored

#### Scenario: Create is rejected for another user's recipe
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns a recipe
*   **When** I add a recipe ingredient to that recipe
*   **Then** the API returns `404`
*   **And** no recipe ingredient is stored for that recipe

#### Scenario: Listing another user's recipe ingredients is rejected
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns a recipe with a measured ingredient
*   **When** I send `GET /recipeapi/recipes/:recipeId/recipeIngredients/` for that recipe
*   **Then** the API returns `404`

#### Scenario: Edit Recipe lists the recipe's ingredients
*   **Given** I am on Edit Recipe for `Chili` and it has `2` cups of `Beans`
*   **When** the page loads
*   **Then** the Ingredients card shows `2 cups of Beans`

#### Scenario: User adds a measured ingredient from Edit Recipe
*   **Given** I am on Edit Recipe for `Chili`
*   **When** I add quantity `2` of `Beans` from the Add Ingredient dialog
*   **Then** `addRecipeIngredient` is called
*   **And** the Ingredients card shows `Beans`

### US-3.2 — Adjust a recipe's ingredient

#### Scenario: Owner updates a recipe ingredient's quantity
*   **Given** I am signed in and `Chili` has `2` cups of `Beans`
*   **When** I change that recipe ingredient's quantity to `3`
*   **Then** the API returns `200` with `{ "message": "RecipeIngredient was updated successfully." }`
*   **And** reloading `Chili`'s ingredients shows quantity `3`

#### Scenario: Update is rejected for another user's recipe ingredient
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns a recipe ingredient with id `9`
*   **When** I send `PUT /recipeapi/recipes/:recipeId/recipeIngredients/9` with a new quantity
*   **Then** the API returns `404`
*   **And** recipe ingredient `9` keeps its original quantity

#### Scenario: Update is rejected without a session
*   **Given** I am not signed in
*   **When** I send `PUT /recipeapi/recipes/:recipeId/recipeIngredients/1` with a new quantity
*   **Then** the API returns `401`

### US-3.3 — Remove an ingredient from a recipe

#### Scenario: Owner removes a recipe ingredient
*   **Given** I am signed in and `Chili` has a recipe ingredient `Beans`
*   **When** I delete that recipe ingredient
*   **Then** the API returns `200` with `{ "message": "RecipeIngredient was deleted successfully!" }`
*   **And** `Beans` no longer appears in `Chili`'s ingredient list

#### Scenario: Owner removes a recipe ingredient from Edit Recipe
*   **Given** I am on Edit Recipe for `Chili` and it lists `Beans`
*   **When** I click the delete icon on that ingredient
*   **Then** `deleteRecipeIngredient` is called
*   **And** `Beans` no longer appears in the Ingredients card

#### Scenario: Delete is rejected for another user's recipe ingredient
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns a recipe ingredient with id `9`
*   **When** I send `DELETE /recipeapi/recipes/:recipeId/recipeIngredients/9`
*   **Then** the API returns `404`
*   **And** recipe ingredient `9` still exists

### US-3.4 — Add a numbered step

#### Scenario: Owner adds a numbered step
*   **Given** I am signed in and I own a recipe `Chili`
*   **When** I add step number `1` with instruction `Simmer the beans`
*   **Then** the API returns `200` with a recipe step whose `stepNumber` is `1` and whose `instruction` is `Simmer the beans`
*   **And** `Chili`'s step table includes that step

#### Scenario: Create is rejected when instruction is missing
*   **Given** I am signed in and I own a recipe
*   **When** I send `POST /recipeapi/recipes/:recipeId/recipeSteps/` with a `stepNumber` and `recipeId` but no `instruction`
*   **Then** the API returns `400` with `"Description cannot be empty for recipe step!"`
*   **And** no recipe step is stored

#### Scenario: Create is rejected when step number is not a positive number
*   **Given** I am signed in and I own a recipe
*   **When** I send `POST /recipeapi/recipes/:recipeId/recipeSteps/` with `stepNumber` set to `0`
*   **Then** the API returns `400`
*   **And** no recipe step is stored

#### Scenario: Create is rejected without a session
*   **Given** I am not signed in
*   **When** I send `POST /recipeapi/recipes/:recipeId/recipeSteps/` with a complete body
*   **Then** the API returns `401`
*   **And** no recipe step is stored

#### Scenario: Create is rejected for another user's recipe
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns a recipe
*   **When** I add a recipe step to that recipe
*   **Then** the API returns `404`
*   **And** no recipe step is stored for that recipe

#### Scenario: Steps are listed in step-number order
*   **Given** I am signed in and `Chili` has steps numbered `3`, `1`, and `2`
*   **When** I request `Chili`'s steps
*   **Then** they appear in the order `1`, `2`, `3`

#### Scenario: Listing another user's steps is rejected
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns a recipe with a step
*   **When** I send `GET /recipeapi/recipes/:recipeId/recipeStepsWithIngredients/` for that recipe
*   **Then** the API returns `404`

#### Scenario: Edit Recipe lists the recipe's steps
*   **Given** I am on Edit Recipe for `Chili` and it has step `1` `Simmer the beans`
*   **When** the page loads
*   **Then** the Steps card shows `1` and `Simmer the beans`

#### Scenario: Owner adds a numbered step from Edit Recipe
*   **Given** I am on Edit Recipe for `Chili`
*   **When** I add step number `1` with instruction `Simmer the beans` from the Add Step dialog
*   **Then** `addRecipeStep` is called
*   **And** the Steps card shows `Simmer the beans`

### US-3.5 — Attach ingredients to a step

#### Scenario: Owner attaches ingredients to a step
*   **Given** I am signed in and `Chili` has measured ingredients `Beans` and `Rice` and a step `Simmer the beans`
*   **When** I attach `Beans` and `Rice` to that step
*   **Then** both recipe ingredients store that step's id
*   **And** the step's row lists `Beans` and `Rice`

#### Scenario: A step with no attached ingredients
*   **Given** I am signed in and `Chili` has a step with no attached ingredients
*   **When** I load that recipe's steps with ingredients
*   **Then** the step is returned
*   **And** its attached ingredient list is empty

#### Scenario: Attached ingredients appear on the step's row
*   **Given** I am on Edit Recipe for `Chili` and step `1` has `Beans` and `Rice` attached
*   **When** the page loads
*   **Then** the step's row shows chips for `Beans` and `Rice`

### US-3.6 — Edit a step

#### Scenario: Owner updates a step's instruction
*   **Given** I am signed in and `Chili` has a step `Simmer the beans`
*   **When** I change that step's instruction to `Drain, then simmer the beans`
*   **Then** the API returns `200` with `{ "message": "RecipeStep was updated successfully." }`
*   **And** reloading `Chili`'s steps shows `Drain, then simmer the beans`

#### Scenario: Update is rejected for another user's step
*   **Given** I am signed in as the user with id `1`
*   **And** the user with id `2` owns a recipe step with id `9`
*   **When** I send `PUT /recipeapi/recipes/:recipeId/recipeSteps/9` with a new instruction
*   **Then** the API returns `404`
*   **And** recipe step `9` keeps its original instruction

### US-3.7 — Delete a step

#### Scenario: Owner deletes a step
*   **Given** I am signed in and `Chili` has a step `Simmer the beans`
*   **When** I delete that step
*   **Then** the API returns `200` with `{ "message": "RecipeStep was deleted successfully!" }`
*   **And** that step no longer appears in `Chili`'s step table

#### Scenario: Owner deletes a step from Edit Recipe
*   **Given** I am on Edit Recipe for `Chili` and it lists step `Simmer the beans`
*   **When** I click the delete icon on that step
*   **Then** `deleteRecipeStep` is called
*   **And** `Simmer the beans` no longer appears in the Steps card

#### Scenario: Delete is rejected without a session
*   **Given** I am not signed in
*   **When** I send `DELETE /recipeapi/recipes/:recipeId/recipeSteps/1`
*   **Then** the API returns `401`
*   **And** the step still exists

---

## Data Ownership & Isolation

Recipe ingredients and steps inherit their owner's identity from the parent recipe. There is no `userId` on these tables.

| Rule | Requirement |
|------|-------------|
| **Read scope** | List and read-one succeed only when the parent recipe's `userId = req.user.id` |
| **Write scope** | `PUT` / `DELETE` succeed only when the parent recipe is owned by `req.user.id` |
| **Create scope** | New rows are allowed only when `recipeId` refers to a recipe the session user owns |
| **Cross-user access** | Another user's recipe or its items → `404` (never `403`) |
| **UI scope** | Edit Recipe renders only what the scoped API returned |
| **Implementation** | Resolve the parent recipe through a shared helper under `backend/app/authorization/` — do not repeat the scope check in each controller method |

See [security.mdc](../.cursor/rules/security.mdc) for the app-wide pattern.

---

## API Requirements

Mount prefix is `/recipeapi/` (see [reference/api.md](./reference/api.md)).

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/recipeapi/recipes/:recipeId/recipeIngredients/` | Yes | Add a measured ingredient to the signed-in user's recipe |
| `GET` | `/recipeapi/recipes/:recipeId/recipeIngredients/` | Yes | List measured ingredients for that recipe, with nested `ingredient` |
| `PUT` | `/recipeapi/recipes/:recipeId/recipeIngredients/:id` | Yes | Update quantity, ingredient, or attached step |
| `DELETE` | `/recipeapi/recipes/:recipeId/recipeIngredients/:id` | Yes | Remove a measured ingredient from that recipe |
| `POST` | `/recipeapi/recipes/:recipeId/recipeSteps/` | Yes | Add a numbered step to the signed-in user's recipe |
| `GET` | `/recipeapi/recipes/:recipeId/recipeStepsWithIngredients/` | Yes | List that recipe's steps in step-number order, with attached ingredients |
| `PUT` | `/recipeapi/recipes/:recipeId/recipeSteps/:id` | Yes | Update a step's number or instruction |
| `DELETE` | `/recipeapi/recipes/:recipeId/recipeSteps/:id` | Yes | Delete a step from that recipe |

**Create recipe ingredient request body:**

```json
{ "quantity": 2, "recipeId": 7, "ingredientId": 3 }
```

`recipeStepId` is optional.

**Create recipe ingredient success** (`200`): the stored row including `id`, `quantity`, `recipeId`, `ingredientId`, and `recipeStepId`.

**Create recipe step request body:**

```json
{ "stepNumber": 1, "instruction": "Simmer the beans", "recipeId": 7 }
```

**Create recipe step success** (`200`): the stored row including `id`, `stepNumber`, `instruction`, and `recipeId`.

**Update success** (`200`): `{ "message": "RecipeIngredient was updated successfully." }` or `{ "message": "RecipeStep was updated successfully." }`
**Delete success** (`200`): `{ "message": "RecipeIngredient was deleted successfully!" }` or `{ "message": "RecipeStep was deleted successfully!" }`
**Error response:** `{ "message": "Human-readable explanation." }`
**Validation failure:** `400`
**Unauthenticated:** `401`
**Missing or not owned:** `404` — never `403`

### Changes to shipped behavior

| Endpoint | Shipped now | Required by this spec | Authorized by |
|---|---|---|---|
| `POST /recipeSteps/` | No ownership check | Parent recipe must belong to the session user | FR-009 |
| `GET` list-for-recipe (ingredients and steps) | No auth | Session required; `404` when the recipe is not owned | FR-009 |
| `PUT` / `DELETE` ingredients and steps | Auth only, no ownership check | Parent recipe must belong to the session user | FR-009 |
| Create validation | Synchronous `throw`, so the `400` body may not be JSON | Returns `400` with a JSON `{ message }` | FR-010 |

`GET /recipeapi/recipeIngredients/` and `GET /recipeapi/recipeSteps/` (unscoped list-all) and the delete-all routes are untouched — see Out of Scope.

**Convention note:** create returns `200`, matching the shipped controllers, rather than `201`.

---

## Screen Requirements

### [View: EditRecipe] — route name `editRecipe`, `props: true` on `/recipe/:id`

This feature owns only the **Ingredients** and **Steps** cards. The recipe detail card is Feature 2.

*   **Ingredients card** — heading **Ingredients**; primary action **Add** (opens the Add Ingredient dialog)
*   Each row shows quantity, unit (pluralized when quantity > 1), ingredient name, and price per unit, with pencil (**edit**) and trash (**delete**) icons
*   **Add / Edit Ingredient dialog** — titled **Add Ingredient** or **Edit Ingredient**; fields **Quantity** and **Ingredients** (select from the shared catalog); actions **Close** and **Add Ingredient** / **Update Ingredient**
*   **Success feedback:** snackbar `Ingredient added successfully!`, `"<name> updated successfully!"`, `"<name> deleted successfully!"`
*   **Steps card** — heading **Steps**; primary action **Add** (opens the Add Step dialog)
*   Each row shows step number, instruction, chips of attached ingredient names, plus pencil and trash icons
*   **Add / Edit Step dialog** — titled **Add Step** or **Edit Step**; fields **Number**, **Instruction**, and **Ingredients** (multi-select of this recipe's measured ingredients); actions **Close** and **Add Step** / **Update Step**
*   **Success feedback:** snackbar `Step added successfully!`, `Step updated successfully!`, `Step deleted successfully!`
*   **Empty lists:** both cards still render; the list/table is empty rather than an error
*   **Loading / error:** error responses surface the API `message` in a snackbar
*   Shown for a signed-in owner editing their recipe; a `404` from the recipe read is Feature 2

---

## Test Coverage Map

Each scenario in Acceptance Criteria maps to at least one automated test.

| Story | Scenario | Test file | Test name |
|-------|----------|-----------|-----------|
| US-3.1 | User adds a measured ingredient to a recipe | `backend/tests/recipeIngredients.test.js` | `User adds a measured ingredient to a recipe` |
| US-3.1 | Create is rejected when quantity is missing | `backend/tests/recipeIngredients.test.js` | `Create is rejected when quantity is missing` |
| US-3.1 | Create is rejected when quantity is not a positive number | `backend/tests/recipeIngredients.test.js` | `Create is rejected when quantity is not a positive number` |
| US-3.1 | Create is rejected when the ingredient does not exist | `backend/tests/recipeIngredients.test.js` | `Create is rejected when the ingredient does not exist` |
| US-3.1 | Create is rejected without a session | `backend/tests/recipeIngredients.test.js` | `Create is rejected without a session` |
| US-3.1 | Create is rejected for another user's recipe | `backend/tests/recipeIngredients.test.js` | `Create is rejected for another user's recipe` |
| US-3.1 | Listing another user's recipe ingredients is rejected | `backend/tests/recipeIngredients.test.js` | `Listing another user's recipe ingredients is rejected` |
| US-3.1 | Edit Recipe lists the recipe's ingredients | `frontend/tests/EditRecipe.test.js` | `Edit Recipe lists the recipe's ingredients` |
| US-3.1 | User adds a measured ingredient from Edit Recipe | `frontend/tests/EditRecipe.test.js` | `User adds a measured ingredient from Edit Recipe` |
| US-3.2 | Owner updates a recipe ingredient's quantity | `backend/tests/recipeIngredients.test.js` | `Owner updates a recipe ingredient's quantity` |
| US-3.2 | Update is rejected for another user's recipe ingredient | `backend/tests/recipeIngredients.test.js` | `Update is rejected for another user's recipe ingredient` |
| US-3.2 | Update is rejected without a session | `backend/tests/recipeIngredients.test.js` | `Update is rejected without a session` |
| US-3.3 | Owner removes a recipe ingredient | `backend/tests/recipeIngredients.test.js` | `Owner removes a recipe ingredient` |
| US-3.3 | Owner removes a recipe ingredient from Edit Recipe | `frontend/tests/EditRecipe.test.js` | `Owner removes a recipe ingredient from Edit Recipe` |
| US-3.3 | Delete is rejected for another user's recipe ingredient | `backend/tests/recipeIngredients.test.js` | `Delete is rejected for another user's recipe ingredient` |
| US-3.4 | Owner adds a numbered step | `backend/tests/recipeSteps.test.js` | `Owner adds a numbered step` |
| US-3.4 | Create is rejected when instruction is missing | `backend/tests/recipeSteps.test.js` | `Create is rejected when instruction is missing` |
| US-3.4 | Create is rejected when step number is not a positive number | `backend/tests/recipeSteps.test.js` | `Create is rejected when step number is not a positive number` |
| US-3.4 | Create is rejected without a session | `backend/tests/recipeSteps.test.js` | `Create is rejected without a session` |
| US-3.4 | Create is rejected for another user's recipe | `backend/tests/recipeSteps.test.js` | `Create is rejected for another user's recipe` |
| US-3.4 | Steps are listed in step-number order | `backend/tests/recipeSteps.test.js` | `Steps are listed in step-number order` |
| US-3.4 | Listing another user's steps is rejected | `backend/tests/recipeSteps.test.js` | `Listing another user's steps is rejected` |
| US-3.4 | Edit Recipe lists the recipe's steps | `frontend/tests/EditRecipe.test.js` | `Edit Recipe lists the recipe's steps` |
| US-3.4 | Owner adds a numbered step from Edit Recipe | `frontend/tests/EditRecipe.test.js` | `Owner adds a numbered step from Edit Recipe` |
| US-3.5 | Owner attaches ingredients to a step | `backend/tests/recipeSteps.test.js` | `Owner attaches ingredients to a step` |
| US-3.5 | A step with no attached ingredients | `backend/tests/recipeSteps.test.js` | `A step with no attached ingredients` |
| US-3.5 | Attached ingredients appear on the step's row | `frontend/tests/EditRecipe.test.js` | `Attached ingredients appear on the step's row` |
| US-3.6 | Owner updates a step's instruction | `backend/tests/recipeSteps.test.js` | `Owner updates a step's instruction` |
| US-3.6 | Update is rejected for another user's step | `backend/tests/recipeSteps.test.js` | `Update is rejected for another user's step` |
| US-3.7 | Owner deletes a step | `backend/tests/recipeSteps.test.js` | `Owner deletes a step` |
| US-3.7 | Owner deletes a step from Edit Recipe | `frontend/tests/EditRecipe.test.js` | `Owner deletes a step from Edit Recipe` |
| US-3.7 | Delete is rejected without a session | `backend/tests/recipeSteps.test.js` | `Delete is rejected without a session` |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 3 from @features/feature-3-recipe-list-item-management.md on branch `feature/3-recipe-list-item-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/api.md` (recipe ingredient and step endpoints and auth), `features/reference/data-model.md` (`recipeIngredients` and `recipeSteps`), `features/reference/behavior.md` (items inherit recipe ownership).

---

## Definition of Done

*   [x] Backend and frontend implemented per this spec (**FR-001** through **FR-011** satisfied)
*   [x] **Success Criteria SC-001 through SC-003** met
*   [x] All 32 mapped tests pass (`cd backend && npx jest tests/recipeIngredients.test.js tests/recipeSteps.test.js`, `cd frontend && npx vitest run tests/EditRecipe.test.js`)
*   [x] Test Coverage Map complete, with one `it` per scenario using the exact scenario title
*   [x] `features/reference/data-model.md` updated for `recipeIngredients` and `recipeSteps`
*   [x] `features/reference/api.md` updated for the recipe-ingredient and recipe-step endpoints
*   [x] `features/reference/behavior.md` updated for inherited recipe ownership
*   [x] Catalog row present in [project README §2.3](../README.md#23-feature-catalog)

---

## Out of Scope

*   Creating, editing, or deleting the shared ingredient catalog ([Feature 4 — Ingredients Management](./feature-list.md))
*   The recipe detail card on Edit Recipe (name, servings, time, description, publish) — [Feature 2 — Recipe Management](./feature-list.md)
*   Publishing and public browsing
*   Exporting a recipe to PDF
*   Unscoped `GET /recipeapi/recipeIngredients/` and `GET /recipeapi/recipeSteps/`
*   `DELETE /recipeapi/recipeIngredients/` and `DELETE /recipeapi/recipeSteps/` (delete-all)
