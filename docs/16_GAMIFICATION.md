# 16 — Sistema de Gamificación

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-29
> Complementa a `01_PROJECT_OVERVIEW.md` §17–§19, `03_OBJECTIVES.md` OE-05, `04_SCOPE.md` §2.4, `05_FUNCTIONAL_REQUIREMENTS.md` RF-XP / RF-RACHA / RF-LOGRO / RF-PROG / RF-EVAL, `06_NON_FUNCTIONAL_REQUIREMENTS.md` RNF-016–018, `07_USER_STORIES.md` E06 (US-041–US-049) y `14_LEARNING_SYSTEM.md` / `15_QUIZ_EXAM_SYSTEM.md`. No duplica su contenido; lo especifica de forma implementable.
> **Principio rector:** la gamificación premia **comprensión verificada**, no clics. Toda XP, nivel, racha y logro debe estar anclado a una evaluación validada en servidor (`05` RF-EVAL-006, RF-XP-005).

---

## 1. Propósito y alcance

Este documento define el **Gamification Engine** (`01` §28): cómo se gana, calcula, almacena, audita y muestra la motivación extrínseca (XP, puntos, niveles, rachas, logros, recompensas, desbloqueos y eventos) sin comprometer el objetivo pedagógico (`01` §38: aprender → practicar → equivocarse → feedback → reintentar).

**Dentro del alcance de este documento:**
- Economía de XP y puntos, fórmula de nivel, curva y tabla de XP por acción.
- Reglas de racha: actividad válida, ventana diaria, zona horaria, gracia y congelamiento.
- Catálogo de logros, recompensas y desbloqueos.
- Eventos especiales y penalizaciones (o ausencia deliberada de ellas).
- Reglas anti-gaming para evitar “farmear clics”.
- Configurabilidad sin despliegue (`05` RF-ADM-004, RF-XP-004).
- Trazabilidad a RF/US y criterios de aceptación.

**Fuera de alcance:** modelo de datos físico (`12_DATA_MODEL.md`), contratos OpenAPI (`13_API_SPEC.md`), UI exacta (`27_UI_DESIGN.md`) y analytics detallado (`26_ANALYTICS.md`) — aquí se referencian sin duplicarlos.

---

## 2. Principios de diseño

| # | Principio | Regla operativa |
|---|---|---|
| P-01 | **Comprensión antes que actividad** | Solo acciones con validación en servidor otorgan XP (RF-EVAL-006). Navegar, abrir una lección o hacer clic sin responder no genera XP. |
| P-02 | **No punitivo** | No existe XP negativa ni pérdida de nivel. La única “penalización” es la pérdida natural de racha y la ausencia de bonificación por reintento sin mejora (ver §11). |
| P-03 | **Determinismo y auditabilidad** | Toda regla es configurable, versionada y trazable por intento (`05` RF-EVAL-003, RNF-035). Dos usuarios con el mismo historial obtienen el mismo nivel. |
| P-04 | **Progresión legible** | El usuario siempre sabe qué acción da cuánta XP, cuánto falta para el siguiente nivel y qué desbloquea (RNF-022, `07` US-042). |
| P-05 | **Anti farm** | Cooldowns, idempotencia, topes diarios y validación de tiempo mínimo en lección impiden automatizar o spamear (RF-XP-005, RNF-042). |
| P-06 | **Equidad adaptativa** | El punto de entrada adaptativo (`01` §9) no castiga ni premia XP extra por empezar más adelante; la XP se gana por dominio demostrado, no por repetición. |
| P-07 | **Gratuito = Premium en aprendizaje** | La gamificación nunca bloquea contenido; Premium solo elimina anuncios (`04` §8, `07` US-066). |

---

## 3. Glosario

| Término | Definición en este documento |
|---|---|
| **XP (Experience)** | Moneda de progresión acumulativa y **no canjeable**. Determina el nivel. Solo se otorga en servidor tras validación. |
| **Puntos de módulo** | Puntaje intra-evaluación (quiz/examen). No es XP; sirve para calcular % y aprobación. No se acumula entre módulos. |
| **Nivel** | Rango derivado 100% de XP total mediante fórmula determinista (`05` RF-XP-002). No se pierde. |
| **Racha (Streak)** | Días calendario consecutivos con ≥1 actividad válida (ver §7). Motivador de hábito (`01` §18). |
| **Logro (Achievement)** | Hito discreto desbloqueado una sola vez al cumplir condición verificable (`05` RF-LOGRO-005). |
| **Recompensa** | Feedback inmediato tras acción: animación, XP flotante, barra de progreso, desbloqueo visual. No monetaria en MVP. |
| **Desbloqueo** | Cambio de estado en la ruta: módulo disponible, certificado habilitado, logro visible. |
| **Actividad válida** | Evento registrado en `RF-PROG-001` que cuenta para racha: lección completada, ejercicio validado, quiz enviado, examen enviado o repaso completado (ver §7.2). |
| **Evento especial** | Ventana temporal con multiplicador o logro temático, sin alterar umbrales de aprobación. |

