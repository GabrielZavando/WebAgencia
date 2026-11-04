import {
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMediaDto {
  @ApiPropertyOptional({
    description: 'Nombre del archivo',
    example: 'portada-articulo-actualizada.jpg',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El nombre de archivo no puede estar vacío' })
  @MaxLength(255, {
    message: 'El nombre de archivo no puede exceder 255 caracteres',
  })
  filename?: string;

  @ApiPropertyOptional({
    description: 'URL pública del archivo en Firebase Storage',
    example: 'https://firebasestorage.googleapis.com/...',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'La URL no es válida' })
  url?: string;

  @ApiPropertyOptional({
    description: 'Tipo MIME del archivo',
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  mime_type?: string;

  @ApiPropertyOptional({
    description: 'Tamaño del archivo en bytes',
    example: 102400,
  })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'El tamaño debe ser un número positivo' })
  size?: number;
}
