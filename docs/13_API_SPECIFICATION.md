# 13 — Especificación de API (API Specification)

> **Estado:** Aprobado · **Versión del documento:** 2.0.0 · **Fecha:** 2026-09-02  
> **Complementa a:** `01_PROJECT_OVERVIEW.md` (§5 flujo, §7 jerarquía, §24 motores), `03_OBJECTIVES.md` (OT-04 API REST versionada), `04_SCOPE.md` (§2.8 transversales MVP), `05_FUNCTIONAL_REQUIREMENTS.md` (128 RF), `06_NON_FUNCTIONAL_REQUIREMENTS.md` (RNF-001/003/008/010/032/041), `07_USER_STORIES.md` (E01–E10), `11_SYSTEM_ARCHITECTURE.md`, `12_DATABASE_DESIGN.md` (v2.0.0), `14_LEARNING_SYSTEM.md`, `16_GAMIFICATION.md`, `27_UI_UX_SPECIFICATION.md` y `01_PROJECT_OVERVIEW.md`.  
> **Zona horaria de timestamps de API:** `America/Bogota` (UTC-5) — coherente con `19_SECURITY.md` y `CHANGELOG.md`.

---

## 1. Propósito y alcance

Este documento especifica el **contrato HTTP REST** de la plataforma educativa gamificada. Define qué expone el sistema, los modelos de datos de entrada/salida, los códigos de estado, las reglas de negocio en cada operación y la interacción con los motores pedagógico, de gamificación, de evapythonción y de contenido.

**Sí incluye:**
- Base URL y versionado semántico (`/api/v1`).
- Convenciones transversales de paginación, correlación (`X-Request-Id`) e idempotencia (`Idempotency-Key`).
- Autenticación JWT stateless con rotación de refresh tokens y control de acceso RBAC.
- Sistema de Roadmap y Candados Progresivos ($S_1 \to S_n$ y $M_{i+1}$ condicionado a 100% secciones + $\ge 80\%$ de estrellas de maestría + examen aprobado).
- Calificación formativa en estrellas (1–3 ⭐) con rejugabilidad no punitiva y conservación de mejor marca (`max_stars_earned`).
- Cuaderno de errores persistente (`user_mistakes_notebook`) para práctica deliberada (+5 XP de remediación formativa).
- Ronda de repaso intra-sesión y feedback formativo anti-spoilers.
- Soporte curricular multi-lenguaje (con Python como rutas insignias de lanzamiento).
- Tabla completa de 44 endpoints REST, schemas JSON canónicos, ejemplos de consumo cURL y catálogo de errores de negocio.

**No incluye:**
- Implementación física interna de base de datos (`12_DATABASE_DESIGN.md`).
- Algoritmos internos de inferencia del Learning Engine (`14_LEARNING_SYSTEM.md`).
- Reglas de maquetación de componentes visuales (`27_UI_UX_SPECIFICATION.md`).

---

## 2. Convenciones generales

### 2.1 Base URL y versionado

```
Base URL (dev):     https://api.duolingo-programacion.local/api/v1
Base URL (staging): https://staging-api.duolingo-programacion.com/api/v1
Base URL (prod):    https://api.duolingo-programacion.com/api/v1
```

- Toda ruta está prefijada con `/api/v1` (`RNF-032`).
- Todo cambio que rompa compatibilidad hacia atrás (breaking change) exigirá un incremento mayor a `/api/v2`.
- `Content-Type: application/json; charset=utf-8` en peticiones y respuestas. `Accept: application/json` requerido.

### 2.2 Identificadores y formatos

| Elemento | Formato | Ejemplo |
|---|---|---|
| ID de recurso (UUID v4) | `string(uuid)` | `0f8a1e3a-4b2c-4d9e-9f1a-2b3c4d5e6f70` |
| ID de certificado | `KODA-{LANG}-{SEQ}` (`01` §22, `17`) | `KODA-PY-000001`, `KODA-PY-000001` |
| Fecha / Hora | ISO 8601 con offset Bogotá (UTC-5) | `2026-09-02T14:30:00-05:00` |
| Código de Lenguaje | `PY`, `PY`, `JS`, `RUST`… | `PY` |
| Estado de Candado Módulo | `locked`, `unlocked` | `unlocked` |
| Estado de Progreso Módulo | `not_started`, `in_progress`, `completed`, `passed`, `failed` | `in_progress` |
| Estado de Candado Sección | `locked`, `unlocked` | `unlocked` |
| Estrellas de Sección | Entero `1` a `3` (`stars_earned`, `max_stars_earned`) | `3` (⭐⭐⭐) |
| Porcentaje de Maestría | Decimal `0.00` a `100.00` | `85.50` |
| Paginación | `?page=1&per_page=20` (1-indexed) | — |
| Ordenamiento | `?sort=created_at&order=desc` | — |
| Idempotencia | Header `Idempotency-Key: <uuid>` en POST de mutación/evapythonción | — |
| Correlación | Response header `X-Request-Id: <uuid>` + campo `request_id` en errores (`RNF-041`, `RNF-045`) | — |

### 2.3 Paginación, filtrado y envoltorios

**Request paginado:**
```http
GET /api/v1/notebook/mistakes?page=1&per_page=20&language_id=python HTTP/1.1
```

**Response lista (envoltorio común):**
```json
{
  "data": [ { } ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 4,
    "total_pages": 1
  }
}
```

Regla `RNF-003`: ninguna lista devuelve >100 ítems sin paginación; payload de lección <200 KB JSON sin assets.

