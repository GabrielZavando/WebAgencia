import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from './create-article.dto';
import { TiptapJSON } from '../../shared/types/tiptap';
import {
  IsTiptapDocument,
  IsWithinMaxSize,
} from '../../common/validators/tiptap.validator';

export class UpdateArticleDto {
  @ApiPropertyOptional({
    description: 'Título del artículo',
    example: 'Cómo optimizar tu sitio web para SEO - Actualizado',
    minLength: 5,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Slug URL-friendly para el artículo',
    example: 'como-optimizar-tu-sitio-web-para-seo-actualizado',
    pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message:
      'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Contenido del artículo en formato Tiptap JSON',
    example: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Contenido actualizado...' }],
        },
      ],
    },
  })
  @IsOptional()
  @IsTiptapDocument({
    message: 'El contenido debe ser un documento Tiptap válido',
  })
  @IsWithinMaxSize({ message: 'El contenido no puede superar los 5 MB' })
  content?: TiptapJSON;

  @ApiPropertyOptional({
    description: 'URL de la imagen de portada',
    example: 'https://ejemplo.com/images/portada-actualizada.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de portada no es válida' })
  cover_url?: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría del artículo',
    example: 'cat_789012',
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Etiquetas para el artículo',
    example: ['seo', 'web', 'performance', 'actualizado'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Estado del artículo',
    enum: ArticleStatus,
    example: ArticleStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(ArticleStatus, { message: 'El estado debe ser draft o published' })
  status?: ArticleStatus;
}
