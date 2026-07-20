import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8080';
  
  // Determinamos la URL base del sitio
  let siteUrl = import.meta.env.PUBLIC_SITE_URL;
  
  if (!siteUrl) {
      // Si no hay variable, intentamos obtenerla del request
      const origin = new URL(request.url).origin;
      // Si el origin es localhost o similar, forzamos la de producción como último recurso
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          siteUrl = 'https://gabrielzavando.cl';
      } else {
          siteUrl = origin;
      }
  }

  // Rutas estáticas clave
  const staticPages = [
    '',
    '/servicios',
    '/metodologia',
    '/diagnostico',
    '/blog',
    '/politica-de-privacidad'
  ];

  let dynamicPosts: any[] = [];

  try {
    // Obtenemos todos los posts (o solo los publicos si el endpoint lo requiere)
    const response = await fetch(`${API_BASE_URL}/blog`);
    if (response.ok) {
        const posts = await response.json();
        // Filtramos solo posts publicados en caso de que vengan mezclados
        dynamicPosts = posts.filter((post: any) => post.published);
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Construccion del Sitemap XML String
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Inyectamos páginas estáticas
  staticPages.forEach((page) => {
    let priority = '0.5';
    if (page === '') priority = '1.0';
    else if (['/servicios', '/metodologia', '/diagnostico'].includes(page)) priority = '0.9';
    else if (page === '/blog') priority = '0.8';

    sitemap += `  <url>\n`;
    sitemap += `    <loc>${siteUrl}${page}</loc>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;
    sitemap += `  </url>\n`;
  });

  // 2. Inyectamos las páginas de Post Dinámicas obtenidas de la API NestJS
  dynamicPosts.forEach((post) => {
    // Definimos qué fecha usar para priorizar, idealmente la mas fresca de update
    let lastModStr = null;

    if (post.updatedAt?._seconds) {
        lastModStr = new Date(post.updatedAt._seconds * 1000).toISOString();
    } else if (post.createdAt?._seconds) {
        lastModStr = new Date(post.createdAt._seconds * 1000).toISOString();
    } else if (post.publishedAt) {
        lastModStr = new Date(post.publishedAt).toISOString();
    }

    sitemap += `  <url>\n`;
    sitemap += `    <loc>${siteUrl}/blog/${post.slug}</loc>\n`;
    if (lastModStr) {
        sitemap += `    <lastmod>${lastModStr}</lastmod>\n`;
    }
    sitemap += `    <changefreq>monthly</changefreq>\n`;
    sitemap += `    <priority>0.6</priority>\n`;
    sitemap += `  </url>\n`;
  });

  sitemap += `</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    }
  });
};
