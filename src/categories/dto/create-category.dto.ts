import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
  })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;
}