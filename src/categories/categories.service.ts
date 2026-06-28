import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.findAll();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Categoría no encontrada',
        statusCode: 404,
      });
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slugExists = await this.categoriesRepository.existsBySlug(createCategoryDto.slug);

    if (slugExists) {
      throw new BadRequestException({
        error: 'Bad Request',
        message: 'El slug ya existe',
        statusCode: 400,
      });
    }

    return this.categoriesRepository.create(createCategoryDto);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Categoría no encontrada',
        statusCode: 404,
      });
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const slugExists = await this.categoriesRepository.existsBySlug(updateCategoryDto.slug);

      if (slugExists) {
        throw new BadRequestException({
          error: 'Bad Request',
          message: 'El slug ya existe',
          statusCode: 400,
        });
      }
    }

    return this.categoriesRepository.update(id, updateCategoryDto);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Categoría no encontrada',
        statusCode: 404,
      });
    }

    const articleCount = await this.categoriesRepository.countByCategoryId(id);

    if (articleCount > 0) {
      throw new BadRequestException({
        error: 'Bad Request',
        message: 'La categoría tiene artículos asociados',
        statusCode: 400,
      });
    }

    await this.categoriesRepository.delete(id);
  }
}