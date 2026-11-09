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

/**
 * Walks the CSS up to `index` keeping a stack of open blocks. Returns the
 * names of the `@layer` blocks that enclose that position.
 */
function enclosingLayers(css: string, index: number): string[] {
  const stack: string[] = [];
  let current = '';

  for (let i = 0; i < index; i += 1) {
    const char = css[i];
    if (char === '{') {
      stack.push(current.trim());
      current = '';
    } else if (char === '}') {
      stack.pop();
      current = '';
    } else {
      current += char;
    }
  }

  return stack
    .filter((entry) => entry.startsWith('@layer'))
    .map((entry) => entry.replace('@layer', '').trim());
}

describe('global.css - cascade layers (Tailwind utilities must win)', () => {
  it('existe el archivo de estilos globales', () => {
    expect(existsSync(cssPath)).toBe(true);
  });

  it('el reset universal (*) está dentro de una cascade layer', () => {
    const css = sanitize(readFileSync(cssPath, 'utf-8'));
    const resetIndex = css.indexOf('*,\n*::before');

    expect(resetIndex).toBeGreaterThan(-1);
    expect(enclosingLayers(css, resetIndex).length).toBeGreaterThan(0);
  });

  it('el reset de controles de formulario (input, button, ...) está dentro de una cascade layer', () => {
    const css = sanitize(readFileSync(cssPath, 'utf-8'));
    const resetIndex = css.indexOf('input, button, textarea, select');

    expect(resetIndex).toBeGreaterThan(-1);
    expect(enclosingLayers(css, resetIndex).length).toBeGreaterThan(0);
  });

  it('no existen reglas top-level sin capa que sobrescriban utilidades Tailwind', () => {
    const css = sanitize(readFileSync(cssPath, 'utf-8'));
    const offenders: string[] = [];

    // Collect top-level (unlayered) rule blocks.
    let depth = 0;
    let pending = '';
    const rules: Array<{ selector: string; start: number }> = [];

    for (let i = 0; i < css.length; i += 1) {
      const char = css[i];
      if (char === '{') {
        if (depth === 0) {
          rules.push({ selector: pending.trim(), start: i });
          pending = '';
        }
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          pending = '';
        }
      } else if (depth === 0) {
        pending += char;
      }
    }

    for (const rule of rules) {
      if (rule.selector.startsWith('@')) continue;
      if (enclosingLayers(css, rule.start).length > 0) continue;

      // Unlayered rules that zero out spacing or paint are the ones that
      // silently kill Tailwind utilities (padding/margin/border/background).
      if (/^\s*(\*|html|body|input|button|textarea|select)\b/.test(rule.selector)) {
        offenders.push(rule.selector.replace(/\s+/g, ' '));
      }
    }

    expect(offenders).toEqual([]);
  });
});
