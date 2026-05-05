import { test, expect } from '@playwright/test';

test.describe('Resilience Tests @e2e', () => {
  test('debe mostrar error cuando la API falla (500)', async ({ page }) => {
    // Interceptar la llamada al formulario de contacto
    await page.route('**/forms/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Error interno del servidor' }),
      });
    });

    await page.goto('/metodologia'); // Asumiendo que hay un formulario aquí o en otra página
    
    // Si hay un formulario de contacto en esta página, intentamos enviarlo
    // Esto es un ejemplo genérico, ajusta los selectores a tu realidad
    const nameInput = page.locator('input[name="nombre"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
      await page.locator('input[name="email"]').fill('test@example.com');
      await page.locator('textarea[name="mensaje"]').fill('Mensaje de prueba para error 500');
      
      await page.locator('button[type="submit"]').click();

      // Verificar que aparezca un mensaje de error amigable
      // Ajusta el selector al mensaje de error de tu UI
      await expect(page.locator('text=Algo salió mal')).toBeVisible();
    }
  });

  test('debe manejar estado offline', async ({ page, context }) => {
    await page.goto('/');
    
    // Simular pérdida de conexión
    await context.setOffline(true);
    
    // Intentar alguna acción o simplemente verificar que la UI reacciona si tienes lógica offline
    // Ejemplo: recargar la página debería mostrar un error o estado offline si usas Service Workers
    await page.reload().catch(() => {}); 
    
    // Aquí podrías verificar un banner de "Sin conexión" si lo tienes implementado
  });
});
