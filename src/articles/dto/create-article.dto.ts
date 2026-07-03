import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TiptapJSON } from '../../shared/types/tiptap';
import {
  IsTiptapDocument,
  IsWithinMaxSize,
} from '../../common/validators/tiptap.validator';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export class CreateArticleDto {
  @ApiProperty({
    description: 'Título del artículo',
    example: 'Cómo optimizar tu sitio web para SEO',
    minLength: 5,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  title!: string;

  @ApiProperty({
    description: 'Slug URL-friendly para el artículo',
    example: 'como-optimizar-tu-sitio-web-para-seo',
    pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
  })
  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message:
      'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
  })
  slug!: string;

  @ApiProperty({
    description: 'Contenido del artículo en formato Tiptap JSON',
    example: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Contenido del artículo...' }],
        },
      ],
    },
  })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  @IsTiptapDocument({
    message: 'El contenido debe ser un documento Tiptap válido',
  })
  @IsWithinMaxSize({ message: 'El contenido no puede superar los 5 MB' })
  content!: TiptapJSON;

  @ApiProperty({
    description: 'URL de la imagen de portada',
    example: 'https://ejemplo.com/images/portada.jpg',
  })
  @IsUrl({}, { message: 'La URL de portada no es válida' })
  @IsNotEmpty({ message: 'La URL de portada es requerida' })
  cover_url!: string;

  @ApiProperty({
    description: 'ID de la categoría del artículo',
    example: 'cat_123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'La categoría es requerida' })
  category_id!: string;

  @ApiPropertyOptional({
    description: 'Etiquetas para el artículo',
    example: ['seo', 'web', 'performance'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Estado del artículo',
    enum: ArticleStatus,
    example: ArticleStatus.PUBLISHED,
  })
  @IsEnum(ArticleStatus, { message: 'El estado debe ser draft o published' })
  status!: ArticleStatus;
}
