import { Injectable, NotFoundException } from '@nestjs/common';
import type { MistakesNotebookItem } from '@koda/types';

@Injectable()
export class NotebookService {
  private mistakes: MistakesNotebookItem[] = [
    {
      id: 'mstk_001',
      user_id: 'usr_001',
      question_id: 'q_001',
      language_id: 'lang_lua_01',
      module_id: 'mod_01',
      section_id: 's07',
      lesson_title: 'Palabras reservadas',
      prompt: '¿Por qué local no puede ser usado como nombre de variable?',
      code_context: 'local = 5 -- Error',
      error_count: 2,
      is_resolved: false,
      created_at: '2026-09-02T10:00:00Z',
      last_failed_at: '2026-09-02T11:30:00Z',
    },
  ];

  getMistakes(): MistakesNotebookItem[] {
    return this.mistakes.filter((m) => !m.is_resolved);
  }

  resolveMistake(questionId: string): { success: boolean; xp_reward: number } {
    const item = this.mistakes.find((m) => m.question_id === questionId);
    if (!item) {
      throw new NotFoundException(`Error con question_id '${questionId}' no encontrado en el cuaderno.`);
    }

    item.is_resolved = true;
    return {
      success: true,
      xp_reward: 5,
    };
  }
}
