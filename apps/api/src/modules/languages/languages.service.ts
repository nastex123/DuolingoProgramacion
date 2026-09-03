import { Injectable, NotFoundException } from '@nestjs/common';
import type { ProgrammingLanguage } from '@koda/types';

@Injectable()
export class LanguagesService {
  private readonly languages: ProgrammingLanguage[] = [
    {
      id: 'lang_py_01',
      slug: 'python',
      name: 'Python 3.12',
      description: 'El lenguaje más popular para desarrollo web, análisis de datos e inteligencia artificial.',
      icon_url: '/icons/python.svg',
      color: '#3776AB',
      total_modules: 12,
      is_active: true,
    },
  ];

  findAll(): ProgrammingLanguage[] {
    return this.languages.filter((l) => l.is_active);
  }

  findBySlug(slug: string): ProgrammingLanguage {
    const lang = this.languages.find((l) => l.slug === slug);
    if (!lang) {
      throw new NotFoundException(`Lenguaje '${slug}' no encontrado.`);
    }
    return lang;
  }
}
