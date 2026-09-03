# 26 — Analítica y Métricas (Analytics)

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-29 · **Zona horaria:** America/Bogota (UTC-5)
> Complementa a `01_PROJECT_OVERVIEW.md` §16/§20, `03_OBJECTIVES.md` §7 (indicadores), `04_SCOPE.md` §2.4/§8, `05_FUNCTIONAL_REQUIREMENTS.md` (RF-PROG-006, RF-ADS-004, RF-PREM-006, RF-AUTH-008, RF-ADM-008), `06_NON_FUNCTIONAL_REQUIREMENTS.md` (RNF-018, RNF-037–RNF-040, RNF-045), `11_SYSTEM_ARCHITECTURE.md` §22 (observabilidad), `12_DATABASE_DESIGN.md` §6.12–§6.18, `13_API_SPECIFICATION.md` §4/§8, `14_LEARNING_SYSTEM.md` §7/§10/§17, `15_QUIZ_EXAM_SYSTEM.md` §15.3/§17, `16_GAMIFICATION.md` §5/§7/§9/§17.
> No duplica su contenido; define **qué se mide, cómo se calcula, de qué evento proviene y cómo se visualiza** para operar la plataforma sin recopilación innecesaria. Detalles de despliegue en `21_DEPLOYMENT.md` y pruebas en `20_TESTING.md`.

---

## 1. Propósito y alcance

Este documento es la **fuente de verdad de analítica**. Especifica el modelo de medición del MVP (Python como lenguaje piloto, arquitectura multi-lenguaje) y fija los invariantes de privacidad por diseño. Responde:

- ¿Qué métricas de negocio y aprendizaje se calculan?
- ¿Cuál es su definición operativa, fórmula y evento origen auditable?
- ¿Qué dashboards las exponen y con qué granularidad?
- ¿Qué **no** se recopila y por qué?

**Dentro del alcance:** catálogo de métricas de producto/aprendizaje/gamificación/monetización, fórmulas deterministas y reproducibles, eventos origen (`12`/`13`), dashboards MVP, retención y seudonimización, antipatrones de tracking.

**Fuera del alcance:** implementación del pipeline ETL/BI concreto (requiere ADR en `09-decisions/`), modelo relacional físico extendido (ver `12`), contratos OpenAPI de lectura de progreso/gamificación (ver `13`), wireframes de dashboards (ver `27_UI_UX_SPECIFICATION.md`).

**Principio rector:** medir lo esencial para mejorar el aprendizaje con **minimización de datos** (`06` RNF-037/039/040). Ninguna métrica justifica fingerprinting, tracking cross-site ni compartir progreso con redes de anuncios.

---

## 2. Principios de analítica y privacidad por diseño

| # | Principio | Regla operativa | Origen |
|---|---|---|---|
| A-01 | **Minimización** | Solo métricas del catálogo §3 se persisten. Cualquier métrica nueva requiere ADR + actualización de este doc + entrada en `CHANGELOG.md`. | RNF-037, RNF-039 |
| A-02 | **Seudonimización por defecto** | Toda métrica analítica usa `user_id` seudonimizado (hash con sal rotativa) y nunca `email`, `document_number` ni IP en claro. La tabla analítica no es re-identificable sin clave separada bajo RBAC. | RNF-040, RNF-045 |
| A-03 | **Consentimiento esencial** | Analytics del MVP es **esencial y anónimo** (conteos agregados, sin cookies de terceros). Si a futuro se añade tracking no esencial (ej. RUM detallado, heatmaps), requiere banner de consentimiento explícito y no se carga sin aceptar. | RNF-039, `04` §4 |
| A-04 | **Sin fuga a terceros** | Ningún dato de progreso, intentos o rachas se envía a proveedores de anuncios o pagos. `RF-ADS-004` solo registra impresiones/clics esenciales del slot, sin correlación con progreso. | RNF-040, RF-ADS-004 |
| A-05 | **Trazabilidad y reproducibilidad** | Cada métrica guarda `content_version`, `config_version` (umbrales/XP) y `periodo` para recalcular bit-a-bit. Cambiar contenido/umbral no reescribe historia (`RNF-035`). | RNF-035, RNF-018 |
| A-06 | **Agregación antes que individuo** | Dashboards muestran agregados; el drill-down a usuario requiere rol `analyst`/`support` con auditoría (`RF-ADM-008`) y solo sobre datos del propio usuario o con consentimiento. | RF-ADM-007/008 |
| A-07 | **No punitivo** | La analítica no genera ranking público punitivo, no resta XP ni bloquea por inactividad más allá de racha (ver `16` §11). | `02` PS-08, `16` P-02 |

