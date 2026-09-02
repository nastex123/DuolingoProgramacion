# 12 — Diseño de Base de Datos

> **Estado:** Aprobado / Actualizado · **Versión del documento:** 2.0.0 · **Fecha:** 2026-09-02
> Complementa a `01_PROJECT_OVERVIEW.md`, `03_OBJECTIVES.md`, `04_SCOPE.md`, `05_FUNCTIONAL_REQUIREMENTS.md`, `06_NON_FUNCTIONAL_REQUIREMENTS.md`, `07_USER_STORIES.md`, `11_SYSTEM_ARCHITECTURE.md`, `14_LEARNING_SYSTEM.md`, `16_GAMIFICATION.md`, `27_UI_UX_SPECIFICATION.md` y `28_LUA_CURRICULUM.md`. Materializa el modelo relacional para PostgreSQL ≥ 15 que deben implementar las migraciones versionadas, incluyendo el sistema de desbloqueo progresivo por estrellas (1–3⭐), candados secuenciales, cuaderno de errores y soporte multi-lenguaje (con Lua como lenguaje insignia de lanzamiento).

---

## 1. Propósito y alcance

Este documento define **qué se persiste, cómo se relaciona y con qué garantías** para la plataforma interactiva de aprendizaje de programación con enfoque gamificado. Es la fuente de verdad para:

- Migraciones versionadas (`RF-ADM-005`, `RNF-035`).
- Contratos de API (`13_API_SPECIFICATION.md`): cada recurso persistido tiene reflejo en un endpoint.
- Motores de Dominio: `Learning`, `Question`, `Evaluation`, `Progress`, `Gamification` (Estrellas ⭐, XP, Rachas, Logros), `Review Notebook` (Cuaderno de Errores) y `Certification` (`01` §24–§29, `03` OT-01, `14`, `16`, `28`).
- Desbloqueo progresivo con candados secuenciales ($S_1 \to S_n$) y compuertas de maestría de módulos ($M_{i+1}$ requiere 100% de secciones y $\ge 80\%$ de estrellas de maestría de $M_i$).
- Trazabilidad `RF-*` → tabla/columna y pruebas de invariantes (`20_TESTING.md`, `RNF-033`–`RNF-036`).

**Fuera de alcance:** elección cerrada de proveedor de nube (se especifica interfaz `PostgreSQL ≥ 15` compatible como referencia sin hardcodear hosting), sintaxis propietaria vendor-lock (se provee DDL ANSI/Postgres en `§10`), y detalle de infraestructura de despliegue (`21_DEPLOYMENT.md`).

---

## 2. Convenciones

### 2.1 Identificadores y tipos base

| Convención | Valor |
|---|---|
| PK de todas las tablas de negocio | `UUID v4` (`uuid` / `gen_random_uuid()`), salvo catálogos pequeños inmutables donde se admite `SMALLINT` |
| FK | `UUID` hacia PK referenciada, `ON DELETE RESTRICT` por defecto; `ON DELETE CASCADE` solo en hijos sin sentido sin padre (ej. `answer → question`, `review_queue_items → attempt`) |
| Timestamps | `TIMESTAMPTZ` en UTC; presentación en `America/Bogota` en capa de aplicación (`RNF-018`, `RNF-045`) |
| Moneda | `amount_cents INTEGER` + `currency CHAR(3)` para evitar flotantes |
| Enumeraciones | `VARCHAR` + `CHECK` + `TYPE ENUM` opcional; nunca `INTEGER` mágico |
| Texto largo | `TEXT` con `CHECK (char_length(col) <= N)` cuando hay límite de producto |
| JSON | `JSONB` solo para metadatos extensibles no consultados por rango; todo lo consultable tiene columna dedicada |
| Borrado | `deleted_at TIMESTAMPTZ` (soft delete) en contenido administrable; datos de usuario eliminables se anonimizan (`RF-USR-003`, `RNF-038`) no solo soft-delete |

### 2.2 Nombres

- Tablas en `snake_case` plural (`users`, `programming_languages`, `user_section_stars`, `user_mistakes_notebook`).
- Columnas en `snake_case`.
- Índices `idx_{tabla}_{columnas}`, únicos `uq_{tabla}_{columnas}`, FK `fk_{tabla}_{ref}`, checks `chk_{tabla}_{regla}`.
- Migraciones `V{YYYYMMDD}_{NNN}__{descripcion}.sql` versionadas y reproducibles (`RNF-019`, `RNF-043`).

### 2.3 Principios transversales

1. **Integridad referencial en BD** (`RNF-036`): toda FK existe en BD, no solo en app. Sin huérfanos.
2. **Persistencia atómica** (`RNF-033`, `RF-PROG-001`, `RF-LEC-003`): cada `Attempt`/`AttemptAnswer` es transaccional; doble envío con `idempotency_key` no duplica (`RNF-042`, `05` regla 3).
3. **Calificación Formativa en Estrellas** (`14` §4.2, `16` §8.1): la calificación de 1 a 3 estrellas mide la precisión en la primera pasada y se adjudica tras completar la lección o su ronda de repaso formativo, permitiendo rejugabilidad sin penalizaciones.
4. **Versionado de contenido** (`RNF-035`, `RF-PREG-006`, `RF-ADM-005`): cada intento congela `content_version` y `threshold_applied`; editar una pregunta crea nueva fila versionada, no `UPDATE` destructivo.
5. **Contenido desacoplado** (`RNF-031`, `RF-LANG-004`): ningún texto de lección/pregunta hardcodeado fuera de tablas/archivos de contenido.
6. **Privacidad por diseño** (`RNF-037`–`RNF-040`): PII mínima, nunca en logs/URLs; `document_number` solo para certificado y cifrable si se requiere.

---

## 3. Gestor recomendado y justificación

| Opción | Ventajas | Desventajas | Recomendación |
|---|---|---|---|
| **PostgreSQL ≥ 15 (recomendado)** | FKs + `EXCLUDE` + `JSONB` + `GIN` + `pgcrypto`/`pg_partman`; transacciones sólidas; `TIMESTAMPTZ`; ecosistema de migraciones (Flyway/Liquibase/Prisma/Drizzle) | Requiere gestión de índices y `VACUUM` | ⭐ **Elegida para Producción** — cubre `RNF-033`–`RNF-036` con máximo rendimiento y garantías ACID |
| MySQL 8 | Amplio hosting | Menor soporte `EXCLUDE`, `JSONB` limitado | Alternativa secundaria |
| SQLite | Simplicidad local | No apto para `RNF-005` (escalado horizontal) ni concurrencia de `RNF-001` | Solo para prototipos rápidos o tests offline |

---

## 4. Diagrama ER (Mermaid)

```mermaid
erDiagram
    users ||--o| user_profiles : "1:1 tiene"
    users ||--o{ learning_paths : "1:N personaliza"
    users ||--o{ attempts : "1:N intenta"
    users ||--o{ progress : "1:N agrega"
    users ||--o{ user_section_stars : "1:N califica"
    users ||--o{ user_module_progress : "1:N desbloquea"
    users ||--o{ user_mistakes_notebook : "1:N repasa"
    users ||--o{ review_queue_items : "1:N procesa"
    users ||--o{ xp_transactions : "1:N gana"
    users ||--o{ streaks : "1:N historial"
    users ||--o{ user_achievements : "1:N desbloquea"
    users ||--o{ certificates : "1:N certifica"
    users ||--o{ subscriptions : "1:N suscribe"
    users ||--o{ diagnostic_results : "1:N diagnostica"

    programming_languages ||--o{ learning_paths : "1:N ofrece"
    programming_languages ||--o{ modules : "1:N contiene"
    programming_languages ||--o{ user_module_progress : "1:N mide"
    programming_languages ||--o{ certificates : "1:N acredita"

    learning_paths ||--o{ learning_path_modules : "1:N ordena"

    modules ||--o{ sections : "1:N agrupa"
    modules ||--o{ quizzes : "1:N evalúa"
    modules ||--o{ exams : "1:N certifica"
    modules ||--o{ questions : "1:N ancla"
    modules ||--o{ user_module_progress : "1:N maestría"

    sections ||--o{ lessons : "1:N compone"
    sections ||--o{ questions : "1:N ancla"
    sections ||--o{ user_section_stars : "1:N estrellas"

    lessons ||--o{ questions : "1:N ancla"
    lessons ||--o{ progress : "1:N mide"

    questions ||--o{ answers : "1:N opciones"
    questions ||--o{ quiz_questions : "N:M quiz"
    questions ||--o{ exam_questions : "N:M exam"
    questions ||--o{ attempt_answers : "1:N responde"
    questions ||--o{ user_mistakes_notebook : "1:N registra"
    questions ||--o{ review_queue_items : "1:N encola"

    answers ||--o{ attempt_answers : "1:N elige"

    quizzes ||--o{ quiz_questions : "1:N compone"
    quizzes ||--o{ attempts : "1:N genera"

    exams ||--o{ exam_questions : "1:N compone"
    exams ||--o{ attempts : "1:N genera"

    attempts ||--o{ attempt_answers : "1:N detalla"
    attempts ||--o{ review_queue_items : "1:N activa"

    achievements ||--o{ user_achievements : "1:N otorga"

    %% Entidades de soporte
    programming_languages {
        uuid id PK
        varchar code
        varchar name
        varchar status
    }
    users {
        uuid id PK
        varchar email
        varchar status
    }
    user_section_stars {
        uuid id PK
        uuid user_id FK
        uuid section_id FK
        smallint stars_earned
        int first_attempt_errors
    }
    user_module_progress {
        uuid id PK
        uuid user_id FK
        uuid module_id FK
        boolean is_unlocked
        int stars_earned
        numeric stars_percentage
    }
    user_mistakes_notebook {
        uuid id PK
        uuid user_id FK
        uuid question_id FK
        int fail_count
        boolean is_resolved
    }
```

> Nota: `quiz_questions` y `exam_questions` son tablas de composición versionada; `attempt_answers` congela la respuesta dada y su corrección. `user_section_stars` almacena el rendimiento en estrellas (1–3⭐) por sección. `user_module_progress` centraliza el estado del candado del módulo y el porcentaje de maestría acumulado. `user_mistakes_notebook` persiste los fallos para práctica deliberada y refuerzo formativo.

---

## 5. Resumen de entidades y trazabilidad

| # | Entidad | Tabla | RF / RNF principales | Rol en la Plataforma |
|---|---|---|---|---|
| 1 | User | `users` | RF-AUTH-*, RF-USR-* | Identidad y credenciales de autenticación |
| 2 | UserProfile | `user_profiles` | RF-PROF-*, RF-USR-002 | Perfil visible, preferencias y configuración de UI |
| 3 | ProgrammingLanguage | `programming_languages` | RF-LANG-* | Catálogo multi-lenguaje (`LUA` activo de lanzamiento, `PY`, `JS`, etc.) |
| 4 | LearningPath | `learning_paths` | RF-RUTA-*, RF-LVL-*, RF-DIAG-* | Ruta personalizada por usuario/lenguaje |
| 5 | Module | `modules` | RF-MOD-*, RF-RUTA-004 | Unidad temática (12 módulos canónicos con umbrales) |
| 6 | Section | `sections` | RF-SEC-*, RF-ESTRELLA-* | Subdivisión pedagógica con candados secuenciales ($S_1 \dots S_n$) |
| 7 | Lesson | `lessons` | RF-LEC-*, RF-PREG-* | Unidad mínima de aprendizaje (10 por sección, concepto + ejercicio) |
| 8 | Question | `questions` | RF-PREG-* | Banco tipificado (8 tipos interactivos con versiones) |
| 9 | Answer | `answers` | RF-PREG-002 | Opciones y validaciones por pregunta |
| 10 | Quiz | `quizzes` | RF-QUIZ-* | Evaluación intermedia por módulo (diagnóstica o formativa) |
| 11 | Exam | `exams` | RF-EXAM-* | Examen de certificación y evaluación final de módulo |
| 12 | Attempt | `attempts` | RF-EVAL-*, RF-QUIZ-003, RF-EXAM-003 | Registro de intento inmutable y auditable |
| 13 | Progress | `progress` | RF-PROG-* | Agregado de avance porcentual e ítems completados |
| 14 | XPTransaction | `xp_transactions` | RF-XP-* | Ledger transaccional de XP (recompensas e incentivos) |
| 15 | Streak | `streaks` | RF-RACHA-* | Historial diario para cálculo de rachas activas |
| 16 | Achievement | `achievements` + `user_achievements` | RF-LOGRO-* | Catálogo de medallas/logros y desbloqueos por usuario |
| 17 | Certificate | `certificates` | RF-CERT-*, RF-PDF-* | Acreditación digital verificable con QR y firma |
| 18 | Subscription | `subscriptions` | RF-PREM-*, RF-ADS-* | Suscripción Premium mensual (USD $1/mes) |
| 19 | UserSectionStars | `user_section_stars` | RF-ESTRELLA-001–005, RF-SEC-004 | Puntuación de 1–3 estrellas por sección y registro de reintentos |
| 20 | UserModuleProgress | `user_module_progress` | RF-CANDADO-001–004, RF-MOD-004 | Estado de candado de módulo, % de maestría en estrellas y examen |
| 21 | UserMistakesNotebook | `user_mistakes_notebook` | RF-CUADERNO-001–006, RF-REP-001 | Cuaderno de errores persistente para práctica deliberada |
| 22 | ReviewQueueItem | `review_queue_items` | RF-REP-002, RF-ESTRELLA-002 | Cola de preguntas pendientes en la ronda de repaso de la lección |

