# Brand Brief — WebAgenciaAstro

> Documento de contexto para decisiones de diseño. Audiencia: cliente (Gabriel Zavando) + equipo técnico + agentes IA.

## Cliente

- **Nombre**: Gabriel Zavando
- **Perfil**: Desarrollador freelance con experiencia
- **Ubicación**: Viña del Mar, Chile
- **Dominio**: B2B — servicios digitales para empresas y profesionales
- **Contacto**: contacto@gabrielzavando.cl | +56 9 641 65 631

## Propuesta de valor

**Construyo sitios web a medida, tiendas online y chatbots con IA. Desarrollo freelance con experiencia, claridad y soporte cercano para tu proyecto digital.**

La propuesta se distingue por:
- **Experiencia práctica**: no es teoría, es trabajo real entregado.
- **Claridad**: comunicación directa, sin jerga técnica innecesaria.
- **Soporte cercano**: el cliente no queda abandonado post-entrega.

## Voz y tono

- **Idioma del sitio**: español (todos los textos visibles para el usuario).
- **Estilo**: cercano, profesional, sin jerga técnica excesiva.
- **Estructura**: frases cortas, párrafos de 2-4 líneas, bullets cuando se listan beneficios.
- **Microcopy**: activo, directo ("Guardar cambios", no "Submit"; "Publicado", no "Publishing complete").

## Restricciones del producto

- **1 único usuario admin** (sin registro público, sin recuperación de contraseña vía UI).
- **Sin e-commerce completo** (solo catálogos de servicios/plans estáticos).
- **Sin multi-idioma** (español único).
- **Blog CSR** (posts se obtienen de API NestJS en runtime, no estáticos).
- **Hostinger FTP** (deploy estático, sin SSR, sin Node runtime).

## Público objetivo

| Segmento | Necesidad | Objeción común |
|---|---|---|
| PyMEs chilenas | Presencia web profesional, sin complicaciones técnicas | "¿Será muy caro?" / "¿Podré administrarlo?" |
| Freelancers | Portfolio + captura de leads | "¿Valdrá la pena invertir?" |
| Startups tempranas | MVP web rápido, validación de idea | "¿Escalará después?" |
| Profesionales independientes | Credibilidad + contacto | "¿Necesitaré saber programación?" |

## Anti-look (lo que NO es este diseño)

El cliente ha rechazado propuestas que se sintieron "templado genérico". Este sistema **evita explícitamente**:

1. **Cream/terracotta**: fondo cream (#F4F1EA) con serif display y terracotta accent.
2. **Black/acid-green**: fondo casi negro con verde ácido o bermellón brillante.
3. **Broadsheet**: layout tipo periódico con hairline rules y columns densas.

**En su lugar**: magenta+violeta+cian sobre base oscura/claro, Montserrat+Open Sans, espaciado generoso, sin hairlines, sin columns densas.

## Elementos de marca

| Elemento | Valor | Uso |
|---|---|---|
| Logo principal | `/favicon.svg` | Header, footer, favicon |
| Color primario | `#FF0080` | CTA principal, enlaces, énfasis |
| Color secundario | `#A600FF` | Acentos, hover, elementos secundarios |
| Color de acento | `#00FFE0` | Highlights, gradientes, overlays |
| Color base oscura | `#1D0033` | Fondos de banner, footer, overlays |
| Tipografía display | Montserrat | H1-H6, títulos, headings |
| Tipografía cuerpo | Open Sans | Párrafos, bullets, labels |

## Contenido legal

- **Política de privacidad**: página dedicada `/privacy-policy`.
- **Aviso legal**: vía Schema.org en `<Head>`.
- **Opt-in newsletter**: doble confirmación (futuro).

## Métricas de éxito (UI)

- **Tasa de conversión**: leads form → backend (>15% objetivo).
- **Tiempo de carga**: LCP <2.5s en 4G (validado con Lighthouse).
- **Accesibilidad**: WCAG AA mínimo (contraste ≥4.5:1 para texto normal).
- **Retención blog**: páginas/sesión >2 (contenido relevante).

## Notas para agentes IA

- **Idioma del código**: inglés (variables, funciones, comentarios técnicos).
- **Idioma de la UI**: español (todos los textos visibles).
- **Nombres de componentes**: PascalCase (`ServiceCard`, not `service-card`).
- **Fuentes**: nunca añadir nuevas sin propuesta OpenSpec.
- **Colores**: siempre usar `var(--color-primary)`, nunca `#FF0080` en componentes.

## Referencias

- **Sitio actual**: https://gabrielzavando.cl
- **LinkedIn**: https://linkedin.com/in/gabrielzavando
- **GitHub**: https://github.com/gabrielzavando
- **Instagram**: https://instagram.com/gabrielzavando
- **YouTube**: https://www.youtube.com/@gabrielzavando