### 2.1 Qué NO se recopila (lista de exclusión)

- Ubicación precisa / GPS, contactos, sensores del dispositivo.
- Huella del navegador (fingerprinting), `canvas`/`webgl` fingerprint, `battery`/`fonts` enumeration.
- Historial de navegación fuera de la plataforma ni cross-site cookies.
- Contenido de respuestas de texto libre más allá de `given_answer` normalizado para corrección; sin análisis de estilo/voz.
- Datos biométricos, audio/video, ni keystroke dynamics.
- Datos de tarjeta: nunca en núcleo (`RF-PREM-004`, RNF-037); solo `provider_subscription_id`.

> Cualquier excepción requiere ADR, evapythonción de impacto de privacidad y actualización de política accesible antes del registro (`RNF-039`).

---

## 3. Modelo de eventos origen

Toda métrica deriva de **eventos ya persistidos en `12`**; no existe tabla analítica paralela que duplique hechos sin FK. La analítica es una **vista/materialización** sobre el OLTP.

| Evento origen | Tabla(s) en `12` | Endpoint que lo genera (`13`) | Marca temporal | Clave de idempotencia |
|---|---|---|---|---|
| `user_registered` | `users`, `user_profiles` | `POST /auth/register` | `users.created_at` | — |
| `user_login` / `login_failed` | `audit_log` (auth) | `POST /auth/login` | `audit_log.created_at` | — |
| `lesson_question_answered` | `attempts` (`kind='lesson_question'`), `attempt_answers` | `POST /lessons/{id}/answer` | `attempts.graded_at` | `attempts.idempotency_key` |
| `section_completed` | `progress` (`scope='section'`, `status='completed'`), `xp_transactions` (`reason='section_complete'`) | `POST /lessons/{id}/complete` | `progress.completed_at` | `xp_transactions.idempotency_key` |
| `lesson_completed` | `progress` (`scope='lesson'`) | `POST /lessons/{id}/complete` | `progress.completed_at` | — |
| `quiz_attempted` / `quiz_graded` | `attempts` (`kind='quiz'`), `attempt_answers` | `POST /quiz/{id}/attempt` | `attempts.graded_at` | `attempts.idempotency_key` |
| `exam_attempted` / `exam_graded` | `attempts` (`kind='exam'`) | `POST /exam/{id}/attempt` | `attempts.graded_at` | `attempts.idempotency_key` |
| `diagnostic_attempted` | `attempts` (`kind='diagnostic'`) | `POST /diagnostics/{id}/attempt` | `attempts.graded_at` | — |
| `review_attempted` | `attempts` (`kind='review'`) | `POST /review/attempt` | `attempts.graded_at` | — |
| `streak_day` | `streaks` | derivado de cualquier `actividad válida` (`16` §7.2) | `streaks.activity_date` | `UNIQUE(user_id, activity_date)` |
| `module_passed` | `progress` (`scope='module'`, `status='passed'`), `attempts.is_passed=true` | `POST /exam/{id}/attempt` (aprobado) | `progress.completed_at` | — |
| `certificate_issued` | `certificates` | `Certification Engine` | `certificates.issued_at` | `UNIQUE(code)` |
| `subscription_event` | `subscriptions` | webhook `PaymentProvider` | `subscriptions.updated_at` | `provider_subscription_id` |
| `ad_impression` / `ad_click` | `ad_events` (tabla ligera de `11` §13) | `AdsProvider.reportImpression` | `ad_events.created_at` | — |
| `xp_granted` / `level_up` / `achievement_unlocked` | `xp_transactions`, `user_achievements` | `Gamification Engine` | `xp_transactions.created_at` | `UNIQUE(user_id, idempotency_key)` |