---

## 4. Arquitectura del Gamification Engine

```
Question Engine → Evaluation Engine → [ XP otorgada? ] → Gamification Engine
                                         │                    ├─→ Progress Engine (XP total, nivel)
                                         │                    ├─→ Racha Engine (actividad diaria)
                                         │                    └─→ Logro Engine (evaluar condiciones)
                                                                 └─→ Perfil / Ruta / Notificación
```

**Invariantes:**
1. Evaluation Engine decide aprobación y puntaje; Gamification Engine solo reacciona a eventos **ya calificados en servidor** (RF-EVAL-006).
2. Toda mutación de XP/racha/logro es transaccional e idempotente por `Idempotency-Key` (RNF-033, RNF-042).
3. Configuración (valores XP, curva de nivel, ventana de racha) vive en tabla/config versionada editable vía `25_ADMIN_SYSTEM.md` sin rebuild (RNF-017).

---

## 5. XP — Economía de experiencia

### 5.1 Qué otorga XP y qué no

| Otorga XP (solo si validado en servidor) | No otorga XP (anti-clic) |
|---|---|
| Ejercicio individual respondido **correctamente** | Abrir una lección o hacer scroll |
| Sección completada (todas las lecciones obligatorias) | Clic en “Siguiente” sin completar ejercicios |
| Quiz completado (intento enviado) + bono por aprobación | Previsualizar un quiz sin enviar |
| Examen aprobado | Examen reprobado (ver §5.4) |
| Módulo aprobado (bono de cierre) | Reintento idéntico sin mejora (idempotente) |
| Repaso completado (recompensa menor, ver §5.3) | Repaso abandonado |
| Logros (algunos otorgan XP bono) | Visitar perfil, cambiar avatar, cambiar lenguaje |

> **Regla de oro anti-clic:** ningún endpoint GET otorga XP. Solo POST de respuesta/intento calificado en servidor puede emitir evento `xp_granted` (RF-XP-005).

### 5.2 Tabla de XP por acción (valores base configurables)

Valores iniciales alineados con `01` §17 y `05` RF-XP-001. Todos son **configurables sin despliegue** (`05` RF-XP-004, RF-ADM-004).

| ID acción | Acción | XP base | Condición de otorgamiento | Tope / cooldown | Trazabilidad |
|---|---|---|---|---|---|
| `XP-SEC` | Completar una sección | **+10** | Todas las lecciones/ejercicios obligatorios de la sección en estado completado (`05` RF-SEC-003) | 1 vez por sección y usuario; revisitar no duplica (RF-XP-005) | `01` §17, RF-XP-001, US-025, US-041 |
| `XP-EJ-CORR` | Ejercicio correcto (intra-lección) | **+5** | Respuesta correcta validada en servidor | Solo la **primera** respuesta correcta por ejercicio otorga XP; reintentos del mismo ejercicio no duplican | RF-PREG-004, US-041 |
| `XP-EJ-RECUP` | Ejercicio recuperado tras fallo | **+2** | Falló primero, acierta en reintento tras ver explicación y ≥30 s de separación | Máx. 1 por ejercicio; evita “probar hasta acertar” instantáneo | P-01, US-041 |
| `XP-QUIZ-INTENTO` | Completar un quiz (intento enviado) | **+5** | Quiz enviado y calificado, independiente de aprobación | 1 vez por intento calificado; sin XP extra si se reenvía idempotente | RF-QUIZ-003, US-033 |
| `XP-QUIZ-APROB` | Bono por aprobar quiz | **+20** | Quiz con % ≥ umbral vigente (inicial 70%) | Solo si es aprobado; se suma a `XP-QUIZ-INTENTO` → total **+25** en aprobado | `01` §17, RF-QUIZ-006 |
| `XP-EXAM-APROB` | Aprobar examen de módulo | **+100** | Examen con % ≥ umbral vigente (inicial 80%) | Solo aprobado; reprobado = 0 XP | `01` §17, RF-EXAM-007 |
| `XP-MOD-BONO` | Bono por módulo aprobado | **+50** | Examen aprobado + módulo marcado aprobado (`05` RF-MOD-003). Se otorga junto a `XP-EXAM-APROB` → total por módulo **+150** | 1 vez por módulo | `01` §17, US-036 |
| `XP-REPASO` | Completar sesión de repaso | **+3** | Sesión de repaso (≥5 preguntas) completada, sin importar % | Máx. **+9/día** (3 sesiones) para no incentivar farm de repaso | RF-REP-004, US-050 |
| `XP-DIAG` | Completar diagnóstico | **+10** | Diagnóstico enviado y calificado | 1 vez por diagnóstico; re-diagnóstico no duplica | RF-DIAG-002, US-016 |
| `XP-LOGRO` | Logro con bono | **+10 a +50** | Ver catálogo §9; algunos logros otorgan bono | 1 vez por logro | RF-LOGRO-002 |

