## ADDED Requirements

### Requirement: Login visual parity with approved mockup
The login page SHALL match the visual composition of `inicio-sesion.png` in layout hierarchy, spacing, foreground/background layering, and footer behavior.

#### Scenario: Login layout matches composition
- **WHEN** the user opens `/login`
- **THEN** the page shows fixed logo top-left, centered login card, and sticky full-width footer at bottom
- **AND** card and footer remain legible over the background image.

### Requirement: Tailwind-first implementation for login visuals
The login page visual structure MUST be implemented primarily with Tailwind utility classes in the page/component markup instead of a large login-specific CSS block.

#### Scenario: Tailwind classes drive layout
- **WHEN** reviewing `src/pages/login/index.astro` and `src/components/auth/LoginForm.tsx`
- **THEN** container, spacing, positioning, typography, and responsive behavior are represented by Tailwind utility classes
- **AND** any residual CSS is limited to minimal edge cases.

### Requirement: Transparent overlay over generated background image
The login page SHALL use a generated background image with a transparent gradient overlay equivalent to the Inicio banner pattern.

#### Scenario: Banner-like overlay is applied
- **WHEN** the login page renders
- **THEN** the background image is visible behind a transparent gradient overlay using `--banner-overlay-start` and `--banner-overlay-end`
- **AND** the overlay sits above the image and below content layers.

### Requirement: Input icons rendered inside input fields
Inputs MUST render their icons inside the input visual boundary and aligned consistently.

#### Scenario: Email icon inside field
- **WHEN** the email field is rendered
- **THEN** a mail/envelope icon is shown inside the field at the right side
- **AND** the icon does not overlap typed text.

#### Scenario: Password icon/toggle inside field
- **WHEN** the password field is rendered
- **THEN** the visibility icon/toggle is shown inside the same field on the right
- **AND** icon alignment matches the email field vertical alignment.

### Requirement: Footer sticky and single-line preference
The login footer MUST remain at the bottom, span full width, and keep each text line in one row whenever viewport width allows.

#### Scenario: Full-width sticky footer
- **WHEN** content height is shorter than viewport
- **THEN** the footer stays attached to the bottom edge and spans 100% width.

#### Scenario: Single-line text when possible
- **WHEN** viewport width is sufficient
- **THEN** footer text lines render without wrapping
- **AND** on narrow widths they degrade gracefully without layout breakage.

### Requirement: Dedicated route folder for login page
The login route MUST be implemented with a dedicated page folder structure.

#### Scenario: Folder-based route exists
- **WHEN** inspecting `src/pages`
- **THEN** login is defined at `src/pages/login/index.astro`
- **AND** no duplicate `src/pages/login.astro` remains.

### Requirement: New generated background asset for login
The login page SHALL use a dedicated generated background image asset optimized for web delivery.

#### Scenario: Dedicated login image in assets
- **WHEN** inspecting `src/assets/img/`
- **THEN** there is a login-specific generated image asset (e.g., `login-bg-generated.webp`)
- **AND** login page references that asset directly.
