# 05 — Requisitos Funcionales

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-29
> Complementa a `01_PROJECT_OVERVIEW.md`, `02_PROBLEM_STATEMENT.md`, `03_OBJECTIVES.md` y `04_SCOPE.md`. No duplica su contenido; lo referencia. El detalle de arquitectura, modelo de datos y flujos se reserva para `11`–`17`, `23` y `25`.

---

## 1. Propósito y alcance

Este documento especifica **qué debe hacer el sistema**, no cómo se implementa. Constituye la línea base para diseño (`11`–`14`), casos de uso (`08`), historias de usuario (`07`), pruebas (`20`) y criterios de aceptación del MVP.

**Fuera del alcance de este documento:** requisitos no funcionales (ver `06`), decisiones de tecnología concreta (ver `09-decisions/` y `11`), y priorización temporal fina (ver `22_ROADMAP.md`).

---

## 2. Convenciones

### 2.1 Formato de ID

`RF-{DOMINIO}-{NNN}` — dominio de 3–5 letras en mayúsculas, numeración correlativa con ceros. Ej.: `RF-AUTH-001`.

### 2.2 Atributos por requisito

| Columna | Valores |
|---|---|
| **Prioridad** | `Must` (imprescindible) / `Should` (deseable, no bloquea MVP si se difiere) |
| **Depende de** | IDs de requisitos previos o `—` si no tiene dependencia funcional directa |
| **Entrega** | `MVP` (Fase 1, ver `04` §2) / `Post-MVP` (roadmap, ver `04` §3) |
| **Trazabilidad UC** | IDs de casos de uso en `08_USE_CASES.md` (cuando `08` exista, cada RF debe mapear a ≥1 UC; aquí se propone el mapeo previsto) |

### 2.3 Prioridad vs. entrega

- `Must + MVP` = bloquea la aceptación del MVP si falta.
- `Should + MVP` = incluido en MVP salvo restricción justificada con ADR y actualización de `04`.
- `Must/Should + Post-MVP` = diseñado para no bloquear el MVP (extensible en `11`), pero no implementado en Fase 1.

### 2.4 Referencias cruzadas

Cuando un requisito materializa un elemento de `01`, se indica entre paréntesis (ej.: `01 §5 paso 4`). No se repite la descripción de `01`; se especifica el comportamiento verificable.

---

## 3. Mapa de dominios

| Dominio | Prefijo | Requisitos | Entrega principal |
|---|---|---|---|
| Autenticación | `RF-AUTH` | 8 | MVP |
| Usuarios | `RF-USR` | 6 | MVP |
| Perfil | `RF-PROF` | 7 | MVP |
| Lenguajes | `RF-LANG` | 5 | MVP (solo Python con contenido; arquitectura multi-lenguaje desde MVP) |
| Niveles | `RF-LVL` | 4 | MVP |
| Diagnóstico | `RF-DIAG` | 6 | MVP |
| Rutas | `RF-RUTA` | 5 | MVP |
| Módulos | `RF-MOD` | 5 | MVP |
| Secciones | `RF-SEC` | 5 | MVP |
| Lecciones | `RF-LEC` | 5 | MVP |
| Preguntas | `RF-PREG` | 7 | MVP |
| Quizzes | `RF-QUIZ` | 6 | MVP |
| Exámenes | `RF-EXAM` | 7 | MVP |
| Evaluación | `RF-EVAL` | 6 | MVP |
| Progreso | `RF-PROG` | 6 | MVP |
| XP / Puntos | `RF-XP` | 5 | MVP |
| Rachas | `RF-RACHA` | 5 | MVP |
| Logros | `RF-LOGRO` | 5 | MVP |
| Repaso | `RF-REP` | 5 | MVP |
| Certificados | `RF-CERT` | 6 | MVP |
| PDF | `RF-PDF` | 4 | MVP |
| Publicidad | `RF-ADS` | 5 | MVP |
| Premium | `RF-PREM` | 6 | MVP |
| Administración del contenido | `RF-ADM` | 9 | MVP (mínimo CRUD + publicación; roles finos Post-MVP) |

> Total base: **128 requisitos**. Todo nuevo requisito debe mapear a un `RF-*` y a un `UC-*` en `08` (criterio anti-scope-creep de `04` §10).

---

## 4. Requisitos por dominio

### 4.1 Autenticación (`RF-AUTH`) — ver `01` §5 pasos 1, `04` §2.1, `19_SECURITY.md`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-AUTH-001 | El sistema debe permitir registro con email y contraseña, validando formato de email, fortaleza mínima de contraseña y unicidad de email. | Must | — | MVP | UC-AUTH-01 |
| RF-AUTH-002 | El sistema debe permitir inicio de sesión con email y contraseña, emitiendo token de sesión con expiración configurable y refresh. Sin asumir proveedor de identidad externo en MVP. | Must | RF-AUTH-001 | MVP | UC-AUTH-02 |
| RF-AUTH-003 | El sistema debe permitir cierre de sesión invalidando el token vigente en servidor. | Must | RF-AUTH-002 | MVP | UC-AUTH-02 |
| RF-AUTH-004 | El sistema debe ofrecer recuperación de contraseña vía email con token de un solo uso, expiración corta y límite de intentos. | Must | RF-AUTH-001 | MVP | UC-AUTH-03 |
| RF-AUTH-005 | El sistema debe enviar email de verificación al registrarse y exigir verificación antes de emitir certificado (no bloquea el aprendizaje inicial). | Must | RF-AUTH-001 | MVP | UC-AUTH-01 |
| RF-AUTH-006 | El sistema debe limitar intentos de login (rate limiting) y responder con mensaje genérico sin revelar si el email existe. | Must | RF-AUTH-002 | MVP | UC-AUTH-02 |
| RF-AUTH-007 | El sistema debe gestionar expiración y renovación de sesión sin obligar a re-login durante una lección activa (refresh silencioso). | Should | RF-AUTH-002 | MVP | UC-AUTH-02 |
| RF-AUTH-008 | El sistema debe registrar eventos de autenticación (registro, login, fallo, recuperación) con marca temporal para auditoría y soporte, sin almacenar contraseñas en claro. | Must | RF-AUTH-001, RF-AUTH-002 | MVP | UC-AUTH-04 |

