import { describe, it, expect } from 'vitest';
import {
  slugifyTitle,
  extractPlainTextFromTiptap,
  buildExcerpt,
  renderTiptapToHtml,
} from './tiptap';
import type { TiptapJSON } from '@webastro/shared-types';

const doc: TiptapJSON = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Título de prueba' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Texto con ' },
        { type: 'text', text: 'negrita', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' y ' },
        { type: 'text', text: 'cursiva', marks: [{ type: 'italic' }] },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Elemento uno' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Elemento dos' }],
            },
          ],
        },
      ],
    },
  ],
};

describe('slugifyTitle', () => {
  it('normalizes accents, case and separators', () => {
    expect(slugifyTitle('¡Cómo Optimizar tu Sitio Web!')).toBe(
      'como-optimizar-tu-sitio-web',
    );
  });

  it('collapses spaces and trims hyphens', () => {
    expect(slugifyTitle('  Diseño   Web 2026  ')).toBe('diseno-web-2026');
  });

  it('returns an empty string for titles without alphanumeric characters', () => {
    expect(slugifyTitle('¡!¿?')).toBe('');
  });
});

describe('extractPlainTextFromTiptap', () => {
  it('extracts text from nested nodes', () => {
    expect(extractPlainTextFromTiptap(doc)).toBe(
      'Título de prueba Texto con negrita y cursiva Elemento uno Elemento dos',
    );
  });

  it('returns an empty string for empty or missing documents', () => {
    expect(extractPlainTextFromTiptap(null)).toBe('');
    expect(extractPlainTextFromTiptap({ type: 'doc', content: [] })).toBe('');
  });
});

describe('buildExcerpt', () => {
  it('returns the plain text when it fits', () => {
    expect(buildExcerpt(doc, 200)).toContain('Título de prueba');
    expect(buildExcerpt(doc, 200)).not.toContain('...');
  });

  it('truncates and appends an ellipsis when it exceeds the limit', () => {
    const excerpt = buildExcerpt(doc, 20);
    expect(excerpt).toBe('Título de prueba Tex...');
  });
});

describe('renderTiptapToHtml', () => {
  it('renders allowed nodes and marks as semantic HTML', () => {
    const html = renderTiptapToHtml(doc);

    expect(html).toContain('<h2>Título de prueba</h2>');
    expect(html).toContain(
      '<p>Texto con <strong>negrita</strong> y <em>cursiva</em></p>',
    );
    expect(html).toContain('<ul>');
    expect(html).toContain('<li><p>Elemento uno</p></li>');
    expect(html).not.toContain('<script');
  });

  it('escapes text content', () => {
    const html = renderTiptapToHtml({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '<script>alert(1)</script>' }],
        },
      ],
    });

    expect(html).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });

  it('allows only http(s) image sources', () => {
    const html = renderTiptapToHtml({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: { src: 'javascript:alert(1)', alt: 'Mala' },
        },
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/imagen.png',
            alt: 'Buena',
            title: 'Portada',
          },
        },
      ],
    });

    expect(html).not.toContain('javascript:');
    expect(html).toContain(
      '<img src="https://example.com/imagen.png" alt="Buena" title="Portada" loading="lazy" />',
    );
  });

  it('ignores javascript links', () => {
    const html = renderTiptapToHtml({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Enlace',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
      ],
    });

    expect(html).not.toContain('javascript:');
    expect(html).toBe('<p>Enlace</p>');
  });

  it('renders hard breaks and code blocks', () => {
    const html = renderTiptapToHtml({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Línea uno' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Línea dos' },
          ],
        },
        {
          type: 'codeBlock',
          content: [{ type: 'text', text: 'const x = 1;' }],
        },
      ],
    });

    expect(html).toContain('Línea uno<br />Línea dos');
    expect(html).toContain('<pre><code>const x = 1;</code></pre>');
  });
});
