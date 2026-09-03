# 15 — Sistema de Quizzes y Exámenes

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-29
> Complementa a `01_PROJECT_OVERVIEW.md` §11–§15, `05_FUNCTIONAL_REQUIREMENTS.md` (RF-PREG, RF-QUIZ, RF-EXAM, RF-EVAL), `06_NON_FUNCTIONAL_REQUIREMENTS.md` (RNF-010, RNF-012), `07_USER_STORIES.md` (US-031–US-040) y `14_LEARNING_SYSTEM.md`. No duplica; especifica el comportamiento verificable del motor de evaluación.

---

## 1. Propósito y alcance

Este documento especifica **cómo se componen, seleccionan, califican y aprueban** los quizzes intermedios y exámenes finales por módulo. Es la referencia para `11_SYSTEM_ARCHITECTURE.md` (Evaluation Engine), `12_DATABASE_DESIGN.md`, `13_API_SPECIFICATION.md`, `23_CONTENT_SPECIFICATION.md` y `25_ADMIN_SYSTEM.md`.

**Dentro del alcance:** tipos de pregunta, dificultades, cantidad, selección, puntuación, porcentajes, aprobación, reintentos, penalizaciones, retroalimentación, caracterización de quiz vs. examen, aleatorización/banco/ponderación anti-trivialidad, ejemplos de cálculo y reglas de negocio.

**Fuera del alcance:** contenido concreto de preguntas (ver `23`), ejecución de código en sandbox (Post-MVP, ver `04` §4), UI visual (ver `27`).

---

## 2. Referencias cruzadas

| Referencia | Qué aporta |
|---|---|
| `01` §11 | Tipos de pregunta ancladas al módulo |
| `01` §13–§15 | Ubicación del quiz en la ruta y composición ejemplo del examen |
| `05` RF-PREG-001–007 | Banco, metadatos, entrega anclada, validación, historial, versionado, aleatorización de opciones |
| `05` RF-QUIZ-001–006 | Generación, presentación, calificación, revisión, reintentos y XP de quiz |
| `05` RF-EXAM-001–007 | Generación, composición configurable, calificación, bloqueo, reintentos, revisión y XP de examen |
| `05` RF-EVAL-001–006 | Motor determinista, % y puntaje, registro de intento, bajo rendimiento, versionado de umbrales, calificación en servidor |
| `05` RF-ADM-004–006 | Configuración sin código y validación de coherencia antes de publicar |
| `06` RNF-010, RNF-012 | Feedback < 1 s y resultado de quiz/examen < 2 s p95 |
| `07` US-031–US-040 | Criterios de aceptación de evaluación |

---

## 3. Tipos de preguntas

### 3.1 Catálogo canónico (MVP)

Derivado de `05` RF-PREG-001. Todo tipo tiene validador en servidor y plantilla de render en cliente. Ninguno requiere ejecución de código en MVP (ver `04` §4).

| ID | Tipo | Código | Descripción | Validación en servidor | Ejemplo |
|---|---|---|---|---|---|
| T-01 | Selección múltiple (single choice) | `SINGLE_CHOICE` | Una correcta entre 4 opciones | `respuesta == correcta` | ¿Qué imprime `print(5+5)`? → B. 10 |
| T-02 | Selección múltiple (multiple choice) | `MULTIPLE_CHOICE` | 2–3 correctas entre 4–5; acierto solo si conjunto exacto | Igualdad de conjuntos | Marca los tipos mutables en Python |
| T-03 | Verdadero / Falso | `TRUE_FALSE` | Afirmación binaria | Booleano exacto | "Una variable puede ser reasignada" → V |
| T-04 | Completar código / línea | `FILL_BLANK` | Hueco(s) con 1 respuesta canónica + alias | Normalización (trim, case, alias) | `print(_____)` → `name` |
| T-05 | Predecir output | `PREDICT_OUTPUT` | Dado snippet, elegir/ escribir salida exacta | Comparación exacta o selección | `x=5; print(x*2)` → `10` |
| T-06 | Identificar errores | `FIND_ERROR` | Señalar línea con error o tipo de error | Opción/línea correcta | ¿Dónde está el `SyntaxError`? |
| T-07 | Ordenar líneas | `ORDER_LINES` | Reordenar 4–6 bloques a secuencia válida | Orden exacto (permutación) | Ordena para definir función que retorna suma |
| T-08 | Seleccionar el código correcto | `SELECT_CODE` | Elegir snippet correcto entre 3–4 | Opción correcta | Elige el `for` que itera correctamente |
| T-09 | Relacionar conceptos | `MATCHING` | Emparejar 3–5 pares (término↔definición) | Todos los pares exactos | Une: `list`↔mutable, `tuple`↔inmutable |
| T-10 | Escribir código (MVP restringido) | `WRITE_CODE` | Escribir 1–3 líneas evaluadas por completado/orden/selección; sin runner | Coincidencia normalizada + validación de tokens clave; runner real es Post-MVP | Escribe `def suma(a,b): return a+b` |
| T-11 | Resolver pequeño problema | `SMALL_PROBLEM` | Enunciado breve con respuesta determinista (valor, opción o hueco) | Según subtipo (numérico/texto/opción) | ¿Cuántas iteraciones hace `for i in range(3)`? → 3 |

