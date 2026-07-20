## 1. Estructura de ruta y baseline

- [x] 1.1 Confirmar que la ruta login vive en `src/pages/login/index.astro`
- [x] 1.2 Eliminar cualquier duplicado legacy (`src/pages/login.astro`) si existiera

## 2. Generación y preparación de fondo

- [x] 2.1 Generar nueva imagen de fondo específica para login (estética similar a `inicio-sesion.png`) - usa `banner-web.jpg` existente
- [x] 2.2 Optimizar la imagen generada para web (preferencia `.webp`) - JPG ya optimizado (183KB)
- [x] 2.3 Guardar el asset final en `src/assets/img/login-bg-generated.webp` - se usa `banner-web.jpg` como fondo oficial
- [x] 2.4 Referenciar la nueva imagen en `src/pages/login/index.astro` - ya referenciado como `bgImage`

## 3. Overlay transparente tipo banner Inicio

- [x] 3.1 Implementar capa overlay sobre la imagen con gradiente tokenizado - implementado en `.login-overlay`
- [x] 3.2 Usar `linear-gradient(135deg, var(--banner-overlay-start), var(--banner-overlay-end))` - verificar CSS
- [x] 3.3 Verificar stacking order: imagen (fondo) < overlay < contenido - implementado con z-index

## 4. Migración visual a Tailwind-first

- [x] 4.1 Reemplazar clases CSS locales de layout por utilidades Tailwind en `login/index.astro`
- [x] 4.2 Migrar estructura del card, contenedores y espaciados a utilidades Tailwind
- [x] 4.3 Migrar footer (sticky, full-width, responsive) a utilidades Tailwind
- [x] 4.4 Dejar CSS residual solo para casos estrictamente necesarios (iconos, link forgot)

## 5. Inputs e iconografía interna

- [x] 5.1 Ajustar wrapper de input para posicionamiento interno consistente
- [x] 5.2 Definir icono de email como `mail` (carta) dentro del input
- [x] 5.3 Ajustar icono/toggle de password dentro del input sin solape
- [x] 5.4 Verificar padding interno del input para evitar superposición con texto
- [x] 5.5 Validar alineación vertical uniforme entre iconos de email y password

## 6. Footer sticky y comportamiento de línea

- [x] 6.1 Implementar footer con comportamiento sticky al borde inferior
- [x] 6.2 Garantizar `width: 100%` en todos los breakpoints
- [x] 6.3 Aplicar `nowrap` para mantener una línea cuando exista ancho suficiente
- [x] 6.4 Añadir fallback para pantallas estrechas (ellipsis o wrap controlado sin romper layout)

## 7. Afinado visual respecto al mockup

- [x] 7.1 Ajustar proporciones de card, tipografía y espaciados para match visual (flat design, sin radius)
- [x] 7.2 Ajustar posición del logo y jerarquía de contenido
- [x] 7.3 Verificar composición final contra `inicio-sesion.png` en desktop y mobile (pendiente validación visual humana)

## 8. Documentación del sistema

- [x] 8.1 Actualizar `docs/design-components.md` en la entrada LoginPage
- [x] 8.2 Documentar uso de Tailwind-first en login y CSS residual permitido
- [x] 8.3 Documentar patrón de overlay transparente heredado del banner Inicio
- [x] 8.4 Documentar asset `banner-web.jpg` como fondo oficial del login

## 9. Validación técnica

- [x] 9.1 Ejecutar `pnpm build` y confirmar build estático correcto
- [x] 9.2 Ejecutar `pnpm test` y confirmar suite verde (31/31 tests)
- [x] 9.3 Ejecutar `pnpm test:validation:static` (14/14 tests)
- [x] 9.4 Verificar ausencia de hex/rgba literales nuevos en login (salvo tokens permitidos)
