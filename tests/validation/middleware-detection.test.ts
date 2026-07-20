import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');

describe('Detección de middleware', () => {

  it('4.1 No existe src/middleware.ts ni src/middleware/', () => {
    expect(existsSync(join(srcDir, 'middleware.ts'))).toBe(false);
    expect(existsSync(join(srcDir, 'middleware'))).toBe(false);
  });

  it('4.2 No hay ocurrencias de onRequest en src/', () => {
    const entries = readdirSync(srcDir, { recursive: true }) as string[];
    const sourceFiles = entries.filter(e =>
      e.endsWith('.ts') || e.endsWith('.js') || e.endsWith('.astro')
    );

    for (const file of sourceFiles) {
      const content = readFileSync(join(srcDir, file), 'utf-8');
      expect(content).not.toMatch(/\bonRequest\b/);
    }
  });
});