**Cálculo de ejemplo — completar un módulo típico (5 secciones, 8 ejercicios correctos, quiz aprobado, examen aprobado):**

```
5 secciones × 10         = 50
8 ejercicios × 5         = 40
Quiz (5 + 20)            = 25
Examen aprobado          = 100
Bono módulo              = 50
─────────────────────────────────
Total módulo             = 265 XP
```

### 5.3 Multiplicadores y bonificaciones (no alteran aprobación)

| Bonificador | Efecto | Condición | Límite |
|---|---|---|---|
| **Racha activa** | +5% XP en `XP-EJ-CORR` y `XP-SEC` si racha ≥7 | Racha vigente al momento de la validación | No aplica a exámenes ni a bonos de módulo |
| **Perfección** | +10 XP extra si quiz/examen = 100% | 100% en intento calificado | 1 vez por quiz/examen (logro `PERFECT SCORE` ya cubre parte) |
| **Remontada** | +5 XP si aprueba examen tras haber reprobado el mismo módulo | Examen aprobado donde hubo ≥1 reprobado previo del mismo módulo | 1 vez por módulo |
| **Evento especial** | ×1.5 o ×2 según evento (ver §10) | Ventana de evento activa | Nunca multiplica `XP-MOD-BONO` ni `XP-LOGRO` |

> Todos los multiplicadores se calculan en servidor y se registran como `xp_event.multiplier` para auditoría.

### 5.4 Qué no da XP (y por qué)

- **Examen reprobado:** 0 XP. Se premia dominio, no intento. El usuario recibe revisión de errores + repaso recomendado (`01` §15).
- **Quiz reprobado:** solo `XP-QUIZ-INTENTO` (+5) por el esfuerzo, sin bono de aprobación. Evita frustración total sin premiar no-dominio.
- **Ejercicio incorrecto:** 0 XP; si luego corrige tras estudiar, recibe `XP-EJ-RECUP` (+2) en lugar de +5.
- **Reintento sin mejora:** reenviar la misma respuesta o el mismo quiz sin cambiar respuestas no genera evento nuevo (idempotencia).

### 5.5 Reglas anti-gaming de XP

1. **Validación en servidor obligatoria** (RF-EVAL-006): el cliente nunca decide XP.
2. **Idempotencia** (RNF-042, `05` regla 3): `Idempotency-Key` por intento; doble envío no duplica XP.
3. **Tiempo mínimo por lección:** si `tiempo_en_lección < 20 s` y ≥3 ejercicios respondidos, el lote se marca `sospechoso` y no otorga XP hasta revisión (heurística configurable; no bloquea progreso, solo XP).
4. **Coordenadas de tiempo:** `tiempo_respuesta < 2 s` en ≥5 ejercicios consecutivos → flag `posible_automatización`; se registra en analytics, no se otorga XP-EJ-CORR hasta completar verificación CAPTCHA invisible o pausa.
5. **Tope diario blando:** >200 XP/día solo posible vía módulos/exámenes; si se detecta >300 XP en 24 h sin examen aprobado, se audita (no se bloquea, pero se registra en `26_ANALYTICS.md`).
6. **Versionado:** cada `xp_granted` guarda `config_version` y `content_version` vigentes (RNF-035).

---

## 6. Fórmula de nivel

### 6.1 Definición

Nivel derivado **exclusivamente** de XP total acumulada (`05` RF-XP-002). No se pierde nivel. Curva configurable sin despliegue.

**Fórmula canónica (configurable):**

```
XP_requerida_para_nivel(N) = floor( BASE × N^FACTOR + OFFSET × N )

Donde por defecto:
  BASE   = 100
  FACTOR = 1.65
  OFFSET = 20

XP_total_acumulada_para_alcanzar_N = Σ_{i=1}^{N} XP_requerida_para_nivel(i)
Nivel_actual = máx N tal que XP_total ≥ XP_total_acumulada_para_alcanzar_N
Progreso_al_siguiente = (XP_total − XP_acum_N) / XP_requerida_para_nivel(N+1)
```

**Alternativa lineal por tramos (si se desea curva más suave en MVP):**

```
Niveles 1–10:   100 XP por nivel
Niveles 11–20:  150 XP por nivel
Niveles 21–30:  220 XP por nivel
Niveles 31+:    300 XP por nivel
```

> El sistema debe soportar **ambas** familias vía config `level.curve = "exponential" | "tiered"` (RF-XP-002, RF-ADM-004). Por defecto se usa **exponencial**.

### 6.2 Tabla de referencia (curva exponencial por defecto)

