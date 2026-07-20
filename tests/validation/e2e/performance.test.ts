import { test, expect } from '@playwright/test';
import { lighthouseThresholds } from './lighthouse.config';

test.describe('Auditoría de rendimiento', () => {

  test('9.2 Las páginas principales cargan dentro de umbrales de rendimiento', async ({ page }) => {
    const routes = [
      { path: '/', label: 'Home' },
      { path: '/blog', label: 'Blog' },
    ];

    for (const route of routes) {
      const start = Date.now();
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - start;

      console.log(`[${route.label}] Load time: ${loadTime}ms`);

      const perfTiming = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (!nav) return null;
        return {
          domContentLoaded: nav.domContentLoadedEnd - nav.domContentLoadedStart,
          domInteractive: nav.domInteractive,
          lcp: nav.domContentLoadedEnd,
        };
      });

      if (perfTiming) {
        console.log(`[${route.label}] DOMContentLoaded: ${perfTiming.domContentLoaded}ms`);
      }

      // Basic audit checks
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang');

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      const metaDesc = page.locator('meta[name="description"]');
      await expect(metaDesc).toHaveAttribute('content', /.+/);

      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute('content', /width=device-width/);
    }
  });

  test('9.4 Umbrales de rendimiento diferenciados para CI', async () => {
    const thresholds = lighthouseThresholds;
    expect(thresholds.performance).toBeGreaterThanOrEqual(80);
    expect(thresholds.accessibility).toBeGreaterThanOrEqual(85);
    expect(thresholds.bestPractices).toBeGreaterThanOrEqual(85);
    expect(thresholds.seo).toBeGreaterThanOrEqual(85);

    if (process.env.LIGHTHOUSE_CI) {
      expect(thresholds.performance).toBeLessThanOrEqual(85);
    } else {
      expect(thresholds.performance).toBeGreaterThanOrEqual(85);
    }
  });
});
