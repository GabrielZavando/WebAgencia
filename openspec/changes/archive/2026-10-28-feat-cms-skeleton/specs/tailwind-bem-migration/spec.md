# Spec Delta

## REMOVED Requirements

### Requirement: Admin entry placeholder exists
**Reason**: la entrada admin deja de ser un placeholder estático; ahora es el shell del panel de administración.
**Migration**: reemplazado por "Admin entry uses Tailwind and design tokens".

## ADDED Requirements

### Requirement: Admin entry uses Tailwind and design tokens
The system **SHALL** exponer `/admin` como shell administrativo construido con Tailwind utility-first, tokens del sistema y componentes shadcn/ui, sin clases BEM nuevas en `global.css`.

#### Scenario: /admin usa tokens del sistema
- **WHEN** se inspeccionan las clases del shell
- **THEN** usa tokens (`bg-surface`, `text-text`, `border-border`) y no genéricos (`bg-white`, `bg-gray-100`, `text-gray-600`)

#### Scenario: Componentes shadcn sin BEM nuevo
- **GIVEN** los componentes admin y shadcn/ui agregados
- **WHEN** se revisa `global.css`
- **THEN** solo se añadieron variables CSS puente (bloque aditivo), sin reglas BEM nuevas

#### Scenario: No legacy admin placeholders
- **WHEN** el usuario intenta acceder a `/admin/leads` o `/admin/settings`
- **THEN** esas rutas ya no existen
