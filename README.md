# 🌙 CodeQuest — Duolingo de Programación

> Plataforma educativa interactiva y gamificada para aprender a programar desde cero, diseñada sin asunciones previas, sin fricción y con micro-lecciones atómicas accesibles para cualquier persona.

[![Lua Version](https://img.shields.io/badge/Lua-5.4-blue.svg?logo=lua&logoColor=white)](https://www.lua.org)
[![Módulo 01](https://img.shields.io/badge/Módulo%2001-90%20Lecciones-success.svg)](content/languages/lua/modules/01_fundamentos/module.json)
[![Arquitectura](https://img.shields.io/badge/Frontend-Vanilla%20Desktop%20App-orange.svg)](test_m01.html)
[![Documentación](https://img.shields.io/badge/Docs-29%20Especificaciones-purple.svg)](docs/)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)

---

## 🎯 Visión y Filosofía Pedagógica

La mayoría de cursos y plataformas de programación asumen conocimientos previos, usan jerga intimidante o presentan muros de texto que provocan abandono temprano. **CodeQuest** reimagina el aprendizaje de la programación adoptando los principios de diseño instruccional más avanzados:

- **Micro-Lecciones Atómicas:** Cada lección tiene entre 40 y 70 palabras en segunda persona (*"tú"*), estructurada en un máximo de 3 pasos lógicos.
- **Un Concepto, Una Lección, Una Práctica Obligatoria:** Cada lección enseña una única idea atómica y la evalúa de inmediato con un ejercicio interactivo.
- **Sin Bloqueo Cognitivo:** Cero jerga críptica sin explicar. Los conceptos abstractos (como *chunks*, *tracebacks* o *REPL*) se introducen mediante analogías cotidianas y visuales.
- **Gamificación Formativa y No Punitiva:** Sistema de experiencia (+10 XP por sección, +5 XP por ejercicio), niveles dinámicos, rachas de estudio y retroalimentación que orienta con pistas en lugar de castigar el error.

---

## 🗺️ Currículo Oficial: Módulo 01 — Fundamentos de Lua

El **Módulo 01** (`LUA_MOD_01`) establece los cimientos lógicos y operativos en **90 lecciones atómicas** distribuidas equitativamente en 9 secciones (10 lecciones por sección):

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MÓDULO 01: FUNDAMENTOS DE LUA (90 LECCIONES)                 │
├─────────┬──────────────────────────────────────────┬───────────┬────────────────┤
│ Sección │ Título Didáctico                         │ Lecciones │ Enfoque        │
├─────────┼──────────────────────────────────────────┼───────────┼────────────────┤
│ S01     │ ¿Qué es Lua y dónde se usa?              │ 10        │ Teoría / Intro │
│ S02     │ Cómo se organiza y prueba tu código      │ 10        │ Chunk y REPL   │
│ S03     │ Tu primer print                          │ 10        │ Salida y Texto │
│ S04     │ Comentarios                              │ 10        │ Documentación  │
│ S05     │ Archivos .lua                            │ 10        │ Persistencia   │
│ S06     │ Ejecutar código                          │ 10        │ Terminal & End │
│ S07     │ Palabras reservadas y estilo limpio      │ 10        │ Sintaxis       │
│ S08     │ Kit para entender errores                │ 10        │ Diagnóstico    │
│ S09     │ Checkpoint y Proyecto Integrador         │ 10        │ Graduación     │
└─────────┴──────────────────────────────────────────┴───────────┴────────────────┘
```

### Detalle de Secciones:
1. **S01 — ¿Qué es Lua y dónde se usa?** Concepto de lenguaje, origen en Brasil (1993), ligereza (<300 KB), presencia en Roblox y World of Warcraft, lenguajes incrustados, servidores de alta velocidad (NGINX/Cloudflare), índices que inician en 1 y evaluación booleana (`false` y `nil`).
2. **S02 — Cómo se organiza y prueba tu código:** Instrucciones, ejecución secuencial, qué es un *chunk*, consola interactiva REPL, comando `lua -i`, prompt de espera `>`, cálculo en vivo y cierre con `os.exit()`.
3. **S03 — Tu primer print:** Salida en pantalla, paréntesis obligatorios `()`, saludo canónico `"¡Hola, mundo!"`, por qué usar comillas, comillas dobles `""` vs simples `''`, números directos, evaluación de operaciones matemáticas y comas como separadores automáticos.
4. **S04 — Comentarios:** Qué es un comentario, escribir para tu yo del futuro, dos guiones `--`, comentarios inline, bloques multilínea `--[[ ]]`, desactivación temporal de órdenes de prueba y mitos de rendimiento.
5. **S05 — Archivos .lua:** Persistencia en disco, extensión `.lua`, editores de código especializados vs procesadores de texto, archivo canónico `main.lua`, reflejo de guardado `Ctrl + S`, estructura de carpetas y buenas prácticas de nomenclatura.
6. **S06 — Ejecutar código:** Navegación en terminal, comando `lua main.lua`, compilación a bytecode en milisegundos, lectura de salidas, ejecución de scripts modulares, estructura de bloques con la palabra clave obligatoria `end` y resolución del error `'end' expected`.
7. **S07 — Palabras reservadas y estilo limpio:** Las 21 palabras reservadas de Lua, identificadores prohibidos (`local`, `if`, `while`), reglas de nombres válidos, prohibición de iniciar con dígitos, indentación visual de 2 espacios, punto y coma `;` opcional y sensibilidad a mayúsculas (*case-sensitive*).
8. **S08 — Kit para entender errores:** Pérdida del miedo al error, lectura del *traceback*, anatomía del mensaje (`archivo:línea:motivo`), errores de sintaxis vs tiempo de ejecución (*runtime*), desmitificación de `attempt to index a nil value`, aislamiento mediante comentarios y depuración con `print`.
9. **S09 — Checkpoint y Proyecto Integrador:** Mapa mental de los 8 pilares, 7 repasos activos progresivos, reto práctico de script firmado y graduación formal hacia el Módulo 02.

---

## 💻 Arquitectura de la Aplicación de Escritorio (`test_m01.html`)

El proyecto incluye un entorno standalone interactivo con **arquitectura completa de aplicación web de escritorio**:

```
┌─────────────────┬────────────────────────────────────────────────────────────────────────┐
│  CODEQUEST LUA  │ 🧭 Biblioteca › Sección 01 › Lección 1 de 10      [ 0 XP ] [ 0 🔥 ] [🌙] │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 🗺️ Ruta         │ ┌── BARRA DE SECCIÓN ────────────────────────────────────────────────┐ │
│ 📖 Lección (*)  │ │ S01: ¿Qué es Lua?  │ [1] [2] [3] [4] [5] [6] [7] [8] [9] [10] │ ←/→ │ │
│ 🧩 Quiz         │ └────────────────────────────────────────────────────────────────────┘ │
│ 👤 Perfil       │ ┌───────────────────────────────┐ ┌──────────────────────────────────┐ │
│                 │ │ 📖 TEORÍA & CÓDIGO (Izq 50%)  │ │ 🧠 PRÁCTICA & RETO (Der 50%)     │ │
│                 │ │ • Título de la lección        │ │ • Enunciado claro                │ │
│                 │ │ • Explicación paso a paso     │ │ • [A] Opción 1       (tecla 1)   │ │
│                 │ │ • Editor main.lua con colores │ │ • [B] Opción 2       (tecla 2)   │ │
│                 │ │ • Consola ▶ Salida en Pantalla│ │ • [C] Opción 3       (tecla 3)   │ │
│                 │ │ • Nota didáctica              │ │ • [D] Opción 4       (tecla 4)   │ │
│                 │ │                               │ │ • Feedback / Pista inteligente   │ │
│                 │ │                               │ │ • [Siguiente Lección →]          │ │
│                 │ └───────────────────────────────┘ └──────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Características de la Experiencia Desktop:
- **Barra Lateral Nativa Fija (260px):** Navegación persistente anclada al borde izquierdo entre Ruta, Lección, Quiz y Perfil.
- **Espacio de Trabajo Dividido (Split-Screen 50% / 50%):** Teoría y código a la izquierda; práctica interactiva y retroalimentación a la derecha. Sin necesidad de desplazamientos verticales para recordar conceptos.
- **Stepper Superior de 10 Lecciones:** Píldoras numeradas que indican lección activa, lecciones aprobadas (`✓`) y botones directos de navegación (`← Anterior` y `Siguiente →`).
- **Atajos de Teclado Ergonomizados:** Teclas `1`-`4` o `A`-`D` para seleccionar opciones, `Enter` para enviar respuestas y flechas `←` / `→` para transicionar entre lecciones.
- **Tema Oscuro Inteligente (*Dark Mode*):** Paleta en tonos pizarra (`#0B0F19`, `#151D2E`, `#243048`, `#3B82F6`) con contraste balanceado.
- **Compatibilidad Móvil Fluida:** Transición automática a barra inferior en pantallas con ancho menor a 820px.

---

## 📂 Estructura del Repositorio

```
duolingo-de-programacion/
├── content/
│   └── languages/
│       └── lua/
│           └── modules/
│               └── 01_fundamentos/
│                   ├── module.json      # Declaración de las 90 lecciones y 90 ejercicios
│                   └── bank.json        # Banco de preguntas del examen de certificación
├── docs/                               # 29 especificaciones técnicas completas
│   ├── 01_PROJECT_OVERVIEW.md          # Visión general del producto
│   ├── 16_GAMIFICATION.md              # Economía de XP, rachas y niveles
│   ├── 24_CONTENT_AUTHORING_GUIDE.md   # Estándares pedagógicos de redacción
│   ├── 27_UI_UX_SPECIFICATION.md       # Guía de diseño de interfaz
│   └── 28_LUA_CURRICULUM.md            # Mapeo curricular oficial (v1.2.0)
├── test_m01.html                       # Visor interactivo standalone para escritorio y móvil
├── CHANGELOG.md                        # Bitácora estricta de cambios con zona America/Bogota
└── README.md                           # Documentación principal del proyecto
```

---

## 🚀 Cómo Probar el Proyecto Localmente

No se requieren gestores de paquetes pesados ni configuraciones complejas para ejecutar el visor:

### Opción 1: Con Live Server (Recomendada en VS Code)
1. Abre el repositorio en [Visual Studio Code](https://code.visualstudio.com/).
2. Haz clic derecho sobre [`test_m01.html`](test_m01.html) y selecciona **"Open with Live Server"**.
3. El visor se abrirá en `http://127.0.0.1:5500/test_m01.html`.

### Opción 2: Con Python
```bash
python -m http.server 8080
# Abre http://localhost:8080/test_m01.html en tu navegador
```

### Opción 3: Con Node.js
```bash
npx serve .
# Abre la URL que muestre la consola y selecciona test_m01.html
```

### Opción 4: Directo en Navegador
Haz doble clic sobre el archivo [`test_m01.html`](test_m01.html) para abrirlo directamente en Google Chrome, Brave, Firefox, Edge o Safari.

---

## 🤝 Cómo Colaborar

¡Las contribuciones de la comunidad son bienvenidas!

1. **Añadir preguntas o reportar desajustes:** Abre un [Issue](https://github.com/nastex123/DuolingoProgramacion/issues) detallando el módulo o lección.
2. **Proponer cambios vía Pull Request:**
   - Haz un **Fork** del repositorio.
   - Crea una rama descriptiva: `git checkout -b feature/nueva-seccion`.
   - Realiza tus cambios asegurando respetar la regla pedagógica de micro-lecciones.
   - Envía un **Pull Request**.
3. **Colaboración directa con acceso push:** Solicita una invitación directa al repositorio mediante GitHub Collaborators.

---

## 📜 Licencia

Distribuido bajo la Licencia **MIT**. Consulta `LICENSE` para más información.