> **Nota MVP:** T-10 en MVP no ejecuta código. Se califica por presencia de tokens/normalización y, si aplica, por orden. `05` regla 4 y `04` §4 lo exigen. La ejecución en sandbox se habilita Post-MVP sin cambiar el contrato.

### 3.2 Metadatos por pregunta

Toda pregunta persiste con (ver `05` RF-PREG-002, `23`):

```
lenguaje, modulo, seccion, leccion, tipo (T-01..T-11), dificultad (ver §4),
categoria/concepto, enunciado, opciones/bloques/pares, respuesta(s) válida(s),
explicación (feedback), puntaje_base, peso_dificultad, tiempo_estimado_seg, version
```

### 3.3 Reglas por tipo

- **T-01/T-02/T-03/T-05(opción)/T-06/T-08:** aleatorización de orden de opciones obligatoria (ver §13.1).
- **T-04/T-05(texto)/T-10:** normalización: `trim`, colapso de espacios, `case_sensitive=false` por defecto salvo que la pregunta declare lo contrario (ej. `True` vs `true` en Python es sensible y debe marcarse `case_sensitive=true`).
- **T-07:** los distractores no deben permitir más de una permutación válida; validado en `RF-ADM-006`.
- **T-09:** se califica todo-o-nada en MVP (sin crédito parcial); crédito parcial es Post-MVP configurable.
- **T-11:** si es numérico, tolerancia configurable (por defecto exacta; si admite flotante, `epsilon` declarado).

---

## 4. Niveles de dificultad

### 4.1 Escala

| Nivel | Código | Peso `w` | Criterio pedagógico | Tiempo estimado |
|---|---|---|---|---|
| Fácil | `EASY` | 1.0 | Recuerdo/comprensión directa del concepto recién enseñado | 20–40 s |
| Medio | `MEDIUM` | 1.5 | Aplicación: combinar 2 conceptos o predecir output con 1 trampa | 40–90 s |
| Difícil | `HARD` | 2.0 | Análisis: detectar error sutil, ordenar lógica o resolver problema con condición | 60–150 s |

- El peso `w` se usa en puntuación ponderada (§6). Es configurable sin código (`RF-ADM-004`).
- Toda pregunta tiene exactamente un nivel; el cambio crea nueva versión (`RF-PREG-006`).
- Distribución objetivo por módulo (ver §5.3 y §13.3 para mínimos anti-fácil):

| Evaluación | Fácil | Medio | Difícil |
|---|---|---|---|
| Quiz (10 preguntas) | 40% (4) | 40% (4) | 20% (2) |
| Examen (20 preguntas) | 30% (6) | 40% (8) | 30% (6) |

> Si el banco no permite esta distribución, la generación falla y bloquea publicación (ver §5.4).

---

## 5. Cantidad de preguntas

### 5.1 Quiz intermedio

- **Definición:** al menos 1 por módulo (`01` §13, `05` RF-QUIZ-001).
- **Ubicación canónica:** `Módulo → Sec.1 → Sec.2 → Sec.3 → QUIZ → Sec.4 → Sec.5 → EXAMEN FINAL`. La posición exacta es configurable por módulo (admite 1–2 quizzes si el módulo tiene ≥5 secciones).
- **Cantidad por defecto (configurable):** **10 preguntas** por quiz.
- **Composición por defecto del quiz:**

| Tipo | Cantidad |
|---|---|
| T-01 SINGLE_CHOICE | 3 |
| T-03 TRUE_FALSE | 2 |
| T-05 PREDICT_OUTPUT | 2 |
| T-04 FILL_BLANK | 1 |
| T-06 FIND_ERROR | 1 |
| T-08 SELECT_CODE | 1 |
| **Total** | **10** |

- **Duración estimada:** 8–12 min. Sin límite de tiempo estricto en MVP (ver §9.3).

### 5.2 Examen final

- **Definición:** exactamente 1 por módulo (`05` RF-EXAM-001); evalúa todo el módulo.
- **Cantidad por defecto (configurable, ver `01` §14 y `05` RF-EXAM-002):** **20 preguntas** por examen.
- **Composición por defecto del examen (ejemplo `01` §14):**

| Tipo | Cantidad |
|---|---|
| T-01 SINGLE_CHOICE | 5 |
| T-05 PREDICT_OUTPUT | 5 |
| T-04 FILL_BLANK | 3 |
| T-06 FIND_ERROR | 2 |
| T-03 TRUE_FALSE | 5 |
| **Total** | **20** |

Variante ampliada recomendada cuando el banco lo permite (20 preguntas):

