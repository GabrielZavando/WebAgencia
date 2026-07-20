import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UsersRepository, PaginationResult } from './users.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<User>> {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), 100);

    return this.usersRepository.findAll(sanitizedPage, sanitizedLimit);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Usuario no encontrado',
        statusCode: 404,
      });
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const emailExists = await this.usersRepository.existsByEmail(
      createUserDto.email,
    );

    if (emailExists) {
      throw new BadRequestException({
        error: 'Bad Request',
        message: 'El email ya existe',
        statusCode: 400,
      });
    }

    return this.usersRepository.create(createUserDto);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Usuario no encontrado',
        statusCode: 404,
      });
    }

    return this.usersRepository.update(id, updateUserDto);
  }

  async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'Usuario no encontrado',
        statusCode: 404,
      });
    }

    await this.usersRepository.delete(id);
  }
}