**Zona horaria:** todos los `TIMESTAMPTZ` en UTC; la **fecha de negocio** para DAU/racha se deriva convirtiendo a `timezone` del usuario (`user_profiles.timezone`, por defecto `America/Bogota`) en la capa de proyección, nunca en cliente sin validar (`16` §7.3).

---

## 4. Catálogo de métricas — tabla maestra

> **Lectura:** cada fila es una métrica **agregable por día/semana/mes** y por `language_id` salvo que se indique `global`. Todas son reproducibles con SQL sobre `12` sin ETL propietario.

| # | Métrica | Definición operativa | Fórmula | Evento(s) origen | Granularidad / filtros | Trazabilidad |
|---|---|---|---|---|---|---|
| M-01 | **Usuarios registrados** | Usuarios con cuenta creada y no eliminada/anonimizada. | `COUNT(users) WHERE deleted_at IS NULL` | `user_registered` | Global, por `DATE(created_at)` | RF-AUTH-001, RF-USR-001 |
| M-02 | **Usuarios activos — DAU / WAU / MAU** | Usuarios con ≥1 actividad válida en el día/semana/mes en su zona horaria. | `COUNT(DISTINCT user_id) FROM streaks WHERE activity_date = :d` (DAU); ventana 7/30 días para WAU/MAU. `WAU = COUNT DISTINCT` en 7 días; `MAU` en 30 días. | `streak_day` | Global y por `language_id` (vía `progress.language_id`) | RF-RACHA-001, RF-PROG-001, `16` §7 |
| M-03 | **Sesiones completadas** | Sesiones de aprendizaje finalizadas (sección completada). Una sesión = al menos 1 `section_completed` en el día; no se cuenta navegación sin completar. | `COUNT(progress) WHERE scope='section' AND status='completed' GROUP BY user_id, DATE(completed_at)` | `section_completed` | Por usuario/día, por `module_id` | RF-SEC-003, `14` §11 |
| M-04 | **Lecciones completadas** | Lecciones con todos los ejercicios obligatorios respondidos. | `COUNT(progress) WHERE scope='lesson' AND status='completed'` | `lesson_completed` | Por `section_id`, `module_id`, `language_id` | RF-LEC-003, RF-SEC-003 |
| M-05 | **Preguntas respondidas** | Total de respuestas evapythondas en servidor (no vistas, no previews). | `COUNT(attempt_answers) JOIN attempts WHERE attempts.status='graded'` | `lesson_question_answered`, `quiz_attempted`, `exam_attempted`, `review_attempted` | Por `type`, `difficulty`, `category`, `language_id` | RF-PREG-005, RF-EVAL-003 |
| M-06 | **% correctas (tasa de acierto)** | Proporción de respuestas correctas sobre respondidas. | `SUM(CASE WHEN attempt_answers.is_correct THEN 1 ELSE 0 END) / COUNT(*) * 100` → 2 decimales | `attempt_answers.is_correct` | Global, por `type`/`difficulty`/`concepto`, por `module_id` | RF-EVAL-001/002, `15` §7–§8 |
| M-07 | **Módulos completados (aprobados)** | Módulos con al menos un intento de examen aprobado (no promedio). | `COUNT(DISTINCT progress.module_id) WHERE scope='module' AND status='passed'`  ; invariante `progress.status='passed' ↔ EXISTS (attempt WHERE kind='exam' AND is_passed=true)` | `module_passed`, `exam_graded` | Por `language_id`, por cohorte de registro | RF-EXAM-003, RF-MOD-003, `14` §4.3 |
| M-08 | **Tasa de abandono** | Usuarios que iniciaron pero no completaron un módulo/lenguaje en ventana. Dos variantes: **abandono de módulo** y **abandono de lenguaje**. | `Abandono_modulo = 1 - (M-07 / usuarios_que_iniciaron_modulo)` donde `iniciaron = COUNT(progress WHERE scope='module' AND status IN ('in_progress','passed','failed'))`. `Abandono_lenguaje (30d) = usuarios sin actividad 30d con progreso 0<percent<100` | `progress.status`, `streaks` (inactividad) | Por `module_id` (embudo), por `language_id` | `14` §7.2 R2, RF-PROG-002 |
| M-09 | **Rachas — racha actual, racha máxima, distribución** | Días consecutivos con actividad válida; con gracia 2h y freeze (1 cada 7 días, máx 2) según `16` §7.4. | `racha_actual` derivada de `streaks` con ventana `activity_date - ROW_NUMBER() OVER (ORDER BY activity_date DESC)` (ver `12` §6.15). Distribución = histograma `racha_actual` por bucket 0/1/2-3/4-6/7/8-14/15-30/30+. `Racha_media = AVG(racha_actual) WHERE DAU` | `streak_day`, `streaks.grace_used`, `freeze_used` | Por `language_id`, por cohorte | RF-RACHA-001–005, `16` §7 |
| M-10 | **Certificados emitidos** | Certificados vigentes generados (`KODA-{LANG}-{SEQ}`) con email verificado y todos los módulos aprobados. | `COUNT(certificates) WHERE status='valid'` ; `Tasa_certificacion = certificados_validos / usuarios_que_iniciaron_lenguaje` | `certificate_issued` | Por `language_id`, por `DATE(issued_at)` | RF-CERT-001–003, RF-AUTH-005 |
| M-11 | **Usuarios premium** | Usuarios con suscripción `active` y su proporción sobre registrados/activos. | `Premium_activos = COUNT(DISTINCT user_id) FROM subscriptions WHERE status='active'`. `Penetracion_premium = Premium_activos / MAU * 100` ; `Churn_mensual = canceladas+expiradas en mes / activas inicio mes` | `subscription_event` | Global, por `plan_code`, por cohorte | RF-PREM-001–003, RF-PREM-006 |
| M-12 | **Preguntas por usuario — intensidad** | Promedio de preguntas respondidas por DAU/WAU. Indicador de fricción vs. compromiso. | `AVG( M-05 por usuario activo )` en ventana | `attempt_answers` | Por `module_id`, por `difficulty` | — |
| M-13 | **Tiempo dedicado por sección** | Suma de `time_spent_seconds` reportado en `POST /lessons/{id}/complete` (métrica interna, no ranking). | `SUM(progress.time_spent_seconds)` agregada por `section_id` (si `12` lo persiste; si no, `SUM(attempts.time_spent)` proxy) | `section_completed` (`time_spent_seconds`) | Por `section_id`, percentil p50/p95 | RF-SEC-005 |
| M-14 | **Tasa de aprobación — quiz / examen** | Proporción de intentos aprobados. | `Aprobacion_quiz = COUNT(attempts WHERE kind='quiz' AND is_passed)/COUNT(kind='quiz')`. Idem `exam` | `quiz_graded`, `exam_graded` (`threshold_applied`) | Por `module_id`, por `difficulty` | RF-QUIZ-003, RF-EXAM-003, `15` §9 |
| M-15 | **Abuso / calidad — anti-gaming** | Señales para `16` §5.5 sin exponer PII. | `Tasa_sospechoso = COUNT(attempts flagged sospechoso)/COUNT(attempts)`; `XP_dia_p95`, `overlap_high_rate` de `15` §15.4 | `xp_transactions`, `attempts` (flags) | Por `lesson_id`, por día | RNF-009, RF-XP-005 |
| M-16 | **Retención — D1 / D7 / D30** | Proporción de usuarios que vuelven tras registro/actividad. | `Retencion_Dn = usuarios con streak_day en [fecha_base + n] / usuarios base cohorte` | `streak_day` | Por cohorte semanal de registro | `03` §7 |

