# Feature: Recipe Management

**Feature ID:** 2
**Branch pattern:** `feature/2-recipe-management`
**Status:** Draft
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
*   **When** I request the recipe list for user id `2`
*   **Then** no recipe belonging to user id `2` is returned

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

## Design sections — to be completed

Per §2.2 step 6, the following are filled in after the requirements above are reviewed:

- Data Ownership & Isolation *(sketched under Key Entities; expand as needed)*
- API Requirements
- Screen Requirements
- Test Coverage Map
- Agent implementation request
- Definition of Done
- Out of Scope
