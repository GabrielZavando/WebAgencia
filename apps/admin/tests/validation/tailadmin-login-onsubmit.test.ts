import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const componentPath = join(srcDir, 'components', 'auth', 'TailAdminLogin.tsx');

describe('TailAdminLogin - no onsubmit attribute', () => {
  it('no usa el atributo nativo onsubmit en el formulario', () => {
    expect(existsSync(componentPath)).toBe(true);
    const content = readFileSync(componentPath, 'utf-8');
    // Verificar que NO contiene 'onsubmit=' (atributo HTML nativo que causa warning de React)
    expect(content).not.toContain('onsubmit=');
    // Verificar que SÍ usa onSubmit de React
    expect(content).toContain('onSubmit={handleSubmit}');
  });
});
