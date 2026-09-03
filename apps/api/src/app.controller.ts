import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Estado de salud y metadatos de la API Koda' })
  @ApiResponse({ status: 200, description: 'API operativa' })
  getRoot() {
    return {
      name: 'Koda Backend API 🦊',
      description: 'API REST v2.0 para la plataforma de aprendizaje gamificado Koda',
      version: '2.0.0',
      status: 'online',
      docs: '/api/docs',
      endpoints: {
        languages: '/api/v1/languages',
        lua_roadmap: '/api/v1/learning/roadmap/lua',
        mistakes: '/api/v1/notebook/mistakes',
        verify_certificate: '/api/v1/certificates/verify/:code',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
