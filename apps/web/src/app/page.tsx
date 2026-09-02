'use client';

import React from 'react';
import { RoadmapModuleNode } from '@/components/RoadmapModuleNode';
import type { RoadmapResponse } from '@koda/types';

// Datos iniciales de demostración pedagógica para Lua
const INITIAL_ROADMAP: RoadmapResponse = {
  language: {
    id: 'lang_lua_01',
    slug: 'lua',
    name: 'Lua 5.4',
    description: 'Aprende el lenguaje de scripting ultraligero usado en Roblox, World of Warcraft y NGINX.',
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
      description: 'Cimientos lógicos, sintaxis limpia, print, comentarios y depuración sin miedo a errores.',
      order_index: 1,
      total_sections: 9,
      is_unlocked: true,
      is_completed: true,
      mastery_percentage: 100,
      sections: [
        { id: 's01', code: 'S01', title: '¿Qué es Lua?', order_index: 1, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's02', code: 'S02', title: 'Cómo se organiza tu código', order_index: 2, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's03', code: 'S03', title: 'Tu primer print', order_index: 3, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's04', code: 'S04', title: 'Comentarios útiles', order_index: 4, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 2, max_stars_earned: 3 },
        { id: 's05', code: 'S05', title: 'Archivos .lua', order_index: 5, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's06', code: 'S06', title: 'Ejecutar código', order_index: 6, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's07', code: 'S07', title: 'Palabras reservadas', order_index: 7, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 2, max_stars_earned: 3 },
        { id: 's08', code: 'S08', title: 'Entender errores', order_index: 8, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 2, max_stars_earned: 3 },
        { id: 's09', code: 'S09', title: 'Proyecto Integrador', order_index: 9, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
      ],
    },
    {
      id: 'mod_02',
      code: 'M02',
      title: 'Variables y Tipos de Datos',
      description: 'Almacenamiento en memoria, números, cadenas, booleanos, el tipo nil y la palabra local.',
      order_index: 2,
      total_sections: 10,
      is_unlocked: true,
      is_completed: false,
      mastery_percentage: 35,
      sections: [
        { id: 's01_m2', code: 'S01', title: '¿Qué es una variable?', order_index: 1, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 3, max_stars_earned: 3 },
        { id: 's02_m2', code: 'S02', title: 'Reasignación de valores', order_index: 2, total_lessons: 10, is_unlocked: true, is_completed: true, stars_earned: 2, max_stars_earned: 3 },
        { id: 's03_m2', code: 'S03', title: 'El sistema de tipos', order_index: 3, total_lessons: 10, is_unlocked: true, is_completed: false, stars_earned: 0, max_stars_earned: 3 },
        { id: 's04_m2', code: 'S04', title: 'El tipo number', order_index: 4, total_lessons: 10, is_unlocked: false, is_completed: false, stars_earned: 0, max_stars_earned: 3 },
        { id: 's05_m2', code: 'S05', title: 'El tipo string', order_index: 5, total_lessons: 10, is_unlocked: false, is_completed: false, stars_earned: 0, max_stars_earned: 3 },
      ],
    },
    {
      id: 'mod_03',
      code: 'M03',
      title: 'Estructuras de Control y Tablas',
      description: 'Condicionales if-else, bucles for/while y la estructura de datos reina en Lua.',
      order_index: 3,
      total_sections: 10,
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
