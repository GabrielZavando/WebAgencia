import { IsEmail, IsString, IsEnum, IsBoolean, IsOptional, MinLength } from 'class-validator';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  full_name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser admin o editor' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}