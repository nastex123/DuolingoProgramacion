# 13 — Especificación de API (API Specification)

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-29
> **Complementa a:** `01_PROJECT_OVERVIEW.md` (§5 flujo, §7 jerarquía, §24 motores), `03_OBJECTIVES.md` (OT-04 API REST versionada), `04_SCOPE.md` (§2.8 transversales MVP), `05_FUNCTIONAL_REQUIREMENTS.md` (128 RF), `06_NON_FUNCTIONAL_REQUIREMENTS.md` (RNF-001/003/008/010/032/041), `07_USER_STORIES.md` (E01–E10) y anticipa `11_SYSTEM_ARCHITECTURE.md`, `12_DATA_MODEL.md`.
> **Zona horaria de timestamps de API:** `America/Bogota` (UTC-5) — coherente con `19_SECURITY.md` y `CHANGELOG.md`.

---

## 1. Propósito y alcance

Este documento especifica el **contrato HTTP REST** de la plataforma educativa gamificada. Define qué expone el sistema, no cómo se implementa internamente (reservado para `11` y `12`).

**Sí incluye:** base URL y versionado, convenciones transversales, autenticación/autorización, formato estándar de errores, tabla completa de recursos, schemas JSON, detalle por endpoint (método, path, parámetros, request/response con ejemplos), y trazabilidad a `RF-*`.

**No incluye:** modelo relacional detallado (`12`), lógica de motores (`14`–`17`), ni wireframes (`10`, `27`). Ningún endpoint fuera de este documento debe implementarse sin actualizarlo y registrar la entrada en `CHANGELOG.md` (criterio anti-scope-creep `04` §10).

MVP expone **solo `/api/v1`**; la agregación de un lenguaje nuevo (`RF-LANG-004`, `RNF-006`) no añade endpoints, solo filas en `languages/modules` vía contenido.

---

## 2. Convenciones generales

### 2.1 Base URL y versionado

```
Base URL (dev):     https://api.duolingo-programacion.local/api/v1
Base URL (staging): https://staging-api.duolingo-programacion.com/api/v1
Base URL (prod):    https://api.duolingo-programacion.com/api/v1
```

- Toda ruta está prefijada con `/api/v1` (`RNF-032`). Cambio breaking → `/api/v2` (nunca ruptura silenciosa).
- Contrato descrito en **OpenAPI 3.0.3** (`openapi.yaml` en repo). Linter de OpenAPI en CI (`RNF-032`).
- `Content-Type: application/json; charset=utf-8` en request y response. `Accept` idem.

### 2.2 Identificadores y formatos

| Elemento | Formato | Ejemplo |
|---|---|---|
| ID de recurso (UUID v4) | `string(uuid)` | `0f8a1e3a-...` |
| ID de certificado | `CQ-{LANG}-{SEQ}` (`01` §22) | `CQ-PY-000001` |
| Fecha/hora | ISO 8601 con offset Bogotá | `2026-08-29T15:04:05-05:00` |
| Lenguaje código | `PY`, `LUA`, `JS`… | `PY` |
| Nivel | `BEGINNER`, `MEDIUM`, `SEMI_PROFESSIONAL`, `PROFESSIONAL` | `BEGINNER` |
| Estado módulo | `locked`, `available`, `in_progress`, `passed`, `failed` | `in_progress` |
| Paginación | `?page=1&per_page=20` (1-indexed) | — |
| Ordenamiento | `?sort=created_at&order=desc` | — |
| Idempotencia | Header `Idempotency-Key: <uuid>` en POST de escritura | — |
| Correlación | Response header `X-Request-Id: <uuid>` + campo `request_id` en errores (`RNF-041`, `RNF-045`) | — |

### 2.3 Paginación, filtrado y envoltorios

**Request paginado:**
```
GET /api/v1/languages?page=1&per_page=20
```

**Response lista (envoltorio común):**
```json
{
  "data": [ { } ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 1,
    "total_pages": 1
  }
}
```
Regla `RNF-003`: ninguna lista devuelve >100 ítems sin paginación; payload de lección <200 KB JSON sin assets.

**Filtro y búsqueda:** `?q=`, `?status=available`, `?language_id=`, `?module_id=` según recurso.

### 2.4 Cabeceras transversales

```
Authorization: Bearer <access_token>    // requerido salvo endpoints públicos
Idempotency-Key: <uuid>                // recomendado en POST evaluables
X-Request-Id: <uuid>                   // devuelto por servidor en todas las respuestas
Cache-Control: no-store                // en respuestas autenticadas
```

---

## 3. Autenticación y Autorización

### 3.1 Autenticación

Mecanismo **stateless JWT** (`RNF-008`, `RNF-005`):

| Token | Vida | Uso |
|---|---|---|
| `access_token` (JWT, HS256/RS256) | 15 min (configurable `RF-AUTH-002`) | `Authorization: Bearer` |
| `refresh_token` (opaco, rotativo) | 7 días | `POST /auth/refresh` → emite par nuevo; el anterior se invalida |

- Contraseñas hasheadas con función adaptativa (Argon2/bcrypt, `RNF-008`). Nunca en claro ni en logs.
- `POST /auth/register` envía email de verificación (token un solo uso, expiración corta, `RF-AUTH-005`). Verificación **no bloquea** aprendizaje, sí emisión de certificado (`US-059`).
- Recuperación: `POST /auth/forgot-password` (siempre 200 genérico) + `POST /auth/reset-password` con token un solo uso (`RF-AUTH-004`).
- Logout invalida `refresh_token` en servidor (`RF-AUTH-003`).
- `refresh` silencioso durante lección activa (`RF-AUTH-007`, `RNF-023`) sin re-login.

**Flujo de login:**
```
POST /auth/register → 201 + { access_token, refresh_token, user }
POST /auth/login    → 200 + { access_token, refresh_token, user }
POST /auth/refresh  → 200 + { access_token, refresh_token }
POST /auth/logout   → 204
```

### 3.2 Autorización (RBAC mínimo MVP)

| Rol | Valor en `user.role` | Acceso |
|---|---|---|
| `USER` | `user` | Todo lo de `/users/me/*`, aprendizaje y evaluación propios. Aislamiento estricto (`RF-USR-005`, `RF-PROG-001`, `RNF-009` IDOR). |
| `ADMIN` | `admin` | `USER` + `POST/PATCH/DELETE /admin/*` (`RF-ADM-007`). |
| Premium | `user.is_premium: true` | Flag derivado de suscripción (`RF-PREM-005`); no es rol, condiciona `ads` pero no permisos de contenido (`US-066`). |

