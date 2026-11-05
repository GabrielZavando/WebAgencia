import {
  Controller,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { RebuildService } from './rebuild.service';
import { WebhookAuthGuard } from './webhook-auth.guard';

@ApiTags('Webhooks')
@Controller('webhooks')
export class RebuildController {
  constructor(private readonly rebuildService: RebuildService) {}

  @Post('rebuild-public')
  @UseGuards(WebhookAuthGuard)
  @ApiOperation({
    summary: 'Disparar la revalidación del sitio público en Coolify',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-rebuild-token',
    description: 'Token secreto de revalidación (alternativa al Bearer admin)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Revalidación procesada',
    schema: {
      example: {
        data: { triggered: true },
        meta: { message: 'Revalidación del sitio pública disparada' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
    schema: {
      example: {
        error: 'Unauthorized',
        message: 'Token de acceso requerido',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado',
    schema: {
      example: {
        error: 'Forbidden',
        message: 'Acceso denegado',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 502,
    description: 'Error al contactar a Coolify',
    schema: {
      example: {
        error: 'Bad Gateway',
        message: 'Error al contactar el webhook de Coolify',
        statusCode: 502,
      },
    },
  })
  async rebuildPublic() {
    try {
      const result = await this.rebuildService.triggerRebuild();

      if (result.skipped) {
        return {
          data: { skipped: true },
          meta: {
            message:
              'Webhook de revalidación no configurado; se omite la reconstrucción',
          },
        };
      }

      return {
        data: { triggered: true },
        meta: { message: 'Revalidación del sitio público disparada' },
      };
    } catch {
      throw new HttpException(
        {
          error: 'Bad Gateway',
          message: 'Error al contactar el webhook de Coolify',
          statusCode: 502,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