### 2.4 Cabeceras transversales

```http
Authorization: Bearer <access_token>    // Requerido salvo endpoints públicos
Idempotency-Key: <uuid>                // Requerido en POST evapythonbles y de progreso
X-Request-Id: <uuid>                   // Devuelto por el servidor en todas las respuestas
Cache-Control: no-store                // En respuestas autenticadas
```

---

## 3. Autenticación y Autorización

### 3.1 Autenticación JWT Stateless

Mecanismo **stateless JWT** (`RNF-008`, `RNF-005`):

| Token | Vida | Uso |
|---|---|---|
| `access_token` (JWT, HS256/RS256) | 15 min (configurable `RF-AUTH-002`) | `Authorization: Bearer <token>` |
| `refresh_token` (opaco, rotativo) | 7 días | `POST /auth/refresh` → emite par nuevo; el anterior se invalida |

- Contraseñas hasheadas con función adaptativa (`Argon2id` o `bcrypt` con costo $\ge 12$, `RNF-008`).
- `POST /auth/register` envía email de verificación (token un solo uso, expiración 24 h, `RF-AUTH-005`). Verificación **no bloquea** el aprendizaje, pero es requisito indispensable para emitir certificados (`US-059`).
- `refresh` silencioso durante lección activa (`RF-AUTH-007`, `RNF-023`) sin interrumpir la experiencia de usuario.

### 3.2 Autorización RBAC

| Rol / Flag | Descripción | Alcance |
|---|---|---|
| `user` | Usuario estándar registrado | Acceso a sus rutas, progreso, cuaderno de errores, logros y certificados propios. |
| `admin` | Administrador de contenido y sistema | Acceso a `/admin/*`, CRUD de módulos/preguntas, métricas agregadas y publicación sin deploy. |
| `is_premium` | Flag booleano de suscripción | Desactiva anuncios intersticiales entre secciones (`RF-ADS-001/002`). |

---

## 4. Formato estándar de errores

Todas las respuestas de error ($4xx$ y $5xx$) devuelven un JSON canónico:

```json
{
  "error": {
    "code": "MODULE_LOCKED",
    "message": "El módulo se encuentra bloqueado. Debes completar el 100% de las secciones anteriores, aprobar el examen y acumular al menos el 80% de estrellas.",
    "details": {
      "module_id": "0f8a1e3a-4b2c-4d9e-9f1a-2b3c4d5e6f71",
      "required_stars_percentage": 80.00,
      "current_stars_percentage": 66.67,
      "missing_sections": ["sec-08", "sec-09"],
      "exam_passed": false
    },
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-09-02T14:30:00-05:00"
  }
}
```

---

## 5. Tabla completa de recursos y endpoints

> `Auth` = requiere `Bearer <access_token>`. `Rol` mínimo. `RF` principal trazado.

