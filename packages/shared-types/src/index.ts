// Tipos compartidos entre backend y frontend.
// Este archivo se irá poblando a medida que se definan los tipos de cada entidad.

/**
 * Tiptap v3 JSON document types.
 * Representa la estructura devuelta por el editor Tiptap al serializar
 * un documento de rich-text a JSON.
 */
export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
  [key: string]: unknown;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapJSON {
  type: 'doc';
  content: TiptapNode[];
}

/**
 * Entidad Article - modelo de datos compartido.
 * Corresponde a la colección `articles` en Firestore.
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: TiptapJSON;
  cover_media_id: string | null;
  category_id: string;
  tags: string[] | null;
  status: 'draft' | 'published';
  author_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Entidad Category - modelo de datos compartido.
 * Corresponde a la colección `categories` en Firestore.
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Entidad Media - modelo de datos compartido.
 * Corresponde a la colección `media` en Firestore (biblioteca de imágenes).
 */
export interface Media {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}
