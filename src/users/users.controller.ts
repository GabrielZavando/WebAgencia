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
  ParseBoolPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SetRoles } from '../common/decorators/roles.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@SetRoles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ data: User[]; meta: { total: number; page: number; limit: number } }> {
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
  async findOne(@Param('id') id: string): Promise<{ data: User }> {
    const user = await this.usersService.findById(id);

    return { data: user };
  }

  @Patch(':id')
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
  async remove(@Param('id') id: string): Promise<{ meta: { message: string } }> {
    await this.usersService.delete(id);

    return {
      meta: { message: 'Usuario eliminado exitosamente' },
    };
  }
}