### 4.2 Usuarios (`RF-USR`) — ver `01` §5, `04` §2.1, `12_DATABASE_DESIGN.md`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-USR-001 | El sistema debe crear la cuenta de usuario con datos mínimos (nombre visible, email, contraseña hasheada) y estado inicial activo. | Must | RF-AUTH-001 | MVP | UC-USR-01 |
| RF-USR-002 | El sistema debe permitir al usuario actualizar nombre visible y credenciales (cambio de contraseña exige contraseña actual). | Must | RF-USR-001 | MVP | UC-USR-02 |
| RF-USR-003 | El sistema debe permitir solicitar eliminación de cuenta y borrado/anomización de datos personales conforme a `19` y `06` (privacidad). Progreso y certificados se anonimizan, no se reutiliza el email sin confirmación. | Must | RF-USR-001 | MVP | UC-USR-03 |
| RF-USR-004 | El sistema debe gestionar estados de usuario (activo, bloqueado, pendiente de verificación) y bloquear acceso si está bloqueado. | Must | RF-USR-001 | MVP | UC-USR-04 |
| RF-USR-005 | El sistema debe aislar completamente los datos entre usuarios; un usuario nunca accede a progreso/certificados de otro sin autorización. | Must | RF-USR-001 | MVP | UC-USR-01 |
| RF-USR-006 | El sistema debe permitir al usuario consultar y exportar sus datos personales registrados (portabilidad básica). | Should | RF-USR-001 | MVP | UC-USR-03 |

### 4.3 Perfil (`RF-PROF`) — ver `01` §20, `16_GAMIFICATION.md`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-PROF-001 | El sistema debe mostrar el perfil propio con nombre, avatar, nivel derivado de XP, XP total, racha actual/máxima y lenguajes estudiados. | Must | RF-USR-001, RF-XP-002, RF-RACHA-003 | MVP | UC-PROF-01 |
| RF-PROF-002 | El sistema debe permitir subir/cambiar avatar con validación de formato y tamaño; avatar por defecto si no hay uno. | Should | RF-PROF-001 | MVP | UC-PROF-02 |
| RF-PROF-003 | El sistema debe mostrar progreso por lenguaje (módulos completados, % por lenguaje, módulo/sección actual). | Must | RF-PROG-002 | MVP | UC-PROF-01 |
| RF-PROF-004 | El sistema debe mostrar historial de logros obtenidos con fecha de desbloqueo. | Must | RF-LOGRO-002 | MVP | UC-PROF-03 |
| RF-PROF-005 | El sistema debe mostrar certificados obtenidos con ID, lenguaje, fecha y estado, con acceso a descarga PDF. | Must | RF-CERT-001 | MVP | UC-PROF-04 |
| RF-PROF-006 | El sistema debe mostrar estadísticas de aprendizaje: lecciones completadas, preguntas correctas/incorrectas, quizzes/exámenes realizados y puntuaciones. | Must | RF-PROG-001, RF-EVAL-003 | MVP | UC-PROF-01 |
| RF-PROF-007 | El sistema debe mostrar racha actual y máxima destacadas (ver `01` §18–§20). | Must | RF-RACHA-003 | MVP | UC-PROF-01 |

### 4.4 Lenguajes (`RF-LANG`) — ver `01` §7.1, §30–§31, `04` §2.2

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-LANG-001 | El sistema debe listar lenguajes disponibles con nombre, descripción, estado (disponible/próximamente) y orden. En MVP solo Python está disponible; el resto figura como próximamente sin acceso. | Must | — | MVP | UC-LANG-01 |
| RF-LANG-002 | El sistema debe permitir seleccionar un lenguaje activo; la selección determina la ruta, módulos y progreso visibles. | Must | RF-LANG-001, RF-USR-001 | MVP | UC-LANG-02 |
| RF-LANG-003 | El sistema debe permitir cambiar de lenguaje activo conservando el progreso de cada lenguaje por separado. | Must | RF-LANG-002 | MVP | UC-LANG-02 |
| RF-LANG-004 | El sistema debe permitir agregar un nuevo lenguaje agregando solo contenido y configuración, sin modificar el motor (principio de contenido independiente `01` §31, `23`). | Must | RF-ADM-001 | MVP | UC-ADM-01 |
| RF-LANG-005 | El sistema debe mantener progreso, XP, rachas y logros por lenguaje de forma independiente y agregada a nivel de cuenta. | Must | RF-LANG-002, RF-PROG-001 | MVP | UC-PROF-01 |

### 4.5 Niveles (`RF-LVL`) — ver `01` §8, `14_LEARNING_SYSTEM.md`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-LVL-001 | El sistema debe permitir declarar nivel inicial entre BEGINNER, MEDIUM, SEMI_PROFESSIONAL y PROFESSIONAL con descripciones de `01` §8. | Must | RF-LANG-002 | MVP | UC-LVL-01 |
| RF-LVL-002 | El sistema debe permitir modificar el nivel declarado antes de completar el diagnóstico inicial. | Should | RF-LVL-001 | MVP | UC-LVL-01 |
| RF-LVL-003 | El sistema debe registrar el nivel declarado y usarlo como entrada para la recomendación de punto de entrada junto al diagnóstico. | Must | RF-LVL-001, RF-DIAG-002 | MVP | UC-LVL-02 |
| RF-LVL-004 | El sistema debe bloquear cambios de nivel declarado una vez iniciado el aprendizaje efectivo, salvo re-diagnóstico explícito. | Should | RF-LVL-001, RF-DIAG-004 | MVP | UC-LVL-01 |