> **Notas de fórmula:**
> - Toda división protege `NULLIF(den,0)` y redondea a 2 decimales.
> - WAU/MAU son **usuarios únicos** en ventana móvil, no suma de DAUs.
> - `M-08` abandono no se calcula sobre usuarios que nunca iniciaron contenido (solo `progress` con al menos 1 `in_progress`).
> - `M-11` premium nunca cruza datos de pago con progreso a nivel individual; los ratios son agregados.

---

## 5. Fórmulas consolidadas y ejemplos

### 5.1 Usuarios activos (DAU/WAU/MAU)

```sql
-- DAU America/Bogota para un día dado :d
SELECT COUNT(DISTINCT s.user_id) AS dau
FROM streaks s
WHERE s.activity_date = :d;  -- activity_date ya convertida a timezone del usuario

-- MAU (30 días móviles)
SELECT COUNT(DISTINCT user_id) AS mau
FROM streaks WHERE activity_date BETWEEN :d - INTERVAL '29 days' AND :d;

-- Stickiness
-- stickiness = DAU / MAU
```

### 5.2 % correctas y abandono

```sql
-- % correctas global
SELECT ROUND(100.0 * SUM(CASE WHEN aa.is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 2) AS pct_correctas
FROM attempt_answers aa JOIN attempts a ON a.id = aa.attempt_id
WHERE a.status='graded' AND a.created_at BETWEEN :from AND :to;

-- Abandono de módulo M
-- iniciaron = usuarios con progress en ese módulo en in_progress/passed/failed
-- completaron = M-07 para ese módulo
-- abandono = 1 - completaron/iniciaron
```

