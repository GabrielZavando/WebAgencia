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
  ArrayMinSize,
} from 'class-validator';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
  })
  slug: string;

  @IsString()
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;

  @IsUrl({}, { message: 'La URL de portada no es válida' })
  @IsNotEmpty({ message: 'La URL de portada es requerida' })
  cover_url: string;

  @IsString()
  @IsNotEmpty({ message: 'La categoría es requerida' })
  category_id: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsEnum(ArticleStatus, { message: 'El estado debe ser draft o published' })
  status: ArticleStatus;
}