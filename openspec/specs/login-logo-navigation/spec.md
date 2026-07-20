## Requirements

### Requirement: Login logo links to home page
The logo displayed on the login page SHALL be wrapped in an anchor element (`<a>`) that navigates to the root path (`/`).

#### Scenario: User clicks the logo on the login page
- **WHEN** the user is on the `/login` page and clicks the logo in the top-left corner
- **THEN** the browser navigates to the home page (`/`)

#### Scenario: Logo retains visual appearance
- **WHEN** the logo is rendered on the login page
- **THEN** the logo SHALL maintain the same size, position, and animation behavior as before the change

#### Scenario: Logo is accessible
- **WHEN** the logo link is rendered in the DOM
- **THEN** the anchor element SHALL include an `aria-label` attribute with descriptive text (e.g., "Ir al inicio")
