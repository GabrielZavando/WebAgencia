import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SetRoles } from '../common/decorators/roles.decorator';
import { User } from './entities/user.entity';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@SetRoles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (Solo admin)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    schema: {
      example: {
        data: [
          {
            id: 'user123',
            email: 'usuario@ejemplo.com',
            full_name: 'Juan Pérez',
            role: 'admin',
            avatar_url: 'https://ejemplo.com/avatar.jpg',
            is_active: true,
            created_at: '2026-07-02T00:00:00.000Z',
            updated_at: '2026-07-02T00:00:00.000Z',
          },
        ],
        meta: { total: 10, page: 1, limit: 10 },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado',
    schema: {
      example: {
        error: 'Forbidden',
        message: 'Acceso denegado',
        statusCode: 403,
      },
    },
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{
    data: User[];
    meta: { total: number; page: number; limit: number };
  }> {
    const result = await this.usersService.findAll(page, limit);

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario (Solo admin)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        data: {
          id: 'user456',
          email: 'nuevo@ejemplo.com',
          full_name: 'María García',
          role: 'editor',
          avatar_url: null,
          is_active: true,
          created_at: '2026-07-02T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
        },
        meta: { message: 'Usuario creado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    schema: {
      example: {
        error: 'Bad Request',
        message: 'El correo electrónico no es válido',
        statusCode: 400,
      },
    },
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ data: User; meta: { message: string } }> {
    const user = await this.usersService.create(createUserDto);

    return {
      data: user,
      meta: { message: 'Usuario creado exitosamente' },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID (Solo admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario (Firebase UID)',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido',
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
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        error: 'Not Found',
        message: 'Usuario no encontrado',
        statusCode: 404,
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<{ data: User }> {
    const user = await this.usersService.findById(id);

    return { data: user };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario (Solo admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario (Firebase UID)',
    example: 'user123',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    schema: {
      example: {
        data: {
          id: 'user123',
          email: 'usuario@ejemplo.com',
          full_name: 'Juan Pérez Actualizado',
          role: 'admin',
          avatar_url: 'https://ejemplo.com/avatar.jpg',
          is_active: true,
          created_at: '2026-07-02T00:00:00.000Z',
          updated_at: '2026-07-02T00:00:00.000Z',
        },
        meta: { message: 'Usuario actualizado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        error: 'Not Found',
        message: 'Usuario no encontrado',
        statusCode: 404,
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ data: User; meta: { message: string } }> {
    const user = await this.usersService.update(id, updateUserDto);

    return {
      data: user,
      meta: { message: 'Usuario actualizado exitosamente' },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar usuario (Solo admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario (Firebase UID)',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
    schema: {
      example: {
        meta: { message: 'Usuario eliminado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        error: 'Not Found',
        message: 'Usuario no encontrado',
        statusCode: 404,
      },
    },
  })
  async remove(
    @Param('id') id: string,
  ): Promise<{ meta: { message: string } }> {
    await this.usersService.delete(id);

    return {
      meta: { message: 'Usuario eliminado exitosamente' },
    };
  }
}