---

## 6. Definición por entidad

### 6.1 User — `users`

Identidad canónica. Aísla autenticación de perfil (`RF-USR-005`, `RNF-008`–`RNF-009`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, `DEFAULT gen_random_uuid()` | Identificador interno estable |
| `email` | `VARCHAR(320)` | `NOT NULL`, `UNIQUE`, `CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')` | Email canónico en minúsculas (`LOWER(email)`) |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Argon2id/bcrypt; nunca en claro (`RNF-008`) |
| `status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'active'`, `CHECK (status IN ('active','blocked','pending_verification','deleted'))` | `RF-USR-004` |
| `email_verified_at` | `TIMESTAMPTZ` | `NULL` si no verificado | `RF-AUTH-005`; bloquea solo certificado, no aprendizaje |
| `last_login_at` | `TIMESTAMPTZ` | `NULL` | Auditoría `RF-AUTH-008` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Trigger `ON UPDATE` |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` | Anonimización `RF-USR-003`; no reutiliza email sin confirmación |

**Relaciones:** 1:1 `user_profiles`, 1:N `learning_paths`, `attempts`, `progress`, `xp_transactions`, `streaks`, `user_achievements`, `certificates`, `subscriptions`.

**Restricciones adicionales:**
- `CHECK (email = LOWER(email))`.
- `UNIQUE (email) WHERE deleted_at IS NULL` (permite re-registro tras anonimización solo con confirmación).
- Contraseña nunca logueada (`RNF-008`).

**Índices:**
- `uq_users_email` — `UNIQUE (email) WHERE deleted_at IS NULL`.
- `idx_users_status` — `(status)` para bloqueo masivo/admin.
- `idx_users_created_at` — `(created_at)` para analytics `26`.

---

### 6.2 UserProfile — `user_profiles`

Datos visibles y preferencias. Separado de `users` para minimizar PII en joins de autenticación (`RNF-037`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL`, `UNIQUE` | 1:1 estricto |
| `display_name` | `VARCHAR(80)` | `NOT NULL`, `CHECK (char_length(display_name) BETWEEN 2 AND 80)` | `RF-USR-001/002` |
| `avatar_url` | `VARCHAR(512)` | `NULL`, `CHECK (avatar_url ~* '^https?://')` | `RF-PROF-002`; por defecto URL de avatar genérico en app |
| `avatar_object_key` | `VARCHAR(512)` | `NULL` | Clave en storage S3-compatible si se sube archivo |
| `document_number` | `VARCHAR(50)` | `NULL`, `CHECK (char_length(document_number) BETWEEN 5 AND 50)` | Solo para certificado (`RF-CERT-002`); cifrable con `pgp_sym_encrypt` si se exige |
| `timezone` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'America/Bogota'` | `RF-RACHA-004`; corte diario de racha |
| `locale` | `VARCHAR(10)` | `NOT NULL`, `DEFAULT 'es-CO'` |  |
| `bio` | `VARCHAR(500)` | `NULL` | Opcional futuro perfil público Post-MVP |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |

**Relaciones:** N:1 `users`.

**Restricciones:**
- `CHECK (timezone IN (SELECT name FROM pg_timezone_names))` o lista blanca en app + validación en `RF-ADM-006`.
- `document_number` no se expone en listados; solo en PDF y verificación interna (`RNF-037`).

**Índices:**
- `uq_user_profiles_user_id` — `UNIQUE (user_id)`.
- `idx_user_profiles_display_name` — `GIN (display_name gin_trgm_ops)` para búsqueda admin (opcional).

---

### 6.3 ProgrammingLanguage — `programming_languages`

Catálogo extensible sin tocar el motor (`RF-LANG-004`, `RNF-006`, `RNF-031`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `code` | `VARCHAR(20)` | `NOT NULL`, `UNIQUE`, `CHECK (code ~ '^[A-Z0-9_]+$')` | Ej. `PY`, `LUA`, `JS`; usado en `CQ-{LANG}-{SEQ}` |
| `name` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Ej. `Python` |
| `slug` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE`, `CHECK (slug ~ '^[a-z0-9-]+$')` | URL `/languages/python` |
| `description` | `TEXT` | `NULL`, `CHECK (char_length(description) <= 2000)` |  |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('available','coming_soon','hidden'))`, `DEFAULT 'coming_soon'` | `RF-LANG-001`; en MVP solo `PY=available` |
| `sort_order` | `SMALLINT` | `NOT NULL`, `DEFAULT 100` | Orden de listado |
| `icon_url` | `VARCHAR(512)` | `NULL` |  |
| `content_version` | `INTEGER` | `NOT NULL`, `DEFAULT 1` | Versión agregada del lenguaje; cambio significativo puede obsoletar certificados (`RF-CERT-005`) |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | Soft habilitación sin borrar |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` |  |

**Relaciones:** 1:N `modules`, `learning_paths`, `certificates`.

**Restricciones:**
- `CHECK ((status='available' AND is_active=true) OR status!='available')` — disponible implica activo.

**Índices:**
- `uq_programming_languages_code` — `UNIQUE (code)`.
- `uq_programming_languages_slug` — `UNIQUE (slug)`.
- `idx_programming_languages_status_sort` — `(status, sort_order)`.

---

### 6.4 LearningPath — `learning_paths`

Ruta personalizada por usuario y lenguaje (`RF-RUTA-001`, `RF-DIAG-003`). No es el orden canónico de `modules`; es la **instancia** que adapta el punto de entrada.

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` |  |
| `language_id` | `UUID` | **FK → programming_languages.id**, `NOT NULL` |  |
| `declared_level` | `VARCHAR(20)` | `NOT NULL`, `CHECK (declared_level IN ('BEGINNER','MEDIUM','SEMI_PROFESSIONAL','PROFESSIONAL'))` | `RF-LVL-001` |
| `diagnostic_attempt_id` | `UUID` | **FK → attempts.id**, `NULL` | `RF-DIAG-005`; intento de tipo `diagnostic` |
| `entry_module_id` | `UUID` | **FK → modules.id**, `NULL` | Módulo/sección recomendados (`RF-DIAG-003`) |
| `entry_section_id` | `UUID` | **FK → sections.id**, `NULL` |  |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('active','completed','abandoned'))`, `DEFAULT 'active'` |  |
| `current_module_id` | `UUID` | **FK → modules.id**, `NULL` | Cursor de reanudación (`RF-RUTA-005`) |
| `current_section_id` | `UUID` | **FK → sections.id**, `NULL` |  |
| `current_lesson_id` | `UUID` | **FK → lessons.id**, `NULL` |  |
| `progress_percent` | `SMALLINT` | `NOT NULL`, `DEFAULT 0`, `CHECK (progress_percent BETWEEN 0 AND 100)` | Agregado cacheado; fuente de verdad es `progress` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |

**Relaciones:** N:1 `users`, `programming_languages`; N:1 opcionales a `modules`/`sections`/`lessons`; 1:N `learning_path_modules` (orden efectivo); 1:N `diagnostic_results` si se desglosa por área.

**Restricciones:**
- `UNIQUE (user_id, language_id) WHERE status='active'` — una ruta activa por lenguaje (`RF-LANG-005`).
- `CHECK ((entry_module_id IS NULL) = (entry_section_id IS NULL) OR entry_section_id IS NULL)` — sección sin módulo es inválida (validado en app + FK).
- `CHECK (progress_percent BETWEEN 0 AND 100)`.

**Índices:**
- `uq_learning_paths_user_lang_active` — `UNIQUE (user_id, language_id) WHERE status='active'` (partial).
- `idx_learning_paths_user_lang` — `(user_id, language_id)`.
- `idx_learning_paths_current` — `(current_module_id, current_section_id)` para reanudación.
- `idx_learning_paths_language` — `(language_id)`.

**Tabla de orden efectivo — `learning_path_modules`:**

