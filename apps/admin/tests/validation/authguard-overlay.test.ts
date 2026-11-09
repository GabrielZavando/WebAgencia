import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const componentPath = join(srcDir, 'components', 'auth', 'AuthGuard.tsx');

describe('AuthGuard - sin overlay de verificación', () => {
  it('no usa overlay de pantalla completa (fixed inset-0)', () => {
    expect(existsSync(componentPath)).toBe(true);
    const content = readFileSync(componentPath, 'utf-8');
    // El AuthGuard no debe tener overlay fijo que bloquee el formulario
    expect(content).not.toContain('fixed inset-0');
  });

  it('no usa spinner de animación', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).not.toContain('animate-spin');
  });

  it('no muestra texto de "Verificando sesión"', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).not.toContain('Verificando sesión');
  });
});
