import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const cssPath = join(process.cwd(), 'src', 'styles', 'global.css');

/**
 * Removes comments and quoted strings so brace tracking is not confused by
 * CSS content that contains braces or semicolons.
 */
function sanitize(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");
}

interface StyleRule {
  selector: string;
  layers: string[];
}

/**
 * Walks the CSS collecting every style rule with the `@layer` blocks that
 * enclose it. Rules nested in `@media` are reported with the layers of their
 * own ancestors, so a reset declared inside a media query is still detected.
 */
function parseStyleRules(css: string): StyleRule[] {
  const rules: StyleRule[] = [];
  const stack: string[] = [];
  let pending = '';

  for (const char of css) {
    if (char === '{') {
      const header = pending.trim();
      pending = '';

      if (!header.startsWith('@')) {
        const layers = stack
          .filter((entry) => entry.startsWith('@layer'))
          .map((entry) => entry.replace('@layer', '').trim());
        rules.push({ selector: header, layers });
      }

      stack.push(header);
    } else if (char === '}') {
      stack.pop();
      pending = '';
    } else if (char === ';') {
      // At-rule without a block, e.g. `@import "tailwindcss";`
      pending = '';
    } else {
      pending += char;
    }
  }

  return rules;
}

/**
 * Element-level reset selectors. A compound selector such as `body.menu-active`
 * or `html[data-theme="dark"] .header.scrolled` is a legacy component rule, not
 * a reset, so it is intentionally excluded.
 */
const RESET_SELECTORS = new Set([
  '*',
  '*::before',
  '*::after',
  'html',
  'body',
  'input',
  'button',
  'textarea',
  'select',
  'button:disabled',
]);

/**
 * A rule is an element-level reset only when every selector of the list targets
 * a bare element. Legacy component rules such as `.form-textarea, textarea`
 * keep their BEM priority on purpose, so they are not treated as resets.
 */
function isElementLevelReset(selector: string): boolean {
  const parts = selector
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter((part) => part.length > 0);

  return parts.length > 0 && parts.every((part) => RESET_SELECTORS.has(part));
}

describe('global.css - cascade layers (Tailwind utilities must win)', () => {
  it('existe el archivo de estilos globales', () => {
    expect(existsSync(cssPath)).toBe(true);
  });

  it('el reset universal (*) está dentro de una cascade layer', () => {
    const css = sanitize(readFileSync(cssPath, 'utf-8'));
    const reset = parseStyleRules(css).find((rule) =>
      rule.selector.split(',').some((part) => part.trim() === '*')
    );

    expect(reset).toBeDefined();
    expect(reset?.layers.length ?? 0).toBeGreaterThan(0);
  });

  it('el reset de controles de formulario (input, button, ...) está dentro de una cascade layer', () => {
    const css = sanitize(readFileSync(cssPath, 'utf-8'));
    const reset = parseStyleRules(css).find((rule) =>
      isElementLevelReset(rule.selector) && rule.selector.includes('input')
    );

    expect(reset).toBeDefined();
    expect(reset?.layers.length ?? 0).toBeGreaterThan(0);
  });

  it('las reglas de html y body están dentro de una cascade layer', () => {
    const css = sanitize(readFileSync(cssPath, 'utf-8'));
    const rules = parseStyleRules(css).filter((rule) =>
      rule.selector
        .split(',')
        .map((part) => part.trim())
        .some((part) => part === 'html' || part === 'body')
    );

    expect(rules.length).toBeGreaterThan(0);

    const unlayered = rules.filter((rule) => rule.layers.length === 0);
    expect(unlayered.map((rule) => rule.selector)).toEqual([]);
  });

  it('no existen reglas top-level sin capa que sobrescriban utilidades Tailwind', () => {
    const css = sanitize(readFileSync(cssPath, 'utf-8'));
    const offenders = parseStyleRules(css)
      .filter((rule) => rule.layers.length === 0 && isElementLevelReset(rule.selector))
      .map((rule) => rule.selector.replace(/\s+/g, ' '));

    expect(offenders).toEqual([]);
  });
});
