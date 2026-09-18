# Feature: Profile Management

**Feature ID:** 6
**Branch pattern:** `feature/6-profile-management`
**Status:** Ready
**Created:** 2026-09-17
**Input:** A signed-in user needs to open their account menu to see their name and email, then sign out so this browser no longer has their session.
**Depends on:** Feature 1 — User Authentication & Session Management (register, sign-in, and the browser-stored session)

## User Stories

### US-6.1: View Account
**As a** Authorized User
**I want to** View the details of my account
**So that** I can see the name and username of my profile

**Priority:** P1
**Independent test:** While signed in, open the account menu and confirm first name, last name, and email from the stored session are visible
**Acceptance scenarios:** see ### US-6.1 under Acceptance Criteria

### US-6.2: Log out
**As a** Logged-in User
**I want to** press the log-out button and sign out
**So that** I am no longer logged into the program

**Priority:** P1
**Independent test:** Choose Logout and confirm `user` is cleared from `localStorage` and the login screen appears
**Acceptance scenarios:** see ### US-6.2 under Acceptance Criteria

## Requirements

### Functional Requirements

- **FR-001**: When a signed-in user opens the account menu, the system MUST display that user's first name, last name, and email from the browser-stored session.
- **FR-002**: The account menu MUST display initials made from the first character of the first name and the first character of the last name.
- **FR-003**: The account menu MUST NOT display the user's password.
- **FR-004**: The account menu and **Logout** control MUST appear only when a signed-in session is present in the browser.
- **FR-005**: When no signed-in session is present, the system MUST NOT show the account menu.
- **FR-006**: Choosing **Logout** MUST remove the `user` record from `localStorage`.
- **FR-007**: Choosing **Logout** MUST navigate the user to the login screen.
- **FR-008**: Choosing **Logout** MUST request that the server end the current session.
- **FR-009**: If the server logout request fails, the system MUST still remove the browser-stored session and show the login screen.
- **FR-010**: After **Logout**, the account menu MUST NOT remain available until the user signs in again.

## Assumptions

- Feature 1 authentication is already in the running app: register and sign-in store a `user` object in `localStorage` with `firstName`, `lastName`, `email`, `id`, and `token`.
- The Recipe app has no separate username field. The account identifier shown on the profile menu is the user's **email**.
- Account details are read from the browser-stored session. This feature does not load a separate profile record from the server.
- This feature does not add a dedicated profile page, edit-profile flow, or password change.
- **Logout** on the account menu is the existing Recipe sign-out (also listed as Feature 1 US-1.4). This feature specifies that same behavior; it does not add a second logout path.
- The login screen also removes `user` from `localStorage` when it loads.

## Edge Cases

- No signed-in session → account menu is hidden; **Login** is available.
- Server logout request fails or returns an error → `user` is still removed from `localStorage` and the login screen is shown.
- Password is never shown on the account menu and is not stored in `localStorage`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge
- **SC-002**: A signed-in user can open the account menu and see their first name, last name, and email
- **SC-003**: Choosing **Logout** removes `user` from `localStorage` and shows the login screen
- **SC-004**: After logout, the account menu is not shown

## Data Ownership & Isolation

Each signed-in user may see only their own account details from their own browser session. Logout ends only that session.

| Rule | Requirement |
|------|-------------|
| **Read scope** | The account menu shows `firstName`, `lastName`, and `email` from the signed-in `user` in `localStorage`. There is no profile read API in this feature. |
| **Write scope** | `POST /recipeapi/logout` ends only the server session identified by the caller's Bearer token. It MUST NOT delete the `users` row. |
| **Create scope** | This feature creates no User or Session rows (Feature 1 register/sign-in owns that). |
| **Cross-user access** | This feature does not expose another user's name or email. Missing or invalid logout auth → `401` (not `404`). |
| **UI scope** | The account menu and **Logout** appear only for the signed-in user. Signed-out users see **Login**, not another user's account. |
| **Implementation** | UI reads the browser-stored session. Server logout destroys the session for the presented token. Do not add a profile GET or an authorization helper for this feature. |

## Key Entities

- **User**: registered account; first name, last name, and email are shown on the account menu
- **Session**: server-side record for the signed-in user; ended when the user logs out
- **Browser session**: the `user` value in `localStorage` that the account menu reads and that logout clears

## API Requirements