| # | Recurso | Método | Endpoint | Auth | Rol | Descripción | RF |
|---|---|---|---|---|---|---|---|
| 1 | Auth | POST | `/auth/register` | No | — | Registro con email + contraseña | RF-AUTH-001, RF-USR-001 |
| 2 | Auth | POST | `/auth/login` | No | — | Login, emite `access` + `refresh` | RF-AUTH-002, RF-AUTH-006 |
| 3 | Auth | POST | `/auth/refresh` | Sí (refresh) | — | Renueva par de tokens rotativos | RF-AUTH-007 |
| 4 | Auth | POST | `/auth/logout` | Sí | USER | Invalida `refresh_token` activo | RF-AUTH-003 |
| 5 | Auth | POST | `/auth/forgot-password` | No | — | Solicita recuperación de contraseña | RF-AUTH-004 |
| 6 | Auth | POST | `/auth/reset-password` | No (token) | — | Define nueva contraseña con token | RF-AUTH-004 |
| 7 | Auth | POST | `/auth/verify-email` | No (token) | — | Confirma email del usuario | RF-AUTH-005 |
| 8 | Users | GET | `/users/me` | Sí | USER | Perfil consolidado del titular | RF-PROF-001, RF-USR-002 |
| 9 | Users | PATCH | `/users/me` | Sí | USER | Actualiza datos de perfil / clave | RF-USR-002, RF-PROF-002 |
| 10 | Users | DELETE | `/users/me` | Sí | USER | Solicita anonimización / baja | RF-USR-003 |
| 11 | Users | GET | `/users/me/progress` | Sí | USER | Progreso agregado por lenguaje / módulo | RF-PROG-002, RF-PROG-005 |
| 12 | Users | GET | `/users/me/achievements` | Sí | USER | Logros desbloqueados y en progreso | RF-LOGRO-002/003 |
| 13 | Users | GET | `/users/me/certificates` | Sí | USER | Certificados emitidos al titular | RF-PROF-005, RF-CERT-001 |
| 14 | Users | GET | `/users/me/stats` | Sí | USER | Estadísticas globales de aprendizaje | RF-PROF-006 |
| 15 | Languages | GET | `/languages` | No* | — | Lista de lenguajes (Python disponibles) | RF-LANG-001 |
| 16 | Languages | GET | `/languages/{id}` | No* | — | Detalle de un lenguaje de programación | RF-LANG-001 |
| 17 | Languages | GET | `/languages/{id}/modules` | Sí | USER | Lista de módulos con progreso y candados | RF-MOD-001, RF-RUTA-002 |
| 18 | Languages | GET | `/languages/{id}/roadmap` | Sí | USER | **Roadmap interactivo:** módulos, candados y estrellas | RF-CANDADO-001, RF-ESTRELLA-001 |
| 19 | Modules | GET | `/modules/{id}` | Sí | USER | Detalle de módulo (objetivo, candado, % estrellas) | RF-MOD-002/003/005 |
| 20 | Modules | GET | `/modules/{id}/sections` | Sí | USER | Secciones del módulo con candados y ⭐ | RF-SEC-001, RF-CANDADO-002 |
| 21 | Sections | GET | `/sections/{id}` | Sí | USER | Detalle de sección con micro-lecciones y ⭐ obtenidas | RF-SEC-002/004, RF-ESTRELLA-004 |
| 22 | Sections | POST | `/sections/{id}/complete` | Sí | USER | **Cierre y calificación de sección (1–3 ⭐)** | RF-SEC-003, RF-ESTRELLA-001–005 |
| 23 | Sections | POST | `/sections/{id}/review-queue/answer` | Sí | USER | Responde ejercicio de la ronda de repaso intra-sección | RF-REP-002, RF-ESTRELLA-002 |
| 24 | Lessons | GET | `/lessons/{id}` | Sí | USER | Detalle de lección con teoría, código y ejercicios | RF-LEC-001/004 |
| 25 | Lessons | POST | `/lessons/{id}/complete` | Sí | USER | Marca micro-lección completada | RF-LEC-003, RF-PROG-001 |
| 26 | Lessons | POST | `/lessons/{id}/answer` | Sí | USER | **Envía respuesta de ejercicio:** feedback anti-spoilers | RF-PREG-004/005, RF-CUADERNO-001 |
| 27 | Notebook | GET | `/notebook/mistakes` | Sí | USER | **Cuaderno de errores:** lista ejercicios pendientes | RF-CUADERNO-001–004 |
| 28 | Notebook | POST | `/notebook/mistakes/{question_id}/resolve` | Sí | USER | **Remediación en cuaderno:** valida solución (+5 XP) | RF-CUADERNO-005/006 |
| 29 | Levels | POST | `/users/me/level` | Sí | USER | Declaración de nivel inicial | RF-LVL-001/002 |
| 30 | Diagnostics | POST | `/diagnostics` | Sí | USER | Inicia diagnóstico por lenguaje | RF-DIAG-001 |
| 31 | Diagnostics | POST | `/diagnostics/{id}/attempt` | Sí | USER | Envía intento de diagnóstico (evapythonción y entrada) | RF-DIAG-002/003 |
| 32 | Quizzes | GET | `/quizzes/{id}` | Sí | USER | Metadatos y composición del quiz | RF-QUIZ-001 |
| 33 | Quizzes | POST | `/quiz/{id}/attempt` | Sí | USER | Envía intento de quiz (umbral 70%) | RF-QUIZ-002/003/006 |
| 34 | Quizzes | GET | `/quiz/{id}/attempts` | Sí | USER | Historial de intentos de quiz | RF-QUIZ-005, RF-EVAL-003 |
| 35 | Exams | GET | `/exams/{id}` | Sí | USER | Metadatos y composición del examen final | RF-EXAM-001/002 |
| 36 | Exams | POST | `/exam/{id}/attempt` | Sí | USER | **Envía intento de examen (umbral 80%):** maestría | RF-EXAM-003/004/005 |
| 37 | Exams | GET | `/exam/{id}/attempts` | Sí | USER | Historial de intentos de examen | RF-EXAM-005, RF-EVAL-003 |
| 38 | Progress | GET | `/progress` | Sí | USER | Historial filtrable de lecciones/quizzes/exámenes | RF-PROG-005 |
| 39 | Progress | GET | `/progress/streak` | Sí | USER | Racha actual / récord / congelamientos | RF-RACHA-003/005 |
| 40 | Certificates | GET | `/certificates/{id}` | No* | — | Verificación pública de certificado (`KODA-PY-...`) | RF-CERT-006 |
| 41 | Certificates | GET | `/certificates/{id}/pdf` | Sí | USER | Descarga PDF del certificado (solo titular) | RF-PDF-002/003 |
| 42 | Certificates | POST | `/certificates/verify` | No | — | Verificación pública por código o QR | RF-CERT-004/006 |
| 43 | Review | GET | `/review/recommended` | Sí | USER | Sesión de repaso inteligente recomendada | RF-REP-001/002 |
| 44 | Review | POST | `/review/attempt` | Sí | USER | Envía intento de repaso (no penaliza) | RF-REP-004 |
| — | Admin | * | `/admin/*` | Sí | ADMIN | CRUD completo, validación, publicación y métricas | RF-ADM-001–009 |

\* Endpoints de lectura pública o verificación sin autenticación. No exponen datos personales sensibles (PII).

---

## 6. Schemas comunes (contratos JSON)

### 6.1 User
```json
{
  "id": "0f8a1e3a-4b2c-4d9e-9f1a-2b3c4d5e6f70",
  "name": "Brandon",
  "email": "brandon@example.com",
  "role": "user",
  "avatar_url": "https://cdn.koda.app/avatars/koda.png",
  "email_verified": true,
  "is_premium": false,
  "level": 3,
  "xp_total": 450,
  "created_at": "2026-09-01T10:00:00-05:00"
}
```

### 6.2 Language
```json
{
  "id": "python",
  "code": "PY",
  "name": "Python",
  "description": "Aprende Python desde cero con micro-lecciones, Koda y proyectos de videojuegos.",
  "status": "available",
  "order": 1,
  "modules_count": 12,
  "total_sections_count": 113,
  "total_stars_possible": 339
}
```