### 4.6 Diagnóstico (`RF-DIAG`) — ver `01` §8–§9, `04` §2.2, `14`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-DIAG-001 | El sistema debe ofrecer prueba diagnóstica por lenguaje con preguntas representativas de distintos módulos, sin asumir ejecución de código en MVP. | Must | RF-LVL-001, RF-PREG-001 | MVP | UC-DIAG-01 |
| RF-DIAG-002 | El sistema debe calificar el diagnóstico automáticamente y producir un puntaje por área temática. | Must | RF-DIAG-001, RF-EVAL-001 | MVP | UC-DIAG-02 |
| RF-DIAG-003 | El sistema debe recomendar el módulo/sección de inicio combinando nivel declarado y resultado del diagnóstico (ver `01` §9). La recomendación es sugerida, no impuesta; el usuario puede ajustarla dentro de límites pedagógicos. | Must | RF-DIAG-002, RF-RUTA-001 | MVP | UC-DIAG-02 |
| RF-DIAG-004 | El sistema debe permitir re-tomar el diagnóstico bajo demanda; el nuevo resultado no borra progreso ya validado por exámenes aprobados. | Should | RF-DIAG-002 | MVP | UC-DIAG-03 |
| RF-DIAG-005 | El sistema debe registrar el resultado del diagnóstico en el perfil y en el historial de progreso para trazabilidad. | Must | RF-DIAG-002 | MVP | UC-PROF-01 |
| RF-DIAG-006 | El sistema debe distinguir diagnóstico (ubicación) de exámenes de módulo (certificación de dominio); el diagnóstico nunca otorga aprobación de módulos. | Must | RF-DIAG-002, RF-EXAM-003 | MVP | UC-DIAG-02 |

### 4.7 Rutas (`RF-RUTA`) — ver `01` §5 pasos 5–6, §9, §25

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-RUTA-001 | El sistema debe generar una ruta de aprendizaje personalizada por usuario y lenguaje a partir de nivel + diagnóstico + historial. | Must | RF-DIAG-003, RF-MOD-001 | MVP | UC-RUTA-01 |
| RF-RUTA-002 | El sistema debe visualizar la ruta con módulos en orden canónico, estado (bloqueado/disponible/en progreso/aprobado) y % de avance. | Must | RF-RUTA-001, RF-MOD-003 | MVP | UC-RUTA-02 |
| RF-RUTA-003 | El sistema debe recalcular recomendaciones de repaso y siguiente contenido a partir de historial de errores y rendimiento (ver `01` §9 y `14`). | Must | RF-EVAL-004, RF-REP-002 | MVP | UC-RUTA-01 |
| RF-RUTA-004 | El sistema debe hacer cumplir prerrequisitos: un módulo no se desbloquea hasta aprobar el examen del anterior, salvo punto de entrada adaptativo validado por diagnóstico. | Must | RF-EXAM-003 | MVP | UC-RUTA-02 |
| RF-RUTA-005 | El sistema debe permitir al usuario reanudar la ruta exactamente donde la dejó (módulo/sección/lección/ejercicio) tras cerrar sesión o dispositivo. | Must | RF-LEC-002 | MVP | UC-RUTA-03 |

### 4.8 Módulos (`RF-MOD`) — ver `01` §7.2, §34, `23`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-MOD-001 | El sistema debe listar los módulos de un lenguaje en orden pedagógico configurado (MVP: 12 módulos Python de `01` §34). | Must | RF-LANG-002 | MVP | UC-MOD-01 |
| RF-MOD-002 | El sistema debe mostrar el detalle de un módulo: objetivo, secciones que lo componen, estado, requisitos y evaluaciones asociadas. | Must | RF-MOD-001 | MVP | UC-MOD-02 |
| RF-MOD-003 | El sistema debe gestionar el estado de cada módulo por usuario: bloqueado, disponible, en progreso, aprobado, reprobado. | Must | RF-RUTA-004, RF-EXAM-003 | MVP | UC-MOD-01 |
| RF-MOD-004 | El sistema debe permitir configurar el orden y contenido de módulos por lenguaje sin modificar código del motor (`23`). | Must | RF-ADM-001 | MVP | UC-ADM-02 |
| RF-MOD-005 | El sistema debe registrar fecha de inicio, última actividad y aprobación por módulo y usuario. | Must | RF-MOD-003 | MVP | UC-PROF-01 |

### 4.9 Secciones (`RF-SEC`) — ver `01` §7.3, §10

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-SEC-001 | El sistema debe listar las secciones de un módulo en orden, con título, estado y tipo (teoría/ejemplo/ejercicios/quiz). | Must | RF-MOD-001 | MVP | UC-SEC-01 |
| RF-SEC-002 | El sistema debe presentar cada sección con explicación breve, ejemplo y ejercicios asociados según el modelo `01` §6. | Must | RF-SEC-001, RF-LEC-001 | MVP | UC-SEC-02 |
| RF-SEC-003 | El sistema debe marcar una sección como completada solo cuando todas sus lecciones/ejercicios obligatorios estén finalizados. | Must | RF-LEC-001, RF-PREG-004 | MVP | UC-SEC-02 |
| RF-SEC-004 | El sistema debe mantener navegación jerárquica visible (Lenguaje → Módulo → Sección → Lección) en todo momento. | Must | RF-SEC-001 | MVP | UC-SEC-01 |
| RF-SEC-005 | El sistema debe registrar el tiempo dedicado por sección (solo métrica interna para `26_ANALYTICS.md`, no ranking en MVP). | Should | RF-SEC-003 | MVP | UC-SEC-02 |

