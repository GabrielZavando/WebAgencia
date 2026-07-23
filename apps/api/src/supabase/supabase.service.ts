import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private _client: SupabaseClient | null = null;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl) {
      this.logger.warn(
        'SUPABASE_URL not configured — Supabase will not connect',
      );
      return;
    }

    if (!supabaseSecretKey) {
      this.logger.warn(
        'SUPABASE_SECRET_KEY not configured — Supabase will not connect',
      );
      return;
    }

    try {
      this._client = createClient(supabaseUrl, supabaseSecretKey);
      this.logger.log('Supabase client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase client', error);
    }
  }

  getClient(): SupabaseClient {
    if (!this._client) {
      throw new Error(
        'Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SECRET_KEY environment variables.',
      );
    }
    return this._client;
  }

  get isConnected(): boolean {
    return this._client !== null;
  }
}
