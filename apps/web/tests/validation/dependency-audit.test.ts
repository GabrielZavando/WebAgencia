import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { readdirSync } from 'fs';
import { join } from 'path';

const pkgPath = join(process.cwd(), 'package.json');
const srcDir = join(process.cwd(), 'src');

const ALLOWED_NEW_DEPS = [
  // Base del sitio público (SSG)
  '@tailwindcss/vite',
  'astro',
  'sharp',
  'tailwindcss',
  'typescript',
  '@astrojs/check',
  // Herramientas de validación y pruebas
  '@playwright/test',
  '@vitest/coverage-v8',
  'jsdom',
  'vitest',
  // Tipos compartidos (workspace)
  '@webastro/shared-types',
  // Utilidades de pruebas (React se retiró del sitio público, pero estas
  // utilidades de desarrollo siguen presentes como devDependencies)
  '@testing-library/jest-dom',
  '@testing-library/react',
  '@vitejs/plugin-react',
];

describe('Auditoría de dependencias (sitio público)', () => {

  it('3.1 firebase-admin no está en package.json ni en node_modules', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['firebase-admin']).toBeUndefined();

    const nmPath = join(process.cwd(), 'node_modules', 'firebase-admin');
    expect(existsSync(nmPath)).toBe(false);
  });

  it('3.2 @astrojs/node no está en package.json', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['@astrojs/node']).toBeUndefined();
  });

  it('3.3 No hay imports de firebase-admin en src/', () => {
    const entries = readdirSync(srcDir, { recursive: true }) as string[];
    const sourceFiles = entries.filter(e =>
      e.endsWith('.ts') || e.endsWith('.js') || e.endsWith('.astro')
    );

    for (const file of sourceFiles) {
      const content = readFileSync(join(srcDir, file), 'utf-8');
      expect(content).not.toMatch(/from\s+['"]firebase-admin['"]/);
      expect(content).not.toMatch(/require\(['"]firebase-admin['"]\)/);
    }
  });

  it('3.4 No existen stores de autenticación (authStore, @nanostores/persistent)', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['@nanostores/persistent']).toBeUndefined();

    const entries = readdirSync(srcDir, { recursive: true }) as string[];
    const sourceFiles = entries.filter(e =>
      e.endsWith('.ts') || e.endsWith('.js') || e.endsWith('.astro')
    );

    for (const file of sourceFiles) {
      const content = readFileSync(join(srcDir, file), 'utf-8');
      expect(content).not.toMatch(/authStore/);
    }
  });

  it('3.5 Todas las dependencias están aprobadas explícitamente', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const depName of Object.keys(allDeps)) {
      expect(ALLOWED_NEW_DEPS).toContain(depName);
    }
  });

});
