import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import {
  CurrentUser,
  CurrentUserData,
} from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

interface LoginResponseData {
  user: User;
}

interface LoginResponse {
  data: LoginResponseData;
  meta: { message: string };
}

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con Firebase ID token' })
  @ApiBody({
    description: 'Firebase ID token para autenticación',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    schema: {
      example: {
        data: {
          user: {
            id: 'user123',
            email: 'usuario@ejemplo.com',
            full_name: 'Juan Pérez',
            role: 'admin',
            is_active: true,
            created_at: '2026-07-02T00:00:00.000Z',
            updated_at: '2026-07-02T00:00:00.000Z',
          },
        },
        meta: { message: 'Inicio de sesión exitoso' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido',
    schema: {
      example: {
        error: 'Unauthorized',
        message: 'Token inválido o expirado',
        statusCode: 401,
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const result = await this.authService.login(loginDto.id_token);
    return {
      data: result,
      meta: { message: 'Inicio de sesión exitoso' },
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener usuario autenticado actual' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
    schema: {
      example: {
        data: {
          id: 'user123',
          email: 'usuario@ejemplo.com',
          full_name: 'Juan Pérez',
          role: 'admin',
          avatar_url: 'https://ejemplo.com/avatar.jpg',
          is_active: true,
          created_at: '2026-07-02T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
    schema: {
      example: {
        error: 'Unauthorized',
        message: 'No autenticado',
        statusCode: 401,
      },
    },
  })
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ data: User }> {
    const fullUser = await this.usersService.findById(user.userId);
    return { data: fullUser };
  }
}
