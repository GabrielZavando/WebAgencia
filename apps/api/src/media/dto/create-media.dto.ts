import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsInt,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({
    description: 'Nombre del archivo',
    example: 'portada-articulo.jpg',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de archivo es requerido' })
  @MinLength(1, { message: 'El nombre de archivo no puede estar vacío' })
  @MaxLength(255, {
    message: 'El nombre de archivo no puede exceder 255 caracteres',
  })
  filename: string;

  @ApiProperty({
    description: 'URL pública del archivo en Firebase Storage',
    example: 'https://firebasestorage.googleapis.com/...',
  })
  @IsString()
  @IsNotEmpty({ message: 'La URL es requerida' })
  @IsUrl({}, { message: 'La URL no es válida' })
  url: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty({ message: 'El tipo MIME es requerido' })
  mime_type: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 102400,
  })
  @IsInt()
  @Min(0, { message: 'El tamaño debe ser un número positivo' })
  size: number;

  @ApiProperty({
    description: 'UID del usuario que subió el archivo',
    example: 'uid_abc123',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  uploaded_by: string;
}
