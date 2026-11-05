import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditorTest from './EditorTest';

function readEditorJson(): { type?: string; content?: unknown[] } {
  const raw = screen.getByTestId('editor-json').textContent ?? '{}';
  return JSON.parse(raw);
}

describe('EditorTest island (Tiptap)', () => {
  it('mounts the editor and exposes a Tiptap document JSON', async () => {
    render(<EditorTest />);

    await waitFor(() => {
      expect(readEditorJson().type).toBe('doc');
    });
    expect(Array.isArray(readEditorJson().content)).toBe(true);
  });

  it('renders the toolbar and the editable area', async () => {
    render(<EditorTest />);

    expect(screen.getByTestId('tiptap-toolbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('tiptap-content')).toBeInTheDocument();
    });
    // The editable area is a contenteditable element
    expect(
      screen.getByTestId('tiptap-content').querySelector('[contenteditable]'),
    ).not.toBeNull();
  });

  it('inserts an image node when a URL is submitted', async () => {
    const url = 'https://storage.example.com/cover.png';
    render(<EditorTest />);

    await waitFor(() => {
      expect(readEditorJson().type).toBe('doc');
    });

    fireEvent.change(screen.getByTestId('image-url-input'), {
      target: { value: url },
    });
    fireEvent.click(screen.getByTestId('image-url-submit'));

    await waitFor(() => {
      const json = JSON.stringify(readEditorJson());
      expect(json).toContain('"type":"image"');
      expect(json).toContain(url);
    });
  });
});
