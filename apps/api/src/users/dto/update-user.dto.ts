import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez Actualizado',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  full_name?: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    example: UserRole.EDITOR,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser admin o editor' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Estado de la cuenta del usuario',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
