# Feature: User Authentication & Session Management

**Feature ID:** 1
**Branch pattern:** `feature/1-user-auth`
**Status:** Ready
**Created:** 2026-01-15
**Input:** Multi-user authentication and session management so each user can create an account, login ,logout for the Recipe application. 
**Related:**
- [ADR-0001 — Client–server multi-user architecture](../docs/adr/0001-client-server-multi-user-architecture.md)
- [ADR-0002 — Security architecture](../docs/adr/0002-security-architecture.md)


## User Stories

### US-1.1: Create an account
**As a** new user  
**I want to** create an account with my first name, last name email, and password  
**So that** I can be a registered user of the application and manage my recipes.


**Priority:** P1  
**Independent test:** Submit valid account information and recieve user information  and an authentication token.
**Acceptance scenarios:** see ### US-1.1 — Create an account

### US-1.2: Login
**As a** registered user  
**I want to** Log in with my email and password  
**So that** I can access the application with its features 


**Priority:** P1  
**Independent test:** Sign in with valid credentials and receive user information and an authentication token
**Acceptance scenarios:** see ### US-1.2 — Login

### US-1.3: Authenticate protected requests
**As a** signed-in user  
**I want** my session token to authenticate my requests
**So that** I can access features that require authentication


**Priority:** P1  
**Independent test:** Send a protected request with a valid, unexpired Bearer token and verify that the request is authenticated
**Acceptance scenarios:** see ### US-1.3 — Authenticate protected requests


### US-1.4: Sign out
**As a** signed-in user  
**I want to** sign out of my account   
**So that** no one else can use my account and my session is no longer active

**Priority:** P1  
**Independent test:** Send a logout request with a valid  token and verify that the session is removed and can no longer authenticate protected requests
**Acceptance scenarios:** see ### US-1.4 — Log out under Acceptance Criteria
**Acceptance scenarios:** see ### US-1.4 — Sign out


## Requirements
### Functional Requirements

* **FR-001:** The system MUST allow a new user to create an account using first name, last name, email, and password.
* **FR-002:** The system MUST reject account creation when a required field is missing.
* **FR-003:** The system MUST reject account creation when the email is already in use.
* **FR-004:** The system MUST securely hash and salt passwords before storing them.
* **FR-005:** The system MUST create a session when a new user successfully creates an account.
* **FR-006:** The system MUST return the user's email, first name, last name, ID, and authentication token after successful account creation.
* **FR-007:** The system MUST allow registered users to log in using their email and password.
* **FR-008:** The system MUST verify the submitted password against the stored password hash and salt.
* **FR-009:** The system MUST reject login attempts when the email does not belong to an existing user or the password is incorrect.
* **FR-010:** The system MUST create a session after a successful login.
* **FR-011:** The system MUST return the user's email, first name, last name, ID, and authentication token after successful login.
* **FR-012:** The system MUST use a Bearer token to authenticate protected requests.
* **FR-013:** The system MUST verify that the session associated with the Bearer token is valid and has not expired.
* **FR-014:** The system MUST reject protected requests when the session token is invalid or expired.
* **FR-015:** The system MUST identify the authenticated user associated with a valid session.
* **FR-016:** The system MUST allow a signed-in user to sign out using a valid Bearer token.
* **FR-017:** The system MUST remove the user's session after a successful sign out.
* **FR-018:** The system MUST reject sign-out requests that do not contain valid authentication.

## Assumptions 

- Users identify their accounts using an email address.
- Users must provide a first name, last name, email, and password when creating an account.
- A successful account creation automatically creates an authenticated session for the new user.
- A successful login creates a new authenticated session for the user.
- Authentication uses a token associated with a server-side session.
- Sessions expire one day after they are created.
- Protected requests use a Bearer token to identify the authenticated user.
- Signing out removes the user's current session so the token can no longer authenticate that session.
- Passwords are stored as a salted hash rather than as plain text.
- Password reset, email verification, and third-party/social login are not included in this feature.


## Edge Cases

* A user attempts to create an account without a first name.
* A user attempts to create an account without a last name.
* A user attempts to create an account without an email.
* A user attempts to create an account without a password.
* A user attempts to create an account using an email that is already registered.
* A user attempts to log in with an email that does not belong to an existing user.
* A user attempts to log in with an incorrect password.
* A user attempts to access a protected feature without an authentication token.
* A user attempts to access a protected feature with an invalid authentication token.
* A user attempts to access a protected feature with an expired session.
* A user attempts to sign out without a valid Bearer token.
* A user attempts to sign out using an invalid or expired session token.


