import { useState } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toolbar } from './tiptap/Toolbar';

type PreviewMode = 'json' | 'html';

/**
 * Checks the URL is a well-formed http(s) URL before inserting it as an
 * image source. Full Firebase Storage uploads arrive in a future change;
 * for now images are referenced by URL only.
 */
function isSafeImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Test page island for the Tiptap rich-text editor (CMS skeleton).
 * Produces the same Tiptap JSON document shape the API stores
 * (`{ type: 'doc', content: [...] }` — see shared/types/tiptap.ts).
 */
export default function EditorTest() {
  const [doc, setDoc] = useState<JSONContent | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('json');
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);

  const editor = useEditor({
    // StarterKit covers document/paragraph/text, headings, lists, quote,
    // code block, and history for the skeleton.
    extensions: [StarterKit, ImageExtension.configure({ allowBase64: false })],
    content: '<p>Bienvenido al editor de prueba. Escribe aquí…</p>',
    // Required for client-side islands: the editor mounts after hydration.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap-content min-h-[240px] w-full rounded-md border border-border bg-surface p-4 text-text focus:outline-none',
        'aria-label': 'Contenido del editor',
      },
    },
    onCreate: ({ editor }) => setDoc(editor.getJSON()),
    onUpdate: ({ editor }) => setDoc(editor.getJSON()),
  });

  const insertImageUrl = () => {
    const url = imageUrl.trim();
    if (!url || !editor) return;
    if (!isSafeImageUrl(url)) {
      setImageError('Ingresa una URL válida (http/https)');
      return;
    }
    setImageError(null);
    // No .focus() here: insertion is programmatic (button click), and avoiding
    // it keeps scrollIntoView out of the transaction (jsdom-safe).
    editor.chain().setImage({ src: url }).run();
    setImageUrl('');
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Editor de texto enriquecido (Tiptap)</CardTitle>
            <Badge variant="secondary">Página de prueba</Badge>
          </div>
          <CardDescription>
            El documento se serializa al mismo formato Tiptap JSON que almacena la
            API. Las imágenes se insertan por URL; la subida a Firebase Storage
            llega en un cambio futuro.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Toolbar editor={editor} />

          <div data-testid="tiptap-content">
            <EditorContent editor={editor} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              data-testid="image-url-input"
              type="url"
              placeholder="https://storage.example.com/imagen.png"
              aria-label="URL de imagen"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setImageError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  insertImageUrl();
                }
              }}
            />
            <Button
              data-testid="image-url-submit"
              type="button"
              variant="outline"
              onClick={insertImageUrl}
              disabled={!editor}
            >
              <ImageIcon aria-hidden="true" />
              Insertar imagen
            </Button>
          </div>
          {imageError && (
            <p role="alert" className="text-sm text-error">
              {imageError}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Documento del editor</CardTitle>
            <div className="flex gap-1" role="group" aria-label="Vista del documento">
              <Button
                type="button"
                size="sm"
                variant={previewMode === 'json' ? 'default' : 'ghost'}
                onClick={() => setPreviewMode('json')}
              >
                JSON
              </Button>
              <Button
                type="button"
                size="sm"
                variant={previewMode === 'html' ? 'default' : 'ghost'}
                onClick={() => setPreviewMode('html')}
              >
                HTML
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {previewMode === 'json' ? (
            <pre
              data-testid="editor-json"
              className="max-h-72 overflow-auto rounded-md bg-surface-secondary p-3 text-xs text-text-secondary"
            >
              {doc ? JSON.stringify(doc) : 'El editor se está inicializando…'}
            </pre>
          ) : (
            <pre
              data-testid="editor-html"
              className="max-h-72 overflow-auto rounded-md bg-surface-secondary p-3 text-xs text-text-secondary"
            >
              {editor ? editor.getHTML() : 'El editor se está inicializando…'}
            </pre>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
