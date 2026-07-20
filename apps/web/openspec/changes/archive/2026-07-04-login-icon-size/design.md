## Context

The login page icon uses Google Material Symbols font. Google Fonts injects `font-size: 24px` as default for `.material-symbols-outlined`. Additionally, CSS rules in `global.css` were scoped inside `@media (prefers-reduced-motion: reduce)`, preventing the icon from scaling properly.

## Goals / Non-Goals

**Goals:**
- Make the icon significantly larger (64-80px) for proper visual hierarchy
- Implement responsive sizing (larger on desktop)
- Use CSS classes, not inline styles

**Non-Goals:**
- Changing the icon itself
- Modifying other login page elements
- Changing Google Fonts URL (attempted but reverted due to font loading issues)

## Decisions

**1. Custom CSS class `.material-symbol-lg`** — Defined in `src/styles/global.css` outside of any media query.

Rationale:
- `font-variation-settings: 'opsz' 48` — sets optical size axis to maximum allowed by current font URL
- `font-size: 4rem` (64px) on mobile, `5rem` (80px) on desktop via media query
- Placed OUTSIDE `@media (prefers-reduced-motion: reduce)` to ensure it applies universally
- Responsive sizing via CSS media query instead of Tailwind utilities for clarity

**2. Keep Google Fonts URL unchanged** — Retained `opsz@20..48` (original).

Rationale:
- Attempted to change to `opsz@20..100` but caused font loading failures
- `opsz@20..48` is sufficient when combined with explicit `font-size` overrides
- No additional font data download required

## Risks / Trade-offs

- **Risk:** Larger icon may affect visual balance on small screens. **Mitigation:** 4rem (64px) tested and works well on mobile viewports.
- **Risk:** Future changes to Google Fonts URL may reset optical size limits. **Mitigation:** Class is self-contained; only requires `font-variation-settings` adjustment.
