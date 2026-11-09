import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const componentPath = join(srcDir, 'components', 'auth', 'TailAdminLogin.tsx');

describe('TailAdminLogin - layout de tarjeta centrada', () => {
  it('el formulario principal NO usa min-h-screen (index.astro provee el contenedor 100vh)', () => {
    expect(existsSync(componentPath)).toBe(true);
    const content = readFileSync(componentPath, 'utf-8');
    // Extraer la sección del formulario principal (después del segundo return, antes del cierre del componente)
    const formSection = content.substring(content.lastIndexOf('return ('));
    expect(formSection).not.toContain('min-h-screen');
  });

  it('usa flex centrado (flex items-center justify-center)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('flex');
    expect(content).toContain('items-center');
    expect(content).toContain('justify-center');
  });

  it('NO usa íconos de lucide-react ni material-symbols-outlined (simplificado)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).not.toContain('lucide-react');
    expect(content).not.toContain('material-symbols-outlined');
  });

  it('tiene ancho controlado en el formulario (max-w-md, centrado con mx-auto implícito via justify-center)', () => {
    const content = readFileSync(componentPath, 'utf-8');
    expect(content).toContain('max-w-md');
    expect(content).toContain('w-full');
  });
});
