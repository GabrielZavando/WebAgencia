import { Injectable, Logger } from '@nestjs/common';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);
  private readonly collectionName = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<User>> {
    const firestore = this.firebaseService.getFirestore();
    const usersRef = firestore.collection(this.collectionName);

    const offset = (page - 1) * limit;

    const [snapshot, countSnapshot] = await Promise.all([
      usersRef.orderBy('created_at', 'desc').offset(offset).limit(limit).get(),
      usersRef.count().get(),
    ]);

    const total = countSnapshot.data().count;

    const users: User[] = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
      }),
    ) as User[];

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<User | null> {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore
      .collection(this.collectionName)
      .doc(id)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const firestore = this.firebaseService.getFirestore();
    const usersRef = firestore.collection(this.collectionName);

    const now = new Date().toISOString();
    const userData = {
      email: createUserDto.email,
      full_name: createUserDto.full_name,
      role: createUserDto.role,
      avatar_url: null,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    const newUserDoc = await usersRef.add(userData);

    return {
      id: newUserDoc.id,
      ...userData,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const firestore = this.firebaseService.getFirestore();
    const userRef = firestore.collection(this.collectionName).doc(id);

    const updateData: Partial<User> = {
      updated_at: new Date().toISOString(),
    };

    if (updateUserDto.full_name !== undefined) {
      updateData.full_name = updateUserDto.full_name;
    }
    if (updateUserDto.role !== undefined) {
      updateData.role = updateUserDto.role;
    }
    if (updateUserDto.is_active !== undefined) {
      updateData.is_active = updateUserDto.is_active;
    }

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as User;
  }

  async delete(id: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    await firestore.collection(this.collectionName).doc(id).delete();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection(this.collectionName)
      .where('email', '==', email)
      .limit(1)
      .get();

    return !snapshot.empty;
  }
}
