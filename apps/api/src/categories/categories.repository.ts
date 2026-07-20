import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  private readonly collectionName = 'categories';

  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll(): Promise<Category[]> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection(this.collectionName)
      .orderBy('created_at', 'desc')
      .get();

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  }

  async findById(id: string): Promise<Category | null> {
    const firestore = this.firebaseService.getFirestore();
    const doc = await firestore.collection(this.collectionName).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
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
    } as Category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const firestore = this.firebaseService.getFirestore();
    const categoriesRef = firestore.collection(this.collectionName);

    const now = new Date().toISOString();
    const categoryData = {
      name: createCategoryDto.name,
      slug: createCategoryDto.slug,
      description: createCategoryDto.description || null,
      created_at: now,
      updated_at: now,
    };

    const newDoc = await categoriesRef.add(categoryData);

    return {
      id: newDoc.id,
      ...categoryData,
    };
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const firestore = this.firebaseService.getFirestore();
    const categoryRef = firestore.collection(this.collectionName).doc(id);

    const updateData: Partial<Category> = {
      updated_at: new Date().toISOString(),
    };

    if (updateCategoryDto.name !== undefined) {
      updateData.name = updateCategoryDto.name;
    }
    if (updateCategoryDto.slug !== undefined) {
      updateData.slug = updateCategoryDto.slug;
    }
    if (updateCategoryDto.description !== undefined) {
      updateData.description = updateCategoryDto.description;
    }

    await categoryRef.update(updateData);

    const updatedDoc = await categoryRef.get();

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Category;
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

  async countByCategoryId(categoryId: string): Promise<number> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('articles')
      .where('category_id', '==', categoryId)
      .count()
      .get();

    return snapshot.data().count;
  }
}
