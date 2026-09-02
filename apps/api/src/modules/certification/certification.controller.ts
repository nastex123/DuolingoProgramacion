import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CertificationService } from './certification.service';
import type { CertificateVerificationResponse } from '@koda/types';

@ApiTags('Certification')
@Controller('certificates')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verificación pública de certificado por código QR/ID' })
  @ApiResponse({ status: 200, description: 'Datos de verificación pública' })
  @ApiResponse({ status: 404, description: 'Certificado no encontrado' })
  verify(@Param('code') code: string): CertificateVerificationResponse {
    return this.certificationService.verifyCertificate(code);
  }

  @Get(':id/download-info')
  @ApiOperation({ summary: 'Obtener información de streaming y caché en Google Drive' })
  @ApiResponse({ status: 200, description: 'Metadatos de Google Drive File ID' })
  getDownloadInfo(@Param('id') id: string) {
    return this.certificationService.getDownloadInfo(id);
  }
}
