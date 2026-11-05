import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const adminPagesDir = join(srcDir, 'pages', 'admin');
const loginPagesDir = join(srcDir, 'pages', 'login');
const adminComponentsDir = join(srcDir, 'components', 'admin');
const uiComponentsDir = join(srcDir, 'components', 'ui');
const adminLayoutPath = join(srcDir, 'layouts', 'AdminLayout.astro');
const configPath = join(process.cwd(), 'astro.config.mjs');

describe('Admin panel presence (aplicación de administración)', () => {
  it('contiene las páginas de administración', () => {
    expect(existsSync(join(adminPagesDir, 'index.astro'))).toBe(true);
    expect(existsSync(join(adminPagesDir, 'articles', 'index.astro'))).toBe(true);
    expect(existsSync(join(adminPagesDir, 'categories', 'index.astro'))).toBe(true);
    expect(existsSync(join(adminPagesDir, 'blog', 'editor-test.astro'))).toBe(true);
  });

  it('contiene la página de login', () => {
    expect(existsSync(join(loginPagesDir, 'index.astro'))).toBe(true);
  });

  it('contiene los componentes de administración', () => {
    expect(existsSync(adminComponentsDir)).toBe(true);
    expect(existsSync(join(adminComponentsDir, 'Sidebar.astro'))).toBe(true);
    expect(existsSync(join(adminComponentsDir, 'Header.astro'))).toBe(true);
    expect(existsSync(uiComponentsDir)).toBe(true);
  });

  it('contiene AdminLayout autónomo', () => {
    expect(existsSync(adminLayoutPath)).toBe(true);
  });

  it('contiene utilidades de administración', () => {
    expect(existsSync(join(srcDir, 'lib', 'auth-headers.ts'))).toBe(true);
    expect(existsSync(join(srcDir, 'lib', 'tiptap.ts'))).toBe(true);
    expect(existsSync(join(srcDir, 'lib', 'utils.ts'))).toBe(true);
  });

  it('astro.config.mjs tiene output: server y adaptador @astrojs/node', () => {
    const config = readFileSync(configPath, 'utf-8');
    expect(config).toMatch(/output:\s*['"]server['"]/);
    expect(config).toMatch(/@astrojs\/node/);
    expect(config).not.toMatch(/output:\s*['"]static['"]/);
  });
});
