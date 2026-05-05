import { test, expect } from '@playwright/test';

test.describe('Smoke Tests @smoke', () => {
  test('debe cargar la página de inicio', async ({ page }) => {
    await page.goto('/');
    // Ajustado al título real del sitio
    await expect(page).toHaveTitle(/Desarrollador Freelance/);
  });

  test('debe cargar la página de metodología', async ({ page }) => {
    await page.goto('/metodologia');
    // Usamos un selector más específico para evitar ambigüedad con el logo del header
    const heading = page.locator('.banner__title');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Metodología');
  });
});