| Campo | Tipo | Restricción |
|---|---|---|
| `learning_path_id` | `UUID` | **FK → learning_paths.id**, `NOT NULL`, `ON DELETE CASCADE` |
| `module_id` | `UUID` | **FK → modules.id**, `NOT NULL` |
| `position` | `SMALLINT` | `NOT NULL`, `CHECK (position > 0)` |
| `is_skipped_by_diagnostic` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('locked','available','in_progress','passed','failed'))` |

- **PK** compuesta `(learning_path_id, module_id)`.
- **UQ** `(learning_path_id, position)`.
- Índice `(learning_path_id, position)`.

---

### 6.5 Module — `modules`

Unidad temática canónica (12 módulos en el currículo principal de Lua `28_LUA_CURRICULUM.md`). Orden pedagógico configurable sin código (`RF-MOD-004`, `RF-ADM-004`, `RNF-017`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** | Identificador único del módulo |
| `language_id` | `UUID` | **FK → programming_languages.id**, `NOT NULL` | Lenguaje al que pertenece (`LUA`, `PY`, etc.) |
| `code` | `VARCHAR(50)` | `NOT NULL` | Ej. `LUA_MOD_01`, `LUA_MOD_02` |
| `title` | `VARCHAR(150)` | `NOT NULL` | Título visible (ej. `Fundamentos de Lua`) |
| `slug` | `VARCHAR(150)` | `NOT NULL` | Slug para URLs amigables |
| `description` | `TEXT` | `NULL` | Resumen pedagógico del módulo |
| `objective` | `TEXT` | `NULL` | `RF-MOD-002`; objetivo de aprendizaje |
| `position` | `SMALLINT` | `NOT NULL`, `CHECK (position > 0)` | Posición secuencial en el roadmap (1..12) |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('draft','review','published','archived'))`, `DEFAULT 'draft'` | `RF-ADM-003/009` |
| `content_version` | `INTEGER` | `NOT NULL`, `DEFAULT 1` | Incrementa en cada publicación (`RF-ADM-005`) |
| `total_sections` | `SMALLINT` | `NOT NULL`, `DEFAULT 10`, `CHECK (total_sections > 0)` | Cantidad de secciones (10 en Lua estándar) |
| `total_lessons` | `SMALLINT` | `NOT NULL`, `DEFAULT 100`, `CHECK (total_lessons > 0)` | Cantidad de lecciones atómicas (100 en M02) |
| `min_stars_percentage` | `SMALLINT` | `NOT NULL`, `DEFAULT 80`, `CHECK (min_stars_percentage BETWEEN 0 AND 100)` | Umbral de maestría (80% ⭐) para desbloquear $M_{i+1}$ (`14` §4.1) |
| `quiz_threshold` | `SMALLINT` | `NOT NULL`, `DEFAULT 70`, `CHECK (quiz_threshold BETWEEN 0 AND 100)` | `RF-EVAL-005`; inicial 70% |
| `exam_threshold` | `SMALLINT` | `NOT NULL`, `DEFAULT 80`, `CHECK (exam_threshold BETWEEN 0 AND 100)` | Umbral de aprobación de examen final (80%) |
| `xp_on_pass` | `INTEGER` | `NOT NULL`, `DEFAULT 150` | `01` §17; XP otorgada al completar el módulo |
| `prerequisite_module_id` | `UUID` | **FK → modules.id**, `NULL` | `RF-RUTA-004`; NULL para el primer módulo ($M_1$) |
| `published_at` | `TIMESTAMPTZ` | `NULL` | Fecha de publicación |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` |  |

**Relaciones:** N:1 `programming_languages`; 1:N `sections`, `quizzes`, `exams`, `questions`, `user_module_progress`; self-referencia `prerequisite_module_id`.

**Restricciones:**
- `UNIQUE (language_id, code) WHERE deleted_at IS NULL`.
- `UNIQUE (language_id, slug) WHERE deleted_at IS NULL`.
- `UNIQUE (language_id, position) WHERE deleted_at IS NULL`.
- `CHECK (prerequisite_module_id IS NULL OR prerequisite_module_id != id)` — sin auto-ciclo.
- Validación de ciclos en grafo de prerrequisitos en capa app (`RF-ADM-006`) + trigger que rechaza ciclos detectables por CTE recursivo.

**Índices:**
- `uq_modules_lang_code` — `UNIQUE (language_id, code) WHERE deleted_at IS NULL`.
- `idx_modules_lang_position` — `(language_id, position) WHERE deleted_at IS NULL`.
- `idx_modules_lang_status` — `(language_id, status)`.
- `idx_modules_prereq` — `(prerequisite_module_id)`.

---

### 6.6 Section — `sections`

Subdivisión pedagógica de módulo (`01` §7.3, `RF-SEC-*`). Cada sección agrupa lecciones teóricas y ejercicios interactivos con evaluación formativa en estrellas (1–3⭐) y candado secuencial ($S_1 \to S_n$).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `module_id` | `UUID` | **FK → modules.id**, `NOT NULL`, `ON DELETE CASCADE` | Módulo padre |
| `title` | `VARCHAR(150)` | `NOT NULL` | Nombre descriptivo de la sección |
| `slug` | `VARCHAR(150)` | `NOT NULL` | Slug único dentro del módulo |
| `position` | `SMALLINT` | `NOT NULL`, `CHECK (position > 0)` | Posición secuencial en el módulo (1..10) |
| `type` | `VARCHAR(20)` | `NOT NULL`, `CHECK (type IN ('theory','example','exercise','quiz','review'))`, `DEFAULT 'theory'` | `RF-SEC-001` |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('draft','published','archived'))`, `DEFAULT 'draft'` |  |
| `content_version` | `INTEGER` | `NOT NULL`, `DEFAULT 1` |  |
| `total_lessons` | `SMALLINT` | `NOT NULL`, `DEFAULT 10`, `CHECK (total_lessons > 0)` | Cantidad de lecciones atómicas en la sección |
| `stars_available` | `SMALLINT` | `NOT NULL`, `DEFAULT 3`, `CHECK (stars_available BETWEEN 1 AND 3)` | Máximo de estrellas adjudicables (3 ⭐) |
| `is_first_section` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | `true` si `position = 1` (desbloqueada por defecto al abrir módulo) |
| `xp_on_complete` | `INTEGER` | `NOT NULL`, `DEFAULT 10` | `01` §17; XP otorgada al finalizar la sección |
| `estimated_minutes` | `SMALLINT` | `NULL`, `CHECK (estimated_minutes BETWEEN 1 AND 120)` | Tiempo estimado en minutos |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` |  |

**Relaciones:** N:1 `modules`; 1:N `lessons`, `questions`, `user_section_stars`.

**Restricciones:**
- `UNIQUE (module_id, slug) WHERE deleted_at IS NULL`.
- `UNIQUE (module_id, position) WHERE deleted_at IS NULL`.

**Índices:**
- `idx_sections_module_position` — `(module_id, position)`.
- `idx_sections_module_status` — `(module_id, status)`.

---

### 6.7 Lesson — `lessons`

Unidad mínima de aprendizaje con flujo `concepto → explicación → ejemplo → ejercicio → feedback → recompensa` (`RF-LEC-001`, `01` §6).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `section_id` | `UUID` | **FK → sections.id**, `NOT NULL`, `ON DELETE CASCADE` |  |
| `title` | `VARCHAR(150)` | `NOT NULL` |  |
| `slug` | `VARCHAR(150)` | `NOT NULL` |  |
| `position` | `SMALLINT` | `NOT NULL` |  |
| `body_mdx` | `TEXT` | `NOT NULL` | Explicación breve en formato declarativo (`23_CONTENT_SPECIFICATION.md`) |
| `example_code` | `TEXT` | `NULL` | Bloques de ejemplo; nunca hardcodeado en UI |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('draft','published','archived'))`, `DEFAULT 'draft'` |  |
| `content_version` | `INTEGER` | `NOT NULL`, `DEFAULT 1` |  |
| `is_required` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | `RF-SEC-003`: obligatoria para completar sección |
| `xp_on_complete` | `INTEGER` | `NOT NULL`, `DEFAULT 0` | Normalmente 0; XP se otorga por ejercicio/section |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` |  |

**Relaciones:** N:1 `sections`; 1:N `questions` (ancladas a lección), `progress`.

**Restricciones:**
- `UNIQUE (section_id, slug) WHERE deleted_at IS NULL`.
- `UNIQUE (section_id, position) WHERE deleted_at IS NULL`.

**Índices:**
- `idx_lessons_section_position` — `(section_id, position)`.
- `idx_lessons_section_status` — `(section_id, status)`.

---

### 6.8 Question — `questions`

Banco tipificado (`RF-PREG-001/002`, `01` §11). Versionada: editar crea nueva fila (`RF-PREG-006`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** | Identidad lógica de la pregunta (estable entre versiones) |
| `version` | `INTEGER` | `NOT NULL`, `DEFAULT 1`, `CHECK (version > 0)` | Versión de esta fila |
| `language_id` | `UUID` | **FK → programming_languages.id**, `NOT NULL` |  |
| `module_id` | `UUID` | **FK → modules.id**, `NOT NULL` | Anclaje `RF-PREG-003` |
| `section_id` | `UUID` | **FK → sections.id**, `NULL` | Opcional si es de sección |
| `lesson_id` | `UUID` | **FK → lessons.id**, `NULL` | Opcional si es de lección |
| `type` | `VARCHAR(30)` | `NOT NULL`, `CHECK (type IN ('multiple_choice','true_false','fill_code','predict_output','find_error','order_lines','select_correct_code','match_concepts','write_code','small_problem'))` | `RF-PREG-001` |
| `difficulty` | `VARCHAR(20)` | `NOT NULL`, `CHECK (difficulty IN ('easy','medium','hard'))`, `DEFAULT 'medium'` |  |
| `category` | `VARCHAR(50)` | `NULL` | Ej. `variables`, `loops` para `RF-EVAL-004` |
| `prompt` | `TEXT` | `NOT NULL` | Enunciado |
| `prompt_code` | `TEXT` | `NULL` | Código asociado al enunciado |
| `explanation` | `TEXT` | `NOT NULL` | Explicación de la respuesta correcta (`RF-PREG-004`) |
| `score` | `INTEGER` | `NOT NULL`, `DEFAULT 10`, `CHECK (score > 0)` | `RF-PREG-002` |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('draft','published','archived'))`, `DEFAULT 'draft'` |  |
| `content_version` | `INTEGER` | `NOT NULL`, `DEFAULT 1` | Alias de `version` para trazabilidad de intento |
| `created_by` | `UUID` | **FK → users.id**, `NULL` | Auditoría `RF-ADM-008` |
| `published_at` | `TIMESTAMPTZ` | `NULL` |  |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` |  |

**Relaciones:** N:1 `programming_languages`, `modules`, opcional `sections`/`lessons`; 1:N `answers`, `attempt_answers`, `quiz_questions`, `exam_questions`.

**Restricciones:**
- **PK lógica** `(id, version)` — `PRIMARY KEY (id, version)`; `id` solo es estable, la unicidad real es compuesta. Alternativa: tabla `question_versions` con `question_id + version`; aquí se modela como tabla versionada directa por simplicidad.
- `CHECK ((lesson_id IS NULL AND section_id IS NULL) OR (lesson_id IS NOT NULL AND section_id IS NOT NULL) OR (lesson_id IS NULL AND section_id IS NOT NULL))` — si hay `lesson_id` debe haber `section_id` coherente (validado por FK + trigger que verifica `lessons.section_id = questions.section_id`).
- `CHECK (score BETWEEN 1 AND 100)`.
- `CHECK (type != 'write_code' OR prompt_code IS NOT NULL)` — ejemplo de validación por tipo.

**Índices (críticos para `RNF-007` y repaso `RF-REP-002`):**
- `pk_questions_id_version` — `PRIMARY KEY (id, version)`.
- `idx_questions_module_status` — `(module_id, status, type)` para composición de quiz/examen.
- `idx_questions_section` — `(section_id)` donde no nulo.
- `idx_questions_lesson` — `(lesson_id)` donde no nulo.
- `idx_questions_category` — `(category)` para bajo rendimiento.
- `idx_questions_difficulty` — `(difficulty)`.
- `idx_questions_language` — `(language_id)`.
- `idx_questions_published` — `(published_at) WHERE status='published'`.

> **Versionado:** `UPDATE` de una pregunta publicada está prohibido por trigger; se exige `INSERT` con mismo `id` y `version+1`. Los intentos referencian `(question_id, question_version)` congelados.

---

### 6.9 Answer — `answers`

Opciones y respuestas válidas por pregunta (`RF-PREG-002`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `question_id` | `UUID` | `NOT NULL` | Parte de FK compuesta a `questions` |
| `question_version` | `INTEGER` | `NOT NULL` |  |
| `label` | `VARCHAR(10)` | `NULL` | Ej. `A`, `B` para múltiple choice |
| `body` | `TEXT` | `NOT NULL` | Texto/código de la opción |
| `is_correct` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Puede haber múltiples correctas (`match_concepts`) |
| `position` | `SMALLINT` | `NOT NULL` | Orden canónico; se aleatoriza en entrega (`RF-PREG-007`) |
| `explanation` | `TEXT` | `NULL` | Explicación por opción (opcional) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |

**Relaciones:** N:1 `questions` (`FK (question_id, question_version) → questions (id, version)`, `ON DELETE CASCADE`).

**Restricciones:**
- `UNIQUE (question_id, question_version, position)`.
- `CHECK (char_length(body) BETWEEN 1 AND 2000)`.
- Al menos una `is_correct=true` por pregunta (validado por trigger o en `RF-ADM-006`).

**Índices:**
- `idx_answers_question` — `(question_id, question_version)`.
- `idx_answers_correct` — `(question_id, question_version) WHERE is_correct=true`.

---

### 6.10 Quiz — `quizzes`

Evaluación intermedia por módulo (`RF-QUIZ-*`, `01` §13). Composición configurable.

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `module_id` | `UUID` | **FK → modules.id**, `NOT NULL` |  |
| `title` | `VARCHAR(150)` | `NOT NULL` | Ej. `Quiz — Variables` |
| `slug` | `VARCHAR(150)` | `NOT NULL` |  |
| `position` | `SMALLINT` | `NOT NULL` | Orden dentro del módulo (puede haber >1) |
| `description` | `TEXT` | `NULL` |  |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('draft','published','archived'))`, `DEFAULT 'draft'` |  |
| `content_version` | `INTEGER` | `NOT NULL`, `DEFAULT 1` |  |
| `threshold` | `SMALLINT` | `NOT NULL`, `DEFAULT 70`, `CHECK (threshold BETWEEN 0 AND 100)` | `RF-QUIZ-003`, copia de `modules.quiz_threshold` al momento de publicar; `RNF-035` congela en intento |
| `time_limit_seconds` | `INTEGER` | `NULL`, `CHECK (time_limit_seconds BETWEEN 60 AND 7200)` | Opcional |
| `max_attempts` | `INTEGER` | `NULL`, `CHECK (max_attempts > 0)` | NULL = ilimitados en MVP (`RF-QUIZ-005`) |
| `xp_on_complete` | `INTEGER` | `NOT NULL`, `DEFAULT 25` | `01` §17 |
| `shuffle_questions` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` |  |
| `shuffle_answers` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | `RF-PREG-007` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` |  |

**Relaciones:** N:1 `modules`; 1:N `quiz_questions`, `attempts`.

**Restricciones:**
- `UNIQUE (module_id, slug) WHERE deleted_at IS NULL`.
- `UNIQUE (module_id, position) WHERE deleted_at IS NULL`.

**Índices:**
- `idx_quizzes_module_position` — `(module_id, position)`.
- `idx_quizzes_module_status` — `(module_id, status)`.

**Tabla de composición — `quiz_questions`:**

| Campo | Tipo | Restricción |
|---|---|---|
| `quiz_id` | `UUID` | **FK → quizzes.id**, `NOT NULL`, `ON DELETE CASCADE` |
| `question_id` | `UUID` | `NOT NULL` |
| `question_version` | `INTEGER` | `NOT NULL` |
| `position` | `SMALLINT` | `NOT NULL` |

- **PK** `(quiz_id, question_id, question_version)`.
- **FK** `(question_id, question_version) → questions`.
- **UQ** `(quiz_id, position)`.
- Índice `(question_id, question_version)`.

---

### 6.11 Exam — `exams`

Evaluación final por módulo (`RF-EXAM-*`, `01` §14). Similar a `quizzes` pero con distribución por tipo configurable (`RF-EXAM-002`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `module_id` | `UUID` | **FK → modules.id**, `NOT NULL`, `UNIQUE` | Un examen por módulo en MVP; Post-MVP puede ser 1:N quitando UNIQUE |
| `title` | `VARCHAR(150)` | `NOT NULL` |  |
| `slug` | `VARCHAR(150)` | `NOT NULL` |  |
| `description` | `TEXT` | `NULL` |  |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('draft','published','archived'))`, `DEFAULT 'draft'` |  |
| `content_version` | `INTEGER` | `NOT NULL`, `DEFAULT 1` |  |
| `threshold` | `SMALLINT` | `NOT NULL`, `DEFAULT 80`, `CHECK (threshold BETWEEN 0 AND 100)` | `RF-EXAM-003` |
| `distribution` | `JSONB` | `NOT NULL`, `DEFAULT '{"multiple_choice":5,"predict_output":5,"fill_code":3,"find_error":2,"true_false":5}'` | `RF-EXAM-002`; validada por `CHECK (distribution ? 'multiple_choice')` y suma = total |
| `total_questions` | `SMALLINT` | `NOT NULL`, `DEFAULT 20` | Derivado de `distribution` pero cacheado |
| `time_limit_seconds` | `INTEGER` | `NULL`, `CHECK (time_limit_seconds BETWEEN 300 AND 7200)` |  |
| `max_attempts` | `INTEGER` | `NULL` | NULL = ilimitados (`RF-EXAM-005`) |
| `xp_on_pass` | `INTEGER` | `NOT NULL`, `DEFAULT 100` | `01` §17 |
| `shuffle_questions` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` |  |
| `shuffle_answers` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` |  |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` |  |

**Relaciones:** N:1 `modules`; 1:N `exam_questions`, `attempts`.

**Restricciones:**
- `UNIQUE (module_id) WHERE deleted_at IS NULL` (MVP).
- `CHECK (total_questions = (distribution->>'multiple_choice')::int + (distribution->>'predict_output')::int + ...)` — validado por trigger.
- `CHECK (jsonb_typeof(distribution)='object')`.

