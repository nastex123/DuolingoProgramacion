import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotebookService } from './notebook.service';
import type { MistakesNotebookItem } from '@koda/types';

@ApiTags('Mistakes Notebook')
@Controller('notebook')
export class NotebookController {
  constructor(private readonly notebookService: NotebookService) {}

  @Get('mistakes')
  @ApiOperation({ summary: 'Obtener lista de errores persistentes pendientes para práctica' })
  @ApiResponse({ status: 200, description: 'Lista de errores' })
  getMistakes(): MistakesNotebookItem[] {
    return this.notebookService.getMistakes();
  }

  @Post('mistakes/:questionId/resolve')
  @ApiOperation({ summary: 'Remediar un error del cuaderno y recibir bonificación de +5 XP' })
  @ApiResponse({ status: 200, description: 'Error remediado con éxito' })
  resolveMistake(@Param('questionId') questionId: string) {
    return this.notebookService.resolveMistake(questionId);
  }
}