## Success Criteria

* **SC-001:** A new user can create an account using a first name, last name, email, and password.
* **SC-002:** The system prevents users from creating multiple accounts with the same email address.
* **SC-003:** A successfully created account receives an authentication token and an active session.
* **SC-004:** A registered user can log in with valid email and password credentials and receive an authentication token.
* **SC-005:** The system rejects login attempts with an unknown email or incorrect password.
* **SC-006:** A valid, unexpired Bearer token allows the authenticated user to access protected requests.
* **SC-007:** The system rejects protected requests when the Bearer token is invalid or the session has expired.
* **SC-008:** A signed-in user can sign out using a valid Bearer token.
* **SC-009:** After sign out, the user's session is removed and the token can no longer authenticate that session.
* **SC-010:** User passwords are stored as salted hashes and are not stored as plain text.
* **SC-011:** Every acceptance scenario defined for this feature has a corresponding automated test.


## Data Ownership & Isolation

This feature establishes the authenticated user identity used by later Recipe features. It does **not** define ownership rules for recipes, ingredients, or other domain resources.

| Rule | Requirement |
|------|-------------|
| **Account ownership** | Each `users` row is the account for that email; passwords are never returned in API responses |
| **Session ownership** | Each `sessions` row belongs to exactly one user (`userId`); the authentication token identifies that session |
| **Create scope (register / login)** | Successful registration or login creates a new session for that user only |
| **Protected-request identity** | A valid Bearer token resolves to the session’s user; handlers receive that user as the authenticated principal (`req.user.id`) |
| **Sign-out scope** | Sign-out destroys the session associated with the presented Bearer token; that token must no longer authenticate protected requests |
| **Cross-user sessions** | A token for one user’s session must not authenticate as a different user |
| **UI scope** | The SPA stores the signed-in user’s payload (including token) locally and sends that Bearer token on authenticated API calls; after sign-out, local auth state is cleared |


## Key Entities

* **User:** Represents a registered user of the Recipe application. A user has a first name, last name, email, password hash, and password salt.

* **Session:** Represents an authenticated session for a user. A session is associated with a user and contains the user's email and session expiration date.

* **Authentication Token:** Represents the token returned to the client after successful registration or login. The token is used as a Bearer token to authenticate protected requests and is associated with the user's session.


## API Requirements