| Tipo | Cantidad |
|---|---|
| T-01 SINGLE_CHOICE | 4 |
| T-03 TRUE_FALSE | 3 |
| T-04 FILL_BLANK | 3 |
| T-05 PREDICT_OUTPUT | 4 |
| T-06 FIND_ERROR | 2 |
| T-07 ORDER_LINES | 1 |
| T-08 SELECT_CODE | 1 |
| T-09 MATCHING | 1 |
| T-11 SMALL_PROBLEM | 1 |
| **Total** | **20** |

> La composición es **configurable por módulo** vía `25_ADMIN_SYSTEM.md` sin despliegue (`RF-ADM-004`). El sistema valida que la suma sea la cantidad declarada y que cada tipo tenga banco suficiente (ver §5.4).

### 5.3 Cobertura temática

- Cada módulo declara `conceptos` (ej. Variables: declaración, tipado dinámico, reasignación, naming).
- Quiz: cubre conceptos de las secciones previas al quiz + repaso liviano de anteriores.
- Examen: estratificado por concepto — cada concepto del módulo aparece al menos en 1 pregunta; ningún concepto supera 30% del examen.
- Validación de publicación: si un concepto queda sin cobertura, se rechaza (`RF-ADM-006`).

### 5.4 Tamaño mínimo del banco (anti-repetición, ver §13)

| Evaluación | Preguntas mostradas `N` | Banco mínimo exigido `B_min` | Ratio |
|---|---|---|---|
| Quiz | 10 | 30 | 3× |
| Examen | 20 | 80 | 4× |

- Por dificultad: cada nivel (`EASY`/`MEDIUM`/`HARD`) debe tener al menos `1.5×` su cuota. Ej. examen exige 6 `HARD` → banco `HARD` ≥ 9.
- Por tipo: cada tipo usado debe tener al menos `2×` su cuota en banco.
- Si no se cumple, el admin ve error bloqueante en publicación con detalle de faltantes.

---

## 6. Selección de preguntas

### 6.1 Principios

1. **Anclada al módulo:** solo preguntas con `modulo == modulo_evaluado` y `estado == publicado` (`RF-PREG-003`).
2. **Estratificada:** respeta composición por tipo (§5) y distribución por dificultad (§4.1).
3. **Aleatoria sin repetición intra-intento:** sin duplicados en el mismo intento.
4. **No determinista entre intentos:** dos intentos del mismo usuario no reciben el mismo set salvo que el banco sea mínimo.
5. **Determinista y auditable:** dado `intento_id` + `semilla`, la selección es reproducible para auditoría (`RF-EVAL-003`).

### 6.2 Algoritmo de selección (normativo)

```
entrada: modulo, composicion_por_tipo {T: cuota}, distribucion_dificultad {EASY,MEDIUM,HARD},
         banco_filtrado, usuario, intento_id, semilla = hash(intento_id + modulo + version_contenido)
paso 1: filtrar banco por modulo, publicado, no retirado, version vigente
paso 2: particionar por (tipo, dificultad) → buckets
paso 3: validar B_min por tipo y dificultad (§5.4); si falla → error de generación
paso 4: para cada tipo T con cuota c_T:
          tomar sub-buckets por dificultad según distribución (§4.1)
          muestreo aleatorio sin reemplazo con semilla (Fisher-Yates) dentro de cada sub-bucket
          si un sub-bucket no alcanza su cuota, compensar con MEDIUM (regla de compensación documentada)
paso 5: reunir N preguntas, barajar orden final con semilla2 = hash(semilla + "order")
paso 6: para cada pregunta, barajar opciones (si aplica) con semilla3 = hash(semilla + pregunta_id)
paso 7: persistir seleccion {pregunta_id, version, orden, opciones_orden} en intento
salida: intento con N preguntas trazables
```

### 6.3 Anti-sesgo adicional

- **Historial del usuario:** preguntas falladas recientemente tienen prioridad en repaso (`RF-REP-002`), pero en quiz/examen se **evita** priorizar falladas para no filtrar el examen; en su lugar se aplica §13.4 (penalización de repetición).
- **Exclusión temporal:** pregunta vista en los últimos 2 intentos del mismo módulo se excluye si hay alternativas suficientes (ver §13.4).
- **Compensación:** si un bucket está corto, se compensa solo hacia `MEDIUM`, nunca hacia `EASY` (evita exámenes fáciles por falta de `HARD`).

### 6.4 Trazabilidad

Cada intento guarda: `pregunta_id`, `pregunta_version`, `dificultad`, `tipo`, `peso_aplicado`, `orden_mostrado`, `orden_opciones` y `semilla`. Permite recalcular el intento bit-a-bit (`RNF-035`, `RF-EVAL-003`).

---

## 7. Puntuación

### 7.1 Modelo

- **Puntaje base por pregunta:** `p_base = 10` puntos (configurable).
- **Peso por dificultad:** `w` de §4.1.
- **Puntaje máximo de la pregunta:** `p_max = p_base * w`
- **Puntaje obtenido:** `p_obt = p_max` si acierta, `0` si falla. Sin crédito parcial en MVP (ver §3.3 para excepciones futuras).

### 7.2 Puntaje del intento