### 4.10 Lecciones (`RF-LEC`) — ver `01` §6, §10, §38

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-LEC-001 | El sistema debe entregar cada lección siguiendo el flujo concepto → explicación → ejemplo → ejercicio → retroalimentación → recompensa. | Must | RF-SEC-002, RF-PREG-003 | MVP | UC-LEC-01 |
| RF-LEC-002 | El sistema debe hacer que toda sesión sea reanudable: al abandonar y volver, el usuario retoma en el mismo punto sin pérdida de avance. | Must | RF-PROG-001 | MVP | UC-LEC-02 |
| RF-LEC-003 | El sistema debe persistir el progreso intra-lección por ejercicio/pregunta de forma atómica (cada respuesta guarda su intento). | Must | RF-PROG-001 | MVP | UC-LEC-01 |
| RF-LEC-004 | El sistema debe validar prerrequisitos de lección (lecciones previas completadas o punto de entrada adaptativo). | Must | RF-RUTA-004 | MVP | UC-LEC-01 |
| RF-LEC-005 | El sistema debe permitir revisar lecciones ya completadas sin penalización ni pérdida de progreso. | Should | RF-LEC-001 | MVP | UC-LEC-03 |

### 4.11 Preguntas (`RF-PREG`) — ver `01` §11, `04` §2.3, `15`, `23`, `24`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-PREG-001 | El sistema debe soportar el banco de preguntas tipificadas: selección múltiple, verdadero/falso, completar código/línea, predecir output, identificar errores, ordenar líneas, seleccionar código correcto, relacionar conceptos, escribir código (evaluado por completado/orden/selección en MVP, sin ejecución), resolver pequeños problemas. | Must | — | MVP | UC-PREG-01 |
| RF-PREG-002 | El sistema debe almacenar cada pregunta con metadatos: lenguaje, módulo, sección, lección, tipo, dificultad, categoría, respuestas válidas, explicación y puntaje. | Must | RF-PREG-001 | MVP | UC-ADM-03 |
| RF-PREG-003 | El sistema debe entregar preguntas ancladas al contenido de la lección/sección actual (no aleatorias globales). | Must | RF-PREG-001, RF-LEC-001 | MVP | UC-LEC-01 |
| RF-PREG-004 | El sistema debe validar la respuesta inmediatamente, indicar acierto/error, mostrar explicación y otorgar XP/puntos según configuración. | Must | RF-PREG-001, RF-EVAL-001 | MVP | UC-LEC-01 |
| RF-PREG-005 | El sistema debe registrar cada intento de pregunta con usuario, pregunta, respuesta dada, resultado y marca temporal para historial y repaso. | Must | RF-PREG-004 | MVP | UC-PREG-02 |
| RF-PREG-006 | El sistema debe permitir versionado de preguntas: editar crea nueva versión sin alterar intentos históricos. | Must | RF-ADM-002 | MVP | UC-ADM-03 |
| RF-PREG-007 | El sistema debe permitir mezclar/aleatorizar orden de opciones donde aplique, manteniendo la respuesta correcta trazable. | Should | RF-PREG-001 | MVP | UC-PREG-01 |

### 4.12 Quizzes (`RF-QUIZ`) — ver `01` §13, §15, `15`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-QUIZ-001 | El sistema debe generar al menos un quiz por módulo con preguntas del módulo actual, según composición configurable por `23`/`25`. | Must | RF-PREG-001, RF-MOD-001 | MVP | UC-QUIZ-01 |
| RF-QUIZ-002 | El sistema debe presentar el quiz como intento evaluable con navegación entre preguntas, envío único y confirmación. | Must | RF-QUIZ-001 | MVP | UC-QUIZ-02 |
| RF-QUIZ-003 | El sistema debe calificar el quiz automáticamente y determinar aprobación con umbral configurable (inicial 70% `01` §15). | Must | RF-QUIZ-002, RF-EVAL-001 | MVP | UC-QUIZ-02 |
| RF-QUIZ-004 | El sistema debe mostrar revisión de errores tras el quiz: pregunta, respuesta dada, correcta y explicación, sin revelar banco completo. | Must | RF-QUIZ-003 | MVP | UC-QUIZ-03 |
| RF-QUIZ-005 | El sistema debe permitir reintentar el quiz tras repasar errores; cada intento se registra y la mejor nota no oculta el historial. | Must | RF-QUIZ-003 | MVP | UC-QUIZ-04 |
| RF-QUIZ-006 | El sistema debe otorgar XP por completar quiz y bonificación por aprobación según `01` §17 (valores configurables). | Must | RF-QUIZ-003, RF-XP-001 | MVP | UC-QUIZ-02 |

