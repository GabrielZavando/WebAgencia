import { test, expect } from '@playwright/test';

/**
 * Regression tests for the invisible login button.
 *
 * Root cause: the legacy CSS reset in `src/styles/global.css` was declared
 * without a cascade layer, so it took precedence over Tailwind's
 * `@layer utilities` and neutralised `py-3`, `bg-blue-600`, `rounded-md`,
 * `border-gray-300` and every spacing utility used by the login form.
 */
test.describe('Login form - Tailwind utilities are applied', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('submit button has a visible background color', async ({ page }) => {
    const button = page.locator('button[type="submit"]');
    await expect(button).toBeVisible();

    const background = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    // Tailwind v4 emits the palette in oklch(); the only thing that matters
    // here is that the button is not transparent.
    expect(background).not.toBe('rgba(0, 0, 0, 0)');
    expect(background).toContain('oklch');
  });

  test('submit button has vertical padding and a usable height', async ({ page }) => {
    const button = page.locator('button[type="submit"]');

    const metrics = await button.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        height: el.getBoundingClientRect().height,
        borderRadius: styles.borderRadius,
      };
    });

    expect(metrics.paddingTop).toBe('12px');
    expect(metrics.paddingBottom).toBe('12px');
    expect(metrics.height).toBeGreaterThanOrEqual(40);
    // The admin design language is squared: `--radius: 0rem`.
    expect(metrics.borderRadius).toBe('0px');
  });

  test('login card has padding and a visible border', async ({ page }) => {
    const card = page.locator('button[type="submit"]').locator('xpath=ancestor::div[1]');

    const metrics = await card.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        paddingTop: styles.paddingTop,
        borderTopWidth: styles.borderTopWidth,
        borderTopStyle: styles.borderTopStyle,
      };
    });

    expect(metrics.paddingTop).not.toBe('0px');
    expect(metrics.borderTopWidth).toBe('1px');
    expect(metrics.borderTopStyle).toBe('solid');
  });

  test('login container is centered with flexbox', async ({ page }) => {
    const container = page.locator('[data-testid="login-container"]');

    const styles = await container.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        display: computed.display,
        minHeight: parseFloat(computed.minHeight),
        viewportHeight: window.innerHeight,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems,
      };
    });

    expect(styles.display).toBe('flex');
    expect(styles.justifyContent).toBe('center');
    expect(styles.alignItems).toBe('center');
    // `100vh` is resolved to pixels by getComputedStyle().
    expect(styles.minHeight).toBeGreaterThanOrEqual(styles.viewportHeight);
  });
});
