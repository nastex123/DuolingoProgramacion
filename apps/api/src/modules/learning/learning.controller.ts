import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import type {
  RoadmapResponse,
  LessonDetail,
  LessonAnswerSubmission,
  LessonAnswerFeedback,
} from '@koda/types';

@ApiTags('Learning & Roadmap')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('roadmap/:languageSlug')
  @ApiOperation({ summary: 'Obtener el árbol de roadmap con candados y estrellas' })
  @ApiResponse({ status: 200, description: 'Roadmap del lenguaje' })
  getRoadmap(@Param('languageSlug') languageSlug: string): RoadmapResponse {
    return this.learningService.getRoadmap(languageSlug);
  }

  @Get('lessons/:lessonId')
  @ApiOperation({ summary: 'Obtener detalle de una micro-lección y su ejercicio' })
  @ApiResponse({ status: 200, description: 'Detalle de lección' })
  getLesson(@Param('lessonId') lessonId: string): LessonDetail {
    return this.learningService.getLesson(lessonId);
  }

  @Post('lessons/:lessonId/answer')
  @ApiOperation({ summary: 'Evaluar respuesta de una micro-lección con feedback anti-spoilers' })
  @ApiResponse({ status: 200, description: 'Feedback evaluado y XP otorgado' })
  evaluateAnswer(
    @Param('lessonId') lessonId: string,
    @Body() submission: LessonAnswerSubmission,
  ): LessonAnswerFeedback {
    return this.learningService.evaluateAnswer({ ...submission, lesson_id: lessonId });
  }
}
