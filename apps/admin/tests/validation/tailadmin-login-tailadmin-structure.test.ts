import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const componentPath = join(srcDir, 'components', 'auth', 'TailAdminLogin.tsx');

describe('TailAdminLogin - estructura simplificada', () => {
  it('usa tarjeta blanca con bordes y sombra estándar (bg-white border border-gray-300 rounded-md shadow-sm)', () => {
    expect(existsSync(componentPath)).toBe(true);
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('bg-white');
    expect(content).toContain('border border-gray-300');
    expect(content).toContain('rounded-md');
    expect(content).toContain('shadow-sm');
  });

  it('tiene header con "Bienvenido" y texto centrado', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('Bienvenido');
    expect(content).toContain('text-center');
  });

  it('usa inputs estándar (w-full border rounded-md px-4 py-2)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('w-full');
    expect(content).toContain('border');
    expect(content).toContain('rounded-md');
    expect(content).toContain('px-4');
    expect(content).toContain('py-2');
  });

  it('tiene botón de submit con clases estándar (w-full rounded-md bg-blue-600 py-3 text-white)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('type="submit"');
    expect(content).toContain('Iniciar sesión');
    expect(content).toContain('w-full');
    expect(content).toContain('rounded-md');
    expect(content).toContain('bg-blue-600');
    expect(content).toContain('text-white');
    expect(content).toContain('py-3');
  });

  it('NO importa lucide-react ni usa íconos externos', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).not.toContain('lucide-react');
    expect(content).not.toContain('material-symbols-outlined');
  });

  it('usa estado submitted para validación temprana', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('submitted');
  });
});
