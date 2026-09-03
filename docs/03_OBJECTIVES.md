# 03 — Objetivos

> Define QUÉ debe lograr el proyecto. El CÓMO se detalla en `11`–`14` y siguientes. Complementa a `01_PROJECT_OVERVIEW.md` y `02_PROBLEM_STATEMENT.md`.

---

## 1. Objetivo general

Construir una plataforma interactiva y gamificada que guíe a cualquier persona — desde principiante absoluto hasta profesional — en el aprendizaje progresivo de programación mediante rutas estructuradas por lenguaje, con práctica inmediata, evaluación continua y certificación verificable, reduciendo la fricción inicial y sosteniendo la motivación.

---

## 2. Objetivos específicos

| ID | Objetivo específico |
|---|---|
| OE-01 | Entregar un MVP funcional con Lua como primer lenguaje (ver `04_SCOPE.md`). |
| OE-02 | Implementar diagnóstico inicial que ubique al usuario en el punto correcto de la ruta. |
| OE-03 | Desacoplar contenido del motor para agregar lenguajes sin reescribir el núcleo. |
| OE-04 | Proveer evaluación en dos niveles: Quiz intermedio y Examen final por módulo. |
| OE-05 | Sostener la constancia mediante gamificación (XP, rachas, logros) y perfil de progreso. |
| OE-06 | Emitir certificados de finalización verificables y exportables a PDF. |
| OE-07 | Operar bajo modelo gratuito con publicidad + premium USD $1/mes sin anuncios. |
| OE-08 | Documentar completamente el sistema para que un desarrollador pueda implementarlo sin ambigüedad. |

---

## 3. Objetivos funcionales

Derivados de `05_FUNCTIONAL_REQUIREMENTS.md` (referencia, no duplicación):

- **Autenticación y perfil:** registro, login, recuperación, perfil con progreso por lenguaje.
- **Aprendizaje:** selección de lenguaje/nivel, ruta personalizada, módulos/secciones/lecciones, sesiones reanudables.
- **Evaluación:** banco de preguntas tipificadas, quizzes, exámenes, calificación automática, reintentos con repaso.
- **Progreso y gamificación:** registro de XP, niveles, rachas, logros y estadísticas.
- **Certificación:** generación, identificación única, PDF y verificación QR.
- **Monetización:** publicidad no intrusiva y suscripción premium.
- **Administración:** CRUD de contenido y publicación sin despliegue de código (ver `25_ADMIN_SYSTEM.md`).

---

## 4. Objetivos educativos

| ID | Objetivo educativo | Relacionado con |
|---|---|---|
| OED-01 | Presentar cada concepto en micro-bloques: explicación breve → ejemplo → ejercicio → feedback. | `01` §6, `14` |
| OED-02 | Garantizar práctica anclada: ninguna lección sin ejercicio asociado. | `01` §38 |
| OED-03 | Adaptar la ruta según nivel declarado + diagnóstico + historial de errores. | `02` §7, `14` |
| OED-04 | Reforzar memoria con repaso priorizado (errores, bajo rendimiento, antigüedad, prerrequisitos). | `01` §12, `14` |
| OED-05 | Validar comprensión con Quiz (≥70%) y dominio con Examen (≥80%), configurables. | `01` §15, `15` |
| OED-06 | Cubrir la ruta Lua (piloto) en el MVP. | `01` §34 |
| OED-07 | Permitir que el contenido sea creado por terceros sin romper coherencia pedagógica. | `23`, `24` |

---

## 5. Objetivos de experiencia de usuario (UX)

| ID | Objetivo UX | Criterio observable |
|---|---|---|
| OUX-01 | Onboarding < 3 minutos hasta la primera lección. | Tiempo registro → primera lección (analytics). |
| OUX-02 | Navegación siempre revela "dónde estoy" en la jerarquía Lenguaje→Módulo→Sección. | `10_INFORMATION_ARCHITECTURE.md` |
| OUX-03 | Feedback inmediato en cada ejercicio (< 1 s) con explicación del error. | `15_QUIZ_EXAM_SYSTEM.md` |
| OUX-04 | Sesión reanudable sin pérdida de avance. | Persistencia de sesión |
| OUX-05 | Progreso visual comprensible sin tutorial. | Test de usabilidad (ver `20_TESTING.md`) |
| OUX-06 | Accesibilidad WCAG 2.1 AA y responsive mobile-first. | `06_NON_FUNCTIONAL_REQUIREMENTS.md`, `27` |
| OUX-07 | Publicidad nunca interrumpe un ejercicio en curso; solo entre secciones. | `18_MONETIZATION.md` |

---

## 6. Objetivos técnicos

| ID | Objetivo técnico | Referencia |
|---|---|---|
| OT-01 | Arquitectura modular: Learning, Question, Evaluation, Progress, Gamification, Certification desacoplados. | `11` |
| OT-02 | Contenido independiente del código (formato declarativo versionado). | `23`, `11` § principio |
| OT-03 | Agregar un lenguaje = agregar contenido + config, sin tocar el motor. | `04`, `11` |
| OT-04 | API REST versionada, autenticada y documentada (OpenAPI). | `13` |
| OT-05 | Modelo de datos normalizado con trazabilidad de progreso por intento. | `12` |
| OT-06 | Seguridad: hash de contraseñas, tokens, validación, rate limiting, protección de datos personales. | `19` |
| OT-07 | Observabilidad: logs estructurados, métricas de negocio y técnicas, backups. | `21`, `26` |
| OT-08 | Estrategia de pruebas en pirámide (unit → integration → API → UI). | `20` |
| OT-09 | Despliegue por entornos (dev/staging/prod) con rollback. | `21` |

---

## 7. Criterios generales de cumplimiento

Un objetivo se considera cumplido solo si satisface **los tres** niveles:

### 7.1 Criterio funcional
- Requisitos `RF-*` asociados en `05` implementados y con tests que pasan (ver `20`).
- Casos de uso `UC-*` en `08` ejecutables end-to-end.

### 7.2 Criterio educativo
- Usuario principiante completa Módulo 1 sin ayuda externa (test con 5 usuarios nuevos).
- Usuario intermedio ubicado correctamente por diagnóstico en ≥80% de los casos (muestra de 20).
- Tasa de aprobación de Examen en primer intento entre 55% y 85% (ni trivial ni imposible).

### 7.3 Criterio de producto y negocio
- MVP desplegado con Lua completo (piloto) y certificado PDF verificable.
- Retención D7 ≥ 25% en cohorte de nuevos usuarios (ver `26_ANALYTICS.md`).
- Documentación `01`–`27` completa, sin contradicciones y con `CHANGELOG.md` al día.

> **No objetivo de esta fase:** editor/ejecución de código, rankings, modo offline y app nativa — quedan en roadmap (`22_ROADMAP.md`) y fuera de alcance MVP (`04_SCOPE.md`).
