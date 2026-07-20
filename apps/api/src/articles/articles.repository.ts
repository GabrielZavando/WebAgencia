import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ArticleFilters {
  category_id?: string;
  status?: 'draft' | 'published';
}

@Injectable()
export class ArticlesRepository {
  private readonly collectionName = 'articles';

  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll(
    filters: ArticleFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<Article>> {
    const firestore = this.firebaseService.getFirestore();
    let query: any = firestore.collection(this.collectionName);

    if (filters.category_id) {
      query = query.where('category_id', '==', filters.category_id);
    }

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    const offset = (page - 1) * limit;

    const [snapshot, countSnapshot] = await Promise.all([
      query.orderBy('created_at', 'desc').offset(offset).limit(limit).get(),
      query.count().get(),
    ]);

    const total = countSnapshot.data().count;

    const articles: Article[] = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Article[];

    return {
      data: articles,
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<Article | null> {
    const firestore = this.firebaseService.getFirestore();
    const doc = await firestore.collection(this.collectionName).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Article;
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection(this.collectionName)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Article;
  }

  async create(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<Article> {
    const firestore = this.firebaseService.getFirestore();
    const articlesRef = firestore.collection(this.collectionName);

    const now = new Date().toISOString();
    const articleData = {
      title: createArticleDto.title,
      slug: createArticleDto.slug,
      content: createArticleDto.content,
      cover_url: createArticleDto.cover_url,
      category_id: createArticleDto.category_id,
      tags: createArticleDto.tags || null,
      status: createArticleDto.status,
      author_id: authorId,
      created_at: now,
      updated_at: now,
    };

    const newDoc = await articlesRef.add(articleData);

    return {
      id: newDoc.id,
      ...articleData,
    };
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const firestore = this.firebaseService.getFirestore();
    const articleRef = firestore.collection(this.collectionName).doc(id);

    const updateData: Partial<Article> = {
      updated_at: new Date().toISOString(),
    };

    if (updateArticleDto.title !== undefined) {
      updateData.title = updateArticleDto.title;
    }
    if (updateArticleDto.slug !== undefined) {
      updateData.slug = updateArticleDto.slug;
    }
    if (updateArticleDto.content !== undefined) {
      updateData.content = updateArticleDto.content;
    }
    if (updateArticleDto.cover_url !== undefined) {
      updateData.cover_url = updateArticleDto.cover_url;
    }
    if (updateArticleDto.category_id !== undefined) {
      updateData.category_id = updateArticleDto.category_id;
    }
    if (updateArticleDto.tags !== undefined) {
      updateData.tags = updateArticleDto.tags;
    }
    if (updateArticleDto.status !== undefined) {
      updateData.status = updateArticleDto.status;
    }

    await articleRef.update(updateData);

    const updatedDoc = await articleRef.get();

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Article;
  }

  async delete(id: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    await firestore.collection(this.collectionName).doc(id).delete();
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection(this.collectionName)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    return !snapshot.empty;
  }
}
