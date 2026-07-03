import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Tecnología',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Slug URL-friendly para la categoría',
    example: 'tecnologia',
    pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
  })
  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message:
      'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional de la categoría',
    example: 'Artículos sobre tecnología y desarrollo web',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
