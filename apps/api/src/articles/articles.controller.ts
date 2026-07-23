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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { SetRoles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '../common/decorators/current-user.decorator';
import { Article } from './entities/article.entity';
import { ArticleStatus } from './dto/create-article.dto';

@ApiTags('Artículos')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Listar artículos publicados' })
  @ApiQuery({
    name: 'category_id',
    required: false,
    type: String,
    description: 'Filtrar por ID de categoría',
    example: 'cat123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ArticleStatus,
    description: 'Filtrar por estado (solo autenticados)',
    example: ArticleStatus.PUBLISHED,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de artículos',
    schema: {
      example: {
        data: [
          {
            id: 'art123',
            title: 'Cómo optimizar tu sitio web para SEO',
            slug: 'como-optimizar-tu-sitio-web-para-seo',
            content: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Contenido del artículo...' },
                  ],
                },
              ],
            },
            cover_url: 'https://ejemplo.com/images/portada.jpg',
            category_id: 'cat123',
            tags: ['seo', 'web', 'performance'],
            status: 'published',
            author_id: 'user123',
            created_at: '2026-07-02T00:00:00.000Z',
            updated_at: '2026-07-02T00:00:00.000Z',
          },
        ],
        meta: { total: 50, page: 1, limit: 10 },
      },
    },
  })
  async findAll(
    @Query() query: QueryArticlesDto,
    @CurrentUser() user: CurrentUserData | null,
  ): Promise<{
    data: Article[];
    meta: { total: number; page: number; limit: number };
  }> {
    const isAuthenticated = !!user;

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
  @ApiOperation({ summary: 'Obtener artículo por ID o slug' })
  @ApiParam({
    name: 'id',
    description: 'ID del artículo o slug',
    example: 'art123',
  })
  @ApiResponse({
    status: 200,
    description: 'Artículo obtenido',
    schema: {
      example: {
        data: {
          id: 'art123',
          title: 'Cómo optimizar tu sitio web para SEO',
          slug: 'como-optimizar-tu-sitio-web-para-seo',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Contenido del artículo...' }],
              },
            ],
          },
          cover_url: 'https://ejemplo.com/images/portada.jpg',
          category_id: 'cat123',
          tags: ['seo', 'web', 'performance'],
          status: 'published',
          author_id: 'user123',
          created_at: '2026-07-02T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Artículo no encontrado',
    schema: {
      example: {
        error: 'Not Found',
        message: 'Artículo no encontrado',
        statusCode: 404,
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<{ data: Article }> {
    const article = await this.articlesService.findByIdOrSlug(id);

    return { data: article };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear artículo (Admin/Editor)' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({
    status: 201,
    description: 'Artículo creado',
    schema: {
      example: {
        data: {
          id: 'art456',
          title: 'Nuevo artículo',
          slug: 'nuevo-articulo',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Contenido...' }],
              },
            ],
          },
          cover_url: 'https://ejemplo.com/images/nueva-portada.jpg',
          category_id: 'cat123',
          tags: ['nuevo'],
          status: 'draft',
          author_id: 'user123',
          created_at: '2026-07-02T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
        },
        meta: { message: 'Artículo creado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    schema: {
      example: {
        error: 'Bad Request',
        message: 'El título debe tener al menos 5 caracteres',
        statusCode: 400,
      },
    },
  })
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ data: Article; meta: { message: string } }> {
    const article = await this.articlesService.create(
      createArticleDto,
      user.userId,
    );

    return {
      data: article,
      meta: { message: 'Artículo creado exitosamente' },
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar artículo (Admin/Editor)' })
  @ApiParam({
    name: 'id',
    description: 'ID del artículo',
    example: 'art123',
  })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({
    status: 200,
    description: 'Artículo actualizado',
    schema: {
      example: {
        data: {
          id: 'art123',
          title: 'Artículo Actualizado',
          slug: 'articulo-actualizado',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Contenido actualizado...' }],
              },
            ],
          },
          cover_url: 'https://ejemplo.com/images/portada-actualizada.jpg',
          category_id: 'cat123',
          tags: ['actualizado', 'seo'],
          status: 'published',
          author_id: 'user123',
          created_at: '2026-07-02T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
        },
        meta: { message: 'Artículo actualizado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Artículo no encontrado',
    schema: {
      example: {
        error: 'Not Found',
        message: 'Artículo no encontrado',
        statusCode: 404,
      },
    },
  })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar artículo (Solo admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID del artículo',
    example: 'art123',
  })
  @ApiResponse({
    status: 200,
    description: 'Artículo eliminado',
    schema: {
      example: {
        meta: { message: 'Artículo eliminado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Artículo no encontrado',
    schema: {
      example: {
        error: 'Not Found',
        message: 'Artículo no encontrado',
        statusCode: 404,
      },
    },
  })
  async remove(
    @Param('id') id: string,
  ): Promise<{ meta: { message: string } }> {
    await this.articlesService.delete(id);

    return {
      meta: { message: 'Artículo eliminado exitosamente' },
    };
  }
}