### 6.3 Module (con Candados y Estrellas)
```json
{
  "id": "mod-py-01",
  "language_id": "python",
  "title": "Fundamentos de Python",
  "objective": "Comprender la sintaxis básica, print, comentarios y ejecución.",
  "position": 1,
  "status": "in_progress",
  "is_unlocked": true,
  "unlocked_at": "2026-09-01T10:00:00-05:00",
  "mastered_at": null,
  "min_stars_percentage": 80,
  "stars_total_possible": 27,
  "stars_earned": 22,
  "stars_percentage": 81.48,
  "sections_count": 9,
  "completed_sections_count": 8,
  "requirements": {
    "requires_module_id": null,
    "min_stars_percentage_required": 80,
    "requires_exam_passed": false
  },
  "evapythontions": {
    "quiz_id": "qz-py-01",
    "exam_id": "ex-py-01"
  }
}
```

### 6.4 Section y Calificación en Estrellas (`user_section_stars`)
```json
{
  "id": "sec-py-01-03",
  "module_id": "mod-py-01",
  "language_id": "python",
  "title": "Tu primer print",
  "position": 3,
  "section_type": "example",
  "is_unlocked": true,
  "stars_available": 3,
  "user_stars": {
    "stars_earned": 3,
    "max_stars_earned": 3,
    "first_attempt_errors": 0,
    "remedied_in_review": 0,
    "attempt_count": 1,
    "completed_at": "2026-09-02T14:15:00-05:00"
  },
  "lessons_count": 10
}
```

### 6.5 Question (Polimórfica según tipo `15`)
```json
{
  "id": "q-py-01-03-01",
  "section_id": "sec-py-01-03",
  "type": "multiple_choice",
  "difficulty": "easy",
  "concept_id": "py-print-string",
  "prompt": "¿Qué instrucción muestra un mensaje de texto en la pantalla?",
  "code_snippet": null,
  "options": [
    { "id": "a", "text": "print(\"Hola\")" },
    { "id": "b", "text": "show(\"Hola\")" },
    { "id": "c", "text": "escribir(\"Hola\")" },
    { "id": "d", "text": "display(\"Hola\")" }
  ],
  "points": 5
}
```

### 6.6 LessonAnswerFeedback (Anti-Spoilers)
```json
{
  "is_correct": false,
  "question_id": "q-py-01-03-01",
  "explanation": "En Python utilizamos la función print(...) para enviar texto a la consola.",
  "hint": "Recuerda que print significa 'imprimir' en inglés y es la palabra estándar en Python.",
  "added_to_review_queue": true,
  "added_to_mistakes_notebook": true
}
```

### 6.7 UserMistakesNotebookItem (Cuaderno de Errores)
```json
{
  "id": "mstk-0f8a-001",
  "question_id": "q-py-01-03-01",
  "module_id": "mod-py-01",
  "language_id": "python",
  "concept_id": "py-print-string",
  "prompt": "¿Qué instrucción muestra un mensaje de texto en la pantalla?",
  "type": "multiple_choice",
  "options": [
    { "id": "a", "text": "print(\"Hola\")" },
    { "id": "b", "text": "show(\"Hola\")" },
    { "id": "c", "text": "escribir(\"Hola\")" },
    { "id": "d", "text": "display(\"Hola\")" }
  ],
  "user_last_answer": { "selected_option_id": "b" },
  "error_count": 2,
  "last_failed_at": "2026-09-02T14:10:00-05:00",
  "is_resolved": false,
  "resolved_at": null
}
```

### 6.8 Roadmap Completo
```json
{
  "language_id": "python",
  "language_name": "Python",
  "total_stars_earned": 45,
  "total_stars_possible": 339,
  "global_percentage": 13.27,
  "modules": [
    {
      "id": "mod-py-01",
      "position": 1,
      "title": "Fundamentos de Python",
      "status": "passed",
      "is_unlocked": true,
      "stars_earned": 26,
      "stars_total_possible": 27,
      "stars_percentage": 96.30,
      "min_stars_percentage": 80,
      "can_unlock_next": true,
      "sections": [
        { "id": "sec-01", "position": 1, "is_unlocked": true, "stars_earned": 3, "max_stars_earned": 3, "status": "completed" },
        { "id": "sec-02", "position": 2, "is_unlocked": true, "stars_earned": 3, "max_stars_earned": 3, "status": "completed" },
        { "id": "sec-09", "position": 9, "is_unlocked": true, "stars_earned": 2, "max_stars_earned": 2, "status": "completed" }
      ]
    },
    {
      "id": "mod-py-02",
      "position": 2,
      "title": "Variables y tipos de datos",
      "status": "in_progress",
      "is_unlocked": true,
      "stars_earned": 19,
      "stars_total_possible": 30,
      "stars_percentage": 63.33,
      "min_stars_percentage": 80,
      "can_unlock_next": false,
      "sections": [
        { "id": "sec-01", "position": 1, "is_unlocked": true, "stars_earned": 3, "max_stars_earned": 3, "status": "completed" },
        { "id": "sec-07", "position": 7, "is_unlocked": true, "stars_earned": 0, "max_stars_earned": 0, "status": "in_progress" },
        { "id": "sec-08", "position": 8, "is_unlocked": false, "stars_earned": 0, "max_stars_earned": 0, "status": "locked" }
      ]
    },
    {
      "id": "mod-py-03",
      "position": 3,
      "title": "Operadores",
      "status": "not_started",
      "is_unlocked": false,
      "stars_earned": 0,
      "stars_total_possible": 27,
      "stars_percentage": 0.00,
      "min_stars_percentage": 80,
      "can_unlock_next": false,
      "sections": []
    }
  ]
}
```

