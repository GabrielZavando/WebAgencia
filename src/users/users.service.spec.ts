import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UserRole } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'editor' as const,
    avatar_url: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginatedResult = {
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(paginatedResult);

      const result = await service.findAll(1, 10);

      expect(result).toEqual(paginatedResult);
      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should enforce minimum page of 1', async () => {
      const paginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(paginatedResult);

      await service.findAll(-1, 10);

      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should cap limit at 100', async () => {
      const paginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 100,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(paginatedResult);

      await service.findAll(1, 200);

      expect(repository.findAll).toHaveBeenCalledWith(1, 100);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      full_name: 'New User',
      role: UserRole.EDITOR,
    };

    it('should create user successfully', async () => {
      jest.spyOn(repository, 'existsByEmail').mockResolvedValue(false);
      jest.spyOn(repository, 'create').mockResolvedValue({
        ...mockUser,
        email: createUserDto.email,
        full_name: createUserDto.full_name,
      });

      const result = await service.create(createUserDto);

      expect(result.email).toBe(createUserDto.email);
      expect(repository.existsByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
    });

    it('should throw BadRequestException when email already exists', async () => {
      jest.spyOn(repository, 'existsByEmail').mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto = { full_name: 'Updated Name' };
      const updatedUser = { ...mockUser, full_name: 'Updated Name' };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateDto);

      expect(result.full_name).toBe('Updated Name');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await service.delete('user-123');

      expect(repository.delete).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
