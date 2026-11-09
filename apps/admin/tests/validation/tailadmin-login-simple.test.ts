import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const componentPath = join(srcDir, 'components', 'auth', 'TailAdminLogin.tsx');

describe('TailAdminLogin - mínima expresión funcional', () => {
  it('NO importa lucide-react ni usa librerías de íconos externas', () => {
    expect(existsSync(componentPath)).toBe(true);
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).not.toContain('lucide-react');
    expect(content).not.toContain('Mail');
    expect(content).not.toContain('Eye');
    expect(content).not.toContain('EyeOff');
    expect(content).not.toContain('CheckCircle');
    expect(content).not.toContain('material-symbols-outlined');
  });

  it('usa clases estándar de Tailwind para la tarjeta (bg-white, border-gray-300)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('bg-white');
    expect(content).toContain('border-gray-300');
    expect(content).toContain('rounded-md');
  });

  it('usa clases estándar de texto (text-gray-900, text-gray-500)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('text-gray-900');
    expect(content).toContain('text-gray-500');
  });

  it('tiene botón de submit con w-full rounded-md bg-blue-600 py-3 text-white', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('type="submit"');
    expect(content).toContain('Iniciar sesión');
    expect(content).toContain('w-full');
    expect(content).toContain('rounded-md');
    expect(content).toContain('bg-blue-600');
    expect(content).toContain('text-white');
    expect(content).toContain('py-3');
    expect(content).not.toContain('bg-primary');
    expect(content).not.toContain('hover:bg-secondary');
  });

  it('usa inputs con w-full border rounded-md px-4 py-2', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('w-full');
    expect(content).toContain('border');
    expect(content).toContain('rounded-md');
    expect(content).toContain('px-4');
    expect(content).toContain('py-2');
  });

  it('usa estado submitted para validación temprana (no muestra errores al cargar)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('submitted');
  });
});