| Nivel | XP requerida para subir a este nivel | XP total acumulada para alcanzar el nivel | Ejemplo de hito |
|---|---|---|---|
| 1 | 0 | 0 | Registro |
| 2 | 120 | 120 | ~1 módulo pequeño |
| 3 | 145 | 265 | 1 módulo completo (ver ejemplo §5.2) |
| 4 | 172 | 437 |  |
| 5 | 202 | 639 | ~2–3 módulos |
| 6 | 235 | 874 |  |
| 7 | 271 | 1.145 |  |
| 8 | 310 | 1.455 | ~5 módulos |
| 9 | 352 | 1.807 |  |
| 10 | 397 | 2.204 | Mitad de Python (6 módulos) |
| 15 | 680 | 4.900 |  |
| 20 | 1.050 | 9.200 | Python completo (~12 módulos + repaso) |
| 30 | 1.980 | 23.500 | Multi-lenguaje avanzado |
| 50 | 4.600 | 82.000 | Veterano (post-MVP con varios lenguajes) |

> Valores redondeados con `BASE=100, FACTOR=1.65, OFFSET=20`. Ajustables vía admin; la tabla se recalcula y se publica con `config_version`.

### 6.3 Reglas de nivel

- **Determinista:** misma XP_total → mismo nivel siempre, sin importar orden de obtención.
- **Sin techo en MVP:** niveles 1–50 definidos; más allá, la fórmula sigue sin límite (no se bloquea XP).
- **Notificación:** al subir de nivel se dispara recompensa visual + posible logro (`LEVEL_5`, etc.) y se registra `level_up` con `old_level`, `new_level`, `xp_total`.
- **Perfil:** muestra nivel, XP total, XP para siguiente nivel y barra de progreso (RF-PROF-001, US-042).
- **Migración de curva:** si se cambia `BASE/FACTOR/OFFSET`, los niveles ya alcanzados **no se recalculan hacia abajo**; solo afecta el progreso hacia el siguiente nivel y se guarda `level_config_version` por usuario.

---

## 7. Rachas (Streaks)

### 7.1 Definición

Racha = días calendario consecutivos con **≥1 actividad válida** (`05` RF-RACHA-001, `07` US-044). Cuenta como hábito, no como puntaje.

### 7.2 Actividad válida para racha

Cuenta **una** por día, sin importar cuántas se hagan (evita farm):

| Actividad válida | Condición mínima |
|---|---|
| Completar una lección (todos los ejercicios obligatorios de la lección) | Validada en servidor |
| Completar una sección | `RF-SEC-003` |
| Enviar un quiz (aprobado o no) | Intento calificado |
| Enviar un examen (aprobado o no) | Intento calificado |
| Completar una sesión de repaso (≥5 preguntas) | `RF-REP-001` |
| Completar diagnóstico | `RF-DIAG-002` |

**No cuenta:** login sin actividad, navegar, revisar lección ya completada sin nuevo intento, abrir perfil, cambiar avatar.

### 7.3 Ventana diaria y zona horaria

| Regla | Valor | Trazabilidad |
|---|---|---|
| **Zona horaria** | La declarada por el usuario en perfil; por defecto `America/Bogota` (UTC-5). Se guarda `user.timezone` y `racha.timezone_version`. | RF-RACHA-004, US-044 |
| **Corte diario** | `00:00` en la zona horaria del usuario. Ventana = `[00:00, 23:59:59]` local. | RF-RACHA-004 |
| **Resolución de fecha** | Fecha de racha = fecha local del evento convertida desde `UTC` en servidor. Nunca se usa hora del cliente sin validar. | RF-RACHA-004 |
| **Cambio de zona horaria** | Si el usuario cambia TZ, la racha vigente no se recalcula retroactivamente; el nuevo corte aplica desde el día siguiente. Se registra `timezone_change`. | RF-RACHA-004 |

### 7.4 Gracia, congelamiento y pérdida

| Mecanismo | Regla | Configurable |
|---|---|---|
| **Gracia (grace window)** | Tras el corte, existe una **ventana de gracia de 2 horas** (00:00–02:00 local) donde una actividad aún cuenta para el día anterior si el día anterior quedó sin actividad. Solo aplica si no se usó gracia el día anterior (no acumulable). | Sí: `streak.grace_hours` (0–6, por defecto 2) |
| **Congelar racha (Streak Freeze)** | Token que evita perder la racha un día sin actividad. Se otorga 1 por cada 7 días de racha y máx. 2 almacenados. Se consume automáticamente el primer día sin actividad si hay token disponible. No se otorga por compra en MVP. | Sí: `streak.freeze.earn_every_days=7`, `max_freezes=2` |
| **Pérdida de racha** | Si un día calendario no registra actividad válida, no hay gracia disponible ni freeze, la racha **vuelve a 0** al siguiente corte (`05` RF-RACHA-002). La racha máxima histórica se conserva (`RF-RACHA-003`). | No (invariante) |
| **Racha máxima** | `max_streak` = mayor valor histórico alcanzado; nunca se resetea. | No |

