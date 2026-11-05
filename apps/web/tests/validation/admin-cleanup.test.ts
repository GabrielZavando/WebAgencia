import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const adminPagesDir = join(srcDir, 'pages', 'admin');
const loginPagesDir = join(srcDir, 'pages', 'login');
const adminComponentsDir = join(srcDir, 'components', 'admin');
const authComponentsDir = join(srcDir, 'components', 'auth');
const uiComponentsDir = join(srcDir, 'components', 'ui');
const adminLayoutPath = join(srcDir, 'layouts', 'AdminLayout.astro');
const configPath = join(process.cwd(), 'astro.config.mjs');
const pkgPath = join(process.cwd(), 'package.json');

describe('Admin panel cleanup (sitio público)', () => {
  it('no contiene páginas de administración', () => {
    expect(existsSync(adminPagesDir)).toBe(false);
    expect(existsSync(join(adminPagesDir, 'index.astro'))).toBe(false);
    expect(existsSync(join(adminPagesDir, 'articles', 'index.astro'))).toBe(false);
    expect(existsSync(join(adminPagesDir, 'categories', 'index.astro'))).toBe(false);
  });

  it('no contiene la página de login pública', () => {
    expect(existsSync(loginPagesDir)).toBe(false);
  });

  it('no contiene componentes de administración', () => {
    expect(existsSync(adminComponentsDir)).toBe(false);
    expect(existsSync(authComponentsDir)).toBe(false);
    expect(existsSync(uiComponentsDir)).toBe(false);
  });

  it('no contiene AdminLayout', () => {
    expect(existsSync(adminLayoutPath)).toBe(false);
  });

  it('no contiene utilidades de administración', () => {
    expect(existsSync(join(srcDir, 'lib', 'auth-headers.ts'))).toBe(false);
    expect(existsSync(join(srcDir, 'lib', 'tiptap.ts'))).toBe(false);
    expect(existsSync(join(srcDir, 'lib', 'utils.ts'))).toBe(false);
  });

  it('astro.config.mjs tiene output: static y sin adaptador de servidor', () => {
    const config = readFileSync(configPath, 'utf-8');
    expect(config).toMatch(/output:\s*['"]static['"]/);
    expect(config).not.toMatch(/adapter/);
    expect(config).not.toMatch(/@astrojs\/node/);
    expect(config).not.toMatch(/output:\s*['"]server['"]/);
    expect(config).not.toMatch(/output:\s*['"]hybrid['"]/);
  });

  it('package.json no declara @astrojs/node', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['@astrojs/node']).toBeUndefined();
  });
});
