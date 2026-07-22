import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateLeadData {
  email: string;
  fullName: string;
  status?: string;
  metadata?: Prisma.InputJsonValue;
  attribution?: Prisma.InputJsonValue;
  payload?: Prisma.InputJsonValue;
}

export interface CreateContactMessageData {
  leadId: string;
  message: string;
}

@Injectable()
export class LeadsRepository {
  private readonly logger = new Logger(LeadsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findLeadByEmail(email: string) {
    return this.prisma.lead.findUnique({
      where: { email },
    });
  }

  async createLead(data: CreateLeadData) {
    return this.prisma.lead.create({
      data: {
        email: data.email,
        full_name: data.fullName,
        status: data.status ?? 'contact',
        metadata: data.metadata ?? {},
        attribution: data.attribution ?? {},
        payload: data.payload ?? {},
      },
    });
  }

  async createContactMessage(data: CreateContactMessageData) {
    return this.prisma.contactMessage.create({
      data: {
        lead_id: data.leadId,
        message: data.message,
      },
    });
  }
}