**Diagrama de estados:**

```
[Día con actividad] → racha += 1, gracia no consumida, freeze no consumido
[Día sin actividad + gracia disponible] → actividad en 00:00–02:00 cuenta para día anterior, racha se mantiene
[Día sin actividad + freeze disponible] → freeze se consume, racha se mantiene (se registra freeze_used)
[Día sin actividad + sin gracia ni freeze] → racha = 0
```

### 7.5 Notificación y visualización

- Perfil muestra `racha_actual` y `racha_máxima` destacadas (RF-PROF-007, US-044).
- Barra de racha con llama 🔥 y contador; a 6 días avisa “¡1 día para ON FIRE!”.
- Push/email opcional (si el usuario consiente, `19_SECURITY.md`): recordatorio a las 19:00 local si aún no hay actividad ese día.
- Historial diario auditable (`05` RF-RACHA-005) para soporte.

---

## 8. Puntos vs. XP — Distinción operativa

| Concepto | Dónde vive | Para qué sirve | Se acumula | Afecta nivel |
|---|---|---|---|---|
| **Puntos de evaluación** | Quiz/Examen (0–100) | Calcular % y aprobación (70/80) | No; por intento | No |
| **XP** | Cuenta global + por lenguaje | Progresión y nivel | Sí, indefinidamente | Sí |
| **% de progreso** | Módulo/Lenguaje | Visualizar avance (`RF-PROG-002`) | Sí, hasta 100% | No |
| **Racha** | Cuenta global | Hábito | Días consecutivos | No |

> Nunca se convierte puntos de examen en XP de forma proporcional; la XP de examen es fija por aprobación (evita “farmear” reprobados con 60%).

---

## 9. Logros (Achievements)

### 9.1 Reglas generales

- Catálogo versionado (`05` RF-LOGRO-001, RF-ADM-005); agregar un logro es solo config/contenido (RF-LOGRO-004).
- Desbloqueo **automático y en servidor** al cumplirse condición (RF-LOGRO-002); sin botón “reclamar”.
- **Una sola vez** por usuario y condición (RF-LOGRO-005); se guarda `unlocked_at`.
- Algunos logros otorgan XP bono (ver columna XP); esa XP sigue reglas de §5.
- Rareza: `Común` (<50% usuarios), `Raro` (<10%), `Épico` (<2%), `Legendario` (<0.5%) — calculada en analytics, no hardcodeada.

### 9.2 Catálogo MVP (18 logros base)

| ID | Nombre | Descripción | Condición verificable | XP bono | Rareza inicial | Trazabilidad |
|---|---|---|---|---|---|---|
| `FIRST_CODE` | Primer Código | Escribir tu primer código correcto | 1 ejercicio `XP-EJ-CORR` | +10 | Común | `01` §19, US-047 |
| `FIRST_SECTION` | Primer Paso | Completar tu primera sección | 1 `XP-SEC` | +10 | Común | US-025 |
| `FIRST_MODULE` | Primer Módulo | Completar el primer módulo | 1 módulo en `aprobado` | +25 | Común | `01` §19, US-047 |
| `FIRST_QUIZ` | Quiz Superado | Aprobar tu primer quiz | 1 quiz con % ≥70% | +10 | Común | US-033 |
| `PERFECT_QUIZ` | Perfección | 100% en un quiz | 1 quiz con 100% | +15 | Raro | `01` §19, US-047 |
| `PERFECT_EXAM` | Examen Perfecto | 100% en un examen | 1 examen con 100% | +20 | Raro | `01` §19 |
| `ON_FIRE` | En Llamas | Racha de 7 días | `racha_actual == 7` | +20 | Raro | `01` §19, US-046 |
| `STREAK_30` | Imparable | Racha de 30 días | `racha_actual == 30` | +50 | Épico | — |
| `PYTHON_BEGINNER` | Python Beginner | Completar Fundamentos de Python | Módulo “Fundamentos” aprobado | +15 | Común | `01` §19 |
| `PYTHON_HALF` | Medio Camino | Completar 6 módulos de Python | 6 módulos aprobados en Python | +30 | Raro | — |
| `CODE_MASTER_PY` | Code Master | Completar todos los módulos de Python | 12/12 módulos aprobados en un lenguaje | +50 | Épico | `01` §19, US-054 |
| `MULTI_LANG` | Políglota | Completar al menos 2 lenguajes | 2 lenguajes con `lenguaje_completado` | +50 | Legendario (post-MVP) | `01` §19 |
| `LEVEL_5` | Nivel 5 | Alcanzar nivel 5 | `nivel >= 5` | — | Común | US-042 |
| `LEVEL_10` | Nivel 10 | Alcanzar nivel 10 | `nivel >= 10` | — | Raro | US-042 |
| `LEVEL_20` | Nivel 20 | Alcanzar nivel 20 | `nivel >= 20` | — | Épico | US-042 |
| `COMEBACK` | Remontada | Aprobar un módulo tras reprobarlo | Examen aprobado donde hubo reprobado previo mismo módulo | +10 | Común | §5.3 |
| `REVIEWER` | Repasador | Completar 10 sesiones de repaso | 10 `XP-REPASO` | +15 | Raro | US-050 |
| `DIAG_DONE` | Ubicado | Completar el diagnóstico | 1 `XP-DIAG` | — | Común | US-016 |

