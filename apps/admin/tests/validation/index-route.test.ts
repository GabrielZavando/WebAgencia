import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const indexPath = join(srcDir, 'pages', 'index.astro');

describe('Ruta raíz / (index.astro)', () => {
  it('existe la página de ruta raíz', () => {
    expect(existsSync(indexPath)).toBe(true);
  });

  it('renderiza AuthGuard con client:load y ambas redirecciones habilitadas', () => {
    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('AuthGuard');
    expect(content).toContain('client:load');
    expect(content).toContain('redirectToLogin');
    expect(content).toContain('redirectToAdmin');
  });

  it('usa AdminLayout con hideHeader y hideSidebar', () => {
    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('AdminLayout');
    expect(content).toContain('hideHeader');
    expect(content).toContain('hideSidebar');
  });
});
