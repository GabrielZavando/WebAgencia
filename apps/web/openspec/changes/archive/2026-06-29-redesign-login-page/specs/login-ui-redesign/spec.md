## ADDED Requirements

### Requirement: Usuario puede ver página de login con diseño tecnológico
El sistema DEBE mostrar una página de login con fondo tecnológico oscuro, card centrada semitransparente, logo en esquina superior izquierda y footer con copyright en la parte inferior.

#### Scenario: Visualización correcta del fondo
- **WHEN** usuario navega a `/login`
- **THEN** el sistema muestra imagen de fondo tecnológica con tonos azul/violeta y overlay gradiente

#### Scenario: Card de login centrada
- **WHEN** la página carga
- **THEN** la card de login está centrada vertical y horizontalmente con ancho máximo 450px

#### Scenario: Logo visible en esquina superior
- **WHEN** la página carga
- **THEN** el logo de la agencia es visible en la esquina superior izquierda con tamaño ~3-4rem

#### Scenario: Footer visible en parte inferior
- **WHEN** la página carga
- **THEN** el footer con copyright es visible centrado en la parte inferior de la pantalla

### Requirement: Card de login con elementos estilizados
El sistema DEBE mostrar una card de login con título "Bienvenido", subtítulo "Ingresa a tu panel de control", campos de email y contraseña estilizados, link de recuperación de contraseña, botón de inicio de sesión rosa vibrante, y footer de card con copyright.

#### Scenario: Título y subtítulo visibles
- **WHEN** la página carga
- **THEN** se muestra "Bienvenido" como H2 (blanco, 1.75rem, font-weight 700) y subtítulo "Ingresa a tu panel de control" (gris claro, 0.95rem)

#### Scenario: Campo de email funcional
- **WHEN** usuario ingresa email en campo "CORREO ELECTRÓNICO"
- **THEN** el input acepta texto, muestra label uppercase (0.85rem), y tiene fondo oscuro con borde sutil

#### Scenario: Campo de contraseña con toggle de visibilidad
- **WHEN** usuario ingresa contraseña en campo "CONTRASEÑA"
- **THEN** el input oculta caracteres y muestra ícono de ojo para toggle de visibilidad

#### Scenario: Link de recuperación de contraseña
- **WHEN** usuario hace clic en "¿Olvidaste tu contraseña?"
- **THEN** el link es visible alineado a la derecha, color rosa/violeta (#FF0080), 0.85rem

#### Scenario: Botón de inicio de sesión
- **WHEN** usuario completa campos y hace clic en "INICIAR SESIÓN"
- **THEN** el botón tiene fondo rosa vibrante (#FF0080), texto blanco uppercase, font-weight 700, padding generoso

#### Scenario: Loading state en botón
- **WHEN** el formulario está siendo enviado
- **THEN** el botón muestra estado de loading con texto "Iniciando sesión..." y opacity 60%

#### Scenario: Footer de card con copyright
- **WHEN** la página carga
- **THEN** se muestra copyright pequeño centrado en parte inferior de la card

### Requirement: Formulario de login funcional con API
El sistema DEBE mantener la funcionalidad de autenticación existente: envío de email/password a `POST /api/v1/auth/login` en localhost:3000, inyección de token Turnstile, validaciones, honeypot, y manejo de errores.

#### Scenario: Login exitoso
- **WHEN** usuario ingresa credenciales válidas y envía formulario
- **THEN** el sistema envía POST a `/api/v1/auth/login` con email, password y turnstileToken, recibe token JWT, y redirige a home

#### Scenario: Credenciales inválidas (401)
- **WHEN** usuario ingresa email/password incorrectos
- **THEN** el sistema muestra error "Credenciales inválidas" en rojo

#### Scenario: Rate limiting (429)
- **WHEN** usuario excede intentos de login
- **THEN** el sistema muestra error "Demasiados intentos, espera unos minutos" y deshabilita botón por 60 segundos

#### Scenario: Error de red
- **WHEN** la API no está disponible (localhost:3000 offline)
- **THEN** el sistema muestra error "Error de conexión, intenta más tarde"

#### Scenario: Validación de email inválido
- **WHEN** usuario ingresa email sin formato válido
- **THEN** el sistema muestra error "Email inválido" debajo del campo

#### Scenario: Validación de password corto
- **WHEN** usuario ingresa password con menos de 8 caracteres
- **THEN** el sistema muestra error "Password debe tener al menos 8 caracteres"

#### Scenario: Honeypot detecta bot
- **WHEN** bot completa campo oculto website-url
- **THEN** el sistema aborta envío silenciosamente y loguea "Honeypot triggered - bot detected"

#### Scenario: Turnstile inyecta token
- **WHEN** usuario envía formulario
- **THEN** el sistema inyecta token de Cloudflare Turnstile en el payload

### Requirement: Responsive design para login
El sistema DEBE adaptar el diseño de login para mobile (320px-767px), tablet (768px-1023px), y desktop (1024px+).

#### Scenario: Mobile layout (320px)
- **WHEN** viewport width es 320px-767px
- **THEN** la card ocupa 100% del ancho menos 2rem de padding, logo y footer mantienen posiciones

#### Scenario: Tablet layout (768px)
- **WHEN** viewport width es 768px-1023px
- **THEN** la card tiene max-width 400px, centrada horizontalmente

#### Scenario: Desktop layout (1024px+)
- **WHEN** viewport width es 1024px o mayor
- **THEN** la card tiene max-width 450px, centrada horizontal y verticalmente

### Requirement: Animaciones y transiciones
El sistema DEBE incluir animaciones sutiles de entrada (fade-in), hover states en botones y links, y focus states en inputs.

#### Scenario: Fade-in al cargar página
- **WHEN** la página carga
- **THEN** los elementos principales (card, logo, footer) aparecen con animación fade-in suave

#### Scenario: Hover en botón de login
- **WHEN** usuario pasa cursor sobre botón "INICIAR SESIÓN"
- **THEN** el botón cambia a opacidad 90% o muestra ligero glow

#### Scenario: Focus en inputs
- **WHEN** usuario hace focus en campo de email o password
- **THEN** el input muestra borde con color primary (#FF0080) y box-shadow sutil

#### Scenario: Hover en link de recuperación
- **WHEN** usuario pasa cursor sobre "¿Olvidaste tu contraseña?"
- **THEN** el link muestra underline o cambio de color

## MODIFIED Requirements

None - Esta es una capacidad nueva que no modifica requisitos existentes.

## REMOVED Requirements

None - No se eliminan requisitos existentes.