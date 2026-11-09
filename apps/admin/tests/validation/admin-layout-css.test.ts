import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const layoutPath = join(srcDir, 'layouts', 'AdminLayout.astro');

describe('AdminLayout - global.css import', () => {
  it('importa global.css para que los estilos de Tailwind estén disponibles', () => {
    expect(existsSync(layoutPath)).toBe(true);
    const content = readFileSync(layoutPath, 'utf-8');
    expect(content).toContain("import '../styles/global.css'");
  });
});
