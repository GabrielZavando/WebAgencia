import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const pagePath = join(srcDir, 'pages', 'login', 'index.astro');

describe('Login page - contenedor principal centrado', () => {
  it('tiene contenedor principal con min-h-screen flex items-center justify-center bg-cover bg-center', () => {
    expect(existsSync(pagePath)).toBe(true);
    const content = readFileSync(pagePath, 'utf-8');
    expect(content).toContain('min-h-screen');
    expect(content).toContain('flex');
    expect(content).toContain('items-center');
    expect(content).toContain('justify-center');
    expect(content).toContain('bg-cover');
    expect(content).toContain('bg-center');
  });

  it('TailAdminLogin no tiene min-h-screen (se evita estiramiento doble)', () => {
    const tailadminPath = join(srcDir, 'components', 'auth', 'TailAdminLogin.tsx');
    const content = readFileSync(tailadminPath, 'utf-8');
    const formSection = content.substring(content.lastIndexOf('return ('));
    expect(formSection).not.toContain('min-h-screen');
  });
});