### 9.3 Logros post-MVP (diseñados, no implementados en Fase 1)

| ID futuro | Nombre | Condición |
|---|---|---|
| `SPEED_LEARNER` | Aprendiz Veloz | Completar 3 secciones en un día (con tiempo mínimo válido) |
| `BUG_HUNTER` | Cazador de Bugs | 10 ejercicios “identificar errores” correctos |
| `FRIEND_STREAK` | Racha Compartida | Racha de 7 días con amigo (requiere sistema social) |
| `CREATOR` | Creador | Publicar contenido como autor (requiere marketplace) |

> Los logros post-MVP no se muestran como “pendientes” en MVP para no hacer spoiler de funciones no disponibles (RF-LOGRO-003).

### 9.4 Visualización

- Perfil → Logros: obtenidos con fecha + icono + rareza; pendientes solo con nombre/descripción genérica sin revelar contenido sensible (US-048).
- Animación de desbloqueo no bloqueante (confetti + sonido opcional).
- Orden: obtenidos recientes primero, luego pendientes por rareza.

---

## 10. Recompensas y eventos especiales

### 10.1 Recompensas inmediatas (por acción)

| Momento | Recompensa visual | XP mostrada | Siguiente paso |
|---|---|---|---|
| Ejercicio correcto | Check verde + “+5 XP” flotante + explicación | +5 (o +2 si es recuperación) | Botón “Continuar” |
| Sección completada | Pantalla de recompensa + barra de progreso + “+10 XP” | +10 | `Recompensa → (Publicidad si gratuito) → Siguiente sección` (`01` §23) |
| Quiz aprobado | Medalla + “¡Aprobado!” + “+25 XP” | +25 | Desbloqueo de siguiente contenido o repaso |
| Examen aprobado | Medalla grande + “¡Módulo aprobado!” + “+150 XP” + confetti | +150 | Desbloqueo siguiente módulo |
| Subida de nivel | Pantalla de nivel + animación + posible logro | — | Compartir opcional |
| Logro desbloqueado | Toast + icono + “+XP” si aplica | Según catálogo | Ver en perfil |

### 10.2 Eventos especiales

Ventanas temporales que **nunca** alteran umbrales de aprobación (70/80) ni desbloquean contenido sin dominio.

| Evento | Frecuencia | Efecto | Ejemplo |
|---|---|---|---|
| **Doble XP de repaso** | 1 fin de semana/mes | `XP-REPASO` ×2 (de +3 a +6) | “Fin de semana de repaso” |
| **Semana de racha** | Trimestral | `XP-EJ-CORR` +1 extra si racha ≥3 durante la semana | “Semana en llamas” |
| **Evento temático** | Al lanzar un lenguaje nuevo | Logro temático + bono XP único por completar el primer módulo del nuevo lenguaje | “Bienvenida Lua” |
| **Desafío de módulo** | Mensual (post-MVP) | Completar un módulo específico con ≥90% otorga logro + bono | “Desafío Bucles” |

**Reglas de eventos:**
- Configurables vía `25` con `event.start`, `event.end`, `event.multiplier`, `event.scope`.
- Se anuncian en perfil/ruta con banner y cuenta regresiva.
- Toda XP de evento guarda `event_id` para auditoría.
- Un usuario no puede “guardar” intentos para usarlos en evento futuro: la XP se calcula con la config vigente al momento de la validación.

---

## 11. Penalizaciones — Filosofía no punitiva

**No existe XP negativa, pérdida de nivel, ni bloqueo por inactividad más allá de la racha.** El diseño es deliberadamente no punitivo para no desmotivar (`02` PS-08).

| Situación | ¿Penalización? | Qué ocurre realmente |
|---|---|---|
| Respuesta incorrecta | No | 0 XP, se muestra explicación y se prioriza para repaso (`01` §12) |
| Quiz reprobado | No | Solo +5 por intento, sin bono; se ofrece revisión y repaso; reintento ilimitado (`05` RF-QUIZ-005) |
| Examen reprobado | No | 0 XP, módulo permanece bloqueado hasta aprobar (`05` RF-EXAM-004); revisión detallada + repaso |
| Día sin actividad | Sí, blanda | Racha vuelve a 0 (o consume freeze/gracia). No se pierde XP ni progreso. |
| Reintento idéntico / spam | No XP extra | Idempotencia: no duplica XP ni progreso (RNF-042) |
| Tiempo sospechosamente bajo | XP retenida | No se otorga XP hasta validar; el progreso pedagógico sí se guarda para no bloquear aprendizaje |
| Abandono de lección | No | Sesión reanudable sin pérdida (RNF-023) |

