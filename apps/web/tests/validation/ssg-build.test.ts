import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const distDir = join(process.cwd(), 'dist');
const configPath = join(process.cwd(), 'astro.config.mjs');

describe('Build estático', () => {

  it('2.1 astro build produce solo archivos estáticos en dist/', () => {
    expect(existsSync(distDir)).toBe(true);

    const entries = readdirSync(distDir, { recursive: true }) as string[];

    const serverArtifacts = entries.filter(e => {
      const fullPath = join(distDir, e);
      if (statSync(fullPath).isDirectory()) return false;
      const ext = e.split('.').pop()?.toLowerCase() || '';
      const basename = e.toLowerCase();
      return (
        basename.includes('server') ||
        basename.includes('function') ||
        ext === 'mjs' || ext === 'cjs'
      );
    });

    expect(serverArtifacts).toHaveLength(0);
  });

  it('2.2 astro.config.mjs tiene output: static', () => {
    const config = readFileSync(configPath, 'utf-8');
    expect(config).toMatch(/output:\s*['"]static['"]/);
  });

  it('2.3 No hay adapter de servidor configurado en astro.config.mjs', () => {
    const config = readFileSync(configPath, 'utf-8');
    expect(config).not.toMatch(/adapter/);
    expect(config).not.toMatch(/@astrojs\/node/);
    expect(config).not.toMatch(/output:\s*['"]server['"]/);
    expect(config).not.toMatch(/output:\s*['"]hybrid['"]/);
  });
});