```
P_max  = Σ p_max_i           (suma sobre N preguntas del intento)
P_obt  = Σ p_obt_i
Porcentaje = (P_obt / P_max) * 100
```

- Cálculo en servidor, determinista, con redondeo a **2 decimales** (half-up). El cliente nunca decide aprobación (`RF-EVAL-006`).
- `P_max` y `P_obt` se persisten por intento junto a `porcentaje` y `umbral_aplicado`.

### 7.3 Tabla de puntaje por dificultad

| Dificultad | p_max |
|---|---|
| EASY (w=1.0) | 10 |
| MEDIUM (w=1.5) | 15 |
| HARD (w=2.0) | 20 |

### 7.4 XP asociada (no confundir con puntuación)

La puntuación determina aprobación; la XP es recompensa separada (ver §9.2 y `16_GAMIFICATION.md`). No se usa para calcular %.

---

## 8. Porcentajes y redondeo

- **Fórmula normativa:** `porcentaje = round((P_obt / P_max) * 100, 2)`
- **Regla de aprobación:** `aprobado = porcentaje >= umbral` (comparación con 2 decimales, sin tolerancia).
- **Ejemplo límite:** 69.995% → 70.00% tras redondeo → aprueba quiz (70%). 69.994% → 69.99% → no aprueba.
- **Persistencia:** se guarda `porcentaje_calculado` (con 2 decimales) y `porcentaje_sin_redondeo` (4 decimales) para auditoría.

---

## 9. Aprobación

### 9.1 Umbrales

| Evaluación | Umbral inicial | Código config | Efecto |
|---|---|---|---|
| Quiz | **70%** | `threshold.quiz` | `aprobado` si ≥ 70% |
| Examen | **80%** | `threshold.exam` | `aprobado` si ≥ 80%; desbloquea siguiente módulo |

- Umbrales **configurables por módulo y por lenguaje** sin despliegue (`RF-ADM-004`, `RF-EVAL-005`).
- **Versionado:** cada intento persiste `umbral_aplicado` y `version_contenido`. Cambiar el umbral no re-califica intentos pasados.
- Rango permitido: Quiz 50–90%, Examen 60–95%; fuera de rango requiere ADR.

### 9.2 Efectos de aprobar / reprobar

```
Quiz aprobado   → XP +25 (config), marca quiz_aprobado, habilita continuar secciones
Quiz reprobado  → sin bloqueo de ruta; CTA a revisión (§11) y repaso sugerido

Examen aprobado → XP +100 (config) + bono módulo +150 al cerrar módulo,
                  modulo.estado = APROBADO, siguiente modulo → DISPONIBLE
Examen reprobado→ modulo.estado = REPROBADO, siguiente modulo permanece BLOQUEADO,
                  CTA a revisión detallada (§12) y repaso obligatorio sugerido
```

- Un módulo se considera aprobado con **al menos un intento de examen aprobado**; no se promedia (`05` glosario).
- Diagnóstico nunca otorga aprobación (`RF-DIAG-006`).

### 9.3 Tiempo y navegación

- Quiz/examen son intentos con **envío único**: navegación libre entre preguntas, confirmación antes de enviar, sin edición post-envío.
- Sin límite de tiempo estricto en MVP. Si se configura `time_limit` (Post-MVP), el envío se auto-confirma al expirar y se califica lo respondido; lo no respondido = 0.

---

## 10. Reintentos

### 10.1 Política

| Aspecto | Quiz | Examen |
|---|---|---|
| Reintentos | Ilimitados | Ilimitados |
| Historial | Todos persisten; mejor nota no oculta historial (`RF-QUIZ-005`) | Todos persisten; desbloqueo exige 1 intento aprobado, no promedio (`RF-EXAM-005`) |
| Composición del reintento | ≥ 50% preguntas distintas al intento previo (si banco lo permite) | ≥ 60% distintas; si banco insuficiente, se advierte y se registra `overlap_ratio` |
| Cooldown | Sin bloqueo técnico; se exige ver revisión de errores antes de reintentar (UX gate, no API block) | Igual; además se sugiere repaso de conceptos con bajo rendimiento |
| Umbral | El vigente al momento del reintento | Igual |

### 10.2 Reglas de reintento

- **RN-RETRY-01:** cada reintento es un nuevo `intento_id` con nueva `semilla`; nunca se reutiliza el set.
- **RN-RETRY-02:** el sistema registra `intento_numero` (1,2,3...) y `es_reintento = intento_numero > 1`.
- **RN-RETRY-03:** re-diagnóstico no borra aprobaciones (`RF-DIAG-004`); reintento de examen no afecta módulos ya aprobados.
- **RN-RETRY-04:** idempotencia: reenvío del mismo `intento_id` con mismo `Idempotency-Key` no duplica calificación ni XP (`RNF-042`).

---

## 11. Penalizaciones

### 11.1 Qué NO se penaliza

