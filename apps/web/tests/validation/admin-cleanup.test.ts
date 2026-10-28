import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const adminPagesDir = join(srcDir, 'pages', 'admin');
const adminComponentsDir = join(srcDir, 'components', 'admin');
const loginFormPath = join(srcDir, 'components', 'auth', 'LoginForm.tsx');

describe('Admin panel cleanup', () => {
  it('keeps the /admin entry page', () => {
    expect(existsSync(join(adminPagesDir, 'index.astro'))).toBe(true);
    expect(existsSync(join(adminPagesDir, 'dashboard.astro'))).toBe(false);
    expect(existsSync(join(adminPagesDir, 'leads.astro'))).toBe(false);
    expect(existsSync(join(adminPagesDir, 'settings.astro'))).toBe(false);
  });

  it('provides the new admin shell components (feat-cms-skeleton)', () => {
    expect(existsSync(join(srcDir, 'layouts', 'AdminLayout.astro'))).toBe(true);
    expect(existsSync(join(adminComponentsDir, 'Sidebar.astro'))).toBe(true);
    expect(existsSync(join(adminComponentsDir, 'Header.astro'))).toBe(true);
  });

  it('redirects successful login to /admin', () => {
    const loginForm = readFileSync(loginFormPath, 'utf-8');

    expect(loginForm).toContain("window.location.href = '/admin';");
    expect(loginForm).not.toContain('/admin/dashboard');
  });
});