### 4.13 Exámenes (`RF-EXAM`) — ver `01` §14–§15, `15`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-EXAM-001 | El sistema debe generar un examen final por módulo que evalúe todo el módulo. | Must | RF-PREG-001, RF-MOD-001 | MVP | UC-EXAM-01 |
| RF-EXAM-002 | El sistema debe componer el examen con distribución configurable por tipo de pregunta (ej. inicial `01` §14: 5 múltiple, 5 predicción, 3 completar, 2 detectar errores, 5 V/F). | Must | RF-EXAM-001 | MVP | UC-EXAM-01 |
| RF-EXAM-003 | El sistema debe calificar el examen automáticamente y determinar aprobación con umbral configurable (inicial 80% `01` §15). | Must | RF-EXAM-001, RF-EVAL-001 | MVP | UC-EXAM-02 |
| RF-EXAM-004 | El sistema debe bloquear el avance al siguiente módulo si el examen no es aprobado, ofreciendo revisión de errores y repaso. | Must | RF-EXAM-003, RF-RUTA-004 | MVP | UC-EXAM-03 |
| RF-EXAM-005 | El sistema debe permitir reintentos ilimitados de examen registrando cada intento; el desbloqueo exige un intento aprobado, no promedio. | Must | RF-EXAM-003 | MVP | UC-EXAM-04 |
| RF-EXAM-006 | El sistema debe mostrar revisión detallada tras el examen con desglose por tipo de pregunta y conceptos con bajo rendimiento. | Must | RF-EXAM-003, RF-EVAL-004 | MVP | UC-EXAM-03 |
| RF-EXAM-007 | El sistema debe otorgar XP por aprobar examen según `01` §17 (valores configurables) y marcar el módulo como aprobado. | Must | RF-EXAM-003, RF-XP-001 | MVP | UC-EXAM-02 |

### 4.14 Evaluación (`RF-EVAL`) — ver `01` §27, `15`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-EVAL-001 | El sistema debe implementar un motor de evaluación que calcule puntuaciones, porcentajes y aciertos/errores de forma determinista y auditable. | Must | RF-PREG-001 | MVP | UC-EVAL-01 |
| RF-EVAL-002 | El sistema debe producir por cada intento: puntaje total, porcentaje, detalle por pregunta y resultado de aprobación según umbral vigente al momento del intento. | Must | RF-EVAL-001 | MVP | UC-EVAL-01 |
| RF-EVAL-003 | El sistema debe registrar cada intento de quiz/examen con usuario, módulo, puntaje, % , umbral aplicado, fecha y versión de contenido evaluado. | Must | RF-EVAL-002 | MVP | UC-EVAL-02 |
| RF-EVAL-004 | El sistema debe identificar conceptos/temas con bajo rendimiento por usuario y exponerlos para repaso y adaptación de ruta. | Must | RF-EVAL-003 | MVP | UC-EVAL-03 |
| RF-EVAL-005 | El sistema debe versionar umbrales (70/80 iniciales) y aplicar el vigente al calificar, conservando el umbral histórico por intento. | Must | RF-EVAL-001 | MVP | UC-ADM-04 |
| RF-EVAL-006 | El sistema debe garantizar que la calificación no depende de estado del cliente; toda decisión de aprobación se toma en servidor. | Must | RF-EVAL-001 | MVP | UC-EVAL-01 |

### 4.15 Progreso (`RF-PROG`) — ver `01` §16, `04` §2.4, `16`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-PROG-001 | El sistema debe registrar progreso atómico por usuario: lenguaje, módulo, sección, lección, pregunta/intento, con marca temporal. | Must | RF-LEC-003, RF-PREG-005 | MVP | UC-PROG-01 |
| RF-PROG-002 | El sistema debe permitir consultar progreso agregado por lenguaje y por módulo (completadas/total, % , estado). | Must | RF-PROG-001 | MVP | UC-PROF-01 |
| RF-PROG-003 | El sistema debe visualizar el progreso con barras/indicadores comprensibles sin tutorial (ver `03` OUX-05). | Must | RF-PROG-002 | MVP | UC-PROF-01 |
| RF-PROG-004 | El sistema debe conservar el progreso ante cierre de sesión, cambio de dispositivo o pérdida de conexión (persistencia en servidor). | Must | RF-PROG-001 | MVP | UC-LEC-02 |
| RF-PROG-005 | El sistema debe exponer historial filtrable de lecciones, preguntas, quizzes y exámenes por usuario y lenguaje. | Should | RF-PROG-001 | MVP | UC-PROF-01 |
| RF-PROG-006 | El sistema debe exportar internamente métricas de progreso para `26_ANALYTICS.md` sin exponer datos de otros usuarios. | Must | RF-PROG-001 | MVP | UC-PROG-02 |

### 4.16 XP / Puntos (`RF-XP`) — ver `01` §17, `28`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-XP-001 | El sistema debe otorgar XP por acciones configurables (completar sección +10, ejercicio correcto +5, quiz +25, examen +100, módulo +150 como valores iniciales `01` §17). | Must | RF-EVAL-001 | MVP | UC-GAM-01 |
| RF-XP-002 | El sistema debe calcular el nivel del usuario a partir de XP acumulada con curva configurable y determinista. | Must | RF-XP-001 | MVP | UC-GAM-01 |
| RF-XP-003 | El sistema debe registrar historial de XP por evento (acción, XP otorgada, referencia a lección/quiz/examen, fecha). | Must | RF-XP-001 | MVP | UC-GAM-02 |
| RF-XP-004 | El sistema debe hacer que los valores de XP sean configurables sin despliegue de código (vía `25` o configuración versionada). | Must | RF-ADM-001 | MVP | UC-ADM-04 |
| RF-XP-005 | El sistema debe garantizar que la XP solo se otorga por acciones validadas en servidor; reintentos indebidos no duplican XP fuera de regla. | Must | RF-XP-001, RF-EVAL-006 | MVP | UC-GAM-01 |

