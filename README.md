# 🦊 Koda — Duolingo de Programación

> Plataforma educativa interactiva y gamificada para aprender a programar desde cero, diseñada sin asunciones previas, sin fricción cognitiva y con micro-lecciones atómicas ultra accesibles.

[![Lua Version](https://img.shields.io/badge/Lua-5.4-blue.svg?logo=lua&logoColor=white)](https://www.lua.org)
[![Módulo 01](https://img.shields.io/badge/Módulo%2001-90%20Lecciones-success.svg)](content/languages/lua/modules/01_fundamentos/module.json)
[![Módulo 02](https://img.shields.io/badge/Módulo%2002-100%20Lecciones-success.svg)](content/languages/lua/modules/02_variables/module.json)
[![Arquitectura](https://img.shields.io/badge/Arquitectura-Monolito%20Modular%20(Next.js%20%2B%20NestJS)-indigo.svg)](docs/11_SYSTEM_ARCHITECTURE.md)
[![Base de Datos](https://img.shields.io/badge/Database-Supabase%20(PostgreSQL%2015)-emerald.svg)](docs/12_DATABASE_DESIGN.md)
[![Documentación](https://img.shields.io/badge/Docs-29%20Especificaciones-purple.svg)](docs/)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)

> [!IMPORTANT]
> ### ⚠️ Aviso sobre el Estado del Proyecto (Sujeto a Cambios)
> - **Fase de diseño y especificación técnica:** El repositorio contiene el diseño curricular completo, las especificaciones de arquitectura, contratos de API REST v2.0.0, modelo relacional de base de datos en Supabase y el sistema pedagógico.
> - **Prototipos locales interactivos:** Los archivos [`test_m01.html`](test_m01.html) y [`test_m02.html`](test_m02.html) son herramientas de prueba y validación rápida en navegador (con motor gráfico PixiJS para 🦊 Koda) para verificar la pedagogía y la experiencia de usuario de escritorio.

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
│  │   ├── Cliente Wasm: wasmoon (Lua), Pyodide (Python), Workers (JS)         │
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

## 🗺️ Mapa Curricular Oficial (Lua)

### 📘 Módulo 01: Fundamentos de Lua (`LUA_MOD_01`) — 90 Lecciones
Estructurado en **9 secciones × 10 micro-lecciones** con 90 ejercicios interactivos:

| Sección | Título Didáctico | Lecciones | Enfoque Pedagógico |
|---|---|:---:|---|
| **S01** | ¿Qué es Lua y dónde se usa? | 10 | Introducción, origen, ligereza (<300 KB), Roblox y booleanos |
| **S02** | Cómo se organiza y prueba tu código | 10 | Chunks, instrucciones, REPL interactivo y salida |
| **S03** | Tu primer print | 10 | Textos, comillas simples/dobles, números y comas |
| **S04** | Comentarios | 10 | Buenas prácticas, inline `--`, multilínea `--[[ ]]` y depuración |
| **S05** | Archivos .lua | 10 | Persistencia en disco, editores, `main.lua` y atajos |
| **S06** | Ejecutar código | 10 | Terminal, `lua main.lua`, bloques de código y palabra clave `end` |
| **S07** | Palabras reservadas y estilo limpio | 10 | Las 21 palabras reservadas, identificadores y nombres válidos |
| **S08** | Kit para entender errores | 10 | Lectura de tracebacks, errores de sintaxis vs runtime y debug |
| **S09** | Checkpoint y Proyecto Integrador | 10 | Repaso activo, script integrador y graduación al M02 |

---

### 📗 Módulo 02: Variables y Tipos de Datos (`LUA_MOD_02`) — 100 Lecciones
Estructurado en **10 secciones × 10 micro-lecciones** con 100 ejercicios y 20 preguntas de examen:

| Sección | Título Didáctico | Lecciones | Enfoque Pedagógico |
|---|---|:---:|---|
| **S01** | ¿Qué es una variable y cómo guardar? | 10 | Asignación pura sin `local` para principiantes absolutos |
| **S02** | Reasignación y cambio de valores | 10 | Contadores acumulativos, reducción y tipado dinámico |
| **S03** | El sistema de tipos y type() | 10 | Los 8 tipos nativos y la función inspectora `type()` |
| **S04** | El tipo number: Enteros y decimales | 10 | Enteros de 64 bits, decimales, división `//`, módulo `%` y potencia `^` |
| **S05** | El tipo string: Textos y bloques | 10 | Cadenas, escapes `\n \t`, multilínea `[[ ]]` y longitud `#` |
| **S06** | El tipo boolean: Lógica de la verdad | 10 | `true`/`false`, regla de falsy (`false`/`nil`), `not` y doble negación |
| **S07** | El tipo nil y la llegada de local | 10 | Ausencia de valor y el uso de `local` para proteger el scope |
| **S08** | Conversión de tipos y Coerción | 10 | `tostring()`, `tonumber()` y diferencia entre `+` y concatenar `..` |
| **S09** | Vistazo a los 4 tipos avanzados | 10 | `table`, `function`, `thread` y `userdata` |
| **S10** | Checkpoint y Proyecto RPG | 10 | Proyecto Ficha de Héroe RPG y graduación hacia el Módulo 03 |

---

## 💻 Entorno de Pruebas y Prototipado Local (Sandbox)

El repositorio incluye visores interactivos de escritorio ([`test_m01.html`](test_m01.html) y [`test_m02.html`](test_m02.html)) construidos para probar de forma inmediata la pedagogía y la experiencia visual:

```
┌─────────────────┬────────────────────────────────────────────────────────────────────────┐
│     🦊 KODA     │ 🧭 Lua › Módulo 01 › Sección 02: Tu primer print  [ 50 XP ] [ 🔥 3 ]  │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 🗺️ Ruta         │ ┌── STEPPER DE SECCIÓN ──────────────────────────────────────────────┐ │
│ 📖 Lección (*)  │ │ S02: Tu primer print │ [✓] [✓] [✓] [●] [5] [6] [7] [8] [9] [10]   │ │
│ 📓 Cuaderno     │ └────────────────────────────────────────────────────────────────────┘ │
│ 🏆 Logros       │ ┌───────────────────────────────┐ ┌──────────────────────────────────┐ │
│ 📜 Certificados │ │ 📖 TEORÍA & CÓDIGO (Izq 50%)  │ │ 🧠 DESAFÍO INTERACTIVO (Der 50%) │ │
│                 │ │ • Micro-explicación paso a paso│ │ • Enunciado claro y sin spoilers │ │
│ [🦊 Koda WebGL] │ │ • Editor con sintaxis Lua     │ │ • [A] Opción 1       (tecla 1)   │ │
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
├── content/                            # Contenido pedagógico declarativo desacoplado
│   └── languages/
│       └── lua/
│           ├── config/
│           │   └── thresholds.json     # Umbrales, XP y reglas de estrellas
│           └── modules/
│               ├── 01_fundamentos/     # 90 lecciones atómicas + banco
│               │   ├── module.json
│               │   └── bank.json
│               └── 02_variables/       # 100 lecciones atómicas + banco
│                   ├── module.json
│                   └── bank.json
├── docs/                               # 29 especificaciones técnicas completas
│   ├── 01_PROJECT_OVERVIEW.md          # Visión general del producto y principios
│   ├── 11_SYSTEM_ARCHITECTURE.md       # Arquitectura técnica, motores y stack
│   ├── 12_DATABASE_DESIGN.md           # Modelo relacional Supabase v2.0.0
│   ├── 13_API_SPECIFICATION.md         # Especificación REST v2.0.0 (44 endpoints)
│   ├── 14_LEARNING_SYSTEM.md           # Máquinas de estado y lógica pedagógica
│   ├── 16_GAMIFICATION.md              # Economía de XP, rachas y estrellas
│   ├── 17_CERTIFICATION.md             # Motor de certificación y Google Drive
│   ├── 27_UI_UX_SPECIFICATION.md       # Sistema de diseño de interfaz
│   └── 28_LUA_CURRICULUM.md            # Currículo formativo oficial de Lua
├── test_m01.html                       # Sandbox interactivo del Módulo 01
├── test_m02.html                       # Sandbox interactivo del Módulo 02
├── CHANGELOG.md                        # Bitácora estricta de cambios (America/Bogota)
└── README.md                           # Documentación general del proyecto
```

---

## 🚀 Cómo Probar los Prototipos Localmente

Para abrir y experimentar con los visores interactivos sin necesidad de dependencias complejas:

### Opción 1: Con Live Server (Recomendado en VS Code)
1. Abre el proyecto en **Visual Studio Code**.
2. Haz clic derecho sobre [`test_m01.html`](test_m01.html) o [`test_m02.html`](test_m02.html) y selecciona **"Open with Live Server"**.

### Opción 2: Con Python
```bash
python3 -m http.server 8080
# Abre http://localhost:8080/test_m01.html en tu navegador
```

### Opción 3: Con Node.js
```bash
npx serve .
# Abre la URL que muestre la consola y selecciona el módulo a probar
```

---

## 🤝 Contribuciones y Colaboración

¡Las contribuciones y sugerencias son bienvenidas!
1. Para reportar dudas o inconsistencias pedagógicas, abre un [Issue](https://github.com/nastex123/DuolingoProgramacion/issues).
2. Para proponer mejoras a las especificaciones o al contenido declarativo, crea un Fork y envía un Pull Request siguiendo las guías de `docs/24_CONTENT_AUTHORING_GUIDE.md`.

---

## 📜 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
