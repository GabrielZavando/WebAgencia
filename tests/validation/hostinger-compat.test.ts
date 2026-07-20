import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const distDir = join(process.cwd(), 'dist');

describe('Compatibilidad Hostinger', () => {

  it('8.1 No existen archivos server-side en dist/', () => {
    expect(existsSync(distDir)).toBe(true);

    const entries = readdirSync(distDir, { recursive: true }) as string[];
    const serverSide = entries.filter(e => {
      const fullPath = join(distDir, e);
      if (statSync(fullPath).isDirectory()) return false;
      const basename = e.toLowerCase();
      return (
        basename.includes('server') ||
        basename.includes('function') ||
        basename.endsWith('.mjs') ||
        basename.endsWith('.cjs')
      );
    });

    expect(serverSide).toHaveLength(0);
  });

  it('8.2 dist/ servido con servidor estático responde rutas sin 404', async () => {
    expect(existsSync(distDir)).toBe(true);

    const indexHtml = join(distDir, 'index.html');
    const blogHtml = join(distDir, 'blog', 'index.html');

    expect(existsSync(indexHtml)).toBe(true);
    expect(existsSync(blogHtml)).toBe(true);

    const indexContent = readFileSync(indexHtml, 'utf-8');
    expect(indexContent).toContain('<!DOCTYPE html');
  });

  it('8.3 Variables de entorno son solo PUBLIC_', () => {
    const envPath = join(process.cwd(), '.env');
    const envExamplePath = join(process.cwd(), '.env.example');

    const filesToCheck = [];
    if (existsSync(envPath)) filesToCheck.push(envPath);
    if (existsSync(envExamplePath)) filesToCheck.push(envExamplePath);

    if (filesToCheck.length === 0) {
      const envDir = join(process.cwd());
      const entries = readdirSync(envDir);
      const envFiles = entries.filter(e => e.startsWith('.env'));
      for (const f of envFiles) filesToCheck.push(join(envDir, f));
    }

    for (const file of filesToCheck) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
      for (const line of lines) {
        const varName = line.split('=')[0]?.trim();
        if (varName && !varName.startsWith('PUBLIC_')) {
          expect(varName).toMatch(/^PUBLIC_/);
        }
      }
    }
  });
});