This feature uses the existing logout endpoint only. Register, login, session creation, and protected recipe/ingredient routes stay with Feature 1.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/recipeapi/logout` | Yes (Bearer token) | End the current server session |

**Request body:** none.

**Headers:** `Authorization: Bearer <token>` from the browser-stored session.

**Success response** (`200`):
```json
{ "message": "Logged out successfully." }
```

**Error responses** (`401`): `{ "message": "..." }`
- Missing or non-Bearer auth → `{ "message": "Authentication required" }`
- Token does not map to a session → `{ "message": "Invalid session" }`

The account menu does not display these API messages. On success or failure of this request, the UI still clears `user` from `localStorage` and shows the login screen (FR-009).

## Screen Requirements

There is **no** `/profile` route and **no** profile page. Account view and logout are app-bar chrome.

### App chrome — account menu

Present on every route (app bar).

*   **Signed in:** avatar with initials `{firstName[0]}{lastName[0]}` opens the account menu.
*   Account menu shows:
    *   the same initials
    *   `{firstName} {lastName}` (example: `Ada Cook`)
    *   email (example: `ada@example.com`) — this is the account identifier; there is no username
    *   **Logout**
*   **Signed out:** account menu is hidden; **Login** is shown and goes to route `login`.
*   Password, `id`, and `token` are not shown.

**Empty state:** no signed-in session → no account menu (no extra empty-state copy).

**Loading / error:** no loading indicator for the account menu. Logout API errors are not shown in the UI; the login screen still appears.

### [View: Login] — route name `login`

*   Path `/`. Heading **Login**.
*   **Logout** navigates here (`router` name `login`).
*   Login form, register dialog, and session *creation* are Feature 1 — do not respecify them here.

## Data Model Requirements

This feature adds **no new tables or columns**. It uses the existing User and Session data created at register/sign-in.

### `users` table (existing)
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `firstName` | STRING | Required; displayed on the account menu |
| `lastName` | STRING | Required; displayed on the account menu |
| `email` | STRING | Required; displayed on the account menu as the account identifier |
| `password` | BLOB | Required; MUST NOT be shown on the account menu |
| `salt` | BLOB | Required; not shown in the UI |

### `sessions` table (existing)
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment; encrypted into the browser session `token` |
| `email` | STRING | Required |
| `expirationDate` | DATE | Required |
| `userId` | INTEGER FK | Required; references `users.id` |

### Associations

- User has many Sessions
- Session belongs to one User

Logout deletes the server `sessions` row for the current token. It does not delete the `users` row.

## Acceptance Criteria

### US-6.1 — View Account

#### Scenario: Signed-in user views account name and email
*   **Given** I am signed in with first name `Ada`, last name `Cook`, and email `ada@example.com`
*   **When** I open the account menu
*   **Then** I see `Ada Cook`
*   **And** I see `ada@example.com`
*   **And** I see initials `AC`
*   **And** I do not see my password

#### Scenario: Signed-out user does not see the account menu
*   **Given** I am not signed in
*   **When** I view the application bar
*   **Then** the account menu is not shown
*   **And** a **Login** control is shown

### US-6.2 — Log out

#### Scenario: Signed-in user logs out
*   **Given** I am signed in
*   **And** `user` is present in `localStorage`
*   **When** I choose **Logout**
*   **Then** `user` is removed from `localStorage`
*   **And** I am on the login screen
*   **And** the account menu is not shown

#### Scenario: Logout still signs the browser out if the server logout request fails
*   **Given** I am signed in
*   **And** `user` is present in `localStorage`
*   **When** I choose **Logout**
*   **And** the server logout request fails
*   **Then** `user` is still removed from `localStorage`
*   **And** I am on the login screen

## Test Coverage Map

Each scenario above must map to at least one automated test.

| Story | Scenario | Test file | Test name |
|-------|----------|-----------|-----------|
| US-6.1 | Signed-in user views account name and email | `frontend/tests/MenuBar.test.js` | `Signed-in user views account name and email` |
| US-6.1 | Signed-out user does not see the account menu | `frontend/tests/MenuBar.test.js` | `Signed-out user does not see the account menu` |
| US-6.2 | Signed-in user logs out | `frontend/tests/MenuBar.test.js` | `Signed-in user logs out` |
| US-6.2 | Logout still signs the browser out if the server logout request fails | `frontend/tests/MenuBar.test.js` | `Logout still signs the browser out if the server logout request fails` |

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

~~~text
Implement Feature 6 from @features/feature-6-profile-management.md on branch `feature/6-profile-management`.

The running Recipe app already has the account menu and Logout. Do not add a profile page, username field, edit-profile flow, or a second logout path. Do not re-specify or re-implement Feature 1 register, sign-in, or session creation.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
Change product code only if a mapped test shows a gap against this spec.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
~~~

**Reference updates for this feature:** `features/reference/api.md` (logout), `features/reference/behavior.md` (account menu and logout). No `data-model.md` change unless schema actually changes (this feature adds none).

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-00N** satisfied)
*   [ ] **Success Criteria (SC-00N)** met
*   [ ] All mapped tests pass (`npm test`)
*   [ ] Test Coverage Map complete
*   [ ] `features/reference/data-model.md` updated (if schema changed)
*   [ ] `features/reference/api.md` updated (if API changed)
*   [ ] `features/reference/behavior.md` updated (if product rules changed)

## Out of Scope

*   Register, sign-in, stay signed in across reloads, and blocking unauthenticated recipe/ingredient changes (Feature 1)
*   A dedicated profile page or `/profile` route
*   Editing first name, last name, email, or password
*   A separate username field (email is the account identifier shown today)
*   Password reset
*   Recipe, recipe-step, recipe-ingredient, and ingredient catalog management (Features 2–5)
