import { apiClient } from '../lib/api-client';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  publishedAt: string;
  published: boolean;
}

const STORAGE_KEY = 'blog_posts_cache';

interface CacheEntry {
  timestamp: number;
  posts: BlogPost[];
}

function getCache(): BlogPost[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > 5 * 60 * 1000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return entry.posts;
  } catch {
    return null;
  }
}

function setCache(posts: BlogPost[]) {
  try {
    const entry: CacheEntry = { timestamp: Date.now(), posts };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage no disponible
  }
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const cached = getCache();
  if (cached) return cached;

  const posts = await apiClient.get<BlogPost[]>('/api/v1/blog/posts?status=published');
  setCache(posts);
  return posts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchBlogPosts();
  return posts.find(p => p.slug === slug) || null;
}
