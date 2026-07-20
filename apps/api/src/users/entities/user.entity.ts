export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor';
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