- **No hay puntos negativos** por fallar. Fallar = 0 en esa pregunta.
- **No hay penalización en % por reintentar.** El % se calcula igual; la penalización es solo en recompensas (ver §11.2) y en variedad del set.

### 11.2 Penalizaciones aplicadas

| Concepto | Regla | Motivo |
|---|---|---|
| XP por reintento | Quiz: 100% XP el 1er intento, 50% en reintentos aprobados posteriores. Examen: 100% 1er aprobado, 70% 2do, 50% 3ro+ (configurable `xp.retry_decay`) | Evita farm de XP reintentando |
| Tiempo (Post-MVP) | Si `time_limit` activo, no responder = 0; sin penalización adicional por tiempo | Simplicidad |
| Bloqueo de avance | Solo examen reprobado bloquea siguiente módulo (`RF-EXAM-004`) | Garantiza dominio |
| Anti-fuerza bruta | Rate limit por usuario: máx 5 envíos de quiz/examen por hora (config `rate.eval_per_hour`) | Evita abuso de reintentos |

### 11.3 Qué nunca se hace

- No se resta XP por reprobar.
- No se baja % de módulo ni se invalida progreso por fallar repaso (`RF-REP-004`).
- No se cobra penalización económica.

---

## 12. Retroalimentación

### 12.1 Feedback inmediato por pregunta (durante lección/ejercicio)

- Al enviar una respuesta individual (ejercicio de lección): validación en servidor < 1 s p95 (`RNF-010`), respuesta `acierto: true|false`, `explicacion` en lenguaje del usuario, `xp_otorgada` si aplica.
- Mensaje pedagógico, no técnico: causa + siguiente paso; nunca stack trace (`RNF-022`).

### 12.2 Revisión tras quiz

- Disponible inmediatamente tras calificar (< 2 s, `RNF-012`).
- Por cada pregunta: `enunciado`, `respuesta_dada`, `respuesta_correcta`, `acierto`, `explicacion`, `concepto`.
- **No expone banco completo:** solo las N preguntas del intento. No se listan preguntas no evaluadas (`RF-QUIZ-004`).

### 12.3 Revisión detallada tras examen

- Todo lo de §12.2 más:
  - Desglose por tipo: tabla `tipo → correctas/total → %` y `puntaje_tipo / puntaje_max_tipo`.
  - Desglose por dificultad y por concepto.
  - Lista de **conceptos con bajo rendimiento** ( < 60% en ese concepto) para repaso (`RF-EXAM-006`, `RF-EVAL-004`).
  - CTA a repaso priorizado.

### 12.4 Feedback y repaso

- Los conceptos con bajo rendimiento alimentan `RF-REP-002` (priorización de repaso entre sesiones).
- El repaso no revela respuestas de preguntas futuras.

---

## 13. Quiz intermedio — especificación cerrada

| Atributo | Valor |
|---|---|
| Cantidad | 10 preguntas (configurable 8–15) |
| Composición | §5.1 |
| Dificultad | 40/40/20 (§4.1) |
| Umbral | 70% (`threshold.quiz`) |
| Ubicación | Tras ~50% de secciones del módulo |
| Navegación | Libre entre preguntas, envío único con confirmación |
| Calificación | Automática en servidor, < 2 s |
| Revisión | §12.2 |
| Reintentos | Ilimitados, sin bloqueo de ruta |
| XP | +25 al completar/ aprobar (configurable, ver `16`) |
| Registro | `intento` con puntaje, %, umbral, versión, fecha (`RF-EVAL-003`) |
| Efecto en progreso | No bloquea avance; se registra para analytics y adaptación de ruta |

**Estados del quiz por usuario/módulo:** `NO_INICIADO → EN_CURSO → ENVIADO → CALIFICADO → (APROBADO | REPROBADO) → REINTENTO*`

---

## 14. Examen final — especificación cerrada

| Atributo | Valor |
|---|---|
| Cantidad | 20 preguntas (configurable 15–25) |
| Composición | §5.2 |
| Dificultad | 30/40/30 (§4.1) |
| Umbral | 80% (`threshold.exam`) |
| Ubicación | Al cerrar todas las secciones del módulo |
| Prerrequisito | Secciones completadas (o punto de entrada adaptativo validado) |
| Navegación | Igual que quiz |
| Calificación | Automática en servidor, < 2 s |
| Revisión | §12.3 con conceptos débiles |
| Reintentos | Ilimitados, exige 1 aprobado para desbloquear |
| XP | +100 al aprobar +150 al completar módulo (configurable) |
| Registro | Igual que quiz, con `desglose_por_tipo` y `conceptos_debiles` |
| Efecto en progreso | `APROBADO` desbloquea siguiente módulo; `REPROBADO` lo mantiene bloqueado |

**Estados del examen por usuario/módulo:** `BLOQUEADO → DISPONIBLE → EN_CURSO → ENVIADO → CALIFICADO → (APROBADO → MODULO_APROBADO | REPROBADO → REPASO → REINTENTO)`

---

## 15. Cómo evitar exámenes fáciles o repetitivos