---

## 7. Detalle de endpoints clave

### 7.1 `POST /auth/register` — Registro

- **Auth:** No · **Idempotencia:** No
- **RF:** RF-AUTH-001, RF-USR-001 · **RNF:** RNF-008 (Argon2id/bcrypt)

**Request:**
```json
{
  "name": "Brandon Pérez",
  "email": "brandon@example.com",
  "password": "PasswordSeguro!2026"
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "user": {
      "id": "0f8a1e3a-4b2c-4d9e-9f1a-2b3c4d5e6f70",
      "name": "Brandon Pérez",
      "email": "brandon@example.com",
      "role": "user",
      "email_verified": false
    },
    "tokens": {
      "access_token": "eyJhbGciOi...",
      "refresh_token": "7a8b9c...",
      "expires_in": 900
    }
  }
}
```

---

### 7.2 `POST /auth/login` — Inicio de sesión

- **Auth:** No · **RF:** RF-AUTH-002, RF-AUTH-006

**Request:**
```json
{
  "email": "brandon@example.com",
  "password": "PasswordSeguro!2026"
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "user": {
      "id": "0f8a1e3a-4b2c-4d9e-9f1a-2b3c4d5e6f70",
      "name": "Brandon Pérez",
      "role": "user",
      "is_premium": false,
      "level": 3,
      "xp_total": 450
    },
    "tokens": {
      "access_token": "eyJhbGciOi...",
      "refresh_token": "7a8b9c...",
      "expires_in": 900
    }
  }
}
```

---

### 7.3 `GET /languages` — Listar lenguajes de programación

- **Auth:** No (público) · **Paginación:** Sí · **RF:** RF-LANG-001

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "python",
      "code": "PY",
      "name": "Python",
      "description": "Ruta interactiva de 12 módulos y micro-lecciones con Koda y proyectos de videojuegos.",
      "status": "available",
      "order": 1,
      "modules_count": 12,
      "total_stars_possible": 339
    },
    {
      "id": "py",
      "code": "PY",
      "name": "Python",
      "description": "Ruta interactiva de fundamentos a POO y proyecto final.",
      "status": "available",
      "order": 2,
      "modules_count": 12,
      "total_stars_possible": 360
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total_items": 2, "total_pages": 1 }
}
```

---

### 7.4 `GET /languages/{id}/roadmap` — Roadmap Interactivo Consolidado

- **Auth:** Sí (`USER`) · **RF:** RF-CANDADO-001–004, RF-ESTRELLA-001–005, RF-RUTA-001/002

**Path params:** `id` = `python` | `py` | UUID

**Response `200 OK`:**
Retorna el schema detallado en §6.8 con todos los módulos, candados, estrellas acumuladas y secciones intra-módulo.

---

### 7.5 `GET /sections/{id}` — Detalle de sección y micro-lecciones

- **Auth:** Sí (`USER`) · **RF:** RF-SEC-002/004, RF-ESTRELLA-004

**Response `200 OK`:**
```json
{
  "data": {
    "id": "sec-py-01-03",
    "module_id": "mod-py-01",
    "language_id": "python",
    "title": "Tu primer print",
    "position": 3,
    "is_unlocked": true,
    "stars_available": 3,
    "user_stars": {
      "stars_earned": 3,
      "max_stars_earned": 3,
      "first_attempt_errors": 0,
      "attempt_count": 1
    },
    "lessons": [
      { "id": "les-python-01-03-01", "position": 1, "title": "¿Qué hace print?", "concept_id": "python-print-intro", "status": "completed" },
      { "id": "les-python-01-03-02", "position": 2, "title": "Imprimir texto entre comillas", "concept_id": "py-print-string", "status": "completed" }
    ]
  }
}
```

---

### 7.6 `POST /lessons/{id}/answer` — Enviar respuesta de ejercicio (Feedback Anti-Spoilers)

- **Auth:** Sí · **Idempotencia:** Recomendada (`Idempotency-Key`)
- **RF:** RF-PREG-004/005, RF-CUADERNO-001 · **RNF:** RNF-010 (<1 s)

**Request:**
```json
{
  "question_id": "q-py-01-03-01",
  "selected_option_id": "b",
  "time_spent_seconds": 12
}
```

**Response `200 OK` (Respuesta Incorrecta):**
```json
{
  "data": {
    "is_correct": false,
    "question_id": "q-py-01-03-01",
    "explanation": "En Python utilizamos la función print(...) para enviar texto a la consola.",
    "hint": "Recuerda que print significa 'imprimir' en inglés y es la palabra estándar en Python.",
    "added_to_review_queue": true,
    "added_to_mistakes_notebook": true,
    "first_attempt_error_registered": true
  }
}
```

**Response `200 OK` (Respuesta Correcta):**
```json
{
  "data": {
    "is_correct": true,
    "question_id": "q-py-01-03-01",
    "explanation": "¡Exacto! print(\"Hola\") muestra el texto en la consola de salida.",
    "hint": null,
    "xp_awarded": 5
  }
}
```

---

### 7.7 `POST /sections/{id}/complete` — Cierre y Calificación en Estrellas (1 a 3 ⭐)

- **Auth:** Sí · **Idempotencia:** Sí (`Idempotency-Key` obligatorio)
- **RF:** RF-SEC-003, RF-ESTRELLA-001–005, RF-CANDADO-002/003, RF-XP-001

**Request:**
```json
{
  "time_spent_seconds": 240,
  "first_attempt_errors": 0,
  "remedied_in_review": 0
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "section_id": "sec-py-01-03",
    "module_id": "mod-py-01",
    "language_id": "python",
    "status": "completed",
    "stars": {
      "stars_earned": 3,
      "max_stars_earned": 3,
      "is_new_high_score": true,
      "first_attempt_errors": 0,
      "remedied_in_review": 0,
      "attempt_count": 1
    },
    "rewards": {
      "xp_awarded": 10,
      "xp_total": 460,
      "level": 3,
      "level_up": false,
      "streak": { "current": 3, "longest": 3 }
    },
    "unlocks": {
      "unlocked_next_section_id": "sec-py-01-04",
      "module_unlocked_next": false,
      "module_stars_percentage": 33.33,
      "module_stars_earned": 9,
      "module_stars_total_possible": 27
    },
    "ads": {
      "show_interstitial": false,
      "reason": "free_user_completed_section"
    }
  }
}
```

---

### 7.8 `GET /notebook/mistakes` — Listar Cuaderno de Errores Persistente

- **Auth:** Sí (`USER`) · **RF:** RF-CUADERNO-001–004

**Query params:**

| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `language_id` | string | `python` | Filtro por lenguaje |
| `module_id` | string | null | Filtro por módulo específico |
| `is_resolved` | boolean | `false` | `false` para errores pendientes, `true` para remediados |
| `page` | int | 1 | Número de página |
| `per_page` | int | 20 | Ítems por página |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "mstk-01",
      "question_id": "q-py-01-03-01",
      "module_id": "mod-py-01",
      "language_id": "python",
      "concept_id": "py-print-string",
      "prompt": "¿Qué instrucción muestra un mensaje de texto en la pantalla?",
      "type": "multiple_choice",
      "options": [
        { "id": "a", "text": "print(\"Hola\")" },
        { "id": "b", "text": "show(\"Hola\")" },
        { "id": "c", "text": "escribir(\"Hola\")" },
        { "id": "d", "text": "display(\"Hola\")" }
      ],
      "error_count": 2,
      "last_failed_at": "2026-09-02T14:10:00-05:00",
      "is_resolved": false
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total_items": 1, "total_pages": 1 }
}
```

