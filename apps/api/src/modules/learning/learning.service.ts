import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  RoadmapResponse,
  LessonDetail,
  LessonAnswerSubmission,
  LessonAnswerFeedback,
} from '@koda/types';

@Injectable()
export class LearningService {
  getRoadmap(languageSlug: string): RoadmapResponse {
    if (languageSlug !== 'lua') {
      throw new NotFoundException(`Ruta para el lenguaje '${languageSlug}' no disponible.`);
    }

    return {
      language: {
        id: 'lang_lua_01',
        slug: 'lua',
        name: 'Lua 5.4',
        description: 'Aprende el lenguaje de scripting ultraligero usado en Roblox, WoW y NGINX.',
        icon_url: '/icons/lua.svg',
        color: '#000080',
        total_modules: 12,
        is_active: true,
      },
      overall_progress_percentage: 45,
      total_stars_earned: 24,
      max_possible_stars: 270,
      current_module_id: 'mod_01',
      modules: [
        {
          id: 'mod_01',
          code: 'M01',
          title: 'Fundamentos de Lua',
          description: 'Cimientos lógicos, sintaxis limpia, print, comentarios y depuración.',
          order_index: 1,
          total_sections: 9,
          is_unlocked: true,
          is_completed: true,
          mastery_percentage: 100,
          sections: [
            { id: 's01', code: 'S01', title: '¿Qué es Lua?', order_index: 1, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
            { id: 's02', code: 'S02', title: 'Cómo se organiza tu código', order_index: 2, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
          ],
        },
        {
          id: 'mod_02',
          code: 'M02',
          title: 'Variables y Tipos de Datos',
          description: 'Memoria, números, cadenas, booleanos, el tipo nil y la palabra local.',
          order_index: 2,
          total_sections: 10,
          is_unlocked: true,
          is_completed: false,
          mastery_percentage: 35,
          sections: [
            { id: 's01_m2', code: 'S01', title: '¿Qué es una variable?', order_index: 1, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
          ],
        },
      ],
    };
  }

  getLesson(lessonId: string): LessonDetail {
    return {
      id: lessonId,
      section_id: 's01_m2',
      title: '¿Qué es una variable?',
      order_index: 1,
      theory_markdown: 'Una variable es una cajita con una etiqueta en la memoria de la computadora para guardar datos.',
      code_example: 'nombre = "Koda"\nprint(nombre)',
      expected_output: 'Koda',
      tip_markdown: 'En Lua no necesitas declarar el tipo de dato con antelación.',
      question: {
        id: 'q_001',
        type: 'SINGLE_CHOICE',
        prompt: '¿Qué valor se guardó en la variable nombre?',
        hint: 'Mira lo que está a la derecha del signo igual =.',
        options: [
          { id: 'opt_1', text: 'Koda' },
          { id: 'opt_2', text: 'nombre' },
          { id: 'opt_3', text: 'print' },
          { id: 'opt_4', text: 'nil' },
        ],
      },
    };
  }

  evaluateAnswer(submission: LessonAnswerSubmission): LessonAnswerFeedback {
    const isCorrect = submission.selected_option_ids.includes('opt_1');

    return {
      is_correct: isCorrect,
      xp_earned: isCorrect ? 5 : 0,
      feedback_message: isCorrect
        ? '¡Excelente deducción! Guardaste "Koda" en la variable correctamente. +5 XP'
        : 'Casi lo logras. Recuerda que el valor es el contenido que asignas con el operador =.',
      hint: isCorrect ? undefined : 'Revisa la asignación nombre = "Koda".',
      added_to_review_queue: !isCorrect,
    };
  }
}