### 4.17 Rachas (`RF-RACHA`) — ver `01` §18, `16`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-RACHA-001 | El sistema debe incrementar la racha en 1 por cada día calendario con al menos una actividad educativa válida (lección/quiz/examen/repaso). | Must | RF-PROG-001 | MVP | UC-GAM-03 |
| RF-RACHA-002 | El sistema debe reiniciar la racha a 0 si un día calendario no registra actividad, con ventana de gracia configurable (ej. zona horaria del usuario). | Must | RF-RACHA-001 | MVP | UC-GAM-03 |
| RF-RACHA-003 | El sistema debe exponer racha actual y racha máxima histórica por usuario. | Must | RF-RACHA-001 | MVP | UC-PROF-01 |
| RF-RACHA-004 | El sistema debe resolver la fecha de racha con zona horaria explícita del usuario y documentar la regla de corte diario. | Must | RF-RACHA-001 | MVP | UC-GAM-03 |
| RF-RACHA-005 | El sistema debe registrar el historial diario de actividad para auditoría de rachas. | Must | RF-RACHA-001 | MVP | UC-GAM-03 |

### 4.18 Logros (`RF-LOGRO`) — ver `01` §19, `16`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-LOGRO-001 | El sistema debe mantener un catálogo de logros con ID, nombre, descripción, icono y condición verificable (ej. FIRST CODE, FIRST MODULE, ON FIRE 7 días, PERFECT SCORE, PYTHON BEGINNER, CODE MASTER, MULTI LANGUAGE `01` §19). | Must | — | MVP | UC-GAM-04 |
| RF-LOGRO-002 | El sistema debe desbloquear logros automáticamente al cumplirse la condición, sin acción manual del usuario, y registrar fecha de desbloqueo. | Must | RF-LOGRO-001, RF-PROG-001 | MVP | UC-GAM-04 |
| RF-LOGRO-003 | El sistema debe mostrar logros obtenidos y pendientes (solo descriptivos, sin spoilers sensibles) en el perfil. | Must | RF-LOGRO-002 | MVP | UC-PROF-03 |
| RF-LOGRO-004 | El sistema debe permitir configurar y agregar nuevos logros sin modificar el motor (contenido/configuración). | Should | RF-LOGRO-001, RF-ADM-001 | MVP | UC-ADM-05 |
| RF-LOGRO-005 | El sistema debe garantizar que un logro se otorga una sola vez por usuario y condición; no se duplica por reintentos. | Must | RF-LOGRO-002 | MVP | UC-GAM-04 |

### 4.19 Repaso (`RF-REP`) — ver `01` §12, `04` §2.4, `14`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-REP-001 | El sistema debe generar sesiones de repaso con preguntas de contenido ya estudiado, priorizadas según `01` §12. | Must | RF-PREG-005, RF-EVAL-004 | MVP | UC-REP-01 |
| RF-REP-002 | El sistema debe priorizar repaso por: respuestas incorrectas previas, conceptos con bajo rendimiento, conceptos no repasados hace días y prerrequisitos de contenidos próximos. | Must | RF-REP-001 | MVP | UC-REP-01 |
| RF-REP-003 | El sistema debe ofrecer repaso entre sesiones sin bloquear el avance de la ruta principal; el repaso es opcional pero recomendado. | Must | RF-REP-001 | MVP | UC-REP-02 |
| RF-REP-004 | El sistema debe registrar resultados de repaso y retroalimentar al motor de evaluación para ajustar priorización futura, sin penalizar el progreso del módulo. | Must | RF-REP-001, RF-EVAL-004 | MVP | UC-REP-01 |
| RF-REP-005 | El sistema debe permitir repaso manual por módulo/tema a elección del usuario además del repaso recomendado. | Should | RF-REP-001 | MVP | UC-REP-02 |

### 4.20 Certificados (`RF-CERT`) — ver `01` §21–§22, `04` §2.5, `17`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-CERT-001 | El sistema debe generar un certificado de finalización por lenguaje solo cuando todos los módulos y exámenes del lenguaje estén aprobados con umbral vigente. Un certificado por lenguaje completado (`04` §7). | Must | RF-EXAM-003, RF-MOD-003 | MVP | UC-CERT-01 |
| RF-CERT-002 | El sistema debe incluir en el certificado al menos: nombre del usuario, número de documento, lenguaje completado, fecha de finalización, identificador único, nombre de la plataforma y estado de finalización (`01` §21). | Must | RF-CERT-001 | MVP | UC-CERT-01 |
| RF-CERT-003 | El sistema debe asignar identificador único con formato `CQ-{LANG}-{SEQ}` ej. `CQ-PY-000001` (`01` §22, `04` §7) correlativo por lenguaje. | Must | RF-CERT-001 | MVP | UC-CERT-01 |
| RF-CERT-004 | El sistema debe generar código QR que permita verificación interna por ID dentro de la plataforma. Verificación pública es Post-MVP (`04` §3). | Must | RF-CERT-003 | MVP | UC-CERT-02 |
| RF-CERT-005 | El sistema debe permitir re-emisión/invalidación: si cambia el contenido del lenguaje de forma significativa, el certificado previo se marca obsoleto y se exige revalidación (ver `17`). No se duplican certificados vigentes por el mismo lenguaje. | Must | RF-CERT-001 | MVP | UC-CERT-03 |
| RF-CERT-006 | El sistema debe exponer verificación interna por ID/QR que confirme validez, lenguaje, fecha y titular sin exponer datos sensibles de terceros. | Must | RF-CERT-003 | MVP | UC-CERT-02 |

