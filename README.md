# 🦊 Koda — Duolingo de Programación

> Plataforma educativa interactiva y gamificada para aprender a programar desde cero, diseñada sin asunciones previas, sin fricción cognitiva y con micro-lecciones atómicas ultra accesibles.

[![Python Version](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](https://www.python.org)
[![Módulo 01](https://img.shields.io/badge/Módulo%2001-Fundamentos-success.svg)](content/languages/python/modules/01_fundamentos/module.json)
[![Ruta Oficial](https://img.shields.io/badge/Ruta-12%20Módulos-blueviolet.svg)](content/languages/python/manifest.json)
[![Arquitectura](https://img.shields.io/badge/Arquitectura-Monolito%20Modular%20(Next.js%20%2B%20NestJS)-indigo.svg)](docs/11_SYSTEM_ARCHITECTURE.md)
[![Base de Datos](https://img.shields.io/badge/Database-Supabase%20(PostgreSQL%2015)-emerald.svg)](docs/12_DATABASE_DESIGN.md)
[![Documentación](https://img.shields.io/badge/Docs-Hub%20de%20Especificaciones-purple.svg)](docs/README.md)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)

> [!IMPORTANT]
> ### ⚠️ Aviso sobre el Estado del Proyecto
> El repositorio contiene la arquitectura completa, monorepo funcional con Next.js 15 y NestJS, contratos compartidos `@koda/types`, especificaciones REST v2.0.0, modelo relacional en Supabase y el currículo de **Python 3.12** como lenguaje oficial de lanzamiento.

---

## 🎯 Visión y Filosofía Pedagógica de Koda

La mayoría de cursos de programación asumen conocimientos previos, emplean jerga intimidante o presentan muros de texto que provocan frustración y abandono temprano. **Koda** reimagina el aprendizaje combinando la psicología de gamificación de Duolingo, la ergonomía de herramientas como Linear y VS Code, y los principios de diseño instruccional más rigurosos:

- **Micro-Lecciones Atómicas:** Cada lección tiene entre 40 y 70 palabras explicadas en segunda persona (*"tú"*), estructurada en un máximo de 3 pasos lógicos.
- **Un Concepto, Una Lección, Una Práctica Inmediata:** Cada lección enseña una única idea atómica y la evalúa al instante mediante un desafío interactivo.
- **Sin Bloqueo Cognitivo:** Cero conceptos abstractos sin explicar. Se introducen mediante analogías visuales cotidianas.
- **Sistema de Errores Formativo y Sin Spoilers:** Al equivocarse, el estudiante recibe una pista inteligente pero **nunca se le revela la respuesta correcta**. La pregunta se encola en la **Ronda de Repaso Final** con **opciones barajadas** aleatoriamente, otorgando +2 XP de recuperación.
- **Cuaderno de Errores Persistente:** Los fallos no resueltos se guardan en el cuaderno personal para permitir práctica deliberada posterior (+5 XP al remediar).
- **Gamificación Formativa y No Punitiva:** Sistema de 1 a 3 estrellas (⭐) por sección según precisión, candados de progresión secuencial, economía de XP determinista, rachas diarias y reacciones emocionales en tiempo real con la mascota **🦊 Koda**.

---

## 🏗️ Pila Tecnológica Oficial

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            ARQUITECTURA DE KODA                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14+/15 App Router + TypeScript)                           │
│  ├── SEO & SSG/ISR: Verificación pública de certificados (/verificar/[code]) │
│  ├── UI & Estilos: Tailwind CSS + Shadcn UI + Lucide Icons                   │
│  ├── Estado & Server Cache: Zustand + TanStack Query                         │
│  ├── Editor Multi-Lenguaje: Monaco Editor / CodeMirror 6 (+50 lenguajes)     │
│  └── Motor Gráfico WebGL: PixiJS v7 (Mascota Koda 🦊, confeti y emociones)   │
├──────────────────────────────────────────────────────────────────────────────┤
│  Backend (NestJS Monolito Modular con 9 Motores Desacoplados)                │
│  ├── Core API: REST /api/v1 + OpenAPI 3.0.3 (44 endpoints)                   │
│  ├── Auth: JWT Stateless (15 min) + Refresh rotativo HttpOnly + Argon2id     │
│  ├── Motor de Ejecución Híbrido (ICodeRunner):                               │
│  │   ├── Cliente Wasm: Pyodide (Python), Workers (JS)                        │
│  │   └── Backend Sandbox: Piston / Judge0 en Docker (Rust, C/C++, C#, Go)   │
│  └── Motor de Certificación: Generación 100% en backend (Node.js + QR)       │
├──────────────────────────────────────────────────────────────────────────────┤
│  Persistencia & Almacenamiento                                               │
│  ├── Base de Datos: Supabase (PostgreSQL 15+) con triggers y JSONB           │
│  ├── Storage de Certificados: Google Drive API v3 (Service Account)          │
│  │   └── Detección previa & streaming: Entrega inmediata sin re-generar      │
│  └── Caché & Rate Limiting: Redis                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Mapa Curricular Oficial (Python 3.12)

La ruta oficial de Python se compone de **12 módulos canónicos** (`01_PROJECT_OVERVIEW.md` §34) estructurados bajo el estándar de micro-lecciones atómicas:

| Módulo | Título Formativo | Foco Pedagógico | Estado |
|:---:|---|---|:---:|
| **M01** | **Fundamentos de Python** | Tu primer `print()`, cadenas de texto, números, indentación y comentarios `#` | 🟢 Disponible |
| **M02** | **Variables y Tipos de Datos** | Almacenamiento en memoria, `int`, `float`, `str`, `bool` y función inspectora `type()` | 🟢 Disponible |
| **M03** | **Operadores y Expresiones** | Aritmética (`+`, `-`, `*`, `/`, `//`, `%`, `**`), comparadores y operadores lógicos (`and`, `or`, `not`) | 🟡 En roadmap |
| **M04** | **Condicionales** | Toma de decisiones lógicas con bloques `if`, `elif` y `else` | 🟡 En roadmap |
| **M05** | **Bucles e Iteración** | Automatización de tareas repetitivas con `for`, `while`, `range()`, `break` y `continue` | 🟡 En roadmap |
| **M06** | **Funciones y Modularidad** | Creación de bloques reutilizables con `def`, argumentos, parámetros y `return` | 🟡 En roadmap |
| **M07** | **Listas y Tuplas** | Colecciones ordenadas, indexación `[0]`, slicing `[:]`, métodos `append()` y mutabilidad | 🟡 En roadmap |
| **M08** | **Diccionarios y Conjuntos** | Mapeo asociativo clave-valor `{key: value}`, métodos `get()` y colecciones únicas con `set` | 🟡 En roadmap |
| **M09** | **Manejo de Errores** | Prevención de caídas con bloques de control `try`, `except`, `else` y `finally` | 🟡 En roadmap |
| **M10** | **Módulos y Bibliotecas** | Organización del código con `import`, bibliotecas nativas (`math`, `random`) y paquetes | 🟡 En roadmap |
| **M11** | **Programación Orientada a Objetos** | Clases, instancias, atributos, métodos y el inicializador constructor `__init__` | 🟡 En roadmap |
| **M12** | **Proyecto Final Integrador** | Aplicación integral de todos los conceptos, examen final y emisión de certificación | 🟡 En roadmap |

---

## 💻 Experiencia de Aprendizaje y Workspace Desktop

Koda implementa una interfaz de escritorio optimizada para el enfoque y la retención pedagógica:

```
┌─────────────────┬────────────────────────────────────────────────────────────────────────┐
│     🦊 KODA     │ 🧭 Python › Módulo 01 › Sección 02: Tu primer print() [ 50 XP ] [ 🔥 3 ] │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 🗺️ Ruta         │ ┌── STEPPER DE SECCIÓN ──────────────────────────────────────────────┐ │
│ 📖 Lección (*)  │ │ S02: Tu primer print() │ [✓] [✓] [✓] [●] [5] [6] [7] [8] [9] [10]  │ │
│ 📓 Cuaderno     │ └────────────────────────────────────────────────────────────────────┘ │
│ 🏆 Logros       │ ┌───────────────────────────────┐ ┌──────────────────────────────────┐ │
│ 📜 Certificados │ │ 📖 TEORÍA & CÓDIGO (Izq 50%)  │ │ 🧠 DESAFÍO INTERACTIVO (Der 50%) │ │
│                 │ │ • Micro-explicación paso a paso│ │ • Enunciado claro y sin spoilers │ │
│ [🦊 Koda WebGL] │ │ • Editor con sintaxis Python  │ │ • [A] Opción 1       (tecla 1)   │ │
│                 │ │ • Consola de salida en vivo   │ │ • [B] Opción 2       (tecla 2)   │ │
│                 │ │ • Tip formativo               │ │ • [C] Opción 3       (tecla 3)   │ │
│                 │ │                               │ │ • [D] Opción 4       (tecla 4)   │ │
│                 │ │                               │ │ • Feedback / Pista inteligente   │ │
│                 │ └───────────────────────────────┘ └──────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Características del Workspace Desktop:
- **Espacio Dividido 50/50:** Teoría y código a la izquierda; práctica interactiva a la derecha sin scrolls molestos.
- **Stepper de 10 Píldoras:** Visualización del estado en tiempo real de cada micro-lección (`✓` completada, `●` activa).
- **Atajos de Teclado:** Teclas `1`-`4` o `A`-`D` para seleccionar opciones, `Enter` para verificar y flechas `←` / `→` para navegar.
- **Mascota 🦊 Koda en WebGL (PixiJS v7):** Animación en tiempo real con físicas de flotación, confeti acelerado y reacciones emocionales según los aciertos o equivocaciones.

---

## 📂 Estructura del Repositorio

```
DuolingoProgramacion/
├── apps/                               # Aplicaciones del Monorepo
│   ├── api/                            # Backend NestJS (REST API v2 + Swagger OpenAPI)
│   └── web/                            # Frontend Next.js 15 (React 19 + PixiJS + Tailwind)
├── packages/                           # Paquetes y Contratos Compartidos
│   └── types/                          # Definiciones TypeScript compartidas (@koda/types)
├── content/                            # Contenido pedagógico declarativo desacoplado
│   └── languages/
│       └── python/
│           ├── manifest.json           # Registro oficial del curso y 12 módulos
│           ├── config/                 # Umbrales, XP y composiciones de examen
│           └── modules/
│               └── 01_fundamentos/     # Lecciones atómicas con print, variables y tipos
├── docs/                               # Hub de Documentación y Especificaciones
│   ├── README.md                       # Índice maestro y mapa de lectura por rol
│   ├── adr/                            # Registro de decisiones de arquitectura (ADR-001..006)
│   ├── 01_PROJECT_OVERVIEW.md          # Visión general y filosofía pedagógica
│   ├── 11_SYSTEM_ARCHITECTURE.md       # Arquitectura técnica, motores y stack oficial
│   ├── 12_DATABASE_DESIGN.md           # Modelo relacional Supabase v2.0.0
│   ├── 13_API_SPECIFICATION.md         # Especificación REST v2.0.0 (44 endpoints)
│   ├── 14_LEARNING_SYSTEM.md           # Máquinas de estado y lógica pedagógica
│   ├── 16_GAMIFICATION.md              # Economía de XP, rachas y estrellas
│   ├── 17_CERTIFICATION.md             # Motor de certificación y Google Drive
│   └── 27_UI_UX_SPECIFICATION.md       # Sistema de diseño de interfaz
├── CONTRIBUTING.md                     # Guía de contribución y estándares de código
├── CHANGELOG.md                        # Bitácora estricta de cambios (America/Bogota)
├── LICENSE                             # Licencia de código abierto MIT
└── README.md                           # Documentación principal del proyecto
```

---

## 🛠️ Inicio Rápido con el Monorepo (Next.js + NestJS)

Para ejecutar la aplicación completa en tu entorno local:

### 1. Requisitos Previos
- **Node.js** `>= 20.0.0`
- **pnpm** `>= 9.0.0` (recomendado: `npm i -g pnpm`)

### 2. Instalación y Compilación
```bash
# Instalar todas las dependencias del monorepo
pnpm install

# Compilar los paquetes de contratos TypeScript
pnpm --filter "@koda/types" build
```

### 3. Ejecución en Desarrollo
```bash
# Iniciar frontend y backend en paralelo (con precompilación de contratos)
pnpm dev

# O iniciar servicios de forma individual:
pnpm dev:web    # Inicia Next.js en http://localhost:3000
pnpm dev:api    # Inicia NestJS en http://localhost:4000
```

- 🌐 **Frontend (Next.js):** [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend API (REST v2):** [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- 📚 **Swagger UI (OpenAPI 3.0):** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🤝 Contribuciones y Colaboración

¡Las contribuciones son bienvenidas! Consulta [`CONTRIBUTING.md`](CONTRIBUTING.md) para conocer las pautas de estilo, convención de commits y el flujo de trabajo con ramas.

Para proponer nuevo contenido pedagógico, consulta la guía de autoría en [`docs/24_CONTENT_AUTHORING_GUIDE.md`](docs/24_CONTENT_AUTHORING_GUIDE.md).

---

## 📜 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