---

### 7.9 `POST /notebook/mistakes/{question_id}/resolve` — Remediar Error en Cuaderno (+5 XP)

- **Auth:** Sí · **Idempotencia:** Sí (`Idempotency-Key` obligatorio)
- **RF:** RF-CUADERNO-005/006, RF-XP-001

**Request:**
```json
{
  "selected_option_id": "a",
  "time_spent_seconds": 15
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "question_id": "q-py-01-03-01",
    "is_correct": true,
    "is_resolved": true,
    "resolved_at": "2026-09-02T14:35:00-05:00",
    "rewards": {
      "xp_awarded": 5,
      "xp_total": 465,
      "reason": "mistake_notebook_resolved"
    },
    "explanation": "¡Excelente remediación! Dominaste el concepto 'py-print-string'."
  }
}
```

---

### 7.10 `POST /quiz/{id}/attempt` — Enviar Intento de Quiz (Umbral 70%)

- **Auth:** Sí · **Idempotencia:** Sí (`Idempotency-Key`) · **RF:** RF-QUIZ-002/003/006, RF-EVAL-001/002

**Request:**
```json
{
  "answers": [
    { "question_id": "q-qz-01", "selected_option_id": "b" },
    { "question_id": "q-qz-02", "selected_option_id": "a" }
  ],
  "time_spent_seconds": 180
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "attempt_id": "att-qz-001",
    "quiz_id": "qz-py-01",
    "score": 90,
    "percentage": 90.00,
    "passed": true,
    "threshold_applied": 70.00,
    "rewards": {
      "xp_awarded": 25,
      "xp_total": 490
    },
    "details": [
      { "question_id": "q-qz-01", "is_correct": true, "points": 10 },
      { "question_id": "q-qz-02", "is_correct": true, "points": 10 }
    ]
  }
}
```

---

### 7.11 `POST /exam/{id}/attempt` — Enviar Intento de Examen (Umbral 80% y Desbloqueo)

- **Auth:** Sí · **Idempotencia:** Sí (`Idempotency-Key`) · **RF:** RF-EXAM-003/004/005, RF-CANDADO-003

**Request:**
```json
{
  "answers": [
    { "question_id": "q-ex-01", "selected_option_id": "c" },
    { "question_id": "q-ex-20", "selected_option_id": "a" }
  ],
  "time_spent_seconds": 600
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "attempt_id": "att-ex-001",
    "exam_id": "ex-py-01",
    "module_id": "mod-py-01",
    "score": 85,
    "percentage": 85.00,
    "passed": true,
    "threshold_applied": 80.00,
    "module_mastered": true,
    "next_module_unlocked": true,
    "unlocked_module_id": "mod-py-02",
    "rewards": {
      "xp_awarded": 100,
      "xp_total": 590
    }
  }
}
```

---

## 8. Catálogo de códigos de error por dominio

