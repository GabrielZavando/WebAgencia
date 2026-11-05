import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkgPath = join(process.cwd(), 'package.json');

const ALLOWED_NEW_DEPS = [
  // Base del panel admin (SSR)
  '@astrojs/node',
  '@astrojs/react',
  '@tailwindcss/vite',
  '@types/react',
  '@types/react-dom',
  'astro',
  'class-variance-authority',
  'clsx',
  'firebase',
  'lucide-react',
  'radix-ui',
  'react',
  'react-dom',
  'sharp',
  'tailwind-merge',
  'tailwindcss',
  'tw-animate-css',
  // Tiptap editor v3 (panel admin)
  '@tiptap/react',
  '@tiptap/starter-kit',
  '@tiptap/extension-image',
  '@tiptap/pm',
  // Tipos compartidos (workspace)
  '@webastro/shared-types',
  // Herramientas de validación y pruebas
  '@astrojs/check',
  '@playwright/test',
  '@testing-library/jest-dom',
  '@testing-library/react',
  '@vitejs/plugin-react',
  '@vitest/coverage-v8',
  'jsdom',
  'typescript',
  'vitest',
];

describe('Auditoría de dependencias (panel de administración)', () => {

  it('4.1 firebase-admin no está en package.json del panel', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['firebase-admin']).toBeUndefined();
  });

  it('4.2 Todas las dependencias del panel están aprobadas explícitamente', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const depName of Object.keys(allDeps)) {
      expect(ALLOWED_NEW_DEPS).toContain(depName);
    }
  });

  it('4.3 Dependencias requeridas del panel están presentes', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(allDeps['@astrojs/node']).toBeDefined();
    expect(allDeps['astro']).toBeDefined();
    expect(allDeps['react']).toBeDefined();
    expect(allDeps['react-dom']).toBeDefined();
    expect(allDeps['@astrojs/react']).toBeDefined();
    expect(allDeps['@tiptap/react']).toBeDefined();
    expect(allDeps['firebase']).toBeDefined();
  });

});
