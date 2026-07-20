## 1. Update login page icon size

- [x] 1.1 In `src/styles/global.css`, add `.material-symbol-lg` class with `font-variation-settings: 'opsz' 48` and responsive `font-size: 4rem` (5rem on md+)
- [x] 1.2 In `src/pages/login/index.astro`, add class `material-symbol-lg` to the icon `<span>`
- [x] 1.3 Run `pnpm build` to verify no errors
- [x] 1.4 Fix CSS media query placement — move `.material-symbol-lg` outside of `@media (prefers-reduced-motion: reduce)` block
