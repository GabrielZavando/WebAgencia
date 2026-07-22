import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

interface LeadResponseData {
  leadId: string;
  message: string;
}

interface LeadResponse {
  data: LeadResponseData;
  meta: { message: string };
}

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('contact')
  @ApiOperation({ summary: 'Registrar contacto desde formulario web' })
  @ApiBody({
    description: 'Datos del formulario de contacto',
    type: CreateLeadDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Contacto registrado exitosamente',
    schema: {
      example: {
        data: {
          leadId: 'uuid-lead-123',
          message: 'Contacto registrado exitosamente',
        },
        meta: { message: 'Contacto registrado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lead existente — nuevo mensaje agregado',
    schema: {
      example: {
        data: {
          leadId: 'uuid-lead-existente',
          message: 'Contacto registrado exitosamente',
        },
        meta: { message: 'Contacto registrado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 503,
    description: 'Base de datos no configurada',
    schema: {
      example: {
        error: 'Service Unavailable',
        message: 'Base de datos no configurada',
        statusCode: 503,
      },
    },
  })
  async createContact(
    @Body() createLeadDto: CreateLeadDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LeadResponse> {
    const { isNew, ...result } = await this.leadsService.createLead(createLeadDto);

    // 201 = new lead, 200 = existing lead (duplicate email)
    res.status(isNew ? HttpStatus.CREATED : HttpStatus.OK);

    return {
      data: result,
      meta: { message: result.message },
    };
  }
}