API mount prefix: `/recipeapi` (matches the running Recipe backend).

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/recipeapi/users/` | No | Create account (register); creates user + session |
| `POST` | `/recipeapi/login` | Basic (`email:password`) | Log in; creates session |
| `POST` | `/recipeapi/logout` | Bearer token | Sign out; removes session |
| *(any protected route)* | e.g. authenticated Recipe mutations already mounted under `/recipeapi` | Bearer token | Authenticate request and identify `req.user` (US-1.3) |

**Error response shape:** `{ "message": "Human-readable explanation." }` (flat JSON; no `{ success, data }` envelope).

### `POST /recipeapi/users/` — Create an account

**Request body:**
```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "password": "a-secure-password"
}
```

**Success (`200`):** creates the user, creates a session (expiration one day from creation), returns:
```json
{
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "id": 1,
  "token": "<authentication-token>"
}
```

**Errors:**
| Condition | Status | Message (as implemented) |
|-----------|--------|--------------------------|
| Missing required field (`firstName`, `lastName`, `email`, or `password`) | `400` | e.g. `"First name cannot be empty for user!"` |
| Email already registered | `400` | `"This email is already in use."` |

### `POST /recipeapi/login` — Login

**Credentials:** `Authorization: Basic <base64(email:password)>` (no JSON credential body required).

**Success (`200`):** creates a session (expiration one day from creation), returns the same user + `token` shape as registration.

**Errors:**
| Condition | Status | Message (as implemented) |
|-----------|--------|--------------------------|
| Unknown email | `401` | `"User not found!"` |
| Incorrect password | `401` | `"Invalid password!"` |
| Missing / invalid Basic credentials when required | `401` | `"Authentication required"` |

### Bearer authentication on protected requests (US-1.3)

**Header:** `Authorization: Bearer <token>`

On success, the server associates the request with the session’s user (`req.user.id`) and continues.

**Errors (`401`) when the token is missing, invalid, or the session is expired** — messages as implemented on route middleware, for example:
- `"Unauthorized! No Auth Header"`
- `"Unauthorized! Expired Token, Logout and Login again"`
- `"Session has expired."` / `"Invalid session"` (when credential/token authentication helpers reject the session)

### `POST /recipeapi/logout` — Sign out

**Header:** `Authorization: Bearer <token>`

**Success (`200`):**
```json
{ "message": "Logged out successfully." }
```
The session row for that token is removed.

**Errors:**
| Condition | Status | Message (as implemented) |
|-----------|--------|--------------------------|
| Missing / non-Bearer auth | `401` | `"Authentication required"` |
| Invalid / undecryptable token | `401` | `"Invalid session"` |


## Screen Requirements

### [View: Login] — route name `login` (`/`)

* Purpose: sign in with email and password, or open the create-account dialog.
* Heading: **Login**
* Fields: **Email**, **Password**
* Primary actions:
  * **Login** — submits credentials via `POST /recipeapi/login` (Basic auth)
  * **Create Account** — opens the create-account dialog
* On visiting this route, clear any previously stored local auth payload (`localStorage` key `user`).
* **Success:** snackbar **"Login successful!"**; store the API user+token payload under `localStorage` key `user`; navigate to route name `recipes`.
* **Error:** snackbar shows the API `message` string.
* **Note:** The running Login page also includes **View Published Recipes** (navigates to `recipes` without signing in). That control is existing app navigation; it is **not** authorized by this feature’s FRs/Gherkin (recipe browsing is out of scope).

### [Dialog: Create Account] — on `login`

* Heading: **Create Account**
* Fields: **First Name**, **Last Name**, **Email**, **Password**
* Actions: **Close** (dismiss), **Create Account** (submit `POST /recipeapi/users/`)
* **Success:** snackbar **"Account created successfully!"**; store user+token under `localStorage` key `user`; close dialog; navigate to `recipes`.
* **Error:** snackbar shows the API `message` string (e.g. email already in use).

### [Component: MenuBar] — app chrome (sign out)

* When a signed-in user is present in `localStorage` key `user`, show the user avatar menu including **Logout**.
* **Logout** calls `POST /recipeapi/logout` with the Bearer token, clears `localStorage` key `user`, and navigates to route name `login`.
* When no signed-in user is present, show **Login** navigation to route name `login` (existing chrome).

### Client auth state (for this feature)

* Store the full register/login success payload (including `token`) in `localStorage` under key `user`.
* Authenticated API calls attach `Authorization: Bearer <token>` from that stored payload.
* No separate `/register` route — registration is the dialog on `login`.


## Data Model Requirements

### `users` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `firstName` | STRING | Required |
| `lastName` | STRING | Required |
| `email` | STRING | Required |
| `password` | BLOB | Required; stored as a salted hash |
| `salt` | BLOB | Required |

### `sessions` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `email` | STRING | Required |
| `expirationDate` | DATE | Required |
| `userId` | INTEGER FK | Required; references `users.id` |

### Associations
- One `user` can have many `sessions`.
- Each `session` belongs to one `user`.
- Deleting a user cascades to their associated sessions.


## Acceptance Criteria

### US-1.1 — Create an account

#### Scenario: Successfully create an account

**Given** the user provides a first name, last name, email, and password that are not already registered
**When** the user submits the account creation request
**Then** the system creates the user account
**And** the system creates an active session for the user
**And** the system returns the user's information and an authentication token

#### Scenario: Create an account with an existing email

**Given** an account already exists with the submitted email
**When** the user submits the account creation request
**Then** the system returns a `400` error
**And** the response indicates that the email is already in use

#### Scenario: Create an account with missing required information

**Given** the user does not provide one or more required registration fields
**When** the user submits the account creation request
**Then** the system returns a `400` error

### US-1.2 — Login

#### Scenario: Successfully login

**Given** a registered user provides the correct email and password
**When** the user submits the login request
**Then** the system authenticates the user
**And** the system creates an active session
**And** the system returns the user's information and an authentication token

#### Scenario: Login with an unknown email

**Given** no account exists with the submitted email
**When** the user submits the login request
**Then** the system returns a `401` error
**And** the response indicates that the user was not found

#### Scenario: Login with an incorrect password

**Given** the submitted email belongs to a registered user
**And** the submitted password is incorrect
**When** the user submits the login request
**Then** the system returns a `401` error
**And** the response indicates that the password is invalid

### US-1.3 — Authenticate protected requests

#### Scenario: Access a protected request with a valid session

**Given** the user has an active session
**And** the user provides a valid, unexpired Bearer token
**When** the user sends a request to a protected route
**Then** the system authenticates the request
**And** the system identifies the authenticated user

#### Scenario: Access a protected request with an invalid token

**Given** the user provides an invalid Bearer token
**When** the user sends a request to a protected route
**Then** the system returns a `401` error

#### Scenario: Access a protected request with an expired session

**Given** the user's session has expired
**When** the user sends a request to a protected route using the expired session token
**Then** the system returns a `401` error

### US-1.4 — Sign out

#### Scenario: Successfully sign out

**Given** the user has an active session
**And** the user provides a valid Bearer token
**When** the user sends a sign-out request
**Then** the system removes the user's session
**And** the system returns a successful sign-out response

#### Scenario: Sign out without authentication

**Given** the user does not provide a valid Bearer token
**When** the user sends a sign-out request
**Then** the system returns a `401` error

#### Scenario: Sign out with an invalid token

**Given** the user provides an invalid or expired Bearer token
**When** the user sends a sign-out request
**Then** the system returns a `401` error


## Test Coverage Map

Each scenario above must map to at least one automated test. Prefer exact `it("…")` titles matching the Scenario names.

| Story | Scenario | Test file | Test name |
|-------|----------|-----------|-----------|
| US-1.1 | Successfully create an account | `backend/tests/auth.test.js` | `it("Successfully create an account")` |
| US-1.1 | Create an account with an existing email | `backend/tests/auth.test.js` | `it("Create an account with an existing email")` |
| US-1.1 | Create an account with missing required information | `backend/tests/auth.test.js` | `it("Create an account with missing required information")` |
| US-1.1 | Successfully create an account | `frontend/tests/Login.test.js` | `it("Successfully create an account")` |
| US-1.2 | Successfully login | `backend/tests/auth.test.js` | `it("Successfully login")` |
| US-1.2 | Login with an unknown email | `backend/tests/auth.test.js` | `it("Login with an unknown email")` |
| US-1.2 | Login with an incorrect password | `backend/tests/auth.test.js` | `it("Login with an incorrect password")` |
| US-1.2 | Successfully login | `frontend/tests/Login.test.js` | `it("Successfully login")` |
| US-1.3 | Access a protected request with a valid session | `backend/tests/auth.test.js` | `it("Access a protected request with a valid session")` |
| US-1.3 | Access a protected request with an invalid token | `backend/tests/auth.test.js` | `it("Access a protected request with an invalid token")` |
| US-1.3 | Access a protected request with an expired session | `backend/tests/auth.test.js` | `it("Access a protected request with an expired session")` |
| US-1.4 | Successfully sign out | `backend/tests/auth.test.js` | `it("Successfully sign out")` |
| US-1.4 | Sign out without authentication | `backend/tests/auth.test.js` | `it("Sign out without authentication")` |
| US-1.4 | Sign out with an invalid token | `backend/tests/auth.test.js` | `it("Sign out with an invalid token")` |
| US-1.4 | Successfully sign out | `frontend/tests/MenuBar.test.js` | `it("Successfully sign out")` |


## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 1 from @features/feature-1-user-auth.md on branch `feature/1-user-auth`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
Align with the existing Recipe auth implementation under `/recipeapi` (register via POST /users/, login Basic, logout Bearer) — do not invent alternate auth APIs.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`


## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001**–**FR-018** satisfied)
*   [ ] **Success Criteria (SC-001**–**SC-011)** met
*   [ ] All mapped tests pass (`npm test`)
*   [ ] Test Coverage Map complete (every Gherkin scenario has a real `it`)
*   [ ] `features/reference/data-model.md` updated (users / sessions schema)
*   [ ] `features/reference/api.md` updated (auth endpoints and payloads)
*   [ ] `features/reference/behavior.md` updated (session TTL, Bearer auth, sign-out clears session)
*   [ ] Catalog row present in project README for Feature 1


## Out of Scope

*   Password reset, email verification, and third-party / social login (see Assumptions)
*   Recipe, ingredient, recipe-step, and recipe-ingredient CRUD and ownership rules (later features)
*   Shared ingredient catalog management (later features)
*   User profile editing beyond registration fields returned at auth time
*   Router navigation guards that force unauthenticated users away from app routes (not required by this feature’s FRs/Gherkin)
*   Admin user management, roles, or multi-organization tenancy
