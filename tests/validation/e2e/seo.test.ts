import { test, expect } from '@playwright/test';

test.describe('SEO Técnico - Auditoría', () => {

  test('10.2 Meta tags Open Graph en home', async ({ page }) => {
    await page.goto('/');

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDesc = page.locator('meta[property="og:description"]');
    const ogImage = page.locator('meta[property="og:image"]');
    const ogUrl = page.locator('meta[property="og:url"]');

    await expect(ogTitle).toHaveAttribute('content', /.+/);
    await expect(ogDesc).toHaveAttribute('content', /.+/);
    await expect(ogImage).toHaveAttribute('content', /.+/);
    await expect(ogUrl).toHaveAttribute('content', /.+/);
  });

  test('10.2 Meta tags Open Graph en blog', async ({ page }) => {
    await page.goto('/blog');

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDesc = page.locator('meta[property="og:description"]');

    await expect(ogTitle).toHaveAttribute('content', /.+/);
    await expect(ogDesc).toHaveAttribute('content', /.+/);
  });

  test('10.3 Meta description en home y blog', async ({ page }) => {
    await page.goto('/');
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);

    await page.goto('/blog');
    const metaDescBlog = page.locator('meta[name="description"]');
    await expect(metaDescBlog).toHaveAttribute('content', /.+/);
  });

  test('10.4 Un solo h1 en home', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('10.4 Un solo h1 en blog', async ({ page }) => {
    await page.goto('/blog');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('10.5 Imágenes con lazy loading', async ({ page }) => {
    await page.goto('/');

    const imgs = page.locator('img');
    const count = await imgs.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const img = imgs.nth(i);
        const loading = await img.getAttribute('loading');
        const isAboveFold = await img.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.top < window.innerHeight;
        });

        if (!isAboveFold && loading !== null) {
          expect(loading).toBe('lazy');
        }
      }
    }
  });

  test('10.7 Etiquetas canonical y lang en HTML', async ({ page }) => {
    await page.goto('/');

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /.+/);

    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
  });
});