| Dominio | HTTP | `code` | Mensaje (es) | RF / RNF |
|---|---|---|---|---|
| **Auth** | 400 | `VALIDATION_ERROR` | Campos de registro o credenciales con formato inválido. | RF-AUTH-001 |
| **Auth** | 401 | `INVALID_CREDENTIALS` | Credenciales incorrectas. | RF-AUTH-002, RNF-041 |
| **Auth** | 401 | `INVALID_REFRESH` | Refresh token inválido, reutilizado o expirado. | RF-AUTH-007 |
| **Auth** | 409 | `EMAIL_TAKEN` | El correo electrónico ya se encuentra registrado. | RF-AUTH-001 |
| **Auth** | 429 | `RATE_LIMITED` | Demasiadas solicitudes. Reintenta en {s} segundos. | RF-AUTH-006 |
| **Roadmap** | 422 | `MODULE_LOCKED` | Módulo bloqueado. Requiere 100% de secciones del módulo anterior, examen aprobado y $\ge 80\%$ de estrellas. | RF-CANDADO-003, RF-RUTA-004 |
| **Roadmap** | 422 | `SECTION_LOCKED` | Sección bloqueada. Debes completar la sección inmediatamente anterior. | RF-CANDADO-002, RF-SEC-004 |
| **Roadmap** | 422 | `INSUFFICIENT_STARS` | Estrellas insuficientes en el módulo actual para abrir el siguiente módulo. | RF-ESTRELLA-003, RF-MOD-004 |
| **Notebook** | 404 | `QUESTION_NOT_IN_MISTAKES` | La pregunta indicada no existe en tu cuaderno de errores activos. | RF-CUADERNO-003 |
| **Notebook** | 409 | `ALREADY_RESOLVED` | El error ya fue remediado previamente en el cuaderno. | RF-CUADERNO-005 |
| **Lessons** | 422 | `LESSON_LOCKED` | Micro-lección bloqueada. Completa las anteriores. | RF-LEC-004 |
| **Lessons** | 409 | `ALREADY_COMPLETED` | Lección o sección ya completada (idempotencia garantizada). | RF-XP-005 |
| **Quiz/Exam**| 400 | `INCOMPLETE_ANSWERS` | Faltan respuestas para preguntas obligatorias de la evapythonción. | RF-QUIZ-002, RF-EXAM-001 |
| **Quiz/Exam**| 409 | `IDEMPOTENCY_CONFLICT` | Mismo `Idempotency-Key` enviado con payload diferente. | RNF-042 |
| **Certificates**| 403 | `NOT_CERTIFICATE_OWNER` | Solo el titular registrado puede descargar el PDF oficial. | RF-PDF-002 |
| **Certificates**| 404 | `CERTIFICATE_NOT_FOUND` | Certificado no encontrado para el código proporcionado. | RF-CERT-006 |
| **Certificates**| 422 | `CERTIFICATE_NOT_ELIGIBLE` | Debes completar y aprobar los 12 módulos y verificar tu correo. | RF-CERT-001, RF-AUTH-005 |
| **Admin** | 403 | `ADMIN_REQUIRED` | Se requieren privilegios de administrador. | RF-ADM-007 |
| **Admin** | 422 | `CONTENT_VALIDATION_FAILED` | Error de validación semántica o pedagógica en el contenido. | RF-ADM-006 |

---

## 9. Ejemplos de consumo cURL (Flujo Integral de Aprendizaje)

```bash
# 1. Login y obtención de tokens
curl -X POST https://api.duolingo-programacion.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"brandon@example.com","password":"PasswordSeguro!2026"}'

# 2. Consultar Roadmap de Python con Candados y Estrellas
curl https://api.duolingo-programacion.com/api/v1/languages/python/roadmap \
  -H "Authorization: Bearer $ACCESS"

# 3. Enviar respuesta a ejercicio interactivo (Feedback Anti-Spoilers)
curl -X POST https://api.duolingo-programacion.com/api/v1/lessons/les-python-01-03-01/answer \
  -H "Authorization: Bearer $ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"question_id":"q-py-01-03-01","selected_option_id":"b","time_spent_seconds":15}'

# 4. Completar sección y calificar con 3 Estrellas (Idempotente)
curl -X POST https://api.duolingo-programacion.com/api/v1/sections/sec-py-01-03/complete \
  -H "Authorization: Bearer $ACCESS" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json" \
  -d '{"time_spent_seconds":240,"first_attempt_errors":0,"remedied_in_review":0}'

# 5. Consultar Cuaderno de Errores pendientes
curl https://api.duolingo-programacion.com/api/v1/notebook/mistakes?language_id=python&is_resolved=false \
  -H "Authorization: Bearer $ACCESS"

# 6. Remediar error en el Cuaderno (+5 XP)
curl -X POST https://api.duolingo-programacion.com/api/v1/notebook/mistakes/q-py-01-03-01/resolve \
  -H "Authorization: Bearer $ACCESS" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440002" \
  -H "Content-Type: application/json" \
  -d '{"selected_option_id":"a","time_spent_seconds":10}'

# 7. Enviar Intento de Examen de Módulo (Compuerta de Maestría >=80%)
curl -X POST https://api.duolingo-programacion.com/api/v1/exam/ex-py-01/attempt \
  -H "Authorization: Bearer $ACCESS" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440003" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question_id":"q-ex-01","selected_option_id":"c"}],"time_spent_seconds":550}'

# 8. Verificar Certificado Público (Sin PII)
curl https://api.duolingo-programacion.com/api/v1/certificates/KODA-PY-000001
```

---

## 10. Matriz de Trazabilidad RF → Endpoints

