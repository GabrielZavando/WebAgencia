# Spec Delta

## REMOVED Requirements

### Requirement: Placeholder admin pages exist
**Reason**: Las rutas `/admin/leads` y `/admin/settings` se eliminan; ya no forman parte del producto.
**Migration**: Usar únicamente `/admin` como placeholder administrativo hasta implementar el CRUD real.

## ADDED Requirements

### Requirement: Admin entry placeholder exists
The system **SHALL** exponer `/admin` como página placeholder estática construida con Tailwind utility-first y tokens del sistema.

#### Scenario: /admin exists
- **WHEN** el usuario accede a `/admin`
- **THEN** llega a una página placeholder con estilos Tailwind y tokens del sistema

#### Scenario: No legacy admin placeholders
- **WHEN** el usuario intenta acceder a `/admin/leads` o `/admin/settings`
- **THEN** esas rutas ya no existen