### 4.21 PDF (`RF-PDF`) — ver `01` §21, `04` §2.5, `17`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-PDF-001 | El sistema debe exportar el certificado a PDF con plantilla versionada que incluya todos los datos de `RF-CERT-002` más QR. | Must | RF-CERT-002 | MVP | UC-CERT-01 |
| RF-PDF-002 | El sistema debe almacenar el PDF de forma recuperable y permitir descarga autenticada por el titular. | Must | RF-PDF-001 | MVP | UC-CERT-04 |
| RF-PDF-003 | El sistema debe garantizar que el PDF exportado corresponde bit-a-bit a los datos del certificado vigente (no plantillas desincronizadas). | Must | RF-PDF-001, RF-CERT-005 | MVP | UC-CERT-04 |
| RF-PDF-004 | El sistema debe abstraer el almacenamiento de objetos (interfaz S3-compatible, ver `04` §9) sin acoplar a un proveedor concreto en código de negocio. | Must | RF-PDF-002 | MVP | UC-CERT-04 |

### 4.22 Publicidad (`RF-ADS`) — ver `01` §23, `03` OUX-07, `04` §2.6, `18`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-ADS-001 | El sistema debe mostrar publicidad solo a usuarios gratuitos y únicamente entre secciones completadas (`Sección completada → Recompensa → Publicidad → Siguiente sección` `01` §23). | Must | RF-SEC-003, RF-PROG-001 | MVP | UC-ADS-01 |
| RF-ADS-002 | El sistema debe garantizar que la publicidad nunca interrumpe un ejercicio, quiz o examen en curso (`04` §8, `03` OUX-07). | Must | RF-ADS-001 | MVP | UC-ADS-01 |
| RF-ADS-003 | El sistema debe cargar anuncios de forma asíncrona sin bloquear la navegación ni el registro de progreso; fallo del proveedor no impide continuar aprendiendo (degradado). | Must | RF-ADS-001 | MVP | UC-ADS-01 |
| RF-ADS-004 | El sistema debe registrar impresiones/clics de anuncios solo con métricas esenciales y sin tracking invasivo (`04` §4, `26`). | Must | RF-ADS-001 | MVP | UC-ADS-02 |
| RF-ADS-005 | El sistema debe abstraer la red de anuncios tras una interfaz, sin hardcodear un proveedor específico en el núcleo. | Must | RF-ADS-001 | MVP | UC-ADS-01 |

### 4.23 Premium (`RF-PREM`) — ver `01` §23, `04` §2.6 y §8, `18`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-PREM-001 | El sistema debe ofrecer plan premium de USD $1/mes (precio inicial configurable) que elimina toda publicidad para el suscriptor. | Must | RF-ADS-001 | MVP | UC-PREM-01 |
| RF-PREM-002 | El sistema debe gestionar el ciclo de suscripción: activación, renovación, expiración y cancelación, con estados `activa`, `expirada` y `cancelada` (`04` §8). | Must | RF-PREM-001 | MVP | UC-PREM-02 |
| RF-PREM-003 | El sistema debe conservar progreso y acceso a rutas al pasar entre gratuito y premium; el cambio de plan no borra avance. | Must | RF-PREM-002, RF-PROG-001 | MVP | UC-PREM-02 |
| RF-PREM-004 | El sistema debe abstraer la pasarela de pagos tras una interfaz; no debe hardcodear Stripe/PayPal u otro proveedor en el núcleo (`04` §4). | Must | RF-PREM-001 | MVP | UC-PREM-01 |
| RF-PREM-005 | El sistema debe reflejar el estado premium en toda la experiencia (sin anuncios, sin interrupciones) de forma inmediata tras activación y hasta expiración. | Must | RF-PREM-002, RF-ADS-001 | MVP | UC-PREM-03 |
| RF-PREM-006 | El sistema debe registrar eventos de facturación/suscripción para soporte y auditoría sin almacenar datos de tarjeta en el núcleo. | Must | RF-PREM-002 | MVP | UC-PREM-02 |

### 4.24 Administración del contenido (`RF-ADM`) — ver `01` §31, `04` §2.7, `23`, `25`

| ID | Descripción | Prioridad | Depende de | Entrega | UC previsto |
|---|---|---|---|---|---|
| RF-ADM-001 | El sistema debe proveer CRUD de lenguajes, módulos, secciones y lecciones con validación de estructura `Lenguaje → Módulo → Sección → Lección` (`01` §7). | Must | — | MVP | UC-ADM-01 |
| RF-ADM-002 | El sistema debe proveer CRUD de preguntas y banco asociado (tipos, dificultad, respuestas, explicaciones) con versionado (`RF-PREG-006`). | Must | RF-ADM-001, RF-PREG-002 | MVP | UC-ADM-03 |
| RF-ADM-003 | El sistema debe permitir publicar y ocultar contenido sin despliegue de código, con efecto inmediato o programado. | Must | RF-ADM-001 | MVP | UC-ADM-02 |
| RF-ADM-004 | El sistema debe permitir configurar sin código: umbrales de quiz/examen, valores de XP, orden de módulos y composición de exámenes/quizzes. | Must | RF-EVAL-005, RF-XP-004 | MVP | UC-ADM-04 |
| RF-ADM-005 | El sistema debe versionar todo contenido publicado y mantener trazabilidad de qué versión cursó cada intento de evaluación. | Must | RF-ADM-001, RF-EVAL-003 | MVP | UC-ADM-02 |
| RF-ADM-006 | El sistema debe validar coherencia antes de publicar: IDs únicos, prerrequisitos sin ciclos, referencias lenguaje→módulo→sección→pregunta íntegras y tipos de pregunta válidos. | Must | RF-ADM-001 | MVP | UC-ADM-02 |
| RF-ADM-007 | El sistema debe restringir operaciones de administración a usuarios con rol administrador autenticado y autorizado (RBAC mínimo). | Must | RF-AUTH-002 | MVP | UC-ADM-05 |
| RF-ADM-008 | El sistema debe registrar auditoría de cambios administrativos (quién, qué, cuándo, versión anterior/nueva). | Must | RF-ADM-001 | MVP | UC-ADM-05 |
| RF-ADM-009 | El sistema debe soportar flujo de revisión con roles diferenciados (autor / revisor / publicador) y estados de contenido (borrador → revisión → publicado). | Should | RF-ADM-007 | Post-MVP | UC-ADM-05 |

