import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Astro removes the `ssr` attribute from an island once it is hydrated.
 * Waiting for it guarantees the React event handlers are attached before the
 * test interacts with the form.
 */
async function waitForLoginHydration(page: Page): Promise<void> {
  await page.waitForSelector(
    'astro-island[component-url*="TailAdminLogin"]:not([ssr])',
    { state: 'attached' },
  );
}

/**
 * Reads the admin `.env` and reports whether it points to a real Firebase
 * project. The repository ships dummy credentials, so the flows that perform
 * a real `signInWithEmailAndPassword` cannot succeed locally.
 */
function hasRealFirebaseCredentials(): boolean {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return false;

  const values = Object.fromEntries(
    readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const [key, ...rest] = line.split('=');
        return [key.trim(), rest.join('=').trim()];
      }),
  );

  const apiKey = values.PUBLIC_FIREBASE_API_KEY ?? '';
  const projectId = values.PUBLIC_FIREBASE_PROJECT_ID ?? '';

  const looksDummy =
    apiKey.includes('dummy') ||
    apiKey.includes('test') ||
    projectId.includes('dummy') ||
    projectId.includes('test');

  return !looksDummy;
}

const REAL_FIREBASE = hasRealFirebaseCredentials();

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await waitForLoginHydration(page);
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

  test('submits successfully and redirects to admin', async ({ page }) => {
    test.skip(!REAL_FIREBASE, 'Requires real Firebase credentials');

    await page.route('/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            user: {
              id: 'admin-1',
              email: 'admin@example.com',
              full_name: 'Admin Example',
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          meta: { message: 'Login exitoso' },
        },
      });
    });

    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/admin');
  });

  test('shows error message for invalid credentials', async ({ page }) => {
    test.skip(!REAL_FIREBASE, 'Requires real Firebase credentials');

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
    test.skip(!REAL_FIREBASE, 'Requires real Firebase credentials');

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

  test('tab navigation moves through the form fields', async ({ page }) => {
    // The email input is auto-focused on load, so tabbing moves forward
    // through password and then the submit button.
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(submitButton).toBeFocused();
  });

  test('form can be submitted with Enter key', async ({ page }) => {
    test.skip(!REAL_FIREBASE, 'Requires real Firebase credentials');

    await page.route('/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            user: {
              id: 'admin-1',
              email: 'admin@example.com',
              full_name: 'Admin Example',
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          meta: { message: 'Login exitoso' },
        },
      });
    });

    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('input[type="password"]').press('Enter');

    await expect(page).toHaveURL('/admin');
  });
});