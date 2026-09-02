'use client';

import React from 'react';
import { Lock, Star, CheckCircle2, Play } from 'lucide-react';
import type { RoadmapModule } from '@koda/types';

interface RoadmapModuleNodeProps {
  module: RoadmapModule;
  onSelectModule?: (moduleId: string) => void;
}

export const RoadmapModuleNode: React.FC<RoadmapModuleNodeProps> = ({
  module,
  onSelectModule,
}) => {
  return (
    <div
      className={`relative rounded-2xl p-6 transition-all border ${
        module.is_unlocked
          ? 'bg-slate-900 border-slate-800 hover:border-orange-500/50 shadow-lg hover:shadow-orange-500/10'
          : 'bg-slate-950/60 border-slate-850 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Node Icon Avatar */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner ${
              module.is_completed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : module.is_unlocked
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            {module.is_completed ? (
              <CheckCircle2 size={28} />
            ) : module.is_unlocked ? (
              <Play size={24} className="fill-orange-400 translate-x-0.5" />
            ) : (
              <Lock size={24} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                {module.code}
              </span>
              <span className="text-xs text-slate-400">• {module.total_sections} Secciones</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{module.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{module.description}</p>
          </div>
        </div>

        {/* Action Button & Mastery */}
        <div className="flex flex-col items-end gap-2">
          {module.is_unlocked ? (
            <button
              onClick={() => onSelectModule?.(module.id)}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow-md shadow-orange-500/20 flex items-center gap-1.5"
            >
              Continuar
            </button>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800">
              <Lock size={12} /> Bloqueado
            </span>
          )}
          {module.is_unlocked && (
            <div className="text-[11px] text-slate-400">
              Maestría: <span className="font-semibold text-white">{module.mastery_percentage}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Sections Star Pills */}
      {module.is_unlocked && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-5 gap-2">
          {module.sections.map((sec, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition ${
                sec.is_completed
                  ? 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
                  : sec.is_unlocked
                  ? 'bg-orange-500/5 border-orange-500/20'
                  : 'bg-slate-900/30 border-slate-850 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400">{sec.code}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      size={11}
                      className={
                        s <= sec.stars_earned
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-200 truncate">{sec.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
