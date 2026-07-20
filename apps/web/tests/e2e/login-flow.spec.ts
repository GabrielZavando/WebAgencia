import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('page loads with email auto-focused', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('no-es-email');
    await emailInput.blur();
    
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#email-error')).toContainText('Email inválido');
  });

  test('shows validation error for short password', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('short');
    await passwordInput.blur();
    
    await expect(page.locator('#password-error')).toBeVisible();
    await expect(page.locator('#password-error')).toContainText('al menos 8 caracteres');
  });

  test('submits successfully and redirects to home', async ({ page }) => {
    await page.route('/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          token: 'fake-jwt-token',
          user: { email: 'admin@example.com', role: 'admin' },
          expiresAt: new Date().toISOString(),
        },
      });
    });

    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/');
  });

  test('shows error message for invalid credentials', async ({ page }) => {
    await page.route('/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        json: { message: 'Credenciales inválidas' },
      });
    });

    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.form-error')).toBeVisible();
    await expect(page.locator('.form-error')).toContainText('Credenciales inválidas');
  });

  test('rate limit disables button', async ({ page }) => {
    await page.route('/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        json: { message: 'Demasiados intentos' },
      });
    });

    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.form-error')).toContainText('Demasiados intentos');
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    await expect(page.locator('button[type="submit"]')).toContainText('Espera');
  });

  test('header and footer are hidden on login page', async ({ page }) => {
    await expect(page.locator('header')).not.toBeVisible();
    await expect(page.locator('footer')).not.toBeVisible();
  });

  test('tab navigation works correctly', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('form can be submitted with Enter key', async ({ page }) => {
    await page.route('/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          token: 'fake-jwt-token',
          user: { email: 'admin@example.com', role: 'admin' },
          expiresAt: new Date().toISOString(),
        },
      });
    });

    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('input[type="password"]').press('Enter');

    await expect(page).toHaveURL('/');
  });
});