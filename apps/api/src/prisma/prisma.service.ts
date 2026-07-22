import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _isConnected = false;

  constructor() {
    // Prisma 7 requires a driver adapter — always create one
    // When DATABASE_URL is not set, use a placeholder that will fail at connect time
    const connectionString = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/placeholder';
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });

    if (!process.env.DATABASE_URL) {
      this.logger.warn('DATABASE_URL not configured — Prisma will not connect');
    }
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      return;
    }
    try {
      await this.$connect();
      this._isConnected = true;
      this.logger.log('Prisma connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      // Don't throw — allow app to start for auth-only operations
    }
  }

  async onModuleDestroy() {
    if (this._isConnected) {
      await this.$disconnect();
      this.logger.log('Prisma disconnected from database');
    }
  }

  get isConnected(): boolean {
    return this._isConnected;
  }
}
