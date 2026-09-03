'use client';

import React from 'react';
import { RoadmapModuleNode } from '@/components/RoadmapModuleNode';
import type { RoadmapResponse } from '@koda/types';

// Datos iniciales de demostración pedagógica para Python 3.12
const INITIAL_ROADMAP: RoadmapResponse = {
  language: {
    id: 'lang_py_01',
    slug: 'python',
    name: 'Python 3.12',
    description: 'El lenguaje más popular del mundo para principiantes, desarrollo web, análisis de datos e IA.',
    icon_url: '/icons/python.svg',
    color: '#3776AB',
    total_modules: 12,
    is_active: true,
  },
  overall_progress_percentage: 25,
  total_stars_earned: 18,
  max_possible_stars: 360,
  current_module_id: 'py_mod_01',
  modules: [
    {
      id: 'py_mod_01',
      code: 'M01',
      title: 'Fundamentos de Python',
      description: 'Tu primer print(), cadenas de texto, números, sintaxis limpia y comentarios sin miedo.',
      order_index: 1,
      total_sections: 8,
      is_unlocked: true,
      is_completed: true,
      mastery_percentage: 100,
      sections: [
        { id: 's01', code: 'S01', title: '¿Qué es Python?', order_index: 1, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's02', code: 'S02', title: 'Tu primer print()', order_index: 2, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's03', code: 'S03', title: 'Cadenas de texto (Strings)', order_index: 3, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's04', code: 'S04', title: 'Números y Operaciones', order_index: 4, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 2, max_stars_earned: 3 },
        { id: 's05', code: 'S05', title: 'Comentarios con #', order_index: 5, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's06', code: 'S06', title: 'Indentación y Bloques', order_index: 6, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 2, max_stars_earned: 3 },
        { id: 's07', code: 'S07', title: 'Entender errores simples', order_index: 7, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 2, max_stars_earned: 3 },
        { id: 's08', code: 'S08', title: 'Checkpoint y Proyecto', order_index: 8, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
      ],
    },
    {
      id: 'py_mod_02',
      code: 'M02',
      title: 'Variables y Tipos de Datos',
      description: 'Almacenamiento en memoria, números enteros, decimales, textos, booleanos y type().',
      order_index: 2,
      total_sections: 10,
      is_unlocked: true,
      is_completed: false,
      mastery_percentage: 20,
      sections: [
        { id: 's01_m2', code: 'S01', title: '¿Qué es una variable?', order_index: 1, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's02_m2', code: 'S02', title: 'Reasignar valores', order_index: 2, total_lessons: 10, is_unlocked: true, is_completed: false, stars_earned: 0, max_stars_earned: 3 },
        { id: 's03_m2', code: 'S03', title: 'El tipo int y float', order_index: 3, total_lessons: 10, is_unlocked: false, is_completed: false, stars_earned: 0, max_stars_earned: 3 },
        { id: 's04_m2', code: 'S04', title: 'El tipo str y formato', order_index: 4, total_lessons: 10, is_unlocked: false, is_completed: false, stars_earned: 0, max_stars_earned: 3 },
        { id: 's05_m2', code: 'S05', title: 'Booleanos: True y False', order_index: 5, total_lessons: 10, is_unlocked: false, is_completed: false, stars_earned: 0, max_stars_earned: 3 },
      ],
    },
    {
      id: 'py_mod_03',
      code: 'M03',
      title: 'Operadores y Expresiones',
      description: 'Operaciones aritméticas, operadores lógicos and/or/not y expresiones compuestas.',
      order_index: 3,
      total_sections: 8,
      is_unlocked: false,
      is_completed: false,
      mastery_percentage: 0,
      sections: [],
    },
  ],
};

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-slate-900 border border-orange-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-3">
            <span>✨ Curso Activo</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Ruta Oficial de {INITIAL_ROADMAP.language.name}
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-xl">
            {INITIAL_ROADMAP.language.description}
          </p>

          {/* Progress bar */}
          <div className="mt-5 flex items-center gap-4">
            <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${INITIAL_ROADMAP.overall_progress_percentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-orange-400">
              {INITIAL_ROADMAP.overall_progress_percentage}% Completado
            </span>
          </div>
        </div>

        {/* Stars summary badge */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center min-w-[140px] shadow-lg">
          <span className="text-2xl">⭐</span>
          <span className="text-lg font-black text-white mt-1">
            {INITIAL_ROADMAP.total_stars_earned} / {INITIAL_ROADMAP.max_possible_stars}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Estrellas acumuladas</span>
        </div>
      </div>

      {/* Modules Roadmap Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">Módulos del Curso</h3>
          <span className="text-xs text-slate-400">Desbloqueo secuencial con $\ge 80\%$ de maestría</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {INITIAL_ROADMAP.modules.map((mod) => (
            <RoadmapModuleNode key={mod.id} module={mod} />
          ))}
        </div>
      </div>
    </div>
  );
}
