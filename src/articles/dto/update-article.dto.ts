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
import { ArticleStatus } from './create-article.dto';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de portada no es válida' })
  cover_url?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(ArticleStatus, { message: 'El estado debe ser draft o published' })
  status?: ArticleStatus;
}