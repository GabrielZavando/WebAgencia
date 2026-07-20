/**
 * Tiptap v3.27.1 JSON document types.
 *
 * These interfaces represent the structure returned by the Tiptap editor
 * when serializing a rich-text document to JSON.
 *
 * @see https://tiptap.dev/reference/interfaces/TiptapNode
 * @see https://tiptap.dev/reference/interfaces/TiptapJSON
 */

/**
 * A node within a Tiptap document.
 * Can represent text, paragraphs, headings, lists, blockquotes, etc.
 */
export interface TiptapNode {
  /** The node type name (e.g., 'doc', 'paragraph', 'text', 'heading', 'bulletList') */
  type: string;
  /** Optional attributes for the node (e.g., level for headings, size for text) */
  attrs?: Record<string, unknown>;
  /** Child nodes (for container nodes like 'doc', 'paragraph', 'bulletList') */
  content?: TiptapNode[];
  /** Mark modifiers (e.g., bold, italic, code, link) applied to text nodes */
  marks?: TiptapMark[];
  /** Text content (for text nodes) */
  text?: string;
  /** Additional properties for extensibility */
  [key: string]: unknown;
}

/**
 * A mark applied to a text node (e.g., bold, italic, code, link).
 */
export interface TiptapMark {
  /** The mark type name (e.g., 'bold', 'italic', 'code', 'link') */
  type: string;
  /** Optional attributes for the mark (e.g., href for links) */
  attrs?: Record<string, unknown>;
}

/**
 * The root structure of a Tiptap JSON document.
 * Always has type 'doc' and contains an array of top-level nodes.
 */
export interface TiptapJSON {
  /** Always 'doc' for the root document */
  type: 'doc';
  /** Array of top-level content nodes */
  content: TiptapNode[];
}
