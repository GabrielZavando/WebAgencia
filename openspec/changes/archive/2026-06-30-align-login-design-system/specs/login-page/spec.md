## ADDED Requirements

### Requirement: LoginPage visual alignment with design system
The LoginPage SHALL use only design tokens (CSS variables) for all visual properties, with no hardcoded hex/rgba values.

#### Scenario: All colors use design tokens
- **WHEN** inspecting LoginPage CSS (login.astro + LoginForm.tsx)
- **THEN** all color values reference `var(--color-*)`, `var(--btn-*)`, or `var(--color-*-rgb)` with no hex/rgba literals

### Requirement: Form components use standard system classes
The LoginPage SHALL use the standard form classes from global.css instead of custom duplicates.

#### Scenario: Input fields use form-input class
- **WHEN** email and password inputs render
- **THEN** they use `.form-input` class (not `.login-input`)

#### Scenario: Submit button uses btn-form class
- **WHEN** form submit button renders
- **THEN** it uses `.btn-form` class (not `.login-submit-btn`)

#### Scenario: Error messages use error-message class
- **WHEN** validation errors display
- **THEN** they use `.error-message` class (not `.login-error-message`)

### Requirement: Border radius aligns with flat design
The LoginPage SHALL use border-radius values consistent with the flat design system.

#### Scenario: Inputs have flat border-radius
- **WHEN** email and password inputs render
- **THEN** border-radius is 0 (or omitted, inheriting from .form-input)

#### Scenario: Submit button has flat border-radius
- **WHEN** submit button renders
- **THEN** border-radius is 0 (or omitted, inheriting from .btn-form)

#### Scenario: Card maintains documented exception
- **WHEN** login card container renders
- **THEN** border-radius is 16px (documented exception, not flat)

### Requirement: Typography uses fluid scale
The LoginPage SHALL use the fluid typography scale from design tokens.

#### Scenario: Labels use text-xs token
- **WHEN** form labels render
- **THEN** font-size is `var(--text-xs)` (0.75rem)

#### Scenario: Subtitle uses text-sm token
- **WHEN** page subtitle renders
- **THEN** font-size is `var(--text-sm)` (0.875rem)

### Requirement: Focus and error states match system
The LoginPage SHALL use the same focus and error state styling as the standard form system.

#### Scenario: Input focus shows shadow ring
- **WHEN** user focuses an input field
- **THEN** it displays `box-shadow: inset 0 0 0 2px var(--color-primary), 0 0 0 4px rgba(var(--color-primary-rgb), 0.3)`

#### Scenario: Input error shows red border
- **WHEN** input has validation error
- **THEN** border-color is `var(--color-error)` with error message below

## MODIFIED Requirements

Ninguna. Esta change no modifica requisitos de capacidades existentes, solo añade la nueva capacidad `login-page` con alineación completa al sistema de diseño.