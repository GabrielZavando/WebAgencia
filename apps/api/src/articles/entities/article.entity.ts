import { TiptapJSON } from '../../shared/types/tiptap';

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