| Código RF | Endpoint(s) REST | Historias de Usuario (US) |
|---|---|---|
| `RF-AUTH-001–007` | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/verify-email` | US-001–US-005 |
| `RF-USR-001–005` | `GET/PATCH/DELETE /users/me` | US-006, US-007 |
| `RF-PROF-001–007` | `GET /users/me`, `GET /users/me/progress`, `GET /users/me/stats` | US-008, US-011 |
| `RF-LANG-001–004` | `GET /languages`, `GET /languages/{id}`, `GET /languages/{id}/modules` | US-013, US-014 |
| `RF-RUTA-001–004` | `GET /languages/{id}/roadmap`, `GET /languages/{id}/modules` | US-015–US-018 |
| `RF-CANDADO-001–004` | `GET /languages/{id}/roadmap`, `GET /modules/{id}`, `GET /sections/{id}` | US-016, US-019 |
| `RF-ESTRELLA-001–005` | `POST /sections/{id}/complete`, `GET /sections/{id}`, `GET /languages/{id}/roadmap` | US-020, US-021 |
| `RF-CUADERNO-001–006` | `GET /notebook/mistakes`, `POST /notebook/mistakes/{question_id}/resolve`, `POST /lessons/{id}/answer` | US-022, US-023 |
| `RF-MOD-001–005` | `GET /modules/{id}`, `GET /modules/{id}/sections` | US-023, US-024 |
| `RF-SEC-001–005` | `GET /sections/{id}`, `POST /sections/{id}/complete` | US-025, US-026 |
| `RF-LEC-001–004` | `GET /lessons/{id}`, `POST /lessons/{id}/complete`, `POST /lessons/{id}/answer` | US-027–US-030 |
| `RF-PREG-001–006` | `POST /lessons/{id}/answer`, `POST /quiz/{id}/attempt`, `POST /exam/{id}/attempt` | US-031, US-032 |
| `RF-QUIZ-001–006` | `GET /quizzes/{id}`, `POST /quiz/{id}/attempt`, `GET /quiz/{id}/attempts` | US-033–US-035 |
| `RF-EXAM-001–007` | `GET /exams/{id}`, `POST /exam/{id}/attempt`, `GET /exam/{id}/attempts` | US-036–US-039 |
| `RF-EVAL-001–006` | Evapythondor en servidor en `POST /lessons/{id}/answer`, `POST /quiz/{id}/attempt`, `POST /exam/{id}/attempt` | US-040 |
| `RF-XP-001–005` | Motor de XP en `/sections/{id}/complete`, `/quiz/{id}/attempt`, `/exam/{id}/attempt`, `/notebook/mistakes/{id}/resolve` | US-041–US-043 |
| `RF-RACHA-001–005` | `GET /progress/streak`, `GET /users/me/progress` | US-044, US-045 |
| `RF-LOGRO-001–005` | `GET /users/me/achievements` | US-046–US-048 |
| `RF-REP-001–005` | `GET /review/recommended`, `POST /review/attempt`, `POST /sections/{id}/review-queue/answer` | US-049–US-051 |
| `RF-CERT-001–006` | `GET /users/me/certificates`, `GET /certificates/{id}`, `POST /certificates/verify` | US-054–US-058 |
| `RF-PDF-001–004` | `GET /certificates/{id}/pdf` | US-056, US-060 |
| `RF-ADM-001–009` | `/admin/*` | US-067–US-072 |

---

## 11. Consideraciones no funcionales (RNF)

| Requisito | Garantía en Contrato de API |
|---|---|
| **RNF-001** | Tiempo de respuesta p95: lecturas `<300 ms`, envío de ejercicios `<500 ms`, calificación de quiz/examen `<2 s`. |
| **RNF-003** | Paginación por defecto en todas las colecciones; payload máximo de lección `<200 KB`. |
| **RNF-008 / RNF-009** | Cifrado en tránsito TLS 1.3, hashing adaptativo Argon2id/bcrypt, RBAC y aislamiento multi-inquilino por `user_id`. |
| **RNF-010** | Feedback formativo de ejercicios devuelto en tiempo real ($<1\text{ s}$). |
| **RNF-014** | Degradado elegante: si el servicio de email o generación de PDF se retrasa, el avance y la calificación no se bloquean. |
| **RNF-032** | Versionado explícito en path `/api/v1` y validación estricta de esquemas OpenAPI 3.0.3 en pipeline CI. |
| **RNF-033 / RNF-042** | Idempotencia garantizada en todas las transacciones de XP, intentos de examen y completitud de sección vía `Idempotency-Key`. |
| **RNF-037 / RNF-039** | Privacidad por diseño: enmascaramiento de números de documento en endpoints públicos de verificación (`CC ***678`) y cero PII en logs. |

---

## 12. Checklist de conformidad por endpoint

Cada endpoint REST en backend debe satisfacer el siguiente checklist previo a su pase a producción:

- [ ] Contrato documentado e integrado en `openapi.yaml` (pasa linter `spectral` sin advertencias).
- [ ] Validación de payload con esquema Zod / Joi en servidor (rechaza campos no tipados).
- [ ] Aislamiento estricto de usuario autenticado contra `user_id` del token JWT (prevención IDOR).
- [ ] Implementación de `Idempotency-Key` en operaciones de escritura financiera/gamificada/evapythontiva.
- [ ] Registro estructurado de trazas en JSON con `request_id`, método, ruta y código HTTP.
- [ ] Pruebas automatizadas unitarias y de integración en `20_TESTING.md` con cobertura $\ge 70\%$.

---

*Fin de `13_API_SPECIFICATION.md` v2.0.0 — Cualquier modificación a contratos existentes requiere registro en `CHANGELOG.md` y versionado semántico.*
