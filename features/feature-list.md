## Feature List
### Capabilities

## Feature 1: User Authentication & Session Management — complete
**Short name:** `user-authentication` · **Depends on:** —
### US-1.1 Register an account
**As a** new user
**I want to** create an account with my first name, last name, email, and password
**So that** I can sign in and manage my own recipes
**Priority:** P1
**Independent test:** Submit valid registration and land on the Recipes page with `user` in `localStorage`
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria
### US-1.2 Sign in
**As a** registered user
**I want to** sign in with my email and password
**So that** I can reach the recipes I created earlier
**Priority:** P1
**Independent test:** Sign in with known credentials and receive a token, then land on the Recipes page
**Acceptance scenarios:** see ### US-1.2 under Acceptance Criteria
### US-1.3 Stay signed in across page loads
**As a** signed-in user
**I want to** remain signed in when I move between pages
**So that** I do not have to re-enter my password to keep working
**Priority:** P1
**Independent test:** Reload the Recipes page and confirm the session persists without a new login
**Acceptance scenarios:** see ### US-1.3 under Acceptance Criteria
### US-1.4 Sign out
**As a** signed-in user
**I want to** sign out from the account menu and return to the login screen
**So that** nobody else on this computer can use my account
**Priority:** P1
**Independent test:** Choose Logout and confirm `user` is cleared from `localStorage` and the login screen appears
**Acceptance scenarios:** see ### US-1.4 under Acceptance Criteria
### US-1.5 Block unauthenticated changes
**As the** application
**I want to** reject recipe and ingredient changes from callers without a valid session
**So that** nobody can alter another cook's data
**Priority:** P1
**Independent test:** Send a create-recipe request with no token and confirm it is rejected
**Acceptance scenarios:** see ### US-1.5 under Acceptance Criteria


## Feature 2: Recipe Management
**Short name:** `recipe-management` · **Depends on:** Feature 1
### US-2.1 Create a recipe
**As a** signed-in user
**I want to** create a recipe with a name, description, servings, and time to make
**So that** I have somewhere to record a dish I cook
**Priority:** P1
**Independent test:** Submit the Add Recipe dialog and see the new recipe on the Recipes page
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria
### US-2.2 See only my own recipes
**As a** signed-in user
**I want to** see just the recipes I created on the Recipes page
**So that** my recipes stay separate from other users' recipes
**Priority:** P1
**Independent test:** Sign in as one user and confirm the page lists only that user's recipes
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria
### US-2.3 Review a recipe's details
**As a** user viewing the Recipes page
**I want to** expand a recipe card to read its ingredients and steps
**So that** I can cook from it without opening the edit screen
**Priority:** P1
**Independent test:** Expand one recipe card and confirm its ingredients and steps are displayed
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria
### US-2.4 Update a recipe's details
**As a** signed-in user
**I want to** change a recipe's name, servings, time, or description
**So that** the recipe reflects how I actually make the dish now
**Priority:** P1
**Independent test:** Change the servings on Edit Recipe, save, and confirm the new value persists after reload
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria
### US-2.5 Delete a recipe
**As a** signed-in user
**I want to** delete a recipe I no longer want
**So that** my Recipes page stays limited to dishes I still cook
**Priority:** P2
**Independent test:** Delete one recipe and confirm it disappears from the Recipes page
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

## Feature 3: Ingredient Catalog Management
**Short name:** `ingredient-catalog-management` · **Depends on:** Feature 1
### US-3.1 Add a catalog ingredient
**As a** signed-in user
**I want to** add an ingredient with a name, a unit of measure, and a price per unit
**So that** I can reuse it across any recipe without retyping its details
**Priority:** P1
**Independent test:** Submit the Add Ingredient dialog and see the ingredient in the Ingredients table
**Acceptance scenarios:** see ### US-3.1 under Acceptance Criteria
### US-3.2 Browse the ingredient catalog
**As a** signed-in user
**I want to** see every catalog ingredient with its unit and price
**So that** I know what is already available before adding a duplicate
**Priority:** P1
**Independent test:** Open the Ingredients page and confirm each row shows name, unit, and price
**Acceptance scenarios:** see ### US-3.2 under Acceptance Criteria
### US-3.3 Correct an ingredient's unit or price
**As a** signed-in user
**I want to** edit a catalog ingredient's unit or price per unit
**So that** recipe costs stay accurate when prices change
**Priority:** P2
**Independent test:** Edit one ingredient's price and confirm the table shows the new value
**Acceptance scenarios:** see ### US-3.3 under Acceptance Criteria
### US-3.4 Remove a catalog ingredient
**As a** signed-in user
**I want to** remove an ingredient I no longer stock
**So that** the catalog does not fill up with things I cannot buy
**Priority:** P3
**Independent test:** Delete an unused ingredient and confirm it leaves the Ingredients table
**Acceptance scenarios:** see ### US-3.4 under Acceptance Criteria



4) Ingredients Management | features/feature-4-ingredients-management

5) Ingredients List Management | features/feature-5-ingredients-list-management
    Depend on: Ingredients Management

6) Profile Management | features/feature-6-profile-management