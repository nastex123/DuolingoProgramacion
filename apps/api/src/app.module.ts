import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { LanguagesModule } from './modules/languages/languages.module';
import { LearningModule } from './modules/learning/learning.module';
import { CertificationModule } from './modules/certification/certification.module';
import { NotebookModule } from './modules/notebook/notebook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LanguagesModule,
    LearningModule,
    CertificationModule,
    NotebookModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
