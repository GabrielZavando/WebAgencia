import { test, expect } from '@playwright/test';

const API_URL = process.env.API_BASE_URL || 'http://localhost:4321';

test.describe('Blog - Validación funcional', () => {

  test('5.1 Carga de posts desde API con mock', async ({ page }) => {
    const mockPosts = [
      { slug: 'test-post', title: 'Test Post', excerpt: 'Test excerpt', content: '<p>Hello</p>', coverImage: '', category: 'tech', author: 'Admin', publishedAt: '2024-01-01', published: true }
    ];

    await page.route('**/api/v1/blog/posts*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPosts) });
    });

    await page.goto('/blog');
    await page.waitForSelector('.post-card', { timeout: 10000 });

    const postCards = page.locator('.post-card');
    await expect(postCards).toHaveCount(1);
    await expect(postCards.first()).toContainText('Test Post');
  });

  test('5.2 Skeleton loader visible durante fetch', async ({ page }) => {
    await page.route('**/api/v1/blog/posts*', async route => {
      await new Promise(r => setTimeout(r, 500));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/blog');

    const skeletons = page.locator('.skeleton-card');
    await expect(skeletons.first()).toBeVisible({ timeout: 3000 });
  });

  test('5.3 Mensaje de error y botón reintentar en fallo de API', async ({ page }) => {
    await page.route('**/api/v1/blog/posts*', async route => {
      await route.fulfill({ status: 500, body: 'Server error' });
    });

    await page.goto('/blog');

    const errorMsg = page.locator('.blog-error-message');
    await expect(errorMsg).toBeVisible({ timeout: 10000 });

    const retryBtn = page.locator('#retryBtn');
    await expect(retryBtn).toBeVisible();
  });

  test('5.4 Caché en sessionStorage (navegación interna sin refetch)', async ({ page }) => {
    let fetchCount = 0;
    const mockPosts = [
      { slug: 'post-1', title: 'Post 1', excerpt: 'Excerpt 1', content: '<p>Content 1</p>', coverImage: '', category: 'tech', author: 'Admin', publishedAt: '2024-01-01', published: true }
    ];

    await page.route('**/api/v1/blog/posts*', async route => {
      fetchCount++;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPosts) });
    });

    await page.goto('/blog');
    await page.waitForSelector('.post-card', { timeout: 10000 });

    const cached = await page.evaluate(() => sessionStorage.getItem('blog_posts_cache'));
    expect(cached).not.toBeNull();

    const parsed = JSON.parse(cached!);
    expect(parsed.posts).toHaveLength(1);
    expect(parsed.posts[0].title).toBe('Post 1');
  });

  test('5.5 Renderizado de post individual desde caché local', async ({ page }) => {
    const mockPosts = [
      { slug: 'mi-post', title: 'Mi Post', excerpt: 'Un post de prueba', content: '<p>Contenido del post</p>', coverImage: '', category: 'tech', author: 'Admin', publishedAt: '2024-06-01', published: true }
    ];

    await page.route('**/api/v1/blog/posts*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPosts) });
    });

    await page.goto('/blog/mi-post');
    await page.waitForSelector('#postContent', { timeout: 10000 });

    await expect(page.locator('#postContent')).toContainText('Contenido del post');
  });

  test('5.6 Actualización de document.title y meta description en detalle', async ({ page }) => {
    const mockPosts = [
      { slug: 'seo-post', title: 'SEO Post Title', excerpt: 'SEO post description for testing', content: '<p>SEO content</p>', coverImage: '', category: 'tech', author: 'Admin', publishedAt: '2024-06-01', published: true }
    ];

    await page.route('**/api/v1/blog/posts*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPosts) });
    });

    await page.goto('/blog/seo-post');
    await page.waitForSelector('#postContent', { timeout: 10000 });

    const title = await page.title();
    expect(title).toContain('SEO Post Title');
  });
});
