import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const componentPath = join(srcDir, 'components', 'auth', 'AuthGuard.tsx');

describe('AuthGuard - renderiza children inmediatamente', () => {
  it('renderiza children sin bloquear (no usa min-h-screen)', () => {
    expect(existsSync(componentPath)).toBe(true);
    const content = readFileSync(componentPath, 'utf-8');
    // El AuthGuard no debe tener min-h-screen que empuje el layout
    expect(content).not.toContain('min-h-screen');
  });

  it('renderiza children directamente (no hay overlay que bloquee)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    // Debe retornar children directamente
    expect(content).toContain('<>{children}</>');
  });
});
