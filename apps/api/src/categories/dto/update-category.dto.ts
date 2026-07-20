import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Nombre de la categoría',
    example: 'Tecnología Actualizada',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Slug URL-friendly para la categoría',
    example: 'tecnologia-actualizada',
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
    description: 'Descripción de la categoría',
    example: 'Artículos actualizados sobre tecnología y desarrollo web',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
