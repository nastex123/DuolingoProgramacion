import { Module } from '@nestjs/common';
import { NotebookController } from './notebook.controller';
import { NotebookService } from './notebook.service';

@Module({
  controllers: [NotebookController],
  providers: [NotebookService],
  exports: [NotebookService],
})
export class NotebookModule {}
