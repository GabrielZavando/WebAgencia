## Why

The `admin_panel_settings` icon above "Bienvenido" on the login page was limited to ~24px (default Material Symbols size) and CSS rules were incorrectly placed inside `@media (prefers-reduced-motion: reduce)`, preventing proper scaling. The icon should be significantly larger (64-80px) to create proper visual hierarchy.

## What Changes

- Add custom CSS class `.material-symbol-lg` with responsive sizing in `src/styles/global.css`
- Apply the class to the login page header icon
- Move `.material-symbol-lg` rules outside of `prefers-reduced-motion` media query

## Capabilities

### New Capabilities

_(none — this is a visual sizing fix, not a new capability)_

### Modified Capabilities

_(none — this does not change spec-level requirements)_

## Impact

- **Code:** 
  - `src/styles/global.css` — add `.material-symbol-lg` class with responsive sizing
  - `src/pages/login/index.astro:28` — apply new class to icon
- **Dependencies:** None
- **APIs:** None
- **Breaking:** No
