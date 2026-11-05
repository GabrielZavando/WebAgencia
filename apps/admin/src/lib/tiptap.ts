import type { TiptapJSON, TiptapMark, TiptapNode } from '@webastro/shared-types';

const BLOCK_NODES = new Set([
  'doc',
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'codeBlock',
]);

const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Genera un slug URL-friendly a partir del título del artículo.
 * Mantiene el mismo contrato que valida el backend: minúsculas, números
 * y guiones simples.
 */
export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isBlockNode(node: TiptapNode): boolean {
  return BLOCK_NODES.has(node.type);
}

function collectPlainText(node: TiptapNode): string {
  if (node.type === 'text') {
    return node.text ?? '';
  }

  if (node.type === 'hardBreak') {
    return ' ';
  }

  const children = node.content ?? [];
  const separator = isBlockNode(node) ? ' ' : '';

  return children
    .map((child) => collectPlainText(child))
    .filter((part) => part.length > 0)
    .join(separator);
}

/**
 * Extrae el texto plano de un documento Tiptap para generar extractos
 * y metadatos sin depender de un campo `excerpt` en el modelo.
 */
export function extractPlainTextFromTiptap(doc: TiptapJSON | null): string {
  if (!doc) {
    return '';
  }

  return collectPlainText({ type: doc.type, content: doc.content })
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildExcerpt(
  doc: TiptapJSON | null,
  maxLength = 160,
): string {
  const text = extractPlainTextFromTiptap(doc);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function isSafeUrl(value: string | null): value is string {
  if (!value) {
    return false;
  }

  try {
    return SAFE_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

function renderMark(mark: TiptapMark, content: string): string {
  switch (mark.type) {
    case 'bold':
      return `<strong>${content}</strong>`;
    case 'italic':
      return `<em>${content}</em>`;
    case 'strike':
      return `<s>${content}</s>`;
    case 'code':
      return `<code>${content}</code>`;
    case 'link': {
      const href = asString(mark.attrs?.href);
      if (!isSafeUrl(href)) {
        return content;
      }
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${content}</a>`;
    }
    default:
      return content;
  }
}

function renderTextNode(node: TiptapNode): string {
  const content = escapeHtml(node.text ?? '');
  return (node.marks ?? []).reduce(
    (result, mark) => renderMark(mark, result),
    content,
  );
}

function renderChildren(node: TiptapNode): string {
  return (node.content ?? []).map((child) => renderNode(child)).join('');
}

function renderNode(node: TiptapNode): string {
  switch (node.type) {
    case 'text':
      return renderTextNode(node);
    case 'hardBreak':
      return '<br />';
    case 'paragraph':
      return `<p>${renderChildren(node)}</p>`;
    case 'heading': {
      const rawLevel = Number(node.attrs?.level);
      const level = Number.isInteger(rawLevel)
        ? Math.min(Math.max(rawLevel, 1), 6)
        : 2;
      return `<h${level}>${renderChildren(node)}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${renderChildren(node)}</ul>`;
    case 'orderedList':
      return `<ol>${renderChildren(node)}</ol>`;
    case 'listItem':
      return `<li>${renderChildren(node)}</li>`;
    case 'blockquote':
      return `<blockquote>${renderChildren(node)}</blockquote>`;
    case 'codeBlock': {
      const code = escapeHtml(
        (node.content ?? []).map((child) => child.text ?? '').join(''),
      );
      return `<pre><code>${code}</code></pre>`;
    }
    case 'image': {
      const src = asString(node.attrs?.src);
      if (!isSafeUrl(src)) {
        return '';
      }
      const alt = asString(node.attrs?.alt) ?? '';
      const title = asString(node.attrs?.title);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} loading="lazy" />`;
    }
    default:
      return renderChildren(node);
  }
}

/**
 * Renderiza un documento Tiptap a HTML seguro usando listas blancas de
 * nodos, marcas y atributos. Todo texto y atributo se escapa antes de
 * serializarse.
 */
export function renderTiptapToHtml(doc: TiptapJSON | null): string {
  if (!doc) {
    return '';
  }

  return (doc.content ?? []).map((node) => renderNode(node)).join('');
}
