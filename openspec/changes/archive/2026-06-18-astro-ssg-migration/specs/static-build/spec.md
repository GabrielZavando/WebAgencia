## ADDED Requirements

### Requirement: Static build generation
The system SHALL generate a complete static site build when running `npm run build`.

#### Scenario: Successful static build
- **WHEN** user runs `npm run build`
- **THEN** Astro builds with `output: 'static'` configuration
- **THEN** Build completes without errors
- **THEN** Output directory `dist/` contains only static files (HTML, CSS, JS, assets)

### Requirement: No Node.js adapter dependency
The system SHALL NOT require `@astrojs/node` adapter for production builds.

#### Scenario: Package.json without node adapter
- **WHEN** inspecting `package.json` dependencies
- **THEN** `@astrojs/node` is not present in `dependencies`
- **THEN** `astro` package is the only Astro-related runtime dependency

### Requirement: Public routes prerendered correctly
The system SHALL prerender all public routes during static build.

#### Scenario: Home page prerendered
- **WHEN** build runs
- **THEN** `dist/index.html` exists with complete landing page content
- **THEN** All landing sections (Banner, Services, About, Workflow, Plans, Contact) rendered in HTML

#### Scenario: Blog index prerendered
- **WHEN** build runs
- **THEN** `dist/blog/index.html` exists with blog posts grid
- **THEN** Posts fetched from external API at build time via `PUBLIC_API_BASE_URL`
- **THEN** Each post card links to `/blog/<slug>/`

#### Scenario: Blog post pages prerendered
- **WHEN** build runs
- **THEN** For each post from API, `dist/blog/<slug>/index.html`index.html` exists
- **THEN** Post content, metadata, and sanitized HTML rendered correctly
- **THEN** Search component included as client-side island

#### Scenario: Static pages prerendered
- **WHEN** build runs
- **THEN** `dist/diagnostico/index.html` exists
- **THEN** `dist/politica-de-privacidad/index.html` exists
- **THEN** `dist/404.html` exists
- **THEN** `dist/suscripcion-confirmada/index.html` exists
- **THEN** `dist/unsubscribe/index.html` exists

### Requirement: Client-side islands preserved
The system SHALL preserve interactive islands (client:visible, client:load) in static build.

#### Scenario: Contact form island included
- **WHEN** build runs
- **THEN** Contact form JavaScript bundled and hydrated on client
- **THEN** Form validation, Turnstile, and API fetch work in browser

#### Scenario: Newsletter form island included
- **WHEN** build runs
- **THEN** Newsletter form in footer JavaScript bundled and hydrated
- **THEN** Double Opt-In flow works in browser

#### Scenario: Theme switcher island included
- **WHEN** build runs
- **THEN** Theme toggle persists preference in localStorage
- **THEN** Works without server-side rendering

### Requirement: Environment variables available at build time
The system SHALL inject `PUBLIC_*` environment variables during build.

#### Scenario: API base URL available for blog fetch
- **WHEN** build runs with `PUBLIC_API_BASE_URL` set
- **THEN** Blog pages can fetch from `${PUBLIC_API_BASE_URL}/blog?published=true`
- **THEN** Build succeeds if API responds successfully

#### Scenario: Turnstile site key available for forms
- **WHEN** build runs with `PUBLIC_TURNSTILE_SITE_KEY` set
- **THEN** Contact and newsletter forms render Turnstile widget with correct site key

### Requirement: Assets optimized and included
The system SHALL process and include all static assets in build output.

#### Scenario: Images optimized
- **WHEN** build runs with `sharp` installed
- **THEN** Images in `src/assets` and `public/` processed and copied to `dist/`
- **THEN** Image optimization (WebP, AVIF) applied per Astro config

#### Scenario: Fonts and CSS bundled
- **WHEN** build runs
- **THEN** Tailwind CSS compiled and minified in `dist/_astro/*.css`
- **THEN** Font files copied to `dist/` with cache-busting hashes
