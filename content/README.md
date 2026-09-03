# 📖 Contenido Pedagógico Declarativo Desacoplado — Koda 🦊

> Este directorio alberga todo el material educativo de Koda en formato puramente declarativo (JSON), desacoplado al 100% de la lógica de programación del motor (`RNF-006`).

---

## 📂 Estructura Jerárquica

```
content/
└── languages/
    └── {slug}/                          # ej. lua, python, javascript
        ├── manifest.json                # Metadatos del curso, versión y lista de módulos
        ├── config/
        │   ├── thresholds.json          # Umbrales mínimos de aprobación (% quiz y examen)
        │   ├── xp.json                  # Economía de XP por sección, ejercicio y examen
        │   └── compositions.json        # Distribución de tipos de pregunta por evaluación
        └── modules/
            ├── 01_fundamentos/          # Directorio de módulo
            │   ├── module.json          # 10 secciones x 10 lecciones con teoría y código
            │   └── bank.json            # Banco de preguntas para quizzes y exámenes
            └── 02_variables/
                ├── module.json
                └── bank.json
```

---

## ✍️ Reglas para Creadores de Contenido

Toda lección y ejercicio añadido a este directorio debe apegarse estrictamente a:

1. [`docs/23_CONTENT_SPECIFICATION.md`](../docs/23_CONTENT_SPECIFICATION.md): Estructura técnica de esquemas y validaciones.
2. [`docs/24_CONTENT_AUTHORING_GUIDE.md`](../docs/24_CONTENT_AUTHORING_GUIDE.md): Guía pedagógica oficial.
   - **Longitud de lección:** 40 a 70 palabras en segunda persona (*"tú"*).
   - **Un concepto por lección:** Introducido con analogías cotidianas y evaluado inmediatamente.
   - **Feedback sin spoilers:** La pista inteligente orienta, pero jamás revela la respuesta correcta.

---

## 🔍 Cursos Disponibles

- **Lua 5.4 (`languages/lua/`):**
  - **Módulo 01:** *Fundamentos de Lua* — 90 lecciones atómicas (9 secciones × 10 lecciones).
  - **Módulo 02:** *Variables y Tipos de Datos* — 100 lecciones atómicas (10 secciones × 10 lecciones) + 20 preguntas de examen.
