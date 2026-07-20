import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

test.describe('SEO Técnico - Archivos', () => {

  test('10.1 Sitemap existe y es XML válido', () => {
    const distDir = join(process.cwd(), 'dist');
    const sitemapPath = join(distDir, 'sitemap.xml');
    expect(existsSync(sitemapPath)).toBe(true);
    const content = readFileSync(sitemapPath, 'utf-8');
    expect(content).toContain('<?xml');
    expect(content).toContain('<urlset');
  });

  test('10.6 robots.txt existe', () => {
    const distDir = join(process.cwd(), 'dist');
    const robotsPath = join(distDir, 'robots.txt');
    expect(existsSync(robotsPath)).toBe(true);
  });
});