> **Decisión explícita:** no se implementa “decaimiento de XP” ni “pérdida de nivel por inactividad”. Si a futuro se considera, requiere ADR y actualización de este documento y de `04_SCOPE.md` (ver `06` §6).

---

## 12. Desbloqueos — Matriz de progresión

| Desbloqueo | Requisito | Efecto | Trazabilidad |
|---|---|---|---|
| Siguiente sección dentro del módulo | Sección anterior completada | Sección pasa a `disponible` | RF-SEC-003 |
| Quiz del módulo | Todas las secciones previas al quiz completadas | Quiz disponible | RF-QUIZ-001, `01` §13 |
| Examen del módulo | Todas las secciones + quiz completados (quiz no exige aprobación para desbloquear examen, solo haberlo intentado) | Examen disponible | RF-EXAM-001 |
| Siguiente módulo | Examen del módulo anterior **aprobado** (≥80%) o punto de entrada adaptativo validado por diagnóstico | Módulo pasa a `disponible` | RF-RUTA-004, US-019 |
| Certificado de lenguaje | Todos los módulos del lenguaje en `aprobado` + email verificado | Certificado generable (`CQ-{LANG}-{SEQ}`) | RF-CERT-001, `04` §7 |
| Logro | Condición del catálogo §9 | Badge visible, posible XP bono | RF-LOGRO-002 |
| Nivel | XP total ≥ umbral de nivel | Nivel incrementa, barra se actualiza | RF-XP-002 |
| Repaso recomendado | Historial con errores/bajo rendimiento | Sesión de repaso disponible (opcional, no bloquea) | RF-REP-001 |
| Evento especial | Ventana temporal activa | Multiplicador/logro temático disponible | §10 |

**Regla de prerrequisito sin ciclos:** `25_ADMIN_SYSTEM.md` valida que no existan ciclos en prerrequisitos antes de publicar (RF-ADM-006).

---

## 13. Configurabilidad (sin despliegue)

Toda la economía vive en config versionada (`05` RF-ADM-004, RNF-017):

```yaml
# gamification.config.yaml (versionado, editable vía admin)
version: 3
xp:
  section: 10
  exercise_correct: 5
  exercise_recovery: 2
  quiz_attempt: 5
  quiz_pass_bonus: 20
  exam_pass: 100
  module_bonus: 50
  review: 3
  review_daily_cap: 9
  diagnostic: 10
level:
  curve: exponential        # exponential | tiered
  base: 100
  factor: 1.65
  offset: 20
streak:
  timezone_default: America/Bogota
  grace_hours: 2
  freeze_earn_every_days: 7
  freeze_max: 2
bonuses:
  streak_7_pct: 5
  perfect_quiz: 10
  perfect_exam: 10
  comeback: 5
events: []
```

- Cambios aplican en <5 min a eventos **futuros**; intentos ya calificados conservan `config_version` histórica (RNF-035).
- Auditoría: quién, qué, cuándo, versión anterior/nueva (`05` RF-ADM-008).

---

## 14. Modelo de datos (referencia, no DDL)

> DDL definitivo en `12_DATA_MODEL.md`. Aquí solo entidades y campos mínimos para implementar este documento.

- `xp_event(id, user_id, language_id, action_id, xp_awarded, multiplier, config_version, content_version, ref_type, ref_id, created_at)`
- `user_progress(user_id, language_id, xp_total, level, current_streak, max_streak, freeze_tokens, timezone, updated_at)`
- `streak_day(user_id, date_local, timezone, had_activity, grace_used, freeze_used, created_at)`
- `achievement(id, code, name, description, icon, condition_json, xp_bonus, rarity, version)`
- `user_achievement(user_id, achievement_id, unlocked_at, xp_event_id)`
- `level_config(version, curve, base, factor, offset, created_at)`

Índices críticos: `(user_id, language_id)` en `xp_event` y `user_progress`; `(user_id, date_local)` en `streak_day`.

---

## 15. API y contratos (referencia para `13_API_SPEC.md`)

- `POST /v1/xp/events` — solo interno (Evaluation → Gamification); no expuesto a cliente para otorgar XP.
- `GET /v1/users/me/gamification` — XP total, nivel, progreso al siguiente, racha actual/máxima, freezes, config_version.
- `GET /v1/users/me/xp-history?language_id=&from=&to=&page=` — historial paginado de `xp_event`.
- `GET /v1/users/me/streak` — racha, historial de 30 días, gracia/freeze disponibles.
- `GET /v1/achievements` — catálogo con estado `unlocked/locked` por usuario.
- `GET /v1/users/me/achievements` — logros del usuario con `unlocked_at`.

