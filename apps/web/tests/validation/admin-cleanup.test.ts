import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const adminPagesDir = join(srcDir, 'pages', 'admin');
const adminComponentsDir = join(srcDir, 'components', 'admin');
const loginFormPath = join(srcDir, 'components', 'auth', 'LoginForm.tsx');

describe('Admin panel cleanup', () => {
  it('keeps only the /admin placeholder page', () => {
    expect(existsSync(join(adminPagesDir, 'index.astro'))).toBe(true);
    expect(existsSync(join(adminPagesDir, 'dashboard.astro'))).toBe(false);
    expect(existsSync(join(adminPagesDir, 'leads.astro'))).toBe(false);
    expect(existsSync(join(adminPagesDir, 'settings.astro'))).toBe(false);
  });

  it('removes the legacy admin components directory', () => {
    expect(existsSync(adminComponentsDir)).toBe(false);
  });

  it('redirects successful login to /admin', () => {
    const loginForm = readFileSync(loginFormPath, 'utf-8');

    expect(loginForm).toContain("window.location.href = '/admin';");
    expect(loginForm).not.toContain('/admin/dashboard');
  });
});
