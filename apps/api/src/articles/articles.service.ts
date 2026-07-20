import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ArticlesRepository,
  PaginationResult,
  ArticleFilters,
} from './articles.repository';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  async findAll(
    filters: ArticleFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<Article>> {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), 100);

    return this.articlesRepository.findAll(
      filters,
      sanitizedPage,
      sanitizedLimit,
    );
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Article> {
    let article = await this.articlesRepository.findById(idOrSlug);

    if (!article) {
      article = await this.articlesRepository.findBySlug(idOrSlug);
    }

    if (!article) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Artículo no encontrado',
        statusCode: 404,
      });
    }

    return article;
  }

  async create(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<Article> {
    const slugExists = await this.articlesRepository.existsBySlug(
      createArticleDto.slug,
    );

    if (slugExists) {
      throw new BadRequestException({
        error: 'Conflict',
        message: 'El slug ya está en uso',
        statusCode: 409,
      });
    }

    return this.articlesRepository.create(createArticleDto, authorId);
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.articlesRepository.findById(id);

    if (!article) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Artículo no encontrado',
        statusCode: 404,
      });
    }

    if (updateArticleDto.slug && updateArticleDto.slug !== article.slug) {
      const slugExists = await this.articlesRepository.existsBySlug(
        updateArticleDto.slug,
      );

      if (slugExists) {
        throw new BadRequestException({
          error: 'Conflict',
          message: 'El slug ya está en uso',
          statusCode: 409,
        });
      }
    }

    return this.articlesRepository.update(id, updateArticleDto);
  }

  async delete(id: string): Promise<void> {
    const article = await this.articlesRepository.findById(id);

    if (!article) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Artículo no encontrado',
        statusCode: 404,
      });
    }

    await this.articlesRepository.delete(id);
  }
}
