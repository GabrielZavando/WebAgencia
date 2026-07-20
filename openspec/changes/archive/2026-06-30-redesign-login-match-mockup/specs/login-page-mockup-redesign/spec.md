## ADDED Requirements

### Requirement: Mockup-aligned visual design
The LoginPage SHALL visually match the approved mockup `inicio-sesion.png` with developer-brand identity (dark mode, photo background, magenta accent).

#### Scenario: Background uses photograph
- **WHEN** LoginPage renders
- **THEN** it displays a photograph of a developer desk setup (monitors with code, coffee, glasses, keyboard) as background, NOT abstract CSS gradients
- **AND** the image is stored at `public/assets/img/login-bg.jpg` and referenced via `background-image: url()`
- **AND** background-size is `cover` and background-position is `center`

#### Scenario: Dark overlay applied to background
- **WHEN** LoginPage renders
- **THEN** a dark overlay (≥60% opacity black) is applied over the photograph to ensure WCAG AA contrast with white text

### Requirement: Bracket logo with magenta glow
The LoginPage SHALL display a `</>` bracket logo in the top-left corner with magenta glow effect.

#### Scenario: Logo is bracket icon
- **WHEN** LoginPage renders
- **THEN** top-left logo is a `</>` bracket SVG (or equivalent code icon) in magenta color (`var(--color-secondary)` or `var(--color-primary)`)
- **AND** logo has a magenta `drop-shadow` filter for glow effect
- **AND** logo size is approximately 50-60px

### Requirement: Card with elevated shadow and mixed border-radius
The LoginPage card SHALL have pronounced elevation shadow and border-radius that contrasts with internal flat controls.

#### Scenario: Card has deep shadow
- **WHEN** LoginPage renders
- **THEN** card displays a deep multi-layer shadow (e.g., 0 25px 50px -12px rgba(0,0,0,0.6)) creating a "floating panel" effect

#### Scenario: Card has rounded corners
- **WHEN** LoginPage renders
- **THEN** card border-radius is approximately 8-12px (exception to system flat design, documented)

#### Scenario: Card background is translucent
- **WHEN** LoginPage renders
- **THEN** card has semi-transparent dark background (rgba approximate ghostblack with 70-85% opacity) allowing background image to partially show through

### Requirement: Asymmetric hierarchy inside card
The LoginPage card SHALL use asymmetric layout: centered header, left-aligned form.

#### Scenario: Header section is centered
- **WHEN** LoginPage renders
- **THEN** title "Bienvenido" and subtitle "Ingresa a tu panel de control" are centered (text-align: center)

#### Scenario: Form section is left-aligned
- **WHEN** LoginPage renders
- **THEN** form labels, inputs, forgot-link, and submit button are left-aligned within card

### Requirement: Inputs with flat design and decorative icons
The login form inputs SHALL be flat (border-radius 0) with decorative icons positioned at right.

#### Scenario: Inputs have flat corners
- **WHEN** email and password inputs render
- **THEN** their border-radius is 0 (override of `.form-input` system class if needed)

#### Scenario: Inputs have decorative icons on right
- **WHEN** email input renders
- **THEN** it has a flag icon (`material-symbols-outlined:flag`) absolutely positioned on the right
- **AND** when password input renders
- **THEN** it has a key icon (`material-symbols-outlined:key`) absolutely positioned on the right
- **AND** icons are decorative (`aria-hidden="true"`)

### Requirement: Magenta primary button
The LoginPage submit button SHALL be magenta, flat, full-width, with uppercase white text.

#### Scenario: Button is full-width magenta
- **WHEN** submit button renders
- **THEN** it has background `var(--color-primary)` (magenta #FF0080), is full-width, has flat border-radius (0), uppercase white text

#### Scenario: Button has generous height
- **WHEN** submit button renders
- **THEN** it has generous height (padding ≥1rem vertically) creating a prominent CTA

### Requirement: Magenta forgot link right-aligned
The LoginPage forgot-link SHALL be magenta and right-aligned below password input.

#### Scenario: Link is magenta and right-aligned
- **WHEN** "¿Olvidaste tu contraseña?" link renders
- **THEN** it has color `var(--color-primary)`, is right-aligned, and is positioned below password input

### Requirement: External footer with personal branding
The LoginPage SHALL display a footer OUTSIDE the card (below it), with developer name highlighted in magenta.

#### Scenario: Footer is external to card
- **WHEN** LoginPage renders
- **THEN** footer with copyright and "Desarrollado por: Gabriel Zavando" appears BELOW the card, not inside it

#### Scenario: Developer name is magenta accent
- **WHEN** footer renders
- **THEN** the name "Gabriel Zavando" appears in magenta (`var(--color-primary)` or `var(--color-secondary)`) in both copyright line and credit line

### Requirement: Maintained functionality and token usage
The LoginPage SHALL maintain all existing functionality (validation, Turnstile, rate limit, honeypot) AND continue using design tokens (no new hex literals).

#### Scenario: No hex literals in login files
- **WHEN** inspecting `src/pages/login.astro` and `src/components/auth/LoginForm.tsx`
- **THEN** there are zero hardcoded hex/rgba literals (all colors via var(--*))

#### Scenario: All existing tests pass
- **WHEN** running `pnpm test`
- **THEN** all 31 existing tests pass (including 8 LoginForm tests) with no regressions
