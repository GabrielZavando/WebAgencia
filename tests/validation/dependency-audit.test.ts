import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { readdirSync } from 'fs';
import { join } from 'path';

const pkgPath = join(process.cwd(), 'package.json');
const srcDir = join(process.cwd(), 'src');

const ALLOWED_NEW_DEPS = [
  '@astrojs/react',
  'react',
  'react-dom',
  '@types/react',
  '@types/react-dom',
  '@testing-library/react',
  '@testing-library/jest-dom',
  'tailadmin-react-free',
  '@heroicons/react',
  'react-router-dom',
  'react-hot-toast',
  'react-toastify',
  'flatpickr',
  'jsvectormap',
  'react-icons',
  'match-sorter',
  'sort-by',
  'firebase',
];

describe('Auditoría de dependencias', () => {

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

  it('3.5 Nuevas dependencias están aprobadas explícitamente', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    const originalDeps = [
      '@tailwindcss/vite',
      'astro',
      'sharp',
      'tailwindcss',
      'typescript',
      '@playwright/test',
      '@vitest/coverage-v8',
      'jsdom',
      'vitest',
    ];

    const allAllowed = [...originalDeps, ...ALLOWED_NEW_DEPS, '@vitejs/plugin-react', '@astrojs/check', 'pnpm', '@parcel/watcher', 'esbuild', 'protobufjs', 'apexcharts'];

    for (const depName of Object.keys(allDeps)) {
      expect(allAllowed).toContain(depName);
    }
  });

  it('3.6 React dependencies están presentes y versionadas correctamente', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(allDeps['@astrojs/react']).toBeDefined();
    expect(allDeps['react']).toBeDefined();
    expect(allDeps['react-dom']).toBeDefined();
    expect(allDeps['@types/react']).toBeDefined();
    expect(allDeps['@types/react-dom']).toBeDefined();

    const reactVersion = allDeps['react'];
    expect(reactVersion).toMatch(/\^?18\./);
  });
});
