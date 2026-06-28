import { IsEmail, IsString, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MinLength(1)
  full_name: string;

  @IsEnum(UserRole, { message: 'El rol debe ser admin o editor' })
  role: UserRole;
}