## Feature List
### Capabilities
1) User Authentification | features/feature-1-user-authentification

 User Stories

 US-1.1: Register an account
**As a** new user  
**I want to** create an account with my name, email, username, and password  
**So that** I can sign in and manage my recipes and ingredients

**Priority:** P1  
**Independent test:** Submit valid registration and land on protected home with `user` in `localStorage`  
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria

US-1.2 Sign in
**As a** user  
**I want to** enter my name, email, username, and password  
**So that** I can sign in and manage my recipes and ingredients using my previously-made account

**Priority:** P1  
**Independent test:** Submit valid registration and land on protected home with `user` in `localStorage`  
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria

US-1.3 Stay signed in across page loads
**As a** signed-in user  
**I want to** remain signed in when I load different pages  
**So that** I can access my account and data attributed to it across pages

**Priority:** P1  
**Independent test:** Ensure user remains authenticated across pages  
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria

US-1.4 Sign out
**As a** signed-in user  
**I want to** sign out of my account and return to the log in screen  
**So that** Others cannot access account and data

**Priority:** P1  
**Independent test:** Clear our session and user login data  
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria

US-1.5 Block unauthenticated access
**As a** unauthorized user  
**I want to** be unable to access accounts and recipes without authentification  
**So that** Data cannot be viewed or edited without authentification

**Priority:** P1  
**Independent test:** Prevent users from proceeding past the login page without valid credentials  
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria


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