### 5.3 Rachas

Derivación canónica de `12` §6.15 (no se persiste `current_streak` mutable sin auditoría):

```sql
WITH days AS (
  SELECT user_id, activity_date,
         activity_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date DESC)::int AS grp
  FROM streaks WHERE user_id = :uid
)
SELECT COUNT(*) AS racha_actual
FROM days WHERE grp = (SELECT grp FROM days ORDER BY activity_date DESC LIMIT 1);
```

Gracia 2h y freeze se reflejan en `streaks` como `grace_used`/`freeze_used`; la métrica de racha ya es post-gracia/freeze, por lo que M-09 no requiere ajuste adicional.

### 5.4 Certificados y premium

```sql
-- Tasa de certificación Python
SELECT ROUND(100.0 * COUNT(c.*) / NULLIF(COUNT(DISTINCT lp.user_id),0),2)
FROM certificates c JOIN learning_paths lp ON lp.language_id = c.language_id
WHERE c.language_id = :py AND c.status='valid';

-- Penetración premium
SELECT ROUND(100.0 * COUNT(DISTINCT s.user_id) FILTER (WHERE s.status='active') / NULLIF(COUNT(DISTINCT st.user_id),0),2)
FROM subscriptions s CROSS JOIN (SELECT DISTINCT user_id FROM streaks WHERE activity_date BETWEEN :from AND :to) st;
```

---

## 6. Dashboards MVP

Todos los dashboards consumen **vistas materializadas diarias** (refresco 03:00 `America/Bogota`) + tabla de hechos `fact_daily` con `date, language_id, module_id, content_version`. El acceso es RBAC (`admin`, `analyst`).

### 6.1 D-01 — Ejecutivo (para dirección)

| KPI | Visual | Frecuencia | Alerta |
|---|---|---|---|
| M-01 Registrados (acumulado + nuevos/día) | Línea + barra diaria | Diario | — |
| M-02 DAU/WAU/MAU + stickiness DAU/MAU | Línea 3 series + gauge | Diario | DAU cae >20% WoW 2 días seguidos |
| M-07 Módulos aprobados / M-10 Certificados | Barras por lenguaje | Diario | Tasa certificación <5% con MAU >500 |
| M-11 Premium activos + penetración + churn | KPI + línea | Diario | Churn mensual >15% |
| M-08 Abandono de lenguaje 30d | Gauge | Semanal | >60% |

### 6.2 D-02 — Aprendizaje y contenido (para pedagógico / Content Engine)

