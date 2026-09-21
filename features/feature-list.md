## Feature List
### Capabilities

## Feature 1: User Authentication & Session Management — complete
**Short name:** `user-auth` · **Depends on:** — · **File:** `features/feature-1-user-auth.md`
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
**Short name:** `recipe-management` · **Depends on:** Feature 1 · **File:** `features/feature-2-recipe-management.md`
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

## Feature 3: Recipe List Item Management
**Short name:** `recipe-list-item-management` · **Depends on:** Feature 2, Feature 4 · **File:** `features/feature-3-recipe-list-item-management.md`
**Scope note:** the items that make up one recipe — measured ingredients and numbered
steps on the Edit Recipe screen. The shared ingredient list itself is Feature 4.
### US-3.1 Add a measured ingredient to a recipe
**As a** signed-in user
**I want to** add a quantity of an existing ingredient to one of my recipes
**So that** the recipe records how much of each item it needs
**Priority:** P1
**Independent test:** Add one quantity plus ingredient on Edit Recipe and see it in that recipe's ingredient list
**Acceptance scenarios:** see ### US-3.1 under Acceptance Criteria
### US-3.2 Adjust a recipe's ingredient
**As a** signed-in user
**I want to** change the quantity of a recipe ingredient or swap it for a different one
**So that** I can tune the recipe after cooking it
**Priority:** P2
**Independent test:** Change one recipe ingredient's quantity and confirm the recipe shows the new amount
**Acceptance scenarios:** see ### US-3.2 under Acceptance Criteria
### US-3.3 Remove an ingredient from a recipe
**As a** signed-in user
**I want to** remove an ingredient from a recipe
**So that** the recipe stops listing something the dish does not use
**Priority:** P2
**Independent test:** Delete one recipe ingredient and confirm it leaves that recipe's list
**Acceptance scenarios:** see ### US-3.3 under Acceptance Criteria
### US-3.4 Add a numbered step
**As a** signed-in user
**I want to** add a step with a number and written instructions to my recipe
**So that** someone can follow the dish in order
**Priority:** P1
**Independent test:** Add one step on Edit Recipe and see it in that recipe's step table
**Acceptance scenarios:** see ### US-3.4 under Acceptance Criteria
### US-3.5 Attach ingredients to a step
**As a** signed-in user
**I want to** mark which of the recipe's ingredients a given step uses
**So that** a cook knows what to have ready before starting that step
**Priority:** P1
**Independent test:** Attach two ingredients to one step and confirm both appear on that step's row
**Acceptance scenarios:** see ### US-3.5 under Acceptance Criteria
### US-3.6 Edit a step
**As a** signed-in user
**I want to** change a step's number or its instructions
**So that** I can fix mistakes or reorder the method
**Priority:** P2
**Independent test:** Edit one step's instruction and confirm the step table shows the new text
**Acceptance scenarios:** see ### US-3.6 under Acceptance Criteria
### US-3.7 Delete a step
**As a** signed-in user
**I want to** delete a step from my recipe
**So that** the method does not include instructions I no longer follow
**Priority:** P2
**Independent test:** Delete one step and confirm it leaves that recipe's step table
**Acceptance scenarios:** see ### US-3.7 under Acceptance Criteria

## Feature 4: Ingredient Catalogue Management
**Short name:** `ingredient-catalogue-management` · **Depends on:** Feature 1 · **File:** `features/feature-4-ingredient-catalogue-management.md`
### US-4.1 Add a catalogue ingredient
**As a** signed-in user
**I want to** add an ingredient with a name, a unit of measure, and a price per unit
**So that** I can reuse it across any recipe without retyping its details
**Priority:** P1
**Independent test:** Submit the Add Ingredient dialog and see the ingredient in the Ingredients table
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

## Feature 5: Ingredients Management
**Short name:** `ingredients-management` · **Depends on:** Feature 1, Feature 4 · **File:** `features/feature-5-ingredients-management.md`
**Overlap:** Feature 5 extends Feature 4 on the same Ingredients screen. Create, browse, edit, and delete Gherkin titles are shared; tests live in one pair of files and must not duplicate `it()` names.
### US-5.1: View created ingredients
**As a** Authorized User
**I want to** view the list of created ingredients
**So that** I can keep track of which ingredients the software knows about

**Priority:** P1
**Independent test:** Display all created ingredients
**Acceptance scenarios:** see ### US-5.1 under Acceptance Criteria

### US-5.2 Edit existing ingredients
**As a** Authorized User
**I want to** be able to edit the values of any created ingredient
**So that** I can change the values, such as units of measurement and price per unit, of any created ingredient to be different than what was inputted on creation

**Priority:** P1
**Independent test:** Edit the existing ingredients
**Acceptance scenarios:** see ### US-5.2 under Acceptance Criteria

### US-5.3 Delete existing ingredients
**As a** Authorized User
**I want to** delete any of the existing ingredients
**So that** I can no longer see or include them in recipes

**Priority:** P1
**Independent test:** Delete any existing ingredient and clear its data
**Acceptance scenarios:** see ### US-5.3 under Acceptance Criteria

## Feature 6: Profile Management
**Short name:** `profile-management` · **Depends on:** Feature 1 · **File:** `features/feature-6-profile-management.md`
### US-6.1: View Account
**As a** Authorized User
**I want to** View the details of my account
**So that** I can see the name and username of my profile

**Priority:** P1
**Independent test:** View the stored user data
**Acceptance scenarios:** see ### US-6.1 under Acceptance Criteria

### US-6.2: Log out
**As a** Logged-in User
**I want to** press the log-out button and sign out
**So that** I am no longer logged into the program

**Priority:** P1
**Independent test:** Log the user out and clear the local cache of user’s credentials
**Acceptance scenarios:** see ### US-6.2 under Acceptance Criteria