> Objetivo: que el usuario no pueda aprobar memorizando un set ni reciba exámenes trivialmente fáciles. Cumple `03` §7.2 (tasa de aprobación 55–85% en primer intento) y `05` RF-ADM-006.

### 15.1 Aleatorización

- **Orden de preguntas:** Fisher-Yates con `semilla` por intento (§6.2 paso 5). Dos intentos nunca comparten orden salvo colisión de semilla.
- **Orden de opciones:** barajado por pregunta con `semilla3`; la opción correcta queda trazable por `opcion_id`, no por posición. Evita memorización posicional.
- **Distractores parametrizados:** preguntas con valores aleatorizables (ej. `x = {3,5,7}`) declaran `params` y `resolver`; cada versión genera variantes sin crear pregunta nueva. Validado en `23`.

### 15.2 Banco y ponderación

- **Tamaño mínimo** §5.4 bloquea publicación de exámenes pobres.
- **Estratificación obligatoria** §4.1 y §5.1–§5.2: si el admin intenta configurar un examen con 80% `EASY`, la validación lo rechaza (`config.exam.max_easy_ratio = 40%`).
- **Ponderación por dificultad** §7.1: un examen con muchas `EASY` otorga menos `P_max` por pregunta difícil, pero el % sigue exigiendo aciertos en `HARD` para llegar a 80%. Ejemplo: fallar las 6 `HARD` (120 pts) deja `P_obt_max = 180/300 = 60%` → reprobado aunque todas las fáciles estén bien.
- **Cobertura por concepto** §5.3: impide exámenes que solo pregunten el concepto más fácil.

### 15.3 Calibración de dificultad

- Cada pregunta registra `tasa_acierto_global` (aciertos / intentos) y `tiempo_mediano_respuesta`.
- Regla de calibración trimestral (analytics `26`): si una `HARD` tiene tasa > 85% sostenida (≥100 intentos), se propone recalificar a `MEDIUM`; si una `EASY` tiene tasa < 40%, se propone a `MEDIUM`. Requiere aprobación de revisor (`RF-ADM-009` Post-MVP, manual en MVP).
- El sistema no auto-cambia dificultad sin aprobación.

### 15.4 Anti-repetición entre intentos

- **Exclusión temporal:** pregunta usada en los últimos `k=2` intentos del mismo usuario/módulo se excluye del pool si hay alternativas suficientes. Si no las hay, se permite pero se marca `reused=true` y cuenta para `overlap_ratio`.
- **Overlap máximo:** reintento de quiz con `overlap > 50%` o examen con `overlap > 40%` genera advertencia en logs y métrica `eval.overlap_high` para `26`.
- **Cooldown de pregunta:** pregunta vista hace < 24 h no se reutiliza en repaso inmediato, pero sí puede aparecer en examen si es el único representante de un concepto (prioridad de cobertura > exclusión).

### 15.5 Controles administrativos

- Validación pre-publicación (`RF-ADM-006`) verifica: IDs únicos, prerrequisitos sin ciclos, referencias íntegras, tipos válidos, cuotas por tipo/dificultad, `B_min` y `max_easy_ratio`.
- Preview de examen: el admin puede generar 5 sets de prueba y ver `overlap` y distribución; si algún set viola reglas, la publicación se bloquea.

---

## 16. Ejemplos de cálculo

### 16.1 Quiz — aprobado por poco

**Config:** 10 preguntas (4 EASY, 4 MEDIUM, 2 HARD) → `P_max = 4*10 + 4*15 + 2*20 = 40+60+40 = 140`

Respuestas: acierta 3 EASY (30), 3 MEDIUM (45), 1 HARD (20) → `P_obt = 95`

```
Porcentaje = 95 / 140 * 100 = 67.857...% → 67.86% → REPROBADO (umbral 70%)
```

Si acierta una EASY más (10 pts extra) → `P_obt=105` → `105/140=75.00%` → **APROBADO**.

### 16.2 Examen — reprobado pese a acertar todas las fáciles

**Config:** 20 preguntas (6 EASY, 8 MEDIUM, 6 HARD) → `P_max = 60+120+120 = 300`

Caso: acierta 6/6 EASY (60), 6/8 MEDIUM (90), 1/6 HARD (20) → `P_obt = 170`

```
Porcentaje = 170/300*100 = 56.666...% → 56.67% → REPROBADO (umbral 80%)
```

Lección: sin `HARD`, no se alcanza 80%. Evita examen fácil por diseño.

### 16.3 Examen — aprobado con distribución equilibrada

Mismo `P_max=300`. Acierta 5/6 EASY (50), 7/8 MEDIUM (105), 5/6 HARD (100) → `P_obt=255`

```
Porcentaje = 255/300*100 = 85.00% → APROBADO
Desglose por tipo (ejemplo):
  SINGLE_CHOICE: 4/5 (80%)  42/50
  PREDICT_OUTPUT: 4/5 (80%)  52/65
  FILL_BLANK: 2/3 (66%)  25/40
  FIND_ERROR: 2/2 (100%)  30/30
  TRUE_FALSE: 5/5 (100%)  55/55
Conceptos débiles: ninguno (<60%)
```

