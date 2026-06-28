import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

interface LoginResponseData {
  user: User;
  token: string;
}

interface LoginResponse {
  data: LoginResponseData;
  meta: { message: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const result = await this.authService.login(loginDto.id_token);
    return {
      data: result,
      meta: { message: 'Inicio de sesión exitoso' },
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: CurrentUserData): Promise<{ data: User }> {
    const fullUser = await this.usersService.findById(user.userId);
    return { data: fullUser };
  }
}