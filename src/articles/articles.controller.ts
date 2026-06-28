import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SetRoles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Article } from './entities/article.entity';
import { ArticleStatus } from './dto/create-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async findAll(
    @Query() query: QueryArticlesDto,
    @Req() request: Request,
  ): Promise<{ data: Article[]; meta: { total: number; page: number; limit: number } }> {
    const authHeader = request.headers.authorization;
    const isAuthenticated = !!authHeader && authHeader.startsWith('Bearer ');

    const filters: { category_id?: string; status?: ArticleStatus } = {};

    if (query.category_id) {
      filters.category_id = query.category_id;
    }

    if (isAuthenticated) {
      filters.status = query.status || ArticleStatus.PUBLISHED;
    } else {
      filters.status = ArticleStatus.PUBLISHED;
    }

    const result = await this.articlesService.findAll(
      filters,
      query.page || 1,
      query.limit || 10,
    );

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<{ data: Article }> {
    const article = await this.articlesService.findByIdOrSlug(id);

    return { data: article };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin', 'editor')
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ data: Article; meta: { message: string } }> {
    const article = await this.articlesService.create(createArticleDto, user.userId);

    return {
      data: article,
      meta: { message: 'Artículo creado exitosamente' },
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin', 'editor')
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<{ data: Article; meta: { message: string } }> {
    const article = await this.articlesService.update(id, updateArticleDto);

    return {
      data: article,
      meta: { message: 'Artículo actualizado exitosamente' },
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ meta: { message: string } }> {
    await this.articlesService.delete(id);

    return {
      meta: { message: 'Artículo eliminado exitosamente' },
    };
  }
}