| KPI | Visual | Para qué decidir |
|---|---|---|
| M-04 Lecciones completadas por `module_id` (embudo) | Embudo `Módulo → Sección → Lección` | Detectar cuello de botella de contenido |
| M-05/M-06 Preguntas respondidas y % correctas por `type`/`difficulty`/`category` | Heatmap `tipo × dificultad` | Recalibrar dificultad (`15` §15.3) y `B_min` |
| M-14 Tasa aprobación quiz/examen por `module_id` | Barras con umbral 70/80 marcado | Validar `03` §7.2 (55–85% primer intento examen); si <55% o >85% sostenido → revisar banco |
| M-13 p50/p95 tiempo por `section_id` | Tabla con semáforo | Detectar fricción (`14` §7.1: tiempo alto + error alto = concepto difícil) |
| M-08 Abandono por `module_id` + `Score_repaso` top conceptos | Barras + lista top 10 `concepto_id` por `Score_repaso` | Priorizar repaso y refuerzo preventivo (`14` §8.2) |
| M-16 Retención D1/D7/D30 por cohorte | Curvas de cohorte | Evapythonr onboarding (`06` RNF-020) |

### 6.3 D-03 — Engagement y gamificación (para producto)

| KPI | Visual |
|---|---|
| M-09 Distribución de rachas + racha media + % usuarios con racha ≥7 | Histograma + KPI |
| M-03 Sesiones completadas / DAU | Línea |
| XP otorgada por `reason` (`section_complete`, `quiz_pass`, etc.) + `event_bonus_applied` | Stacked bar |
| Logros desbloqueados por `code` (tasa desbloqueo) + rareza | Barras |
| M-15 Tasa `sospechoso` por `lesson_id`, `overlap_high_rate` | Tabla de anomalías |

### 6.4 D-04 — Monetización y operación (para negocio + SRE)

| KPI | Visual | Nota privacidad |
|---|---|---|
| `ad_impression` / `ad_click` por día + CTR (solo agregados) | Línea | Sin correlación con `user_id` de progreso |
| M-11 Premium por `plan_code`, MRR estimado (`amount_cents`), cancelaciones | KPI + líneas | `amount_cents` agregado; nunca tarjeta |
| p95 latencias `feedback <1s` (`RNF-010`), `calificación <2s` (`RNF-012`), `lección <300ms` (`RNF-001`) por endpoint | Gráficas APM | `11` §22 / `21` |
| Tasa errores 5xx por endpoint + `request_id` correlacionado (sin PII) | Serie temporal | RNF-018/045 |

### 6.5 Reglas visuales transversales

- Todo panel muestra `content_version` y `config_version` vigentes en el subtítulo.
- Rango por defecto: últimos 30 días; granularidad diaria (semanal si >90 días).
- Export CSV agregado con un clic; export a nivel usuario requiere `analyst` + auditoría.
- Degradado: si la cola analítica falla, el aprendizaje **no se bloquea** (`RNF-014`).

---

## 7. Privacidad, seudonimización y minimización

| Aspecto | Especificación | Verificación |
|---|---|---|
| **Seudonimización** | `user_id` analítico = `HMAC-SHA256(user_id_real, sal_analitica_rotativa)` con rotación trimestral y tabla de correspondencia en vault separado con acceso `admin` auditado. | Test que inspecciona payloads analíticos y falla si aparece `email` o `document_number` en claro |
| **IP** | Se anonimiza a `/24` (IPv4) o `/48` (IPv6) antes de persistir en `audit_log`; nunca se usa para métricas salvo conteo de `429` por `RNF-009`. | Revisión de `19_SECURITY.md` |
| **Logs y errores** | `request_id`, `endpoint`, `content_version`, `America/Bogota` sin PII (RNF-018/045). `401/403` genéricos (`RNF-041`). | Test que provoca 500 y verifica log sin PII |
| **Certificados** | Verificación pública enmascara `document_number` (`CC ***678`, ver `13` §7.12). | Test de `GET /certificates/{id}` |
| **Anonimización por eliminación** | `DELETE /users/me` anonimiza `users.email→anon_{uuid}@deleted.local`, `user_profiles.display_name→Usuario eliminado`, borra `avatar`, conserva `attempts` con `user_id` seudonimizado para no reescribir historia (`RF-USR-003`, `RNF-038`). | Test E2E de eliminación |
| **Retención** | Hechos OLTP 24 meses; agregados diarios 36 meses; `audit_log` 12 meses. TTL documentado y configurable; borrado programado mensual con reporte. | Job de retención + verificación en `staging` |
| **Terceros** | Lista blanca vacía en MVP para datos de aprendizaje. Cualquier script no esencial (ej. ads) se carga async tras `section_completed` y su fallo no bloquea (`RF-ADS-003`). | Inspección de payloads a terceros en `staging` |
| **Derechos** | `GET /users/me` exporta datos personales registrados (`RF-USR-006`); rectificación vía `PATCH /users/me`; eliminación vía `DELETE /users/me` en ≤30 días (`RNF-038`). | Test E2E |