**Índices:**
- `uq_exams_module` — `UNIQUE (module_id) WHERE deleted_at IS NULL`.
- `idx_exams_module_status` — `(module_id, status)`.
- `idx_exams_distribution` — `GIN (distribution)` si se filtra por tipo.

**Tabla de composición — `exam_questions`:**

| Campo | Tipo | Restricción |
|---|---|---|
| `exam_id` | `UUID` | **FK → exams.id**, `NOT NULL`, `ON DELETE CASCADE` |
| `question_id` | `UUID` | `NOT NULL` |
| `question_version` | `INTEGER` | `NOT NULL` |
| `position` | `SMALLINT` | `NOT NULL` |

- **PK** `(exam_id, question_id, question_version)`.
- **UQ** `(exam_id, position)`.
- **FK** `(question_id, question_version) → questions`.

---

### 6.12 Attempt — `attempts`

Intento inmutable y auditable (`RF-EVAL-003`, `RF-PREG-005`, `RF-PROG-001`, `RNF-033`–`RNF-035`). **Es la tabla más crítica del sistema.**

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` | Dueño del intento |
| `kind` | `VARCHAR(20)` | `NOT NULL`, `CHECK (kind IN ('lesson_question','quiz','exam','diagnostic','review'))` | `RF-PREG-005`, `RF-DIAG-001`, `RF-REP-001` |
| `module_id` | `UUID` | **FK → modules.id**, `NULL` | NULL para `lesson_question` fuera de módulo si aplica |
| `section_id` | `UUID` | **FK → sections.id**, `NULL` |  |
| `lesson_id` | `UUID` | **FK → lessons.id**, `NULL` | Para `lesson_question` |
| `quiz_id` | `UUID` | **FK → quizzes.id**, `NULL` | Solo si `kind='quiz'` |
| `exam_id` | `UUID` | **FK → exams.id**, `NULL` | Solo si `kind='exam'` |
| `question_id` | `UUID` | `NULL` | Solo si `kind='lesson_question'` (una pregunta) |
| `question_version` | `INTEGER` | `NULL` | Congela versión |
| `content_version` | `INTEGER` | `NOT NULL` | Versión de contenido evaluada (`RNF-035`) |
| `threshold_applied` | `SMALLINT` | `NULL`, `CHECK (threshold_applied BETWEEN 0 AND 100)` | Umbral vigente al calificar (`RF-EVAL-005`); NULL para `lesson_question` |
| `score` | `INTEGER` | `NOT NULL`, `DEFAULT 0`, `CHECK (score >= 0)` | Puntaje total obtenido |
| `max_score` | `INTEGER` | `NOT NULL`, `CHECK (max_score > 0)` | Puntaje máximo posible |
| `percent` | `NUMERIC(5,2)` | `NOT NULL`, `CHECK (percent BETWEEN 0 AND 100)` | `score/max_score*100` |
| `is_passed` | `BOOLEAN` | `NOT NULL` | `percent >= threshold_applied` (o `score>0` para `lesson_question`) |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('in_progress','submitted','graded','invalidated'))`, `DEFAULT 'graded'` | En MVP `graded` inmediato (`RNF-012` <2s) |
| `idempotency_key` | `VARCHAR(100)` | `NOT NULL` | `RNF-042`; evita duplicados por reintento |
| `started_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `submitted_at` | `TIMESTAMPTZ` | `NULL` |  |
| `graded_at` | `TIMESTAMPTZ` | `NULL` |  |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |

**Relaciones:** N:1 `users`, opcionales `modules`/`sections`/`lessons`/`quizzes`/`exams`; 1:N `attempt_answers`.

**Restricciones:**
- `UNIQUE (user_id, idempotency_key)` — idempotencia por usuario (`05` regla 3, `RNF-042`).
- `CHECK ((kind='quiz' AND quiz_id IS NOT NULL AND exam_id IS NULL AND question_id IS NULL) OR (kind='exam' AND exam_id IS NOT NULL AND quiz_id IS NULL AND question_id IS NULL) OR (kind='lesson_question' AND question_id IS NOT NULL AND quiz_id IS NULL AND exam_id IS NULL) OR (kind IN ('diagnostic','review') AND ...))` — exclusividad por tipo.
- `CHECK ((kind IN ('quiz','exam') AND threshold_applied IS NOT NULL) OR (kind NOT IN ('quiz','exam') AND threshold_applied IS NULL) OR kind='diagnostic')` — umbral solo donde aplica.
- `CHECK (percent = ROUND(score::numeric / NULLIF(max_score,0) * 100, 2))` — trigger que lo garantiza.
- `CHECK (submitted_at IS NULL OR submitted_at >= started_at)`.
- Inmutabilidad tras `graded`: trigger rechaza `UPDATE` de `score/max_score/percent/is_passed/threshold_applied/content_version` si `status='graded'`.

**Índices (todos necesarios para `RNF-007`):**
- `uq_attempts_user_idempotency` — `UNIQUE (user_id, idempotency_key)`.
- `idx_attempts_user_module` — `(user_id, module_id, kind, created_at DESC)` — progreso por módulo, `RF-PROG-002`.
- `idx_attempts_user_quiz` — `(user_id, quiz_id, created_at DESC) WHERE quiz_id IS NOT NULL`.
- `idx_attempts_user_exam` — `(user_id, exam_id, created_at DESC) WHERE exam_id IS NOT NULL`.
- `idx_attempts_user_lesson` — `(user_id, lesson_id) WHERE lesson_id IS NOT NULL`.
- `idx_attempts_module_percent` — `(module_id, percent)` para analytics.
- `idx_attempts_kind_status` — `(kind, status)`.
- `idx_attempts_created_at` — `(created_at)` para `26_ANALYTICS.md`.
- `idx_attempts_question` — `(question_id, question_version)` parcial.
- `idx_attempts_content_version` — `(content_version)` para trazabilidad `RNF-035`.

**Tabla hija — `attempt_answers`:**

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `attempt_id` | `UUID` | **FK → attempts.id**, `NOT NULL`, `ON DELETE CASCADE` |  |
| `question_id` | `UUID` | `NOT NULL` |  |
| `question_version` | `INTEGER` | `NOT NULL` | Congela versión |
| `answer_id` | `UUID` | **FK → answers.id**, `NULL` | NULL para tipos sin opción predefinida (`fill_code`, `write_code`, `order_lines`) |
| `given_answer` | `JSONB` | `NOT NULL` | Respuesta dada normalizada: `{ "selected": ["A"], "text": "name", "order": [3,1,2] }` |
| `is_correct` | `BOOLEAN` | `NOT NULL` | Cálculo en servidor (`RF-EVAL-006`) |
| `score_awarded` | `INTEGER` | `NOT NULL`, `DEFAULT 0`, `CHECK (score_awarded >= 0)` | Puntaje otorgado por esta pregunta |
| `position` | `SMALLINT` | `NOT NULL` | Orden en el intento |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |

- **FK** `(question_id, question_version) → questions`.
- **UQ** `(attempt_id, question_id, question_version)`.
- **UQ** `(attempt_id, position)`.
- Índices: `idx_attempt_answers_attempt` `(attempt_id)`, `idx_attempt_answers_question` `(question_id, question_version)`, `idx_attempt_answers_is_correct` `(is_correct)` para `RF-EVAL-004` / `RF-REP-002`, `GIN (given_answer)` si se analiza texto.

---

### 6.13 Progress — `progress`

Agregado por usuario/lenguaje/módulo/sección/lección (`RF-PROG-002/003`, `01` §16). **No es la fuente de verdad granular** (esa es `attempts` + `attempt_answers`); es un **materialized aggregate** para lecturas p95 <100 ms (`RNF-007`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` |  |
| `language_id` | `UUID` | **FK → programming_languages.id**, `NOT NULL` |  |
| `module_id` | `UUID` | **FK → modules.id**, `NULL` | NULL = agregado por lenguaje |
| `section_id` | `UUID` | **FK → sections.id**, `NULL` | NULL = agregado por módulo |
| `lesson_id` | `UUID` | **FK → lessons.id**, `NULL` | NULL = agregado por sección |
| `scope` | `VARCHAR(20)` | `NOT NULL`, `CHECK (scope IN ('language','module','section','lesson'))` | Nivel del agregado |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('not_started','in_progress','completed','passed','failed'))`, `DEFAULT 'not_started'` | `RF-MOD-003` |
| `total_items` | `INTEGER` | `NOT NULL`, `DEFAULT 0`, `CHECK (total_items >= 0)` | Total de lecciones/preguntas en el scope |
| `completed_items` | `INTEGER` | `NOT NULL`, `DEFAULT 0`, `CHECK (completed_items >= 0)` |  |
| `percent` | `NUMERIC(5,2)` | `NOT NULL`, `DEFAULT 0`, `CHECK (percent BETWEEN 0 AND 100)` | `completed/total*100` |
| `best_score` | `INTEGER` | `NULL` | Mejor puntaje en el scope (si aplica) |
| `best_percent` | `NUMERIC(5,2)` | `NULL`, `CHECK (best_percent BETWEEN 0 AND 100)` |  |
| `attempts_count` | `INTEGER` | `NOT NULL`, `DEFAULT 0` |  |
| `last_activity_at` | `TIMESTAMPTZ` | `NULL` | `RF-MOD-005` |
| `first_started_at` | `TIMESTAMPTZ` | `NULL` |  |
| `completed_at` | `TIMESTAMPTZ` | `NULL` |  |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |

**Relaciones:** N:1 `users`, `programming_languages`, opcionales `modules`/`sections`/`lessons`.

**Restricciones:**
- `UNIQUE (user_id, language_id, module_id, section_id, lesson_id, scope)` — un agregado por scope.
- `CHECK ((scope='language' AND module_id IS NULL AND section_id IS NULL AND lesson_id IS NULL) OR (scope='module' AND module_id IS NOT NULL AND section_id IS NULL AND lesson_id IS NULL) OR (scope='section' AND section_id IS NOT NULL AND lesson_id IS NULL) OR (scope='lesson' AND lesson_id IS NOT NULL))` — coherencia de scope.
- `CHECK (completed_items <= total_items)`.
- `CHECK (percent = CASE WHEN total_items=0 THEN 0 ELSE ROUND(completed_items::numeric/total_items*100,2) END)`.

**Índices:**
- `uq_progress_user_scope` — `UNIQUE (user_id, language_id, module_id, section_id, lesson_id, scope)`.
- `idx_progress_user_lang` — `(user_id, language_id, scope, percent)` — lectura de perfil `RF-PROF-003`.
- `idx_progress_user_module` — `(user_id, module_id) WHERE scope='module'`.
- `idx_progress_last_activity` — `(user_id, last_activity_at DESC)` para rachas y `26`.
- `idx_progress_status` — `(status)` para listados de ruta `RF-RUTA-002`.

---

### 6.14 XPTransaction — `xp_transactions`

Ledger inmutable de XP (`RF-XP-003`, `RF-XP-005`, `RNF-034`). Cada fila es un evento auditado; el `level` se deriva, no se persiste como fuente de verdad.

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` |  |
| `amount` | `INTEGER` | `NOT NULL`, `CHECK (amount != 0)` | Positivo = ganancia; negativo = ajuste admin (raro) |
| `balance_after` | `INTEGER` | `NOT NULL`, `CHECK (balance_after >= 0)` | Balance tras la transacción; evita recalcular |
| `reason` | `VARCHAR(30)` | `NOT NULL`, `CHECK (reason IN ('section_complete','exercise_correct','quiz_complete','quiz_pass','exam_pass','module_complete','streak_bonus','achievement','admin_adjust'))` | `01` §17 + `RF-XP-001` |
| `reference_type` | `VARCHAR(30)` | `NULL`, `CHECK (reference_type IN ('section','lesson','question','quiz','exam','module','achievement','streak'))` | Polimórfico tipado |
| `reference_id` | `UUID` | `NULL` | FK lógica al recurso (no FK física para no acoplar; validada en app) |
| `attempt_id` | `UUID` | **FK → attempts.id**, `NULL` | Trazabilidad a intento cuando aplica |
| `idempotency_key` | `VARCHAR(100)` | `NOT NULL` | `RF-XP-005`; mismo que `attempts.idempotency_key` cuando deriva de intento |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |

**Relaciones:** N:1 `users`, opcional `attempts`.

**Restricciones:**
- `UNIQUE (user_id, idempotency_key)` — `RF-XP-005`, `RNF-042`.
- `CHECK ((reference_type IS NULL) = (reference_id IS NULL))`.
- `CHECK (balance_after >= 0)` — no deuda de XP.
- Inmutabilidad: trigger rechaza `UPDATE`/`DELETE`.

**Índices:**
- `uq_xp_user_idempotency` — `UNIQUE (user_id, idempotency_key)`.
- `idx_xp_user_created` — `(user_id, created_at DESC)` — historial `RF-XP-003`.
- `idx_xp_user_reason` — `(user_id, reason)` para analytics.
- `idx_xp_attempt` — `(attempt_id) WHERE attempt_id IS NOT NULL`.

---

### 6.15 Streak — `streaks`

