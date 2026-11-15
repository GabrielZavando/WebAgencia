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

/**
 * Reads a single value from the admin `.env`.
 */
function readEnvValue(key: string): string | undefined {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return undefined;

  const values = Object.fromEntries(
    readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const [k, ...rest] = line.split('=');
        return [k.trim(), rest.join('=').trim()];
      }),
  );

  return values[key];
}

const REAL_FIREBASE = hasRealFirebaseCredentials();
const ADMIN_EMAIL = readEnvValue('ADMIN_E2E_EMAIL');
const ADMIN_PASSWORD = readEnvValue('ADMIN_E2E_PASSWORD');
const HAS_ADMIN_CREDENTIALS = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

/**
 * The API runs on its own origin (PUBLIC_API_URL), so the mock must match any
 * host. A path-only pattern would be resolved against the Playwright baseURL
 * and would never intercept the real request.
 */
const LOGIN_API_ROUTE = '**/api/v1/auth/login';

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
    test.skip(!HAS_ADMIN_CREDENTIALS, 'Requires admin credentials in apps/admin/.env');

    await page.route(LOGIN_API_ROUTE, async (route) => {
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

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL ?? '');
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD ?? '');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/admin');
  });

  test('shows error message for invalid credentials', async ({ page }) => {
    test.skip(!HAS_ADMIN_CREDENTIALS, 'Requires admin credentials in apps/admin/.env');

    // Firebase rejects the credentials before the API is called, so no session
    // is created and the login page stays visible with the error message.
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL ?? '');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.form-error')).toBeVisible();
    await expect(page.locator('.form-error')).toContainText('Credenciales inválidas');
  });

  test('rate limit disables button', async ({ page }) => {
    test.skip(!HAS_ADMIN_CREDENTIALS, 'Requires admin credentials in apps/admin/.env');

    // The rate limit must be simulated on the Firebase sign-in: a successful
    // sign-in creates a session and AuthGuard redirects to /admin before the
    // API response can be rendered.
    await page.route('**/accounts:signInWithPassword*', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: {
            code: 429,
            message: 'TOO_MANY_ATTEMPTS_TRY_LATER',
            errors: [{ message: 'TOO_MANY_ATTEMPTS_TRY_LATER' }],
          },
        }),
      });
    });

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL ?? '');
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD ?? '');
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
    test.skip(!HAS_ADMIN_CREDENTIALS, 'Requires admin credentials in apps/admin/.env');

    await page.route(LOGIN_API_ROUTE, async (route) => {
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

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL ?? '');
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD ?? '');
    await page.locator('input[type="password"]').press('Enter');

    await expect(page).toHaveURL('/admin');
  });
});