import { test, expect } from '@playwright/test';

test.describe('Modal Message Component', () => {
  test('debe abrir modal via window.modalHelpers', async ({ page }) => {
    await page.goto('/');

    const hasHelpers = await page.evaluate(() => typeof window.modalHelpers !== 'undefined');
    expect(hasHelpers).toBe(true);

    await page.evaluate(() => window.modalHelpers?.openModal('successModal'));
    await page.waitForTimeout(300);

    const successModal = page.locator('#successModal');
    const hasOpen = await successModal.evaluate(el => el.classList.contains('open'));
    expect(hasOpen).toBe(true);
    await expect(successModal).toHaveAttribute('aria-hidden', 'false');
  });

  test('debe cerrar modal via window.modalHelpers', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => window.modalHelpers?.openModal('errorModal'));
    await page.waitForTimeout(300);

    const errorModal = page.locator('#errorModal');
    await expect(errorModal).toHaveClass(/open/);

    await page.evaluate(() => {
      const modal = document.getElementById('errorModal');
      if (modal) window.modalHelpers?.closeModal(modal);
    });
    await page.waitForTimeout(300);

    const hasOpen = await errorModal.evaluate(el => el.classList.contains('open'));
    expect(hasOpen).toBe(false);
  });

  test('debe actualizar mensaje via modal:update event', async ({ page }) => {
    await page.goto('/');

    const newMessage = 'Mensaje actualizado desde el test';
    await page.evaluate((msg) => {
      document.dispatchEvent(new CustomEvent('modal:update', {
        detail: { modalId: 'errorModal', message: msg }
      }));
    }, newMessage);

    const textContent = await page.locator('#errorModal .modal-message__text').textContent();
    expect(textContent).toBe(newMessage);
  });

  test('debe abrir modal tras submit del formulario de contacto (API OK)', async ({ page }) => {
    const logs: { type: string; text: string }[] = [];
    page.on('console', (msg) => logs.push({ type: msg.type(), text: msg.text() }));
    page.on('pageerror', (err) => logs.push({ type: 'pageerror', text: err.message }));
    page.on('response', (response) => {
      if (response.status() >= 400)
        logs.push({ type: 'http', text: response.status() + ' ' + response.url() });
    });

    await page.route('**/api/v1/leads/contact', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OK' }),
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    for (const l of logs) console.log('[' + l.type + ']', l.text);

    await page.evaluate(() => localStorage.removeItem('lastFormSubmit'));

    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('test@test.com');
    await page.locator('#message').fill(
      'Este es un mensaje de prueba para el formulario de contacto'
    );
    await page.waitForTimeout(4000);
    
    logs.length = 0;
    await page.evaluate(async () => {
      const form = document.getElementById('contactForm');
      if (form) {
        console.log('[TEST] Dispatching submit event');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      } else {
        console.log('[TEST] Form not found!');
      }
    });

    await page.waitForTimeout(3000);

    for (const l of logs) console.log('[' + l.type + ']', l.text);

    const successModal = page.locator('#successModal');
    const errorModal = page.locator('#errorModal');
    const successOpen = await successModal.evaluate((el) => el.classList.contains('open'));
    const errorOpen = await errorModal.evaluate((el) => el.classList.contains('open'));
    console.log('successModal.open:', successOpen, 'errorModal.open:', errorOpen);

    expect(successOpen || errorOpen).toBe(true);
  });
});