Historial diario para rachas (`RF-RACHA-*`, `01` §18). Una fila por usuario y día con actividad válida.

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` |  |
| `activity_date` | `DATE` | `NOT NULL` | Fecha en `timezone` del usuario (`RF-RACHA-004`) |
| `timezone` | `VARCHAR(50)` | `NOT NULL` | Zona con la que se calculó `activity_date` |
| `activity_count` | `INTEGER` | `NOT NULL`, `DEFAULT 1`, `CHECK (activity_count > 0)` | Actividades válidas ese día |
| `first_activity_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `last_activity_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |

**Relaciones:** N:1 `users`.

**Restricciones:**
- `UNIQUE (user_id, activity_date)` — un registro por día.
- `CHECK (activity_date <= CURRENT_DATE)` — validado en app con `timezone`.
- `CHECK (last_activity_at >= first_activity_at)`.

**Índices:**
- `uq_streaks_user_date` — `UNIQUE (user_id, activity_date)`.
- `idx_streaks_user_date_desc` — `(user_id, activity_date DESC)` — racha actual/máxima `RF-RACHA-003`.
- `idx_streaks_date` — `(activity_date)` para DAU/WAU `26`.

**Cálculo de racha:** no se persiste `current_streak`/`max_streak` como columna mutable; se deriva de `streaks` con ventana:
```sql
-- Racha actual: días consecutivos hasta hoy (o ayer si hoy sin actividad)
WITH days AS (
  SELECT activity_date,
         activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date DESC))::int AS grp
  FROM streaks WHERE user_id=$1
)
SELECT COUNT(*) FROM days WHERE grp = (SELECT grp FROM days ORDER BY activity_date DESC LIMIT 1);
```
Para p95 <100 ms se cachea en `user_profiles` o `progress` scope `language` y se recalcula por trigger en `streaks` o job diario con `timezone` del usuario. El historial permanece auditable (`RF-RACHA-005`).

---

### 6.16 Achievement — `achievements` + `user_achievements`

Catálogo y desbloqueos (`RF-LOGRO-*`, `01` §19). Contenido configurable sin código (`RF-LOGRO-004`).

**`achievements` (catálogo):**

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `code` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE`, `CHECK (code ~ '^[A-Z_]+$')` | Ej. `FIRST_CODE`, `ON_FIRE`, `CODE_MASTER` |
| `name` | `VARCHAR(100)` | `NOT NULL` |  |
| `description` | `VARCHAR(500)` | `NOT NULL` |  |
| `icon_url` | `VARCHAR(512)` | `NULL` |  |
| `category` | `VARCHAR(30)` | `NOT NULL`, `CHECK (category IN ('progress','streak','score','language','special'))` |  |
| `condition` | `JSONB` | `NOT NULL` | Regla verificable: `{"type":"streak_days","days":7}` o `{"type":"module_complete","count":1}` |
| `xp_reward` | `INTEGER` | `NOT NULL`, `DEFAULT 0`, `CHECK (xp_reward >= 0)` |  |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | `RF-LOGRO-004` |
| `sort_order` | `SMALLINT` | `NOT NULL`, `DEFAULT 100` |  |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |

**Restricciones:**
- `CHECK (jsonb_typeof(condition)='object' AND condition ? 'type')`.

**Índices:**
- `uq_achievements_code` — `UNIQUE (code)`.
- `idx_achievements_category` — `(category)`.
- `idx_achievements_active` — `(is_active) WHERE is_active=true`.

**`user_achievements` (desbloqueos):**

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` |  |
| `achievement_id` | `UUID` | **FK → achievements.id**, `NOT NULL` |  |
| `unlocked_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | `RF-LOGRO-002` |
| `context` | `JSONB` | `NULL` | Evidencia: `{"streak":7,"language":"PY"}` |

**Restricciones:**
- `UNIQUE (user_id, achievement_id)` — `RF-LOGRO-005`; un logro una vez.
- `CHECK (unlocked_at <= now())`.

**Índices:**
- `uq_user_achievements_user_ach` — `UNIQUE (user_id, achievement_id)`.
- `idx_user_achievements_user` — `(user_id, unlocked_at DESC)` — perfil `RF-PROF-004`.
- `idx_user_achievements_achievement` — `(achievement_id)`.

---

### 6.17 Certificate — `certificates`