---

## 8. Retención y ciclo de vida

```
OLTP (users/attempts/progress/xp/streaks/certificates/subscriptions)
  → Proyección diaria 03:00 America/Bogota → fact_daily (agregados, seudonimizado)
  → Dashboards D-01..D-04 (lectura)
  → Retención 24m (OLTP) / 36m (agregados) / 12m (audit_log)
  → Borrado/anonimizado programado + entrada en CHANGELOG.md
```

- El cambio de `content_version` o umbrales genera nueva fila en `fact_daily` con nueva versión; no se re-calcula historia.
- Restauración de backups (`RNF-043` RPO ≤24h, RTO ≤4h) restaura OLTP; `fact_daily` se recalcula idempotentemente desde OLTP.

---

## 9. Antipatrones y riesgos

| Antipatrón | Consecuencia | Mitigación en este doc |
|---|---|---|
| Medir “tiempo en página” con heartbeat invasivo | Falsa precisión + tracking innecesario | Solo `time_spent_seconds` explícito al completar lección (`RF-SEC-005`), sin heartbeat |
| Ranking público con datos individuales | Vergüenza / gaming tóxico | Rankings solo agregados o post-MVP opt-in; nunca por defecto |
| Compartir progreso con ads | Violación RNF-040 | Tabla analítica aislada; contrato `AdsProvider` sin `user_id` de progreso |
| Re-identificar via `document_number` | Fuga PII | Seudonimización + enmascaramiento en verificación |
| Métricas sin `content_version` | No reproducible | Toda métrica guarda versión; §5 |
| “Analytics bloquea lección” | Viola RNF-014 | Pipeline analítico async; degradado no bloqueante |
| Vanity metrics (solo registrados) | Decisión ciega | D-01 exige DAU/MAU + abandono + certificación, no solo M-01 |

---

## 10. Trazabilidad

| Elemento de este doc | RF (`05`) | RNF (`06`) | OE/OT/PS (`02`/`03`) |
|---|---|---|---|
| M-01 Registrados | RF-AUTH-001, RF-USR-001 | RNF-037 | OE-01 |
| M-02 Activos (DAU/WAU/MAU) | RF-RACHA-001, RF-PROG-001 | RNF-018 | OE-01, `03` §7 |
| M-03 Sesiones / M-04 Lecciones | RF-SEC-003, RF-LEC-003 | RNF-010/011 | OED-01, PS-01 |
| M-05 Preguntas / M-06 % correctas | RF-PREG-005, RF-EVAL-001/002 | RNF-035 | PS-05, `15` §7 |
| M-07 Módulos aprobados | RF-EXAM-003, RF-MOD-003 | RNF-034 | OE-04, PS-06 |
| M-08 Tasa abandono | RF-PROG-002, `14` §7 | RNF-018 | PS-06 |
| M-09 Rachas | RF-RACHA-001–005 | RNF-018 | OE-05, `16` §7 |
| M-10 Certificados | RF-CERT-001–003, RF-AUTH-005 | RNF-034 | OE-06 |
| M-11 Premium | RF-PREM-001–003/006 | RNF-037 | OE-07 |
| M-13 Tiempo por sección | RF-SEC-005 | RNF-018 | `14` §7.1 |
| M-14 Aprobación quiz/examen | RF-QUIZ-003, RF-EXAM-003 | RNF-012 | `03` §7.2 |
| Eventos origen §3 | RF-AUTH-008, RF-ADM-008, RF-EVAL-003 | RNF-033/035/045 | OT-06 |
| Dashboards D-01..D-04 | RF-PROG-006 | RNF-014/018 | `03` §7, `11` §22 |
| Privacidad §7 | RF-USR-003/006, RF-ADS-004 | RNF-037–040 | OT-06 |
| No intrusivo / degradado | RF-ADS-003 | RNF-014 | `04` §9 |

