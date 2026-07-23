import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreateLeadData {
  email: string;
  fullName: string;
  status?: string;
  metadata?: Record<string, unknown>;
  attribution?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}

export interface CreateContactMessageData {
  leadId: string;
  message: string;
}

@Injectable()
export class LeadsRepository {
  private readonly logger = new Logger(LeadsRepository.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findLeadByEmail(
    email: string,
  ): Promise<Record<string, unknown> | null> {
    try {
      const result = await this.supabase
        .getClient()
        .from('leads')
        .select('*')
        .eq('email', email)
        .single();

      if (result.error) {
        if (result.error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw result.error;
      }

      return result.data as Record<string, unknown>;
    } catch (error) {
      this.logger.error('Error finding lead by email', error);
      throw error;
    }
  }

  async createLead(data: CreateLeadData): Promise<Record<string, unknown>> {
    try {
      const result = await this.supabase
        .getClient()
        .from('leads')
        .insert({
          email: data.email,
          full_name: data.fullName,
          status: data.status ?? 'contact',
          metadata: data.metadata ?? {},
          attribution: data.attribution ?? {},
          payload: data.payload ?? {},
        })
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      return result.data as Record<string, unknown>;
    } catch (error) {
      this.logger.error('Error creating lead', error);
      throw error;
    }
  }

  async createContactMessage(
    data: CreateContactMessageData,
  ): Promise<Record<string, unknown>> {
    try {
      const result = await this.supabase
        .getClient()
        .from('contact_messages')
        .insert({
          lead_id: data.leadId,
          message: data.message,
        })
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      return result.data as Record<string, unknown>;
    } catch (error) {
      this.logger.error('Error creating contact message', error);
      throw error;
    }
  }
}