Acreditación por lenguaje completado (`RF-CERT-*`, `04` §7, `01` §21–§22). Un certificado vigente por lenguaje con generación 100% en backend (NestJS) y persistencia en Google Drive API v3.

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** | Identificador único del registro |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` | Usuario titular del certificado |
| `language_id` | `UUID` | **FK → programming_languages.id**, `NOT NULL` | Lenguaje acreditado |
| `code` | `VARCHAR(20)` | `NOT NULL`, `UNIQUE` | `CQ-{LANG}-{SEQ}` ej. `CQ-LUA-000001`, `CQ-PY-000001` (`RF-CERT-003`) |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('valid','revoked','obsolete'))`, `DEFAULT 'valid'` | `RF-CERT-005` |
| `language_content_version` | `INTEGER` | `NOT NULL` | Versión del lenguaje al emitir; si cambia significativamente → `obsolete` |
| `issued_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Fecha oficial de emisión (`RF-CERT-002`) |
| `revoked_at` | `TIMESTAMPTZ` | `NULL` | Fecha de revocación u obsolescencia |
| `storage_provider` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'google_drive'` | Proveedor de almacenamiento (`google_drive`, `s3`) |
| `google_drive_file_id` | `VARCHAR(255)` | `NULL` | ID del archivo subido en Google Drive API v3 (evita re-generaciones) |
| `pdf_object_key` | `VARCHAR(512)` | `NULL` | Nombre canónico del archivo (ej. `certs/lua/CQ-LUA-000001_v1.pdf`) |
| `pdf_sha256` | `VARCHAR(64)` | `NULL` | Hash SHA-256 del binario para verificación de integridad bit-a-bit (`RF-PDF-003`) |
| `pdf_version` | `INTEGER` | `NOT NULL`, `DEFAULT 1` | Versión de la plantilla visual del PDF (`RF-PDF-001`) |
| `qr_payload` | `VARCHAR(512)` | `NOT NULL` | URL de verificación pública/interna (`RF-CERT-004`) |
| `metadata` | `JSONB` | `NOT NULL`, `DEFAULT '{}'` | Snapshot inmutable: nombre, documento, plataforma, estado (`RF-CERT-002`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Fecha de creación del registro |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Fecha de última actualización |

**Relaciones:** N:1 `users`, `programming_languages`.

**Restricciones:**
- `UNIQUE (code)` — correlativo único por lenguaje.
- `UNIQUE (user_id, language_id) WHERE status='valid'` — un único certificado vigente por lenguaje (`RF-CERT-005`, `04` §7).
- `CHECK (code ~ '^CQ-[A-Z]+-[0-9]{6}$')`.
- `CHECK ((status='valid' AND revoked_at IS NULL) OR (status IN ('revoked','obsolete') AND revoked_at IS NOT NULL))`.
- `CHECK (language_content_version > 0)`.
- `CHECK (pdf_version > 0)`.

**Índices:**
- `uq_certificates_code` — `UNIQUE (code)`.
- `uq_certificates_user_lang_valid` — `UNIQUE (user_id, language_id) WHERE status='valid'` (partial).
- `idx_certificates_user` — `(user_id, issued_at DESC)` — perfil `RF-PROF-005`.
- `idx_certificates_drive_file` — `(google_drive_file_id) WHERE google_drive_file_id IS NOT NULL`.
- `idx_certificates_language` — `(language_id, issued_at DESC)`.
- `idx_certificates_status` — `(status)`.

**Secuencia correlativa:** no se usa `SERIAL` global; se usa tabla `certificate_sequences`:

| Campo | Tipo |
|---|---|
| `language_id` | `UUID` **PK, FK** |
| `last_seq` | `INTEGER` `NOT NULL`, `DEFAULT 0` |

- Emisión hace `UPDATE certificate_sequences SET last_seq = last_seq + 1 WHERE language_id=$1 RETURNING last_seq` en transacción, luego `code = 'CQ-'||code||'-'||LPAD(last_seq::text,6,'0')`. Garantiza correlativo por lenguaje sin huecos visibles en `code` aunque `id` sea UUID.

---

### 6.18 Subscription — `subscriptions`

Premium USD $1/mes (`RF-PREM-*`, `01` §23, `04` §8). Pasarela abstraída (`RF-PREM-004`, `RF-PREM-006`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK** |  |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` |  |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (status IN ('active','expired','canceled','pending','failed'))`, `DEFAULT 'pending'` | `RF-PREM-002` (`activa/expirada/cancelada` + estados de pago) |
| `plan_code` | `VARCHAR(30)` | `NOT NULL`, `DEFAULT 'premium_monthly'`, `CHECK (plan_code IN ('premium_monthly'))` | Extensible a futuros planes |
| `amount_cents` | `INTEGER` | `NOT NULL`, `DEFAULT 100`, `CHECK (amount_cents > 0)` | 100 = USD $1 |
| `currency` | `CHAR(3)` | `NOT NULL`, `DEFAULT 'USD'` |  |
| `provider` | `VARCHAR(30)` | `NULL`, `CHECK (provider IN ('stripe','paypal','mock'))` | Abstraído; `mock` para MVP/tests |
| `provider_subscription_id` | `VARCHAR(150)` | `NULL` | ID en pasarela; nunca datos de tarjeta en núcleo (`RNF-037`) |
| `current_period_start` | `TIMESTAMPTZ` | `NULL` |  |
| `current_period_end` | `TIMESTAMPTZ` | `NULL` | Expiración |
| `canceled_at` | `TIMESTAMPTZ` | `NULL` |  |
| `trial_ends_at` | `TIMESTAMPTZ` | `NULL` | Opcional |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` |  |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` |  |

**Relaciones:** N:1 `users`.

**Restricciones:**
- `CHECK ((status='active' AND current_period_end IS NOT NULL AND current_period_end > current_period_start) OR status != 'active')`.
- `CHECK ((status='canceled' AND canceled_at IS NOT NULL) OR status != 'canceled')`.
- `CHECK (amount_cents = 100 AND currency='USD')` en MVP; Post-MVP se relaja si hay planes adicionales (validado en app por `plan_code`).
- Solo una `active` por usuario: `UNIQUE (user_id) WHERE status='active'` (partial).

**Índices:**
- `uq_subscriptions_user_active` — `UNIQUE (user_id) WHERE status='active'`.
- `idx_subscriptions_user` — `(user_id, created_at DESC)`.
- `idx_subscriptions_status_period` — `(status, current_period_end)` para job de expiración.
- `idx_subscriptions_provider` — `(provider, provider_subscription_id) WHERE provider_subscription_id IS NOT NULL`.

**Tabla de auditoría — `subscription_events` (opcional pero recomendada para `RF-PREM-006`):**

| Campo | Tipo |
|---|---|
| `id` | `UUID` **PK** |
| `subscription_id` | `UUID` **FK → subscriptions.id**, `NOT NULL` |
| `event_type` | `VARCHAR(30)` `CHECK (event_type IN ('created','activated','renewed','canceled','expired','payment_failed'))` |
| `payload` | `JSONB` `NULL` (sin PII de tarjeta) |
| `created_at` | `TIMESTAMPTZ` `NOT NULL` |

- Índice `(subscription_id, created_at DESC)`.

---

### 6.19 UserSectionStars — `user_section_stars`

Registro de calificación formativa en estrellas (1–3⭐), errores en primer intento y estado de completitud por sección (`14` §4.2, `16` §8.1, `RF-ESTRELLA-*`, `RF-SEC-004`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, `DEFAULT gen_random_uuid()` | Identificador del registro |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` | Usuario evaluado |
| `language_id` | `UUID` | **FK → programming_languages.id**, `NOT NULL` | Lenguaje en curso |
| `module_id` | `UUID` | **FK → modules.id**, `NOT NULL` | Módulo padre |
| `section_id` | `UUID` | **FK → sections.id**, `NOT NULL` | Sección evaluada |
| `stars_earned` | `SMALLINT` | `NOT NULL`, `CHECK (stars_earned BETWEEN 1 AND 3)` | Estrellas obtenidas (3 = 0 errores, 2 = 1 error corregido, 1 = 2+ errores corregidos) |
| `max_stars_earned` | `SMALLINT` | `NOT NULL`, `DEFAULT 1`, `CHECK (max_stars_earned BETWEEN 1 AND 3)` | Mejor puntuación histórica alcanzada en reintentos |
| `first_attempt_errors` | `INTEGER` | `NOT NULL`, `DEFAULT 0`, `CHECK (first_attempt_errors >= 0)` | Cantidad de ejercicios fallados en la primera pasada |
| `review_round_completed` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | `true` cuando se resuelven todos los ejercicios en la ronda de repaso |
| `attempts_count` | `INTEGER` | `NOT NULL`, `DEFAULT 1`, `CHECK (attempts_count > 0)` | Número de veces que el usuario ha completado la sección |
| `is_completed` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | Estado de finalización de la sección |
| `first_completed_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Timestamp de la primera vez que se completó |
| `last_completed_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Timestamp del último reintento |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Trigger `ON UPDATE` |

**Relaciones:** N:1 `users`, `programming_languages`, `modules`, `sections`.

**Restricciones:**
- `UNIQUE (user_id, section_id)` — un registro consolidado por usuario y sección.
- `CHECK (max_stars_earned >= stars_earned)`.
- `CHECK (last_completed_at >= first_completed_at)`.

**Índices:**
- `uq_user_section_stars` — `UNIQUE (user_id, section_id)`.
- `idx_user_section_stars_user_module` — `(user_id, module_id, stars_earned)`.
- `idx_user_section_stars_user_lang` — `(user_id, language_id)`.

---

### 6.20 UserModuleProgress — `user_module_progress`

Estado de candado (`locked`/`unlocked`), total de estrellas acumuladas y porcentaje de maestría por módulo (`14` §4.1, `16` §8.2, `28` §3.1, `RF-CANDADO-*`, `RF-MOD-004`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, `DEFAULT gen_random_uuid()` | Identificador del registro |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` | Usuario |
| `language_id` | `UUID` | **FK → programming_languages.id**, `NOT NULL` | Lenguaje |
| `module_id` | `UUID` | **FK → modules.id**, `NOT NULL` | Módulo evaluado |
| `status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'locked'`, `CHECK (status IN ('locked','unlocked','in_progress','completed','mastered'))` | Estado del módulo en la ruta |
| `is_unlocked` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | `true` si el candado está abierto ($M_1$ o $M_i$ con prerequisitos cumplidos) |
| `sections_total` | `SMALLINT` | `NOT NULL`, `DEFAULT 10`, `CHECK (sections_total > 0)` | Total de secciones configuradas en el módulo |
| `sections_completed` | `SMALLINT` | `NOT NULL`, `DEFAULT 0`, `CHECK (sections_completed BETWEEN 0 AND sections_total)` | Cantidad de secciones finalizadas |
| `stars_total_possible` | `SMALLINT` | `NOT NULL`, `DEFAULT 30`, `CHECK (stars_total_possible > 0)` | Total de estrellas posibles ($N_{\text{secciones}} \times 3$) |
| `stars_earned` | `SMALLINT` | `NOT NULL`, `DEFAULT 0`, `CHECK (stars_earned BETWEEN 0 AND stars_total_possible)` | Suma actual de estrellas obtenidas en el módulo |
| `stars_percentage` | `NUMERIC(5,2)` | `NOT NULL`, `DEFAULT 0.00`, `CHECK (stars_percentage BETWEEN 0 AND 100)` | Porcentaje de maestría (`stars_earned / stars_total_possible * 100`) |
| `exam_passed` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | `true` si el usuario aprobó el examen final con $\ge 80\%$ |
| `exam_score` | `SMALLINT` | `NULL`, `CHECK (exam_score BETWEEN 0 AND 100)` | Calificación más alta en el examen |
| `unlocked_at` | `TIMESTAMPTZ` | `NULL` | Fecha en la que se abrió el candado |
| `completed_at` | `TIMESTAMPTZ` | `NULL` | Fecha en la que completó el 100% de las secciones |
| `mastered_at` | `TIMESTAMPTZ` | `NULL` | Fecha en la que alcanzó $\ge 80\%$ de estrellas + examen aprobado |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |

**Relaciones:** N:1 `users`, `programming_languages`, `modules`.

**Restricciones:**
- `UNIQUE (user_id, module_id)` — un estado por usuario y módulo.
- `CHECK (stars_percentage = ROUND(stars_earned::numeric / NULLIF(stars_total_possible, 0) * 100, 2))`.
- `CHECK ((is_unlocked = true AND unlocked_at IS NOT NULL) OR (is_unlocked = false AND unlocked_at IS NULL))`.

**Índices:**
- `uq_user_module_progress` — `UNIQUE (user_id, module_id)`.
- `idx_user_module_progress_user_lang` — `(user_id, language_id, status)`.
- `idx_user_module_progress_stars` — `(user_id, stars_percentage)`.

---

### 6.21 UserMistakesNotebook — `user_mistakes_notebook`

Cuaderno de Errores persistente para práctica deliberada y refuerzo formativo continuo (`14` §5, `RF-CUADERNO-*`, `RF-REP-*`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, `DEFAULT gen_random_uuid()` | Identificador de la entrada |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` | Estudiante |
| `language_id` | `UUID` | **FK → programming_languages.id**, `NOT NULL` | Lenguaje |
| `module_id` | `UUID` | **FK → modules.id**, `NOT NULL` | Módulo |
| `section_id` | `UUID` | **FK → sections.id**, `NULL` | Sección de origen |
| `lesson_id` | `UUID` | **FK → lessons.id**, `NULL` | Lección de origen |
| `question_id` | `UUID` | `NOT NULL` | Pregunta fallada |
| `question_version` | `INTEGER` | `NOT NULL` | Versión congelada de la pregunta |
| `fail_count` | `INTEGER` | `NOT NULL`, `DEFAULT 1`, `CHECK (fail_count > 0)` | Número de veces que el usuario ha fallado este ejercicio |
| `is_resolved` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | `true` cuando el usuario resuelve correctamente el ejercicio desde el cuaderno |
| `first_failed_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Fecha del primer error |
| `last_failed_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Fecha del error más reciente |
| `resolved_at` | `TIMESTAMPTZ` | `NULL` | Fecha de remediación en el cuaderno de repaso |
| `resolved_in_attempt_id` | `UUID` | **FK → attempts.id**, `NULL` | Intento en el que se corrigió el error |
| `xp_recovered` | `INTEGER` | `NOT NULL`, `DEFAULT 0`, `CHECK (xp_recovered >= 0)` | XP formativa otorgada por corregir el error (+5 XP) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |

**Relaciones:** N:1 `users`, `programming_languages`, `modules`, `sections`, `lessons`, opcional `attempts`; FK compuesta `(question_id, question_version) → questions(id, version)`.

**Restricciones:**
- `UNIQUE (user_id, question_id)` — un registro por ejercicio y usuario (actualiza `fail_count` e `is_resolved`).
- `CHECK ((is_resolved = true AND resolved_at IS NOT NULL) OR (is_resolved = false AND resolved_at IS NULL))`.
- `CHECK (last_failed_at >= first_failed_at)`.

**Índices:**
- `uq_user_mistakes_user_question` — `UNIQUE (user_id, question_id)`.
- `idx_user_mistakes_unresolved` — `(user_id, module_id, last_failed_at DESC) WHERE is_resolved = false`.
- `idx_user_mistakes_user_lang` — `(user_id, language_id, is_resolved)`.

---

### 6.22 ReviewQueueItem — `review_queue_items`

Cola en sesión activa para la ronda de repaso de ejercicios fallados dentro de una lección antes de calificar las estrellas (`14` §4.2, `RF-ESTRELLA-002`, `RF-REP-002`).

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, `DEFAULT gen_random_uuid()` |  |
| `attempt_id` | `UUID` | **FK → attempts.id**, `NOT NULL`, `ON DELETE CASCADE` | Intento activo de la lección/sección |
| `user_id` | `UUID` | **FK → users.id**, `NOT NULL` | Estudiante |
| `section_id` | `UUID` | **FK → sections.id**, `NOT NULL` | Sección en progreso |
| `question_id` | `UUID` | `NOT NULL` | Ejercicio en cola de repaso |
| `question_version` | `INTEGER` | `NOT NULL` | Versión congelada |
| `status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'pending'`, `CHECK (status IN ('pending','passed','failed'))` | Estado en la ronda actual |
| `review_round` | `SMALLINT` | `NOT NULL`, `DEFAULT 1`, `CHECK (review_round > 0)` | Número de iteración de repaso |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |  |

**Relaciones:** N:1 `attempts`, `users`, `sections`; FK `(question_id, question_version) → questions`.

**Restricciones:**
- `UNIQUE (attempt_id, question_id, review_round)`.

**Índices:**
- `idx_review_queue_attempt_status` — `(attempt_id, status)`.

---

## 7. Entidades de soporte no listadas en el enunciado pero requeridas por RF/RNF

Estas tablas no son entidades de dominio nuevas, sino materialización de requisitos ya trazados; se incluyen para que el modelo sea implementable sin huecos.

### 7.1 `diagnostic_results`

Desglose por área del diagnóstico (`RF-DIAG-002/003`, `RF-DIAG-005`).

| Campo | Tipo | Restricción |
|---|---|---|
| `id` | `UUID` **PK** |  |
| `attempt_id` | `UUID` **FK → attempts.id** `NOT NULL`, `UNIQUE` | `kind='diagnostic'` |
| `user_id` | `UUID` **FK → users.id** `NOT NULL` |  |
| `language_id` | `UUID` **FK → programming_languages.id** `NOT NULL` |  |
| `total_score` | `INTEGER` `NOT NULL` |  |
| `max_score` | `INTEGER` `NOT NULL` |  |
| `percent` | `NUMERIC(5,2)` `NOT NULL` |  |
| `area_scores` | `JSONB` `NOT NULL` | `{"variables":80,"loops":45}` |
| `recommended_module_id` | `UUID` **FK → modules.id** `NULL` |  |
| `recommended_section_id` | `UUID` **FK → sections.id** `NULL` |  |
| `created_at` | `TIMESTAMPTZ` `NOT NULL` |  |

- Índices: `idx_diag_user_lang` `(user_id, language_id)`, `uq_diag_attempt` `UNIQUE (attempt_id)`.

### 7.2 `content_audit_log`

Auditoría administrativa (`RF-ADM-008`, `RNF-019`).

| Campo | Tipo |
|---|---|
| `id` | `UUID` **PK** |
| `actor_user_id` | `UUID` **FK → users.id** `NOT NULL` |
| `entity_type` | `VARCHAR(30)` `CHECK (entity_type IN ('language','module','section','lesson','question','quiz','exam','achievement'))` |
| `entity_id` | `UUID` `NOT NULL` |
| `action` | `VARCHAR(20)` `CHECK (action IN ('create','update','publish','hide','archive'))` |
| `from_version` | `INTEGER` `NULL` |
| `to_version` | `INTEGER` `NULL` |
| `diff` | `JSONB` `NULL` |
| `created_at` | `TIMESTAMPTZ` `NOT NULL` |

- Índices: `(entity_type, entity_id, created_at DESC)`, `(actor_user_id)`.

### 7.3 `idempotency_keys` (alternativa a columna por tabla)

Si se prefiere tabla centralizada para `RNF-042`, se puede mantener `idempotency_key` en `attempts`/`xp_transactions` y además una tabla `idempotency_keys (user_id, key, created_at, response_snapshot)` con `UNIQUE (user_id, key)` y TTL 24h para deduplicación exacta de respuesta. En este diseño se opta por columna + índice único por tabla para simplicidad; la tabla centralizada es Post-MVP.

---

## 8. Cómo se almacena el progreso, estrellas y desbloqueos

Este es el núcleo de `RF-PROG-*`, `RF-ESTRELLA-*`, `RF-CANDADO-*`, `RF-CUADERNO-*`, `RF-LEC-003`, `RNF-033`–`RNF-035` y `03` OT-05. Se implementa una **arquitectura de doble capa**: eventos granulares inmutables + agregados derivados y materializados para lectura sub-100ms.

### 8.1 Principio: fuente de verdad vs. agregados materializados

```
Fuente de verdad granular (inmutable, transaccional, auditable)
  attempts (1 fila por lección, quiz, examen, diagnóstico o repaso)
  ├── attempt_answers (1 fila por ejercicio respondido, con is_correct y given_answer)
  └── review_queue_items (cola de repaso activo durante la sesión)
  xp_transactions (ledger inmutable de XP, idempotente)
  streaks (1 fila por día de actividad en zona horaria local)

Agregados y estado de gamificación (actualizados atómicamente)
  user_section_stars (puntuación 1–3⭐, errores en primer intento, reintentos)
  user_module_progress (candado is_unlocked, 100% secciones, % estrellas acumuladas)
  user_mistakes_notebook (errores persistentes, conteo de fallos, estado is_resolved)
  progress (resumen porcentual por scope: language, module, section, lesson)
  learning_paths (cursor de reanudación y avance global)
```

**Regla de consistencia:** toda finalización de lección o ronda de repaso actualiza en una **única transacción**:
1. `attempts` + `attempt_answers` (congelación histórica).
2. `user_mistakes_notebook` (registro o incremento de fallos).
3. `user_section_stars` (cálculo de 1–3⭐ y actualización de `max_stars_earned`).
4. `user_module_progress` (recalcula `stars_earned`, `stars_percentage` y evalúa desbloqueo de $M_{i+1}$).
5. `xp_transactions` (XP base + bonus por estrellas y primera compleción).
6. `progress` + `streaks`.

---

### 8.2 Flujos de negocio y lógica de transición

#### A) Flujo de Lección y Calificación de Estrellas (1–3⭐)

```mermaid
flowchart TD
    Start([Inicio Lección]) --> Run[Resolver 10 ejercicios]
    Run --> CheckErrors{¿Hubo errores en primera pasada?}
    CheckErrors -- No (0 errores) --> Award3[Asignar 3 ⭐⭐⭐\n+10 XP Base +5 XP Perfecto]
    CheckErrors -- Sí (≥1 errores) --> RegErrors[Registrar en Cuaderno de Errores\nEncolar en review_queue_items]
    RegErrors --> ReviewLoop[Ronda de Repaso Formativo\nReintentar ejercicios fallados]
    ReviewLoop --> ReviewResolved{¿Completó repaso?}
    ReviewResolved -- Sí (1 error inicial) --> Award2[Asignar 2 ⭐⭐\n+10 XP Base]
    ReviewResolved -- Sí (≥2 errores iniciales) --> Award1[Asignar 1 ⭐\n+10 XP Base]
    Award3 --> UnlockNext[Desbloquear siguiente sección S_{j+1}]
    Award2 --> UnlockNext
    Award1 --> UnlockNext
    UnlockNext --> UpdateModule[Actualizar user_module_progress\nRecalcular % maestría del módulo]
```

1. **Primera Pasada:** el usuario responde los ejercicios interactivos de la sección ($E_1 \dots E_{10}$). Cada error se guarda en `attempt_answers` con `is_correct = false` y se registra en `user_mistakes_notebook`.
2. **Ronda de Repaso Formativo:** si hay errores, el sistema activa `review_queue_items`. El usuario debe resolver los ejercicios fallados antes de dar por completada la sección.
3. **Adjudicación de Estrellas (`user_section_stars`):**
   - **3 Estrellas (⭐⭐⭐):** 0 errores en la primera pasada.
   - **2 Estrellas (⭐⭐):** 1 error en la primera pasada, corregido exitosamente en el repaso.
   - **1 Estrella (⭐):** 2 o más errores en la primera pasada, corregidos en el repaso.
4. **Rejugabilidad:** el usuario puede repetir cualquier sección completada para mejorar su puntuación. El sistema conserva `max_stars_earned = GREATEST(old_stars, new_stars)` asegurando que nunca se reduzcan las estrellas acumuladas.

---

#### B) Flujo de Desbloqueo Secuencial y Candados de Módulo

1. **Candados de Sección ($S_j$):**
   - La sección $S_1$ de cualquier módulo desbloqueado inicia abierta (`is_unlocked = true`).
   - La sección $S_{j+1}$ se desbloquea automáticamente en el instante en que el usuario obtiene $\ge 1$ estrella en la sección $S_j$.
2. **Candados de Módulo ($M_i \to M_{i+1}$):**
   - $M_1$ (Fundamentos de Lua) está disponible por defecto para todos los usuarios.
   - Para desbloquear $M_{i+1}$, el motor verifica dos condiciones obligatorias en `user_module_progress` de $M_i$:
     $$\text{Condición 1: } \text{sections\_completed} = \text{sections\_total} \quad (100\% \text{ de secciones completadas})$$
     $$\text{Condición 2: } \text{stars\_percentage} \ge 80.00\% \quad (\text{ej. } \ge 24 \text{ estrellas de 30 posibles en M01/M02})$$
   - Si el usuario termina todas las secciones pero tiene $< 80\%$ de estrellas, el módulo $M_{i+1}$ permanece con candado (`🔒`); la interfaz y Koda invitan al estudiante a repetir secciones de 1⭐ o 2⭐ para alcanzar el umbral de maestría.

---

#### C) Flujo del Cuaderno de Errores y Repaso Deliberado (`user_mistakes_notebook`)

1. **Captura Automática:** ante cualquier respuesta incorrecta en lecciones, quizzes o exámenes, se ejecuta un upsert en `user_mistakes_notebook` incrementando `fail_count` y marcando `is_resolved = false`.
2. **Práctica Deliberada:** desde la vista de Cuaderno de Errores, el usuario puede filtrar por módulo y resolver los conceptos pendientes.
3. **Remediación:** al responder correctamente desde el cuaderno:
   - Se marca `is_resolved = true` y `resolved_at = now()`.
   - Se otorga una micro-recompensa formativa de **+5 XP** (`reason = 'mistake_resolved'`).
   - Esta práctica formativa **no** altera retroactivamente las estrellas de la sección original, preservando la validez psicométrica del primer intento.

---

### 8.3 Invariantes que el modelo garantiza (verificables en `20_TESTING.md`)

| Invariante | Regla de Negocio | Verificación SQL en BD |
|---|---|---|
| **I-01: Desbloqueo de Módulo** | $M_{i+1}$ desbloqueado solo si $M_i$ tiene 100% secciones y $\ge 80\%$ estrellas | `SELECT COUNT(*) FROM user_module_progress WHERE is_unlocked = true AND module_id = $M_next AND (SELECT stars_percentage FROM user_module_progress WHERE module_id = $M_prev) < 80.00` = 0 |
| **I-02: Calificación en Rango** | Estrellas por sección siempre entre 1 y 3 | `CHECK (stars_earned BETWEEN 1 AND 3)` en `user_section_stars` |
| **I-03: No Regresión de Estrellas** | Rejugar nunca disminuye la mejor puntuación de estrellas del usuario | Trigger `BEFORE UPDATE` en `user_section_stars`: `NEW.max_stars_earned = GREATEST(OLD.max_stars_earned, NEW.stars_earned)` |
| **I-04: Transaccionalidad de Intento** | Ningún cambio en progreso/estrellas sin su `attempt` grabado | Inserción en transacción única; FK estricta a `attempts(id)` |
| **I-05: Idempotencia de XP** | Reintentos o doble clic no duplican XP | `UNIQUE (user_id, idempotency_key)` en `xp_transactions` |
| **I-06: Inmutabilidad tras Graded** | Un intento calificado no puede ser alterado | Trigger `BEFORE UPDATE` en `attempts` que rechaza modificaciones si `status = 'graded'` |
| **I-07: Emisión de Certificado** | Todos los 12 módulos aprobados y certificados | Verificación de 100% módulos en `mastered` antes de insertar en `certificates` |

---

### 8.4 Retención y reanudación (`RF-RUTA-005`, `RNF-023`, `RNF-044`)

- **Reanudación instantánea:** `learning_paths.current_module_id` + `current_section_id` + `current_lesson_id` permiten posicionar al usuario en su último punto de trabajo en <100 ms.
- **Sincronización Offline/Online:** el cliente almacena localmente el `idempotency_key` y la cola de respuestas; al reconectar envía el batch transaccional al servidor (`RF-PROG-004`).
- **Resiliencia Multi-dispositivo:** el estado de candados y estrellas se consulta centralizadamente mediante `GET /v1/me/roadmap?language=lua`, hidratando la UI de forma idéntica en web y móvil.

---

## 9. Índices y rendimiento (RNF-001, RNF-007, RNF-010–RNF-012)

### 9.1 Matriz de índices por consulta crítica

| Consulta crítica | Tablas involucradas | Índices utilizados | p95 objetivo |
|---|---|---|---|
| Carga de Roadmap (12 módulos + candados + estrellas) | `user_module_progress`, `user_section_stars`, `modules` | `uq_user_module_progress`, `idx_user_section_stars_user_module`, `idx_modules_lang_position` | <80 ms (`RNF-007`) |
| Carga de Cuaderno de Errores pendientes | `user_mistakes_notebook`, `questions` | `idx_user_mistakes_unresolved`, `idx_questions_lesson` | <100 ms (`RNF-001`) |
| Lectura de Lección + 10 ejercicios interactivos | `lessons`, `questions`, `answers` | `idx_lessons_section_position`, `idx_questions_lesson`, `idx_answers_question` | <150 ms (`RNF-001`) |
| Envío de respuesta individual + evaluación | `attempts`, `attempt_answers`, `xp_transactions` | `uq_attempts_user_idempotency`, `uq_xp_user_idempotency` | <300 ms (`RNF-010`) |
| Cierre de sección y adjudicación de estrellas | `attempts`, `user_section_stars`, `user_module_progress` | `uq_user_section_stars`, `uq_user_module_progress` | <400 ms (`RNF-001`) |
| Calificación de Quiz / Examen final | `attempts`, `attempt_answers`, `user_module_progress` | `idx_attempt_answers_attempt`, `uq_user_module_progress` | <800 ms (`RNF-012`) |
| Historial de racha y DAU | `streaks` | `uq_streaks_user_date`, `idx_streaks_user_date_desc` | <50 ms |
| Verificación pública de certificado con QR | `certificates` | `uq_certificates_code` | <100 ms |

### 9.2 Estrategia de volumen y escalabilidad

- **Particionado horizontal:** `attempts` y `attempt_answers` se particionan por rango mensual (`created_at`) mediante `pg_partman` al superar 1M de registros.
- **Monitoreo de Bloat:** autovacuum ajustado para tablas de alto recambio como `user_section_stars` y `user_module_progress`.
- **Caché en Redis:** estado de roadmap y estrellas cacheable con clave `user:{id}:roadmap:{lang}` (TTL 300s), invalidado inmediatamente por webhook/evento de base de datos ante compleción de sección.

---

---

## 10. DDL de referencia (extracto — PostgreSQL)

> Esqueleto ilustrativo; las migraciones reales deben incluir `CREATE EXTENSION pgcrypto`, triggers de `updated_at`, y comentarios `COMMENT ON`.

```sql
-- Extensiones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','blocked','pending_verification','deleted')),
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT chk_users_email_lower CHECK (email = LOWER(email)),
  CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
CREATE UNIQUE INDEX uq_users_email ON users (email) WHERE deleted_at IS NULL;

-- Programming languages
CREATE TABLE programming_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL CHECK (code ~ '^[A-Z0-9_]+$'),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  status VARCHAR(20) NOT NULL DEFAULT 'coming_soon'
    CHECK (status IN ('available','coming_soon','hidden')),
  sort_order SMALLINT NOT NULL DEFAULT 100,
  content_version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_pl_code ON programming_languages (code);
CREATE UNIQUE INDEX uq_pl_slug ON programming_languages (slug);

-- Questions (versionadas)
CREATE TABLE questions (
  id UUID NOT NULL,
  version INT NOT NULL CHECK (version > 0),
  language_id UUID NOT NULL REFERENCES programming_languages(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  section_id UUID REFERENCES sections(id),
  lesson_id UUID REFERENCES lessons(id),
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('multiple_choice','true_false','fill_code','predict_output','find_error','order_lines','select_correct_code','match_concepts','write_code','small_problem')),
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy','medium','hard')),
  prompt TEXT NOT NULL,
  explanation TEXT NOT NULL,
  score INT NOT NULL DEFAULT 10 CHECK (score > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  content_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (id, version)
);

-- Attempts
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  kind VARCHAR(20) NOT NULL
    CHECK (kind IN ('lesson_question','quiz','exam','diagnostic','review')),
  module_id UUID REFERENCES modules(id),
  section_id UUID REFERENCES sections(id),
  lesson_id UUID REFERENCES lessons(id),
  quiz_id UUID REFERENCES quizzes(id),
  exam_id UUID REFERENCES exams(id),
  question_id UUID,
  question_version INT,
  content_version INT NOT NULL,
  threshold_applied SMALLINT CHECK (threshold_applied BETWEEN 0 AND 100),
  score INT NOT NULL DEFAULT 0 CHECK (score >= 0),
  max_score INT NOT NULL CHECK (max_score > 0),
  percent NUMERIC(5,2) NOT NULL CHECK (percent BETWEEN 0 AND 100),
  is_passed BOOLEAN NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'graded'
    CHECK (status IN ('in_progress','submitted','graded','invalidated')),
  idempotency_key VARCHAR(100) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (question_id, question_version) REFERENCES questions(id, version),
  CONSTRAINT chk_attempt_kind CHECK (
    (kind='quiz' AND quiz_id IS NOT NULL AND exam_id IS NULL AND question_id IS NULL) OR
    (kind='exam' AND exam_id IS NOT NULL AND quiz_id IS NULL AND question_id IS NULL) OR
    (kind='lesson_question' AND question_id IS NOT NULL AND quiz_id IS NULL AND exam_id IS NULL) OR
    (kind IN ('diagnostic','review'))
  )
);
CREATE UNIQUE INDEX uq_attempts_user_idempotency ON attempts (user_id, idempotency_key);
CREATE INDEX idx_attempts_user_module ON attempts (user_id, module_id, kind, created_at DESC);

-- User Section Stars (Calificación formativa 1-3⭐)
CREATE TABLE user_section_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  language_id UUID NOT NULL REFERENCES programming_languages(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  section_id UUID NOT NULL REFERENCES sections(id),
  stars_earned SMALLINT NOT NULL CHECK (stars_earned BETWEEN 1 AND 3),
  max_stars_earned SMALLINT NOT NULL DEFAULT 1 CHECK (max_stars_earned BETWEEN 1 AND 3),
  first_attempt_errors INT NOT NULL DEFAULT 0 CHECK (first_attempt_errors >= 0),
  review_round_completed BOOLEAN NOT NULL DEFAULT true,
  attempts_count INT NOT NULL DEFAULT 1 CHECK (attempts_count > 0),
  is_completed BOOLEAN NOT NULL DEFAULT true,
  first_completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_section_stars UNIQUE (user_id, section_id),
  CONSTRAINT chk_max_stars CHECK (max_stars_earned >= stars_earned)
);
CREATE INDEX idx_user_section_stars_user_module ON user_section_stars (user_id, module_id, stars_earned);
CREATE INDEX idx_user_section_stars_user_lang ON user_section_stars (user_id, language_id);

-- User Module Progress (Candados y Maestría 80%⭐)
CREATE TABLE user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  language_id UUID NOT NULL REFERENCES programming_languages(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  status VARCHAR(20) NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked','unlocked','in_progress','completed','mastered')),
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  sections_total SMALLINT NOT NULL DEFAULT 10 CHECK (sections_total > 0),
  sections_completed SMALLINT NOT NULL DEFAULT 0,
  stars_total_possible SMALLINT NOT NULL DEFAULT 30 CHECK (stars_total_possible > 0),
  stars_earned SMALLINT NOT NULL DEFAULT 0,
  stars_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (stars_percentage BETWEEN 0 AND 100),
  exam_passed BOOLEAN NOT NULL DEFAULT false,
  exam_score SMALLINT CHECK (exam_score BETWEEN 0 AND 100),
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_module_progress UNIQUE (user_id, module_id),
  CONSTRAINT chk_sections_completed CHECK (sections_completed BETWEEN 0 AND sections_total),
  CONSTRAINT chk_stars_earned CHECK (stars_earned BETWEEN 0 AND stars_total_possible)
);
CREATE INDEX idx_user_module_progress_user_lang ON user_module_progress (user_id, language_id, status);
CREATE INDEX idx_user_module_progress_stars ON user_module_progress (user_id, stars_percentage);

-- User Mistakes Notebook (Cuaderno de Errores)
CREATE TABLE user_mistakes_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  language_id UUID NOT NULL REFERENCES programming_languages(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  section_id UUID REFERENCES sections(id),
  lesson_id UUID REFERENCES lessons(id),
  question_id UUID NOT NULL,
  question_version INT NOT NULL,
  fail_count INT NOT NULL DEFAULT 1 CHECK (fail_count > 0),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  first_failed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_failed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_in_attempt_id UUID REFERENCES attempts(id),
  xp_recovered INT NOT NULL DEFAULT 0 CHECK (xp_recovered >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (question_id, question_version) REFERENCES questions(id, version),
  CONSTRAINT uq_user_mistakes_user_question UNIQUE (user_id, question_id)
);
CREATE INDEX idx_user_mistakes_unresolved ON user_mistakes_notebook (user_id, module_id, last_failed_at DESC) WHERE is_resolved = false;
CREATE INDEX idx_user_mistakes_user_lang ON user_mistakes_notebook (user_id, language_id, is_resolved);

-- Review Queue Items (Cola de repaso activa)
CREATE TABLE review_queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  section_id UUID NOT NULL REFERENCES sections(id),
  question_id UUID NOT NULL,
  question_version INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','passed','failed')),
  review_round SMALLINT NOT NULL DEFAULT 1 CHECK (review_round > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (question_id, question_version) REFERENCES questions(id, version),
  CONSTRAINT uq_review_queue_item UNIQUE (attempt_id, question_id, review_round)
);
CREATE INDEX idx_review_queue_attempt_status ON review_queue_items (attempt_id, status);

-- Trigger Function: Recalcular estrellas de módulo y evaluar desbloqueo del siguiente
CREATE OR REPLACE FUNCTION fn_recalculate_module_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_module_id UUID;
  v_user_id UUID;
  v_language_id UUID;
  v_total_stars INT;
  v_possible_stars INT;
  v_completed_count INT;
  v_total_sec INT;
  v_pct NUMERIC(5,2);
  v_next_module_id UUID;
BEGIN
  v_module_id := NEW.module_id;
  v_user_id := NEW.user_id;
  v_language_id := NEW.language_id;

  SELECT total_sections INTO v_total_sec FROM modules WHERE id = v_module_id;
  v_possible_stars := COALESCE(v_total_sec * 3, 30);

  SELECT 
    COUNT(*), 
    COALESCE(SUM(max_stars_earned), 0)
  INTO v_completed_count, v_total_stars
  FROM user_section_stars
  WHERE user_id = v_user_id AND module_id = v_module_id;

  v_pct := ROUND((v_total_stars::numeric / NULLIF(v_possible_stars, 0)) * 100, 2);

  UPDATE user_module_progress
  SET 
    sections_completed = v_completed_count,
    stars_earned = v_total_stars,
    stars_percentage = v_pct,
    status = CASE 
      WHEN v_completed_count >= v_total_sec AND v_pct >= 80.00 THEN 'mastered'
      WHEN v_completed_count >= v_total_sec THEN 'completed'
      WHEN v_completed_count > 0 THEN 'in_progress'
      ELSE status
    END,
    completed_at = CASE WHEN v_completed_count >= v_total_sec AND completed_at IS NULL THEN now() ELSE completed_at END,
    mastered_at = CASE WHEN v_completed_count >= v_total_sec AND v_pct >= 80.00 AND mastered_at IS NULL THEN now() ELSE mastered_at END,
    updated_at = now()
  WHERE user_id = v_user_id AND module_id = v_module_id;

  -- Desbloquear el siguiente módulo si cumple 100% secciones y >= 80% de estrellas
  IF v_completed_count >= v_total_sec AND v_pct >= 80.00 THEN
    SELECT id INTO v_next_module_id
    FROM modules
    WHERE language_id = v_language_id 
      AND position = (SELECT position + 1 FROM modules WHERE id = v_module_id)
      AND deleted_at IS NULL;

    IF v_next_module_id IS NOT NULL THEN
      UPDATE user_module_progress
      SET 
        is_unlocked = true,
        status = CASE WHEN status = 'locked' THEN 'unlocked' ELSE status END,
        unlocked_at = COALESCE(unlocked_at, now()),
        updated_at = now()
      WHERE user_id = v_user_id AND module_id = v_next_module_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_section_stars_upsert
AFTER INSERT OR UPDATE OF max_stars_earned ON user_section_stars
FOR EACH ROW EXECUTE FUNCTION fn_recalculate_module_progress();
```

> El DDL completo (22 entidades + 5 tablas de soporte) se genera a partir de este documento y se versiona en `migrations/` con `V__` + `COMMENT ON TABLE/COLUMN` para trazabilidad `RF-*`.

---

## 11. Seguridad y privacidad (RNF-008, RNF-009, RNF-037–RNF-040)

| Medida | Implementación en BD |
|---|---|
| Hash de contraseñas | `password_hash` con Argon2id; nunca `SELECT password_hash` en endpoints de lectura; solo en `verify` |
| PII mínima | `document_number` solo en `user_profiles` y snapshot `certificates.metadata`; acceso por `user_id = auth.uid()` (RLS o `WHERE` en app) |
| Aislamiento entre usuarios | Toda consulta de `attempts/progress/certificates/subscriptions/user_section_stars/user_mistakes_notebook` filtra por `user_id = $auth_user_id` salvo admin con `RF-ADM-007`; test IDOR en `20` (`RNF-009`) |
| No fuga en logs | `RNF-037`: triggers de auditoría nunca loguean `password_hash`, `document_number` en claro, ni `given_answer` con PII |
| Borrado/anonimización | `RF-USR-003`: `UPDATE users SET email='deleted_'||id||'@deleted.local', deleted_at=now()` + `UPDATE user_profiles SET display_name='Usuario eliminado', document_number=NULL, avatar_url=NULL` + `UPDATE certificates SET metadata = metadata - 'document_number'` y `status='revoked'` si aplica |
| Backups | `RNF-043`: dump diario + WAL; retención ≥7 días; ensayo mensual en `staging` |

---

## 12. Migraciones y versionado (RNF-035, RF-ADM-005, RNF-019)

1. **Versionado de contenido:** cada `UPDATE` de `modules/sections/lessons/questions/quizzes/exams` incrementa `content_version` y crea fila de auditoría en `content_audit_log`. Los intentos congelan `content_version` y `threshold_applied`.
2. **Migraciones de esquema:**
   - `V20260829_001__baseline_core.sql`: crea las 18 entidades base (usuarios, catálogo, intentos, certificaciones).
   - `V20260902_002__gamification_stars_locks_notebook.sql`: crea `user_section_stars`, `user_module_progress`, `user_mistakes_notebook`, `review_queue_items` y la función de recálculo y desbloqueo automático.
   - `V20260902_003__seed_lua_12_modules.sql`: inserta los 12 módulos de Lua (`28_LUA_CURRICULUM.md`), con M01 y M02 completos (10 secciones, 100 lecciones y ejercicios cada uno).
3. **Rollback:** cada migración debe tener `DOWN` o ser forward-only con ADR; `21_DEPLOYMENT.md` define estrategia `expand/contract` para cambios breaking.
4. **Validación pre-publicación:** `RF-ADM-006` se implementa como función `validate_content_publish()` que verifica FKs, ciclos de prerrequisitos, y que cada `quiz`/`exam` tiene composición válida antes de `UPDATE status='published'`.

---

## 13. Trazabilidad RF → Tabla

| RF | Tabla(s) | Columna(s) clave |
|---|---|---|
| RF-AUTH-001/002/005 | `users` | `email`, `password_hash`, `email_verified_at`, `status` |
| RF-USR-003 | `users`, `user_profiles`, `certificates` | `deleted_at`, anonimización |
| RF-PROF-001/003 | `user_profiles`, `progress` | `display_name`, `avatar_url`, `progress.percent` |
| RF-LANG-001–005 | `programming_languages`, `learning_paths` | `status`, `learning_paths.language_id` |
| RF-LVL-001–004 | `learning_paths` | `declared_level` |
| RF-DIAG-001–006 | `attempts` (`kind='diagnostic'`), `diagnostic_results` | `threshold_applied`, `area_scores` |
| RF-RUTA-001–005 | `learning_paths`, `learning_path_modules` | `entry_module_id`, `current_*`, `position` |
| RF-MOD-001–005 | `modules`, `user_module_progress` | `position`, `status`, `min_stars_percentage`, `prerequisite_module_id` |
| RF-SEC-001–005 | `sections`, `user_section_stars` | `type`, `stars_available`, `is_first_section`, `xp_on_complete` |
| RF-LEC-001–005 | `lessons` | `body_mdx`, `is_required` |
| RF-PREG-001–007 | `questions`, `answers` | `type`, `difficulty`, `prompt`, `is_correct` |
| RF-QUIZ-001–006 | `quizzes`, `quiz_questions` | `threshold`, `distribution` implícita |
| RF-EXAM-001–007 | `exams`, `exam_questions` | `threshold`, `distribution` |
| RF-EVAL-001–006 | `attempts`, `attempt_answers` | `score`, `percent`, `is_passed`, `threshold_applied`, `content_version` |
| RF-PROG-001–006 | `progress`, `attempts` | `scope`, `completed_items`, `percent` |
| RF-ESTRELLA-001–005 | `user_section_stars` | `stars_earned`, `max_stars_earned`, `first_attempt_errors`, `review_round_completed` |
| RF-CANDADO-001–004 | `user_module_progress`, `sections` | `is_unlocked`, `stars_percentage`, `sections_completed`, `unlocked_at` |
| RF-CUADERNO-001–006 | `user_mistakes_notebook` | `question_id`, `fail_count`, `is_resolved`, `resolved_at`, `xp_recovered` |
| RF-REP-001–005 | `user_mistakes_notebook`, `review_queue_items` | `status`, `review_round`, `last_failed_at` |
| RF-XP-001–005 | `xp_transactions` | `amount`, `reason`, `idempotency_key` |
| RF-RACHA-001–005 | `streaks` | `activity_date`, `timezone` |
| RF-LOGRO-001–005 | `achievements`, `user_achievements` | `code`, `condition`, `unlocked_at` |
| RF-CERT-001–006 | `certificates`, `certificate_sequences` | `code`, `status`, `language_content_version` |
| RF-PDF-001–004 | `certificates` | `pdf_object_key`, `pdf_version` |
| RF-ADS-001–005 | `subscriptions` (inferencia `status='active'` = sin ads) | `status` |
| RF-PREM-001–006 | `subscriptions`, `subscription_events` | `plan_code`, `provider`, `current_period_end` |
| RF-ADM-001–009 | `content_audit_log`, todas las tablas de contenido | `status`, `content_version`, `created_by` |

---

## 14. Decisiones abiertas y próximos pasos

| Decisión | Estado | Siguiente paso |
|---|---|---|
| Gestor concreto y hosting (RDS, Cloud SQL, Supabase) | Abierta — requiere ADR | Evaluar costo vs. `RNF-001`/`RNF-005` en `09-decisions/` |
| RLS vs. `WHERE user_id` en app | Abierta | Si se usa Supabase/PostgREST, habilitar RLS; si API propia, `WHERE` + tests IDOR (`RNF-009`) |
| Particionado de `attempts` | Diferida a Post-MVP | Medir `RNF-007` con dataset sintético 100k intentos; si p95 >100 ms, particionar |
| Cifrado de `document_number` | Abierta | Si `RNF-037` lo exige, usar `pgcrypto` o cifrado en app con KMS |
| Caché de `progress` y `roadmap` en Redis | Recomendada | Implementar tras MVP para garantizar lecturas del roadmap sub-80 ms |

---

*Fin de `12_DATABASE_DESIGN.md` — cualquier adición requiere actualizar `05_FUNCTIONAL_REQUIREMENTS.md`, `11_SYSTEM_ARCHITECTURE.md`, `13_API_SPECIFICATION.md`, `20_TESTING.md` y `CHANGELOG.md`.*
| Cifrado de `document_number` | Abierta | Si `RNF-037` lo exige, usar `pgcrypto` o cifrado en app con KMS |
| Caché de `progress` en Redis | Recomendada | Implementar tras MVP si `idx_progress_user_lang` no alcanza p95 |

> Actualizar este documento y `CHANGELOG.md` (fecha `America/Bogota`) ante cualquier cambio de esquema, y generar ADR si la decisión es arquitectónica (`09-decisions/`).

---

*Fin de `12_DATABASE_DESIGN.md` — cualquier adición requiere actualizar `05_FUNCTIONAL_REQUIREMENTS.md`, `11_SYSTEM_ARCHITECTURE.md`, `13_API_SPEC.md`, `20_TESTING.md` y `CHANGELOG.md`.*
