import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LeadsRepository } from './leads.repository';
import { CreateLeadDto } from './dto/create-lead.dto';

export interface LeadCreatedResponse {
  leadId: string;
  message: string;
  /** true when a new Lead was created; false when an existing lead received a new ContactMessage */
  isNew: boolean;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly leadsRepository: LeadsRepository,
  ) {}

  async createLead(dto: CreateLeadDto): Promise<LeadCreatedResponse> {
    if (!this.supabase.isConnected) {
      throw new ServiceUnavailableException({
        error: 'Service Unavailable',
        message: 'Base de datos no configurada',
        statusCode: 503,
      });
    }

    const normalizedEmail = dto.email.toLowerCase().trim();
    const sanitizedName = dto.name.trim();

    // Check if lead already exists
    const existingLead =
      await this.leadsRepository.findLeadByEmail(normalizedEmail);

    let leadId: string;

    if (existingLead) {
      // Lead exists — create new contact message linked to existing lead
      leadId = existingLead.id as string;
      this.logger.log(
        `Lead already exists for ${normalizedEmail}, adding contact message`,
      );
    } else {
      // Create new lead
      const lead = await this.leadsRepository.createLead({
        email: normalizedEmail,
        fullName: sanitizedName,
        status: 'contact',
        metadata: {
          form_id: 'formulario_contacto_web',
          version: '1.1',
        },
        attribution: {
          utm_source: 'formulario_contacto',
          utm_medium: 'web',
        },
        payload: {
          identity_critical: {
            email: normalizedEmail,
            full_name: sanitizedName,
          },
          profile_optional: {
            phone: dto.phone ?? null,
          },
          custom_fields: {
            message: dto.message,
            status: 'contact',
          },
        },
      });
      leadId = lead.id as string;
      this.logger.log(`New lead created: ${leadId}`);
    }

    // Create contact message
    await this.leadsRepository.createContactMessage({
      leadId,
      message: dto.message,
    });

    this.logger.log(`Contact message saved for lead ${leadId}`);

    return {
      leadId,
      message: 'Contacto registrado exitosamente',
      isNew: !existingLead,
    };
  }
}
