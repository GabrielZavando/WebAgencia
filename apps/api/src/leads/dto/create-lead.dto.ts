import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Nombre del contacto',
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Email de contacto',
    example: 'juan@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Mensaje de contacto',
    example: 'Me interesa saber más sobre sus servicios',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
  message: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto (opcional)',
    example: '+54 11 1234-5678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Asunto del mensaje (opcional)',
    example: 'Consulta sobre servicios',
  })
  @IsOptional()
  @IsString()
  subject?: string;
}