---

## 5. Trazabilidad

### 5.1 Matriz RF → Caso de uso (prevista para `08_USE_CASES.md`)

Cada fila de §4 ya propone `UC previsto`. La relación completa se consolidará en `08` con formato:

| RF | UC | Validación |
|---|---|---|
| RF-AUTH-001 | UC-AUTH-01 | Registro end-to-end con verificación de email |
| RF-DIAG-003 | UC-DIAG-02 | Recomendación de punto de entrada verificada con 20 usuarios |
| RF-QUIZ-003 | UC-QUIZ-02 | Calificación con umbral 70% y revisión de errores |
| RF-CERT-001 | UC-CERT-01 | Certificado solo si todos los exámenes aprobados |

> Regla: ningún `RF` queda sin `UC` y ningún `UC` queda sin `RF` (criterio `04` §10.1).

### 5.2 RF → Objetivo / Problema

| RF (grupo) | OE (`03` §2) | OED/OUX/OT (`03` §4–§6) | PS (`02` §2) |
|---|---|---|---|
| RF-AUTH, RF-USR, RF-PROF | OE-01, OE-08 | OT-04, OT-05, OT-06 | — |
| RF-LANG, RF-LVL, RF-DIAG, RF-RUTA | OE-02, OE-03 | OED-03, OT-01, OT-02 | PS-04, PS-07, PS-09 |
| RF-MOD, RF-SEC, RF-LEC | OE-01, OE-03 | OED-01, OED-02, OED-06 | PS-01, PS-02, PS-03, PS-10 |
| RF-PREG, RF-QUIZ, RF-EXAM, RF-EVAL | OE-04 | OED-05, OUX-03 | PS-05, PS-10 |
| RF-PROG, RF-XP, RF-RACHA, RF-LOGRO, RF-REP | OE-05 | OED-04, OUX-05 | PS-06, PS-08 |
| RF-CERT, RF-PDF | OE-06 | — | PS-06 (demostrabilidad) |
| RF-ADS, RF-PREM | OE-07 | OUX-07 | — |
| RF-ADM | OE-03, OE-08 | OT-01, OT-02, OT-03 | Causa estructural `02` §3 |

### 5.3 Dependencias críticas (orden de implementación sugerido)

```
RF-AUTH/USR → RF-LANG/LVL → RF-DIAG/RUTA → RF-MOD/SEC/LEC → RF-PREG
  → RF-QUIZ/EXAM/EVAL → RF-PROG → RF-XP/RACHA/LOGRO → RF-REP
  → RF-CERT/PDF → RF-ADS/PREM → RF-ADM (transversal, pero CRUD base desde inicio)
```

Cualquier requisito Post-MVP depende de que su contraparte MVP exista y esté probada (ver `20_TESTING.md`).

---

## 6. Reglas de negocio transversales

1. **Umbrales configurables:** Quiz 70% y Examen 80% son valores iniciales (`01` §15); el sistema debe leer el umbral vigente por módulo/intento, no hardcodearlo.
2. **XP configurable:** valores de `01` §17 son iniciales; cambios no requieren despliegue.
3. **Idempotencia de progreso:** reenvíos de la misma respuesta/intento no duplican registros ni XP.
4. **No ejecución de código en MVP:** `RF-PREG-001` evalúa escritura/orden/selección de código sin runner; el runner es Post-MVP (`04` §4).
5. **Publicidad no intrusiva:** `RF-ADS-002` es invariante; cualquier cambio requiere ADR.
6. **Un certificado por lenguaje:** `RF-CERT-001` + `04` §7; re-emisión invalida el anterior.
7. **Contenido desacoplado:** `RF-LANG-004`, `RF-MOD-004`, `RF-PREG-006`, `RF-ADM-003` garantizan que agregar/modificar contenido no exige reconstruir la app (`01` §31).

---

## 7. Criterios de aceptación (por requisito)

Cada `RF` se considera aceptado solo si:

- Existe `UC` en `08` que lo ejercita end-to-end.
- Existe prueba en `20` (unitaria/integración/API/UI según pirámide) que lo cubre y pasa.
- La API que lo expone está documentada en `13` (OpenAPI) y versionada.
- El dato que persiste está modelado en `12` con migración versionada.
- La auditoría/observabilidad relevante está prevista en `21`/`26`.

---

## 8. Glosario mínimo (solo términos con regla)

| Término | Definición en este documento |
|---|---|
| Intento | Envío evaluable de quiz/examen o respuesta a pregunta; inmutable una vez calificado. |
| Aprobado | Intento con % ≥ umbral vigente del módulo al momento de calificar. |
| Módulo aprobado | Al menos un intento de examen del módulo aprobado; no se promedia. |
| Lenguaje completado | Todos los módulos del lenguaje en estado aprobado. |
| Actividad válida (racha) | Registro de `RF-PROG-001` en un día calendario: completar lección/ejercicio, quiz, examen o repaso. |

---

*Fin de `05_FUNCTIONAL_REQUIREMENTS.md` — cualquier adición requiere actualizar este documento, `08_USE_CASES.md`, `12_DATABASE_DESIGN.md`, `13_API_SPECIFICATION.md` y `CHANGELOG.md`.*
