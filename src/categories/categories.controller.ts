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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SetRoles } from '../common/decorators/roles.decorator';
import { Category } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(): Promise<{ data: Category[] }> {
    const categories = await this.categoriesService.findAll();
    return { data: categories };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @SetRoles('admin', 'editor')
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
  async remove(@Param('id') id: string): Promise<{ meta: { message: string } }> {
    await this.categoriesService.delete(id);

    return {
      meta: { message: 'Categoría eliminada exitosamente' },
    };
  }
}