### 16.4 Efecto de peso en pregunta difícil vs. fácil

Pregunta HARD vale 20 pts, EASY 10 pts. Fallar 1 HARD = perder 2× lo que vale 1 EASY. Por eso la ponderación castiga exámenes memorizados solo con fáciles.

### 16.5 Reintento con overlap controlado

Examen intento 1: set A (20 IDs). Intento 2: se muestrean 20 con exclusión de los 20 de A si banco=80.

```
Pool restante = 60 → se toman 20 de 60 → overlap 0% (ideal)
Si banco=40 → pool restante 20 → se toman 20 de 20 → overlap 0% pero sin aleatoriedad
Si banco=30 → pool restante 10 → se necesitan 10 más de A → overlap = 10/20 = 50% → supera 40% → métrica overlap_high
```

Por eso `B_min=80` garantiza overlap 0% sistemático.

---

## 17. Reglas de negocio (normativas)

| ID | Regla | Origen |
|---|---|---|
| RN-QE-001 | Todo quiz/examen se califica exclusivamente en servidor; el cliente nunca decide aprobación. | `05` RF-EVAL-006 |
| RN-QE-002 | Cada intento persiste inmutable con `usuario, modulo, puntaje, P_max, P_obt, %, umbral_aplicado, version_contenido, fecha, semilla, seleccion`. | `05` RF-EVAL-003, `06` RNF-033/035 |
| RN-QE-003 | La selección de preguntas es estratificada por tipo y dificultad y aleatoria sin reemplazo intra-intento. | §6.2 |
| RN-QE-004 | Ningún intento contiene preguntas duplicadas. | §6.1 |
| RN-QE-005 | El porcentaje se calcula como `round(P_obt/P_max*100, 2)` y se compara con `>= umbral` con 2 decimales. | §8 |
| RN-QE-006 | Quiz aprueba con ≥ `threshold.quiz` (def. 70%); examen con ≥ `threshold.exam` (def. 80%). Umbrales versionados por intento. | `01` §15, `05` RF-EVAL-005 |
| RN-QE-007 | Examen reprobado mantiene el siguiente módulo BLOQUEADO hasta un intento aprobado (no promedio). | `05` RF-EXAM-004/005 |
| RN-QE-008 | Reintentos ilimitados; cada uno registra nuevo intento con nueva semilla y ≥50/60% preguntas distintas (quiz/examen) si el banco lo permite. | §10.1 |
| RN-QE-009 | No hay puntos negativos; fallo = 0 en esa pregunta. | §11.1 |
| RN-QE-010 | XP por reintento decae: quiz 50% desde 2do, examen 70%/50% (configurable); nunca se otorga XP por reenvío idempotente. | §11.2, `05` RF-XP-005 |
| RN-QE-011 | Revisión post-evaluación muestra solo las N preguntas del intento, nunca el banco completo. | `05` RF-QUIZ-004/006 |
| RN-QE-012 | Publicación de módulo bloqueada si banco < `B_min` o composición viola `max_easy_ratio` o cobertura por concepto. | §5.4, §15.2 |
| RN-QE-013 | Orden de preguntas y de opciones se aleatoriza por intento con semilla auditable. | §15.1 |
| RN-QE-014 | Preguntas de los últimos 2 intentos se excluyen del siguiente si hay alternativas; overlap >50/40% se registra como métrica. | §15.4 |
| RN-QE-015 | Toda pregunta y umbral tiene versión; intentos históricos no se re-califican. | `05` RF-PREG-006, RF-EVAL-005 |
| RN-QE-016 | Rate limit: máx 5 envíos de evaluación por usuario/hora. | §11.2 |
| RN-QE-017 | Tiempo de feedback < 1 s y calificación < 2 s p95; indicador de carga si se supera 500 ms. | `06` RNF-010/012 |
| RN-QE-018 | Diagnóstico no otorga aprobación de módulos. | `05` RF-DIAG-006 |

---

## 18. Configuración administrable (sin código)

Todo lo siguiente es editable vía `25_ADMIN_SYSTEM.md` con efecto < 5 min y sin rebuild (`06` RNF-017):

