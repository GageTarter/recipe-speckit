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


2) Recipe Management | features/feature-2-recipe-management

3) Recipe List Item Management | features/feature-3-recipe-list-item-management
    Depend on: Recipe Management

4) Ingredients Management | features/feature-4-ingredients-management

5) Ingredients List Management | features/feature-5-ingredients-list-management
    Depend on: Ingredients Management

6) Profile Management | features/feature-6-profile-management