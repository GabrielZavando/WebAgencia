import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  TextQuote,
  Undo2,
  Redo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ToolbarButtonConfig {
  label: string;
  icon: typeof Bold;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

const BUTTONS: ToolbarButtonConfig[][] = [
  [
    {
      label: 'Negrita',
      icon: Bold,
      action: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive('bold'),
    },
    {
      label: 'Itálica',
      icon: Italic,
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive('italic'),
    },
    {
      label: 'Tachado',
      icon: Strikethrough,
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive('strike'),
    },
    {
      label: 'Código inline',
      icon: Code,
      action: (e) => e.chain().focus().toggleCode().run(),
      isActive: (e) => e.isActive('code'),
    },
  ],
  [
    {
      label: 'Encabezado 2',
      icon: Heading2,
      action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive('heading', { level: 2 }),
    },
    {
      label: 'Encabezado 3',
      icon: Heading3,
      action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive('heading', { level: 3 }),
    },
  ],
  [
    {
      label: 'Lista con viñetas',
      icon: List,
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive('bulletList'),
    },
    {
      label: 'Lista numerada',
      icon: ListOrdered,
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive('orderedList'),
    },
    {
      label: 'Cita',
      icon: TextQuote,
      action: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive('blockquote'),
    },
  ],
  [
    {
      label: 'Deshacer',
      icon: Undo2,
      action: (e) => e.chain().focus().undo().run(),
      isActive: () => false,
    },
    {
      label: 'Rehacer',
      icon: Redo2,
      action: (e) => e.chain().focus().redo().run(),
      isActive: () => false,
    },
  ],
];

interface ToolbarProps {
  /** null until the editor mounts (immediatelyRender: false) */
  editor: Editor | null;
}

/**
 * Tiptap toolbar built from shadcn/ui primitives (shadcn-tiptap style).
 * Renders disabled until the editor instance is ready.
 */
export function Toolbar({ editor }: ToolbarProps) {
  return (
    <div
      data-testid="tiptap-toolbar"
      role="toolbar"
      aria-label="Formato del editor"
     className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-surface p-1"
    >
      {BUTTONS.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-1">
          {groupIndex > 0 && <Separator orientation="vertical" className="mx-1 h-6" />}
          {group.map((config) => (
            <Button
              key={config.label}
              type="button"
              variant={editor && config.isActive(editor) ? 'secondary' : 'ghost'}
              size="icon-sm"
              title={config.label}
              aria-label={config.label}
              aria-pressed={editor ? config.isActive(editor) : false}
              disabled={!editor}
              onClick={() => {
                if (editor) config.action(editor);
              }}
            >
              <config.icon aria-hidden="true" />
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