| Clave | Tipo | Default | Descripción |
|---|---|---|---|
| `threshold.quiz` | int 50–90 | 70 | Umbral de aprobación de quiz (%) |
| `threshold.exam` | int 60–95 | 80 | Umbral de aprobación de examen (%) |
| `quiz.questions` | int 8–15 | 10 | Cantidad de preguntas por quiz |
| `exam.questions` | int 15–25 | 20 | Cantidad de preguntas por examen |
| `quiz.composition` | map T→int | §5.1 | Cuotas por tipo para quiz |
| `exam.composition` | map T→int | §5.2 | Cuotas por tipo para examen |
| `difficulty.weights` | map nivel→float | 1.0/1.5/2.0 | Pesos de puntuación |
| `difficulty.distribution.quiz` | map nivel→% | 40/40/20 | Distribución de dificultad quiz |
| `difficulty.distribution.exam` | map nivel→% | 30/40/30 | Distribución de dificultad examen |
| `scoring.p_base` | int | 10 | Puntaje base por pregunta |
| `xp.quiz` | int | 25 | XP por quiz aprobado |
| `xp.exam` | int | 100 | XP por examen aprobado |
| `xp.module_bonus` | int | 150 | XP bono al completar módulo |
| `xp.retry_decay` | map intento→% | 100/70/50 | Decaimiento de XP por reintento |
| `bank.min_ratio.quiz` | float | 3.0 | Ratio mínimo banco/quiz |
| `bank.min_ratio.exam` | float | 4.0 | Ratio mínimo banco/examen |
| `config.exam.max_easy_ratio` | float | 0.40 | Máx proporción de EASY en examen |
| `rate.eval_per_hour` | int | 5 | Rate limit de envíos por hora |
| `eval.time_limit.quiz` | int/null | null | Límite de tiempo quiz (null=sin límite) |
| `eval.time_limit.exam` | int/null | null | Límite de tiempo examen |

Cambios se versionan y se auditan (`RF-ADM-008`).

---

## 19. Modelo de datos mínimo (referencia para `12`)

```
Pregunta { id, lenguaje, modulo, seccion, leccion, tipo, dificultad, categoria,
           enunciado, opciones/bloques/pares, respuesta_valida, explicacion,
           p_base, peso, tiempo_estimado, estado, version, created_at }

Intento { id, usuario_id, modulo_id, tipo: QUIZ|EXAM, intento_numero,
          semilla, seleccion: [ {pregunta_id, pregunta_version, orden, opciones_orden} ],
          respuestas: [ {pregunta_id, respuesta_dada, acierto, p_obt, p_max} ],
          P_obt, P_max, porcentaje, porcentaje_sin_redondeo, umbral_aplicado,
          version_contenido, resultado: APROBADO|REPROBADO,
          desglose_por_tipo, desglose_por_dificultad, conceptos_debiles,
          overlap_ratio, reused_count, created_at, calificado_at }

ConfigEvaluacion { modulo_id, threshold_quiz, threshold_exam, composicion, pesos, ... , version }
```

Índices: `(modulo, tipo, dificultad, estado)`, `(usuario_id, modulo_id, tipo, created_at)`.

---

## 20. API mínima (referencia para `13`)

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/v1/modulos/{id}/quizzes:generate` | Genera intento de quiz (aplica §6.2) |
| `POST` | `/v1/modulos/{id}/exams:generate` | Genera intento de examen |
| `GET` | `/v1/intentos/{id}` | Obtiene intento con preguntas (sin respuestas correctas hasta calificar) |
| `POST` | `/v1/intentos/{id}:submit` | Envía respuestas; califica en servidor; retorna puntaje/%/aprobación |
| `GET` | `/v1/intentos/{id}/revision` | Revisión post-calificación (§12) |
| `GET` | `/v1/modulos/{id}/banco:validate` | Valida B_min y composición (uso admin) |

Toda calificación exige `Idempotency-Key` (`RNF-042`).

---

## 21. Trazabilidad

| Requisito | Cubierto en |
|---|---|
| RF-PREG-001–007 | §3, §5.4, §6, §15 |
| RF-QUIZ-001–006 | §5.1, §9, §10, §12.2, §13 |
| RF-EXAM-001–007 | §5.2–5.4, §9, §10, §12.3, §14 |
| RF-EVAL-001–006 | §6–§9, §17 |
| RF-ADM-004/006 | §5.4, §15.2/15.5, §18 |
| RNF-010/012 | §12.1, §17 RN-QE-017 |
| US-031–US-040 | §3–§14 |

---

## 22. Antipatrones y riesgos

| Antipatrón | Consecuencia | Mitigación en este doc |
|---|---|---|
| Banco pequeño (< B_min) | Repetición y memorización | Bloqueo de publicación §5.4 |
| Examen con 80% fáciles | Aprobación trivial, 100% primer intento | `max_easy_ratio` + ponderación §15.2 |
| Reutilizar mismo set en reintento | Farm de intentos | Nueva semilla + exclusión temporal §15.4 |
| Opciones siempre en mismo orden | Memorización posicional | Barajado por semilla §15.1 |
| Calificar en cliente | Trampa | RN-QE-001 (solo servidor) |
| Promediar reintentos | Desincentiva reintento | RN-QE-007 (1 aprobado basta) |
| Crédito parcial no definido | Ambigüedad en MATCHING | Todo-o-nada en MVP §3.3 |

---

*Fin de `15_QUIZ_EXAM_SYSTEM.md` — cualquier cambio en tipos, dificultades, cantidades, selección, puntuación, umbrales, reintentos, penalizaciones, retroalimentación o aleatorización requiere actualizar este documento, `05`, `12`, `13`, `23`, `25` y `CHANGELOG.md` con fecha `America/Bogota`.*
