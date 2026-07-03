import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
  ApiBody,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SetRoles } from '../common/decorators/roles.decorator';
import { Category } from './entities/category.entity';

@ApiTags('Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías',
    schema: {
      example: {
        data: [
          {
            id: 'cat123',
            name: 'Tecnología',
            slug: 'tecnologia',
            description: 'Artículos sobre tecnología',
            created_at: '2026-07-02T00:00:00.000Z',
            updated_at: '2026-07-02T00:00:00.000Z',
          },
          {
            id: 'cat456',
            name: 'Marketing Digital',
            slug: 'marketing-digital',
            description: null,
            created_at: '2026-07-02T00:00:00.000Z',
            updated_at: '2026-07-02T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error del servidor',
    schema: {
      example: {
        error: 'Internal Server Error',
        message: 'Error interno del servidor',
        statusCode: 500,
      },
    },
  })
  async findAll(): Promise<{ data: Category[] }> {
    const categories = await this.categoriesService.findAll();
    return { data: categories };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear categoría (Admin/Editor)' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada',
    schema: {
      example: {
        data: {
          id: 'cat789',
          name: 'Desarrollo Web',
          slug: 'desarrollo-web',
          description: 'Artículos sobre desarrollo web',
          created_at: '2026-07-02T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
        },
        meta: { message: 'Categoría creada exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    schema: {
      example: {
        error: 'Bad Request',
        message: 'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
        statusCode: 400,
      },
    },
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<{ data: Category; meta: { message: string } }> {
    const category = await this.categoriesService.create(createCategoryDto);

    return {
      data: category,
      meta: { message: 'Categoría creada exitosamente' },
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar categoría (Admin/Editor)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 'cat123',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada',
    schema: {
      example: {
        data: {
          id: 'cat123',
          name: 'Tecnología Actualizada',
          slug: 'tecnologia-actualizada',
          description: 'Artículos actualizados sobre tecnología',
          created_at: '2026-07-02T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
        },
        meta: { message: 'Categoría actualizada exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
    schema: {
      example: {
        error: 'Not Found',
        message: 'Categoría no encontrada',
        statusCode: 404,
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ data: Category; meta: { message: string } }> {
    const category = await this.categoriesService.update(id, updateCategoryDto);

    return {
      data: category,
      meta: { message: 'Categoría actualizada exitosamente' },
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar categoría (Solo admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 'cat123',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría eliminada',
    schema: {
      example: {
        meta: { message: 'Categoría eliminada exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
    schema: {
      example: {
        error: 'Not Found',
        message: 'Categoría no encontrada',
        statusCode: 404,
      },
    },
  })
  async remove(
    @Param('id') id: string,
  ): Promise<{ meta: { message: string } }> {
    await this.categoriesService.delete(id);

    return {
      meta: { message: 'Categoría eliminada exitosamente' },
    };
  }
}