- Toda decisión de aprobación/XP/logros/certificación se toma en **servidor** (`RF-EVAL-006`, `RF-XP-005`).
- Recursos filtran por `user_id` del token; intentar acceder a progreso/certificado ajeno → `403` o `404` (no revela existencia, `RNF-041`).

### 3.3 Rate limiting y seguridad

- `RF-AUTH-006`, `RNF-009`: límite por IP+email en `POST /auth/login` y `/auth/forgot-password` → `429 Too Many Requests` con `Retry-After`.
- Cabeceras: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.
- OWASP ASVS L1: validación/saneamiento en servidor, protección inyección/XSS/IDOR, cabeceras `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` (`RNF-009`).

---

## 4. Formato estándar de respuesta y errores

### 4.1 Envoltorio de éxito

```json
{
  "data": { "id": "...", "type": "language" },
  "meta": { "request_id": "b3e1a...", "timestamp": "2026-08-29T15:04:05-05:00" }
}
```

### 4.2 Envoltorio de error (`RNF-041`, `RNF-045`)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La solicitud contiene campos inválidos.",
    "details": [
      { "field": "email", "issue": "Formato de email inválido." }
    ],
    "request_id": "b3e1a7c2-...",
    "timestamp": "2026-08-29T15:04:05-05:00"
  }
}
```

Nunca expone stack traces ni detalles internos.

### 4.3 Códigos HTTP y códigos de negocio

| HTTP | `code` (negocio) | Cuándo |
|---|---|---|
| 200 | — | GET/POST de lectura/evaluación exitosa |
| 201 | — | Creación (`register`, recurso admin) |
| 204 | — | `logout`, `DELETE` sin cuerpo |
| 400 | `VALIDATION_ERROR` | Body/query inválido (Zod/Joi) |
| 401 | `UNAUTHORIZED` | Falta `Authorization` o token expirado/invalidado |
| 403 | `FORBIDDEN` | Rol insuficiente o acceso a recurso ajeno (IDOR) |
| 404 | `NOT_FOUND` | Recurso inexistente (o no visible por aislamiento) |
| 409 | `CONFLICT` | Email ya registrado, certificado ya vigente, `Idempotency-Key` duplicado con payload distinto |
| 422 | `UNPROCESSABLE_ENTITY` | Regla de negocio: prerrequisito no cumplido, umbral no configurable, nivel bloqueado (`RF-LVL-004`) |
| 429 | `RATE_LIMITED` | `RF-AUTH-006` |
| 500 | `INTERNAL_ERROR` | Error no esperado; log con `request_id` (`RNF-045`) |

Catálogo completo por dominio en §8.

---

## 5. Tabla completa de recursos y endpoints (vista OpenAPI conceptual)

> `Auth` = requiere `Bearer`. `Rol` mínimo. `RF` principal trazado.

| # | Recurso | Método | Endpoint | Auth | Rol | Descripción | RF |
|---|---|---|---|---|---|---|---|
| 1 | Auth | POST | `/auth/register` | No | — | Registro con email+contraseña, envía verificación | RF-AUTH-001, RF-USR-001 |
| 2 | Auth | POST | `/auth/login` | No | — | Login, emite `access`+`refresh` | RF-AUTH-002, RF-AUTH-006 |
| 3 | Auth | POST | `/auth/refresh` | Sí (refresh) | — | Renueva par de tokens (rotativo) | RF-AUTH-007 |
| 4 | Auth | POST | `/auth/logout` | Sí | USER | Invalida `refresh` vigente | RF-AUTH-003 |
| 5 | Auth | POST | `/auth/forgot-password` | No | — | Solicita token de recuperación (respuesta genérica) | RF-AUTH-004 |
| 6 | Auth | POST | `/auth/reset-password` | No (token) | — | Define nueva contraseña con token | RF-AUTH-004 |
| 7 | Auth | POST | `/auth/verify-email` | No (token) | — | Verifica email | RF-AUTH-005 |
| 8 | Users | GET | `/users/me` | Sí | USER | Perfil propio consolidado | RF-PROF-001, RF-USR-002 |
| 9 | Users | PATCH | `/users/me` | Sí | USER | Actualiza nombre/avatar/contraseña | RF-USR-002, RF-PROF-002 |
| 10 | Users | DELETE | `/users/me` | Sí | USER | Solicita eliminación/anonimización | RF-USR-003 |
| 11 | Users | GET | `/users/me/progress` | Sí | USER | **Progreso agregado** por lenguaje/módulo | RF-PROG-002, RF-PROG-005 |
| 12 | Users | GET | `/users/me/achievements` | Sí | USER | **Logros** obtenidos/pendientes | RF-LOGRO-002/003, RF-PROF-004 |
| 13 | Users | GET | `/users/me/certificates` | Sí | USER | **Certificados** del titular | RF-PROF-005, RF-CERT-001 |
| 14 | Users | GET | `/users/me/stats` | Sí | USER | Estadísticas de aprendizaje | RF-PROF-006 |
| 15 | Languages | GET | `/languages` | No* | — | **Listar lenguajes** (PY disponible, resto próximamente) | RF-LANG-001 |
| 16 | Languages | GET | `/languages/{id}` | No* | — | Detalle de lenguaje | RF-LANG-001 |
| 17 | Languages | GET | `/languages/{id}/modules` | Sí | USER | **Módulos de un lenguaje** en orden canónico | RF-MOD-001, RF-RUTA-002 |
| 18 | Modules | GET | `/modules/{id}` | Sí | USER | **Detalle de módulo** (objetivo, secciones, estado, requisitos) | RF-MOD-002/003/005 |
| 19 | Modules | GET | `/modules/{id}/sections` | Sí | USER | Secciones del módulo | RF-SEC-001 |
| 20 | Sections | GET | `/sections/{id}` | Sí | USER | Detalle de sección (teoría→ejemplo→ejercicios) | RF-SEC-002/004 |
| 21 | Lessons | GET | `/lessons/{id}` | Sí | USER | Detalle de lección con ejercicios anclados | RF-LEC-001/004 |
| 22 | Lessons | POST | `/lessons/{id}/complete` | Sí | USER | **Marca lección como completada** (ejercicios ya validados) | RF-SEC-003, RF-LEC-003, RF-PROG-001 |
| 23 | Lessons | POST | `/lessons/{id}/answer` | Sí | USER | Envía respuesta a ejercicio/pregunta de lección (feedback <1 s) | RF-PREG-004/005, RF-LEC-003 |
| 24 | Levels | POST | `/users/me/level` | Sí | USER | Declara nivel inicial | RF-LVL-001/002 |
| 25 | Diagnostics | POST | `/diagnostics` | Sí | USER | Inicia diagnóstico por lenguaje | RF-DIAG-001 |
| 26 | Diagnostics | POST | `/diagnostics/{id}/attempt` | Sí | USER | Envía intento de diagnóstico, devuelve puntaje por área + recomendación | RF-DIAG-002/003 |
| 27 | Quizzes | GET | `/quizzes/{id}` | Sí | USER | Metadatos/composición de quiz | RF-QUIZ-001 |
| 28 | Quizzes | POST | `/quiz/{id}/attempt` | Sí | USER | **Envía intento de quiz** (calificación <2 s) | RF-QUIZ-002/003/006, RF-EVAL-001 |
| 29 | Quizzes | GET | `/quiz/{id}/attempts` | Sí | USER | Historial de intentos de quiz | RF-QUIZ-005, RF-EVAL-003 |
| 30 | Exams | GET | `/exams/{id}` | Sí | USER | Metadatos/composición de examen | RF-EXAM-001/002 |
| 31 | Exams | POST | `/exam/{id}/attempt` | Sí | USER | **Envía intento de examen** (bloquea/desbloquea siguiente módulo) | RF-EXAM-003/004/005/007 |
| 32 | Exams | GET | `/exam/{id}/attempts` | Sí | USER | Historial de intentos de examen | RF-EXAM-005, RF-EVAL-003 |
| 33 | Progress | GET | `/progress` | Sí | USER | Historial filtrable de lecciones/quizzes/exámenes | RF-PROG-005 |
| 34 | Progress | GET | `/progress/streak` | Sí | USER | Racha actual/máxima + historial diario | RF-RACHA-003/005 |
| 35 | Certificates | GET | `/certificates/{id}` | No* | — | Verifica certificado por ID (`CQ-PY-...`) | RF-CERT-006 |
| 36 | Certificates | GET | `/certificates/{id}/pdf` | Sí | USER | Descarga PDF del certificado (solo titular) | RF-PDF-002/003 |
| 37 | Certificates | POST | `/certificates/verify` | No | — | Verifica por QR payload | RF-CERT-004/006 |
| 38 | Review | GET | `/review/recommended` | Sí | USER | Repaso priorizado (errores, bajo rendimiento, antigüedad) | RF-REP-001/002 |
| 39 | Review | POST | `/review/attempt` | Sí | USER | Registra intento de repaso (no penaliza) | RF-REP-004 |
| — | Admin | * | `/admin/*` CRUD | Sí | ADMIN | CRUD lenguajes/módulos/secciones/lecciones/preguntas, publicación, config umbrales/XP | RF-ADM-001–008 |

\* Lectura pública limitada; detalle de progreso/attemps siempre autenticado. Verificación de certificado es pública pero no expone PII (`RF-CERT-006`, `RNF-037`).

**OpenAPI conceptual — esqueleto `openapi.yaml`:**
```yaml
openapi: 3.0.3
info:
  title: Duolingo de Programación API
  version: 1.0.0
  description: Plataforma educativa gamificada — MVP Python
servers:
  - url: https://api.duolingo-programacion.com/api/v1
paths:
  /auth/register:
    post:
      summary: Registro
      requestBody: { $ref: '#/components/schemas/RegisterRequest' }
      responses:
        '201': { $ref: '#/components/responses/RegisterResponse' }
        '400': { $ref: '#/components/responses/ValidationError' }
        '409': { $ref: '#/components/responses/Conflict' }
  # ... resto de paths según tabla
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    Error: { $ref: '#/components/schemas/ErrorEnvelope' }
```

---

## 6. Schemas comunes (contratos JSON)

### 6.1 User
```json
{
  "id": "0f8a1e3a-4b2c-4d9e-9f1a-2b3c4d5e6f70",
  "name": "Brandon",
  "email": "brandon@example.com",
  "role": "user",
  "avatar_url": "https://cdn.example.com/avatars/b.png",
  "email_verified": true,
  "is_premium": false,
  "level": 12,
  "xp_total": 1240,
  "created_at": "2026-08-29T10:00:00-05:00"
}
```

### 6.2 Language
```json
{
  "id": "py",
  "code": "PY",
  "name": "Python",
  "description": "De fundamentos a POO y proyecto final.",
  "status": "available",
  "order": 1,
  "modules_count": 12
}
```

### 6.3 Module
```json
{
  "id": "a1b2c3d4-...",
  "language_id": "py",
  "title": "Variables y tipos de datos",
  "objective": "Comprender qué es una variable y sus tipos.",
  "order": 2,
  "status": "in_progress",
  "sections": [],
  "requirements": { "requires_module_id": "fundamentos-id" },
  "evaluations": { "quiz_id": "qz-...", "exam_id": "ex-..." },
  "progress": { "completed_sections": 2, "total_sections": 5, "percent": 40 },
  "dates": { "started_at": "2026-08-28T09:00:00-05:00", "last_activity_at": "2026-08-29T14:00:00-05:00" }
}
```

### 6.4 Question (polimórfica por `type`)
```json
{
  "id": "q-001",
  "type": "multiple_choice",
  "difficulty": "easy",
  "category": "variables",
  "prompt": "¿Qué imprime `x = 5; print(x + 5)`?",
  "options": [
    { "id": "a", "text": "5" },
    { "id": "b", "text": "10" },
    { "id": "c", "text": "55" },
    { "id": "d", "text": "Error" }
  ],
  "explanation": "x vale 5; x+5 = 10.",
  "points": 10
}
```

### 6.5 Attempt (quiz/examen/diagnóstico)
```json
{
  "id": "att-001",
  "user_id": "0f8a...",
  "quiz_id": "qz-...",
  "score": 85,
  "percentage": 85,
  "passed": true,
  "threshold_applied": 70,
  "content_version": "2026-08-29.1",
  "details": [
    { "question_id": "q-001", "correct": true, "points_awarded": 10 }
  ],
  "created_at": "2026-08-29T15:00:00-05:00"
}
```

### 6.6 Progress agregado
```json
{
  "user_id": "0f8a...",
  "languages": [
    {
      "language_id": "py",
      "percent": 85,
      "current_module_id": "mod-09",
      "current_section_id": "sec-03",
      "current_lesson_id": "les-12",
      "modules_completed": 7,
      "modules_total": 12
    }
  ],
  "global": { "lessons_completed": 54, "questions_answered": 312, "correct": 241, "incorrect": 71 }
}
```

### 6.7 Achievement / Certificate
```json
// Achievement
{ "id": "FIRST_CODE", "name": "FIRST CODE", "description": "Escribir el primer código", "unlocked_at": "2026-08-29T11:00:00-05:00", "icon_url": "https://cdn.example.com/ach/first_code.svg" }

// Certificate
{
  "id": "CQ-PY-000001",
  "user_id": "0f8a...",
  "language_id": "py",
  "language_name": "Python",
  "holder_name": "Brandon Pérez",
  "document_number": "CC 12345678",
  "issued_at": "2026-08-29T16:00:00-05:00",
  "status": "valid",
  "qr_payload": "https://app.duolingo-programacion.com/verify/CQ-PY-000001",
  "pdf_url": "/api/v1/certificates/CQ-PY-000001/pdf"
}
```

---

## 7. Detalle por endpoint obligatorio y críticos

### 7.1 `POST /auth/register` — Registro

- **Auth:** No · **Rate limit:** Sí (IP)
- **RF:** RF-AUTH-001, RF-USR-001 · **US:** US-001

**Parámetros body:**

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `name` | string | Sí | 2–50 chars, sin solo espacios |
| `email` | string(email) | Sí | formato email, único (case-insensitive) |
| `password` | string | Sí | ≥8 chars, ≥1 mayúscula, ≥1 número, ≥1 símbolo (OWASP) |

**Request:**
```json
{
  "name": "Brandon",
  "email": "brandon@example.com",
  "password": "S3gura!2026"
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "user": { "id": "0f8a...", "name": "Brandon", "email": "brandon@example.com", "email_verified": false },
    "access_token": "eyJhbGciOi...",
    "refresh_token": "opaque-...",
    "expires_in": 900
  },
  "meta": { "request_id": "b3e1a...", "timestamp": "2026-08-29T15:04:05-05:00" }
}
```

**Errores:**

| HTTP | `code` | Causa |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Email/contraseña inválidos |
| 409 | `EMAIL_TAKEN` | Email ya existe (mensaje genérico opcional `RNF-041`: no revela existencia si se prefiere 400) |
| 429 | `RATE_LIMITED` | Demasiados registros desde IP |

> Nota: `409` solo si la política decide revelar; alternativa es `400` genérico sin distinguir.

---

### 7.2 `POST /auth/login` — Inicio de sesión

- **Auth:** No · **Rate limit:** Estricto (`RF-AUTH-006`)
- **RF:** RF-AUTH-002, RF-AUTH-006/007 · **US:** US-002

**Request:**
```json
{
  "email": "brandon@example.com",
  "password": "S3gura!2026"
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "user": { "id": "0f8a...", "name": "Brandon", "email_verified": true, "is_premium": false },
    "access_token": "eyJhbGciOi...",
    "refresh_token": "opaque-...",
    "expires_in": 900
  }
}
```

**Errores:**

| HTTP | `code` | Mensaje |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Campos faltantes |
| 401 | `INVALID_CREDENTIALS` | Mensaje genérico: "Credenciales inválidas." (no revela si email existe) |
| 429 | `RATE_LIMITED` | "Demasiados intentos. Reintenta en 60 s." + `Retry-After: 60` |

**Cabeceras en 429:**
```
Retry-After: 60
RateLimit-Remaining: 0
```

---

### 7.3 `GET /languages` — Listar lenguajes

- **Auth:** No (público) · **Paginación:** Sí
- **RF:** RF-LANG-001 · **US:** US-013

**Query params:**

| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | int ≥1 | 1 | — |
| `per_page` | int 1–100 | 20 | `RNF-003` |
| `status` | enum | — | `available`, `coming_soon` |

**Response `200 OK`:**
```json
{
  "data": [
    { "id": "py", "code": "PY", "name": "Python", "status": "available", "order": 1, "modules_count": 12, "description": "De fundamentos a proyecto final." },
    { "id": "lua", "code": "LUA", "name": "Lua", "status": "coming_soon", "order": 2, "modules_count": 0 }
  ],
  "pagination": { "page": 1, "per_page": 20, "total_items": 9, "total_pages": 1 }
}
```

---

### 7.4 `GET /languages/{id}/modules` — Módulos de un lenguaje

- **Auth:** Sí (`USER`) · **Paginación:** No (12 módulos MVP, orden canónico)
- **RF:** RF-MOD-001, RF-RUTA-002, RF-LANG-002 · **US:** US-018, US-023

**Path params:** `id` = `py` | UUID

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "mod-fund",
      "language_id": "py",
      "title": "Fundamentos",
      "order": 1,
      "status": "passed",
      "objective": "Entender qué es programar.",
      "sections_count": 5,
      "progress": { "percent": 100, "completed_sections": 5, "total_sections": 5 },
      "evaluations": { "quiz_id": "qz-fund", "exam_id": "ex-fund" }
    },
    {
      "id": "mod-vars",
      "language_id": "py",
      "title": "Variables y tipos de datos",
      "order": 2,
      "status": "in_progress",
      "progress": { "percent": 40, "completed_sections": 2, "total_sections": 5 }
    }
  ],
  "meta": { "language_id": "py", "total_modules": 12 }
}
```

**Errores:**

| HTTP | `code` | Causa |
|---|---|---|
| 401 | `UNAUTHORIZED` | Sin token |
| 404 | `NOT_FOUND` | `language_id` inexistente |
| 422 | `LANGUAGE_NOT_AVAILABLE` | Lenguaje en `coming_soon` y usuario no es admin |

---

### 7.5 `GET /modules/{id}` — Detalle de módulo

- **Auth:** Sí · **RF:** RF-MOD-002/003/005 · **US:** US-023

**Response `200 OK`:**
```json
{
  "data": {
    "id": "mod-vars",
    "language_id": "py",
    "title": "Variables y tipos de datos",
    "objective": "Comprender variables, asignación y tipos.",
    "order": 2,
    "status": "in_progress",
    "requirements": { "requires_module_id": "mod-fund", "requires_exam_passed": true },
    "sections": [
      { "id": "sec-01", "title": "¿Qué es una variable?", "order": 1, "status": "completed", "type": "theory" },
      { "id": "sec-02", "title": "Declaración y asignación", "order": 2, "status": "completed", "type": "example" },
      { "id": "sec-03", "title": "Tipos de datos", "order": 3, "status": "in_progress", "type": "exercises" },
      { "id": "sec-04", "title": "Modificación de variables", "order": 4, "status": "locked", "type": "exercises" },
      { "id": "sec-05", "title": "Ejercicios", "order": 5, "status": "locked", "type": "quiz" }
    ],
    "evaluations": {
      "quiz": { "id": "qz-vars", "threshold": 70, "questions_count": 10 },
      "exam": { "id": "ex-vars", "threshold": 80, "questions_count": 20 }
    },
    "dates": { "started_at": "2026-08-29T10:00:00-05:00", "last_activity_at": "2026-08-29T14:30:00-05:00" }
  }
}
```

---

### 7.6 `POST /lessons/{id}/complete` — Marcar lección como completada

- **Auth:** Sí · **Idempotencia:** Sí (`Idempotency-Key` recomendado)
- **RF:** RF-SEC-003, RF-LEC-003, RF-PROG-001, RF-XP-001/005 · **US:** US-025, US-026

> Precondición: todos los ejercicios/preguntas obligatorias de la lección ya fueron respondidos vía `POST /lessons/{id}/answer` y validados en servidor. Este endpoint solo consolida el avance y otorga XP de sección si aplica (`+10`).

**Path:** `id` = lesson UUID

**Request:** cuerpo vacío o:
```json
{
  "time_spent_seconds": 180
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `time_spent_seconds` | int ≥0 | Métrica interna para `26_ANALYTICS.md` (`RF-SEC-005`), no afecta XP en MVP |

**Response `200 OK` (idempotente):**
```json
{
  "data": {
    "lesson_id": "les-12",
    "section_id": "sec-03",
    "module_id": "mod-vars",
    "status": "completed",
    "progress": { "section_percent": 60, "module_percent": 45 },
    "rewards": {
      "xp_awarded": 10,
      "xp_total": 1250,
      "level": 12,
      "level_up": false,
      "streak": { "current": 7, "longest": 7 }
    },
    "next_lesson_id": "les-13",
    "ads": { "show_interstitial": true, "reason": "free_user_between_sections" }
  }
}
```

**Errores:**

| HTTP | `code` | Causa |
|---|---|---|
| 401 | `UNAUTHORIZED` | — |
| 404 | `NOT_FOUND` | Lección inexistente |
| 409 | `ALREADY_COMPLETED` | Ya completada (idempotencia: se devuelve `200` con mismo `rewards` si `Idempotency-Key` coincide; `409` solo si reintento sin clave y lógica de negocio lo exige) |
| 422 | `PREREQUISITE_NOT_MET` | Lección bloqueada o ejercicios obligatorios pendientes (`RF-LEC-004`) |

**Reglas de negocio:**
- XP solo se otorga una vez por lección (`RF-XP-005`, `RNF-042`). Reenvío con mismo `Idempotency-Key` no duplica.
- `ads.show_interstitial` = `true` solo si `!is_premium` y se completó sección (`RF-ADS-001/002`).

---

### 7.7 `POST /quiz/{id}/attempt` — Enviar intento de quiz

- **Auth:** Sí · **Idempotencia:** Sí
- **RF:** RF-QUIZ-002/003/006, RF-EVAL-001/002/003/006 · **RNF:** RNF-012 (<2 s) · **US:** US-033

**Path:** `id` = quiz UUID

**Request:**
```json
{
  "answers": [
    { "question_id": "q-001", "option_id": "b" },
    { "question_id": "q-002", "value": "True" },
    { "question_id": "q-003", "code": "name" },
    { "question_id": "q-004", "ordered_ids": ["l3", "l1", "l2"] }
  ],
  "time_spent_seconds": 320
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `answers` | array | Uno por pregunta del quiz; tipos según `RF-PREG-001` |
| `time_spent_seconds` | int | Métrica, no afecta calificación |

**Response `201 Created`:**
```json
{
  "data": {
    "attempt_id": "att-qz-001",
    "quiz_id": "qz-vars",
    "score": 85,
    "percentage": 85,
    "passed": true,
    "threshold_applied": 70,
    "content_version": "2026-08-29.1",
    "rewards": { "xp_awarded": 25, "xp_total": 1275 },
    "details": [
      { "question_id": "q-001", "correct": true, "correct_option_id": "b", "explanation": "x+5 = 10." },
      { "question_id": "q-002", "correct": false, "correct_value": "False", "explanation": "Una variable..." }
    ],
    "next_step": "continue_to_next_section"
  }
}
```

**Errores:**

| HTTP | `code` | Causa |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Faltan respuestas, formato inválido |
| 401 | `UNAUTHORIZED` | — |
| 404 | `NOT_FOUND` | Quiz no existe o no pertenece al módulo desbloqueado |
| 409 | `ALREADY_ATTEMPTED` | `Idempotency-Key` duplicado con payload distinto (idempotencia `RNF-042`) |
| 422 | `QUIZ_NOT_AVAILABLE` | Módulo bloqueado o quiz ya no es el vigente (versionado) |

Revisión de errores sin revelar banco completo: `GET /quiz/{id}/attempts/{attempt_id}` devuelve solo preguntas evaluadas.

---

### 7.8 `POST /exam/{id}/attempt` — Enviar intento de examen

- **Auth:** Sí · **Idempotencia:** Sí
- **RF:** RF-EXAM-001/002/003/004/005/007, RF-EVAL-* · **US:** US-036–039

> Aprobación ≥80% (`RF-EXAM-003`). Bloquea/desbloquea siguiente módulo (`RF-RUTA-004`, `RF-EXAM-004`). Reintentos ilimitados, desbloqueo exige **un** intento aprobado (`RF-EXAM-005`).

**Request:** igual a quiz pero con `exam_id`:
```json
{
  "answers": [
    { "question_id": "q-e01", "option_id": "c" },
    { "question_id": "q-e02", "value": "10" }
  ]
}
```

**Response `201 Created` — Aprobado:**
```json
{
  "data": {
    "attempt_id": "att-ex-001",
    "exam_id": "ex-vars",
    "percentage": 82,
    "passed": true,
    "threshold_applied": 80,
    "module_status": "passed",
    "rewards": { "xp_awarded": 100, "xp_total": 1375, "module_bonus_xp": 150 },
    "breakdown": {
      "by_type": {
        "multiple_choice": { "correct": 4, "total": 5 },
        "predict_output": { "correct": 4, "total": 5 },
        "complete_code": { "correct": 2, "total": 3 }
      },
      "weak_concepts": ["manejo de errores", "tipos inmutables"]
    },
    "next_module_id": "mod-ops",
    "certificate_eligible": false
  }
}
```

**Response `201 Created` — Reprobado:**
```json
{
  "data": {
    "attempt_id": "att-ex-002",
    "percentage": 65,
    "passed": false,
    "module_status": "failed",
    "next_step": "review_errors_and_retry",
    "review_url": "/api/v1/exam/ex-vars/attempts/att-ex-002/review"
  }
}
```

**Errores:** igual a quiz + `422 EXAM_PREREQUISITE_NOT_MET` si no se completaron secciones previas.

---

### 7.9 `GET /users/me/progress` — Progreso del titular

- **Auth:** Sí · **RF:** RF-PROG-002, RF-PROG-005, RF-PROF-003/006 · **US:** US-008, US-011

**Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `language_id` | string | Filtra por lenguaje (ej. `py`). Sin param → todos |
| `include` | string | `stats`, `streak`, `history` (comma-separated) |

**Response `200 OK`:**
```json
{
  "data": {
    "user_id": "0f8a...",
    "languages": [
      {
        "language_id": "py",
        "language_name": "Python",
        "percent": 58,
        "current": { "module_id": "mod-vars", "section_id": "sec-03", "lesson_id": "les-12" },
        "modules": [
          { "id": "mod-fund", "status": "passed", "percent": 100 },
          { "id": "mod-vars", "status": "in_progress", "percent": 40 }
        ],
        "stats": { "lessons_completed": 12, "questions_answered": 84, "correct": 61, "incorrect": 23 }
      }
    ],
    "streak": { "current": 7, "longest": 12, "last_activity_at": "2026-08-29T14:30:00-05:00" },
    "history": [
      { "type": "lesson_completed", "lesson_id": "les-12", "at": "2026-08-29T14:30:00-05:00", "xp": 10 },
      { "type": "quiz_attempt", "quiz_id": "qz-vars", "percentage": 85, "passed": true, "at": "2026-08-29T13:00:00-05:00" }
    ]
  },
  "pagination": { "page": 1, "per_page": 20, "total_items": 42, "total_pages": 3 }
}
```

---

### 7.10 `GET /users/me/achievements` — Logros

- **Auth:** Sí · **RF:** RF-LOGRO-002/003, RF-PROF-004 · **US:** US-010, US-046–048

**Response `200 OK`:**
```json
{
  "data": {
    "unlocked": [
      { "id": "FIRST_CODE", "name": "FIRST CODE", "description": "Escribir el primer código", "unlocked_at": "2026-08-29T11:00:00-05:00", "icon_url": "https://cdn.example.com/ach/first_code.svg" },
      { "id": "ON_FIRE", "name": "ON FIRE", "description": "Racha de 7 días", "unlocked_at": "2026-08-29T14:30:00-05:00" }
    ],
    "locked": [
      { "id": "CODE_MASTER", "name": "CODE MASTER", "description": "Completar todos los módulos de un lenguaje", "progress": { "current": 7, "total": 12 } }
    ],
    "total_unlocked": 2,
    "total_available": 12
  }
}
```

Regla `RF-LOGRO-005`: un logro se otorga una sola vez; reintentos no duplican.

---

### 7.11 `GET /users/me/certificates` — Certificados del titular

- **Auth:** Sí · **RF:** RF-CERT-001/002/003, RF-PROF-005 · **US:** US-054, US-060

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "CQ-PY-000001",
      "language_id": "py",
      "language_name": "Python",
      "status": "valid",
      "issued_at": "2026-08-29T16:00:00-05:00",
      "holder_name": "Brandon Pérez",
      "pdf_url": "/api/v1/certificates/CQ-PY-000001/pdf",
      "verify_url": "/api/v1/certificates/CQ-PY-000001"
    }
  ]
}
```

**Errores:**

| HTTP | `code` | Causa |
|---|---|---|
| 401 | `UNAUTHORIZED` | — |
| 403 | `EMAIL_NOT_VERIFIED` | No verificado y sin certificados previos (`RF-AUTH-005`, `US-059`) — lista vacía con aviso, no 403 duro según UX; se documenta como `meta.warning` |

---

### 7.12 Endpoints complementarios (resumen con ejemplos clave)

#### `POST /auth/refresh`
```json
// Request: { "refresh_token": "opaque-..." }
// Response 200: { "data": { "access_token": "eyJ...", "refresh_token": "opaque-new...", "expires_in": 900 } }
// 401 INVALID_REFRESH si rotado/expirado
```

#### `GET /users/me`
```json
{
  "data": {
    "id": "0f8a...", "name": "Brandon", "email": "b@example.com",
    "level": 12, "xp_total": 1375, "streak": { "current": 7, "longest": 12 },
    "avatar_url": "https://...", "is_premium": false, "email_verified": true
  }
}
```

#### `PATCH /users/me`
```json
// Request: { "name": "Brandon P.", "current_password": "old", "new_password": "New!2026" }
// Response 200: { "data": { "user": { "name": "Brandon P." } } }
// 422 INVALID_CURRENT_PASSWORD si no coincide (RF-USR-002)
```

#### `POST /diagnostics/{id}/attempt`
```json
// Request: { "answers": [ { "question_id": "d-01", "option_id": "b" } ] }
// Response 201: { "data": { "score": 72, "by_area": { "variables": 80, "condicionales": 60 }, "recommended_entry": { "module_id": "mod-ops", "section_id": "sec-01", "reason": "Dominas fundamentos pero fallas en condicionales." } } }
```

#### `GET /certificates/{id}` (verificación pública)
```json
// GET /certificates/CQ-PY-000001 → 200
{
  "data": {
    "id": "CQ-PY-000001",
    "status": "valid",
    "language_name": "Python",
    "holder_name": "B. P.",
    "issued_at": "2026-08-29T16:00:00-05:00",
    "holder_document_masked": "CC ***678"
  }
}
// 404 CERTIFICATE_NOT_FOUND si ID no existe
// 200 con status "obsolete" si invalidado por cambio de contenido (RF-CERT-005)
```

#### `GET /certificates/{id}/pdf`
- **Auth:** Sí (solo titular, `RF-PDF-002`) → `200` con `Content-Type: application/pdf` y `Content-Disposition: attachment; filename="CQ-PY-000001.pdf"`
- **Errores:** `401`, `403 NOT_CERTIFICATE_OWNER`, `404`

---

## 8. Catálogo de códigos de error por dominio

| Dominio | HTTP | `code` | Mensaje (es) | RF / RNF |
|---|---|---|---|---|
| Auth | 400 | `VALIDATION_ERROR` | Campos inválidos. | RF-AUTH-001 |
| Auth | 401 | `INVALID_CREDENTIALS` | Credenciales inválidas. | RF-AUTH-002, RNF-041 |
| Auth | 401 | `INVALID_REFRESH` | Refresh inválido o expirado. | RF-AUTH-007 |
| Auth | 401 | `EMAIL_NOT_VERIFIED` | Verifica tu email para emitir certificado. | RF-AUTH-005 |
| Auth | 409 | `EMAIL_TAKEN` | El email ya está registrado. | RF-AUTH-001 |
| Auth | 422 | `WEAK_PASSWORD` | La contraseña no cumple fortaleza mínima. | RF-AUTH-001 |
| Auth | 429 | `RATE_LIMITED` | Demasiados intentos. Reintenta en {s}s. | RF-AUTH-006 |
| Users | 403 | `FORBIDDEN` | No tienes permiso para este recurso. | RF-USR-005, RNF-009 |
| Users | 404 | `USER_NOT_FOUND` | Usuario no encontrado. | RF-USR-004 |
| Levels | 422 | `LEVEL_LOCKED` | Nivel bloqueado tras iniciar aprendizaje; realiza re-diagnóstico. | RF-LVL-004 |
| Diagnostics | 422 | `DIAGNOSTIC_ALREADY_VALIDATED` | Progreso ya validado por exámenes; diagnóstico no borra aprobaciones. | RF-DIAG-004 |
| Languages | 422 | `LANGUAGE_NOT_AVAILABLE` | Lenguaje próximamente, sin acceso. | RF-LANG-001 |
| Modules | 422 | `PREREQUISITE_NOT_MET` | Debes aprobar el examen del módulo anterior. | RF-RUTA-004, RF-EXAM-004 |
| Lessons | 422 | `LESSON_LOCKED` | Lección bloqueada. Completa prerrequisitos. | RF-LEC-004 |
| Lessons | 409 | `ALREADY_COMPLETED` | Lección ya completada (idempotencia). | RF-XP-005 |
| Questions | 422 | `INVALID_ANSWER_TYPE` | Tipo de respuesta no corresponde al tipo de pregunta. | RF-PREG-001 |
| Quiz/Exam | 400 | `INCOMPLETE_ANSWERS` | Faltan respuestas para preguntas obligatorias. | RF-QUIZ-002, RF-EXAM-001 |
| Quiz/Exam | 422 | `THRESHOLD_NOT_CONFIGURED` | Umbral no configurado para este módulo. | RF-EVAL-005 |
| Quiz/Exam | 409 | `IDEMPOTENCY_CONFLICT` | Mismo `Idempotency-Key` con payload distinto. | RNF-042 |
| Progress | 404 | `PROGRESS_NOT_FOUND` | Sin progreso para el filtro indicado. | RF-PROG-002 |
| Certificates | 403 | `NOT_CERTIFICATE_OWNER` | Solo el titular puede descargar el PDF. | RF-PDF-002 |
| Certificates | 404 | `CERTIFICATE_NOT_FOUND` | Certificado no encontrado. | RF-CERT-006 |
| Certificates | 422 | `CERTIFICATE_NOT_ELIGIBLE` | Debes aprobar todos los módulos y verificar email. | RF-CERT-001, RF-AUTH-005 |
| Certificates | 410 | `CERTIFICATE_OBSOLETE` | Certificado obsoleto por cambio de contenido. Revalida. | RF-CERT-005 |
| Admin | 403 | `ADMIN_REQUIRED` | Requiere rol administrador. | RF-ADM-007 |
| Admin | 422 | `CONTENT_VALIDATION_FAILED` | IDs duplicados, ciclo en prerrequisitos o referencia rota. | RF-ADM-006 |

---

## 9. Autenticación en OpenAPI y ejemplos de consumo

**Security scheme en OpenAPI:**
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security:
  - bearerAuth: []
```

**Ejemplo cURL — flujo completo MVP:**
```bash
# 1. Registro
curl -X POST https://api.duolingo-programacion.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Brandon","email":"brandon@example.com","password":"S3gura!2026"}'

# 2. Login
curl -X POST https://api.duolingo-programacion.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"brandon@example.com","password":"S3gura!2026"}'
# → { access_token, refresh_token }

# 3. Listar lenguajes (público)
curl https://api.duolingo-programacion.com/api/v1/languages

# 4. Módulos de Python
curl https://api.duolingo-programacion.com/api/v1/languages/py/modules \
  -H "Authorization: Bearer $ACCESS"

# 5. Detalle de módulo
curl https://api.duolingo-programacion.com/api/v1/modules/mod-vars \
  -H "Authorization: Bearer $ACCESS"

# 6. Completar lección (idempotente)
curl -X POST https://api.duolingo-programacion.com/api/v1/lessons/les-12/complete \
  -H "Authorization: Bearer $ACCESS" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"time_spent_seconds":180}'

# 7. Intentar quiz
curl -X POST https://api.duolingo-programacion.com/api/v1/quiz/qz-vars/attempt \
  -H "Authorization: Bearer $ACCESS" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440001" \
  -d '{"answers":[{"question_id":"q-001","option_id":"b"}]}'

# 8. Intentar examen
curl -X POST https://api.duolingo-programacion.com/api/v1/exam/ex-vars/attempt \
  -H "Authorization: Bearer $ACCESS" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440002" \
  -d '{"answers":[{"question_id":"q-e01","option_id":"c"}]}'

# 9. Progreso agregado
curl https://api.duolingo-programacion.com/api/v1/users/me/progress?language_id=py \
  -H "Authorization: Bearer $ACCESS"

# 10. Logros y certificados
curl https://api.duolingo-programacion.com/api/v1/users/me/achievements -H "Authorization: Bearer $ACCESS"
curl https://api.duolingo-programacion.com/api/v1/users/me/certificates -H "Authorization: Bearer $ACCESS"

# 11. Verificar certificado (público)
curl https://api.duolingo-programacion.com/api/v1/certificates/CQ-PY-000001
```

---

## 10. Trazabilidad RF → Endpoint

| RF | Endpoint(s) | Validación |
|---|---|---|
| RF-AUTH-001/005 | `POST /auth/register`, `POST /auth/verify-email` | US-001, US-005 |
| RF-AUTH-002/006/007 | `POST /auth/login`, `POST /auth/refresh` | US-002 |
| RF-AUTH-003 | `POST /auth/logout` | US-003 |
| RF-AUTH-004 | `POST /auth/forgot-password`, `POST /auth/reset-password` | US-004 |
| RF-USR-002 | `PATCH /users/me` | US-006 |
| RF-USR-003 | `DELETE /users/me` | US-007 |
| RF-PROF-001/003/006/007 | `GET /users/me`, `GET /users/me/progress` | US-008 |
| RF-LANG-001/002 | `GET /languages`, `GET /languages/{id}/modules` | US-013 |
| RF-MOD-001/002/003 | `GET /languages/{id}/modules`, `GET /modules/{id}` | US-018, US-023 |
| RF-SEC-003, RF-LEC-003 | `POST /lessons/{id}/complete`, `POST /lessons/{id}/answer` | US-025, US-026 |
| RF-PREG-004/005 | `POST /lessons/{id}/answer` | US-032 |
| RF-QUIZ-001/002/003/006 | `GET /quizzes/{id}`, `POST /quiz/{id}/attempt` | US-033 |
| RF-EXAM-001/002/003/007 | `GET /exams/{id}`, `POST /exam/{id}/attempt` | US-036 |
| RF-EVAL-001/002/003/006 | `POST /quiz/{id}/attempt`, `POST /exam/{id}/attempt` (cálculo en servidor) | US-040 |
| RF-PROG-001/002 | `POST /lessons/{id}/complete`, `GET /users/me/progress`, `GET /progress` | US-020, US-026 |
| RF-XP-001/005, RF-RACHA-001 | `POST /lessons/{id}/complete`, `POST /quiz/{id}/attempt`, `POST /exam/{id}/attempt` (rewards) | US-041 |
| RF-LOGRO-002/003 | `GET /users/me/achievements` | US-047, US-048 |
| RF-REP-001/002 | `GET /review/recommended`, `POST /review/attempt` | US-050 |
| RF-CERT-001/002/003/006 | `GET /users/me/certificates`, `GET /certificates/{id}`, `POST /certificates/verify` | US-054, US-055 |
| RF-PDF-002 | `GET /certificates/{id}/pdf` | US-056 |
| RF-ADM-001–008 | `/admin/*` | US-067–072 |

Regla `05` §7: cada `RF` tiene ≥1 endpoint y ≥1 test en `20`; cada endpoint mapea a ≥1 `RF`.

---

## 11. Consideraciones no funcionales aplicadas a la API

| RNF | Aplicación en API |
|---|---|
| RNF-001, RNF-010, RNF-012 | p95 lectura <300 ms, envío ejercicio <500 ms, feedback <1 s, calificación quiz/examen <2 s; APM por endpoint en `21`. |
| RNF-003 | Paginación obligatoria, límite 100 ítems, payload lección <200 KB. |
| RNF-008, RNF-009, RNF-041 | Hash adaptativo, JWT expiración corta + refresh rotativo, validación en servidor, IDOR protegido, errores con `request_id` sin stack. |
| RNF-014 | Fallo de email/ads/PDF no bloquea `POST /lessons/{id}/answer` ni `POST /quiz/{id}/attempt` (degradado). |
| RNF-032 | Versionado `/api/v1` + OpenAPI linteado en CI; breaking → nueva versión. |
| RNF-033, RNF-042 | Persistencia transaccional + `Idempotency-Key` en todos los POST evaluables. |
| RNF-037, RNF-039 | Minimización PII; verificación de certificado enmascara documento; sin PII en logs ni URLs. |

---

## 12. Versionado, evolución y compatibilidad

- **SemVer del contrato:** `1.0.0` (MVP). `MAJOR` = breaking (elimina/cambia campo requerido), `MINOR` = aditivo compatible, `PATCH` = clarificación sin cambio de validación.
- **Deprecación:** header `Deprecation: true` + `Sunset: <date>` con ≥30 días de aviso; alternativa documentada en `CHANGELOG.md`.
- **Cambios de umbrales/XP** (`RF-EVAL-005`, `RF-XP-004`) no requieren nueva versión de API: son **datos de configuración versionados** leídos por `threshold_applied` en cada `attempt`.
- **Versionado de contenido** (`RF-PREG-006`, `RF-ADM-005`): cada `attempt` guarda `content_version`; el contrato de API no cambia por editar una pregunta.

---

## 13. Checklist de implementación por endpoint

Cada endpoint se considera **terminado** solo si:

- [ ] Está en `openapi.yaml` y pasa linter en CI (`RNF-032`).
- [ ] Tiene validación de entrada en servidor (no confía en cliente).
- [ ] Respeta aislamiento por `user_id` del token (`RNF-009`, `RF-USR-005`).
- [ ] Usa `Idempotency-Key` donde corresponde y es atómico (`RNF-033`).
- [ ] Registra auditoría donde aplica (`RF-AUTH-008`, `RF-ADM-008`).
- [ ] Devuelve `X-Request-Id` y log estructurado (`RNF-045`).
- [ ] Tiene test en `20` (unit/integration/API) y mapea a `RF` y `US`.
- [ ] Está trazado en §10 y en `12_DATA_MODEL.md` (migración).

---

## 14. Referencias cruzadas

| Documento | Relación |
|---|---|
| `01_PROJECT_OVERVIEW.md` §7, §24–§29 | Jerarquía y motores que la API orquesta |
| `05_FUNCTIONAL_REQUIREMENTS.md` | 128 RF origen de cada endpoint |
| `06_NON_FUNCTIONAL_REQUIREMENTS.md` | RNF de rendimiento, seguridad, integridad y versionado que la API debe cumplir |
| `07_USER_STORIES.md` | 72 US validadas contra endpoints (§10) |
| `12_DATA_MODEL.md` (futuro) | Tablas `users`, `languages`, `modules`, `sections`, `lessons`, `questions`, `attempts`, `progress`, `certificates` |
| `19_SECURITY.md` (futuro) | Detalle de hash, JWT, rate limiting y OWASP |
| `20_TESTING.md` (futuro) | Pirámide de pruebas por endpoint |

---

*Fin de `13_API_SPECIFICATION.md` — cualquier adición de endpoint, cambio de schema o regla de autenticación requiere ADR si es breaking, actualización de `openapi.yaml`, `12_DATA_MODEL.md`, `08_USE_CASES.md` y entrada en `CHANGELOG.md` con fecha `America/Bogota`.*
