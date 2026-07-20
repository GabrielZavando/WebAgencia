import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  it('should initialize successfully', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