Todos los endpoints de lectura son paginados (RNF-003) y autenticados (RNF-009).

---

## 16. Visualización en perfil y ruta

```
PERFIL — Brandon — Nivel 12 — 1.240 XP — Racha 7 días 🔥 (máx 12) — ❄️×1
Python  ██████████████░░ 85% — 6/12 módulos — Siguiente: Bucles
Logros: 12/18 — Último: ON FIRE (2026-08-29)
XP hoy: +35 — Para nivel 13: 120 XP restantes
```

- Ruta muestra módulos con estado y %; al pasar el cursor, tooltip con XP obtenible.
- Barra de nivel animada al ganar XP.
- Racha con llama y contador; freeze con copo ❄️.

---

## 17. Telemetría y analytics (para `26_ANALYTICS.md`)

Eventos a registrar (seudonimizados, RNF-040):

- `xp_granted`, `level_up`, `streak_increment`, `streak_reset`, `streak_freeze_used`, `achievement_unlocked`, `event_bonus_applied`.
- Métricas de negocio: XP/día por usuario, distribución de niveles, racha media, tasa de desbloqueo por logro, correlación racha–aprobación (no causalidad).
- Alertas: picos de XP sospechosos (>300/día sin examen), tasa de `sospechoso` por lección, abuso de gracia.

---

## 18. Trazabilidad

| Elemento de este doc | RF (`05`) | US (`07`) | RNF (`06`) |
|---|---|---|---|
| Tabla XP §5.2 | RF-XP-001, RF-XP-004, RF-XP-005 | US-041, US-043 | RNF-017 |
| Fórmula de nivel §6 | RF-XP-002, RF-XP-003 | US-042 | RNF-016 |
| Historial XP | RF-XP-003 | US-041 | RNF-035 |
| Racha §7 | RF-RACHA-001–005 | US-044, US-045 | RNF-018 |
| Logros §9 | RF-LOGRO-001–005 | US-046–US-049 | RNF-016 |
| Recompensas §10 | RF-PROF-001, RF-PROG-003 | US-041, US-025 | RNF-022 |
| Desbloqueos §12 | RF-RUTA-004, RF-MOD-003, RF-CERT-001 | US-018, US-019, US-054 | RNF-034 |
| Configurabilidad §13 | RF-ADM-004, RF-XP-004, RF-EVAL-005 | US-043, US-070 | RNF-017 |
| Anti-gaming §5.5 | RF-EVAL-006, RF-XP-005 | US-041 | RNF-009, RNF-042 |
| Eventos §10.2 | RF-ADM-004 | — | RNF-017 |

---

## 19. Criterios de aceptación del sistema de gamificación

- [ ] Toda XP se otorga solo por acción validada en servidor con `config_version` y `content_version` trazables.
- [ ] Reintento idempotente no duplica XP ni progreso (test de doble `Idempotency-Key` pasa).
- [ ] Curva de nivel es determinista y configurable sin rebuild; cambio de curva no reduce nivel ya alcanzado.
- [ ] Racha respeta zona horaria del usuario, ventana de gracia de 2 h y freeze (1 cada 7 días, máx 2) con historial auditable.
- [ ] Logro se desbloquea automáticamente una sola vez, con `unlocked_at` y sin duplicación por reintento.
- [ ] Ninguna acción GET otorga XP; abrir lección o navegar no genera XP (test de anti-clic pasa).
- [ ] Perfil muestra nivel, XP, progreso al siguiente, racha actual/máxima y logros con fecha.
- [ ] Eventos especiales nunca alteran umbrales 70/80 ni desbloquean módulos sin examen aprobado.
- [ ] No existe XP negativa ni pérdida de nivel; la única pérdida es racha a 0 (o consumo de freeze/gracia).
- [ ] Cobertura ≥70% en Gamification Engine y matriz RF→test completa (RNF-016, `20_TESTING.md`).

---

## 20. Decisiones abiertas (requieren ADR si se cambian)

- Si se decide que `XP-REPASO` cuente para racha con menos de 5 preguntas, actualizar §7.2 y `05` RF-RACHA-001.
- Si se introduce “XP canjeable” por cosméticos, crear ADR: afecta P-02 y modelo de negocio (`18_MONETIZATION.md`).
- Si se añade “decaimiento de XP”, requiere ADR y revisión de `04_SCOPE.md` y `06` §6 (trade-off motivación).

---

*Fin de `16_GAMIFICATION.md` — cualquier cambio en valores, fórmulas o catálogo requiere actualizar este documento, `05_FUNCTIONAL_REQUIREMENTS.md` si afecta RF, `12_DATA_MODEL.md` / `13_API_SPEC.md` si afecta contratos, y `CHANGELOG.md` con fecha `America/Bogota`.*