---

## 11. Criterios de aceptación de analítica

- [ ] Las 11 métricas solicitadas (M-01 a M-11) están definidas con fórmula determinista, evento origen y granularidad, y son reproducibles por SQL sobre `12` sin ETL propietario.
- [ ] Tabla maestra §4 cubre métrica → definición → fórmula → evento origen para cada métrica.
- [ ] Cuatro dashboards MVP (D-01 Ejecutivo, D-02 Aprendizaje, D-03 Engagement, D-04 Monetización/Operación) definidos con KPIs, visuales y alertas.
- [ ] Ninguna métrica requiere fingerprinting, tracking cross-site ni compartir progreso con anuncios; la exclusión de §2.1 se cumple y es verificable por inspección de payloads.
- [ ] Seudonimización (`HMAC` + sal rotativa), enmascaramiento de `document_number`, anonimización de IP y retención 24/36/12 meses documentadas y testeables.
- [ ] Degradado: fallo del pipeline analítico o de email/ads/PDF no bloquea lecciones/quizzes/exámenes (`RNF-014`).
- [ ] Cada métrica guarda `content_version`/`config_version`/`periodo` para reproducibilidad; cambio de umbral/contenido no reescribe historia.
- [ ] Checklist de implementación §12 por métrica pasa en CI.

---

## 12. Checklist de implementación por métrica

Cada métrica se considera **terminada** solo si:

- [ ] Su SQL de agregación está en `fact_daily` o vista materializada versionada y pasa `EXPLAIN ANALYZE` en `staging` con 100k intentos (`RNF-007`).
- [ ] Su evento origen persiste transaccionalmente con `idempotency_key`/`content_version`/`threshold_applied` donde aplica (`RNF-033/035`).
- [ ] Está expuesta en el dashboard correspondiente (§6) con `content_version` visible y rango 30d por defecto.
- [ ] No expone PII en payload ni en logs; test de inspección de PII pasa.
- [ ] Tiene test en `20` (unit/integration) y mapea a RF/RNF de §10.
- [ ] Está trazada en `CHANGELOG.md` con fecha `America/Bogota`.

---

## 13. Referencias cruzadas

| Documento | Relación |
|---|---|
| `01_PROJECT_OVERVIEW.md` §16/§20/§28 | Progreso, perfil y gamificación que la analítica mide |
| `03_OBJECTIVES.md` §7 | Indicadores objetivo que este doc operacionaliza |
| `05_FUNCTIONAL_REQUIREMENTS.md` | 128 RF origen de cada evento (ver §10) |
| `06_NON_FUNCTIONAL_REQUIREMENTS.md` | RNF-018/037–040/045 que este doc cumple |
| `11_SYSTEM_ARCHITECTURE.md` §22 | Observabilidad que consume estas métricas |
| `12_DATABASE_DESIGN.md` §6.12–§6.18 | Tablas origen de cada evento |
| `13_API_SPECIFICATION.md` | Endpoints que generan cada evento |
| `14_LEARNING_SYSTEM.md` §7/§8/§10 | Señales de adaptación y `Score_repaso` que la analítica alimenta |
| `15_QUIZ_EXAM_SYSTEM.md` §15.3 | Calibración de dificultad con `tasa_acierto_global` |
| `16_GAMIFICATION.md` §17 | Telemetría de XP/racha/logros que este doc agrega |
| `19_SECURITY.md` (futuro) | Detalle de hash, seudonimización y vault |
| `21_DEPLOYMENT.md` (futuro) | Pipeline, retención y RPO/RTO |

---

*Fin de `26_ANALYTICS.md` — cualquier adición de métrica, cambio de fórmula o nuevo dashboard requiere ADR si afecta privacidad o RNF obligatorio, actualización de este documento y entrada en `CHANGELOG.md` con fecha `America/Bogota`.*
