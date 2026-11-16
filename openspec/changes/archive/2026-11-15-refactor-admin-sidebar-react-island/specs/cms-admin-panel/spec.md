## ADDED Requirements

### Requirement: Comportamiento del overlay y toggle del sidebar en desktop y móvil
The system **SHALL** mostrar el sidebar fijo y siempre visible en pantallas `lg` (1024px) o mayores, sin backdrop ni botón de cierre, y en pantallas menores a 1024px el sidebar inicia cerrado, se abre al clic en el botón del menú y muestra un backdrop oscuro (`bg-black/40`) que se cierra al hacer clic sobre él.

#### Scenario: Desktop no muestra backdrop ni bloquea el contenido
- **GIVEN** un viewport de 1024px o mayor (`lg` en adelante)
- **WHEN** se carga el panel de administración en `/admin`
- **THEN** el sidebar está visible por defecto (`translate-x-0`)
- **AND** no existe un elemento de backdrop/overlay en el DOM
- **AND** el contenido principal no está opacado ni bloqueado

#### Scenario: Móvil inicia con sidebar cerrado y sin backdrop
- **GIVEN** un viewport menor a 1024px
- **WHEN** se carga el panel de administración en `/admin`
- **THEN** el sidebar está oculto (`-translate-x-full`)
- **AND** no existe un elemento de backdrop/overlay en el DOM

#### Scenario: Móvil abre sidebar y muestra backdrop al clic en el botón
- **GIVEN** un viewport menor a 1024px y el sidebar cerrado
- **WHEN** el usuario hace clic en el botón de alternancia del menú (`aria-label="Abrir menú de navegación"`)
- **THEN** el sidebar se muestra (`translate-x-0`)
- **AND** aparece un backdrop oscuro (`fixed inset-0 bg-black/40`)
- **AND** el botón tiene `aria-expanded="true"`

#### Scenario: Móvil cierra sidebar y oculta backdrop al clic en el backdrop
- **GIVEN** un viewport menor a 1024px, el sidebar abierto y el backdrop visible
- **WHEN** el usuario hace clic en el backdrop oscuro
- **THEN** el sidebar se oculta (`-translate-x-full`)
- **AND** el backdrop deja de estar visible
- **AND** el botón tiene `aria-expanded="false"`
