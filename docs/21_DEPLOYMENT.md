# 21 — Despliegue (Deployment)

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-29
> **Zona horaria:** America/Bogota (UTC-5)
> Complementa a `01_PROJECT_OVERVIEW.md`, `03_OBJECTIVES.md` OT-09, `04_SCOPE.md` §2.8/§5/§9, `05_FUNCTIONAL_REQUIREMENTS.md` (128 RF), `06_NON_FUNCTIONAL_REQUIREMENTS.md` (RNF-001/002/004/005/013–015/018/043), `11_SYSTEM_ARCHITECTURE.md`, `12_DATABASE_DESIGN.md`, `13_API_SPECIFICATION.md` y anticipa `19_SECURITY.md`/`20_TESTING.md`/`26_ANALYTICS.md`.
> No duplica su contenido; lo materializa en el plan operativo de despliegue verificable.

---

## 1. Propósito y alcance

Este documento define **cómo se despliega, opera, observa y recupera** la plataforma educativa gamificada del MVP (Python) y su evolución multi-lenguaje. Es la referencia para:

- Reproducir entornos idénticos (`dev`/`staging`/`prod`) sin deriva.
- Desplegar backend, frontend, BD y objetos estáticos de forma atómica y reversible.
- Cumplir RNF de rendimiento, disponibilidad, integridad y recuperación.
- Operar logs, backups, actualizaciones y rollback sin downtime percibido.

**Fuera de alcance:** el DDL exacto (`12`), el contrato OpenAPI (`13`), la lógica pedagógica (`14`/`15`/`16`) y el detalle de UI (`27`) — aquí solo se referencia su artefacto desplegable. La elección cerrada de proveedor cloud requiere ADR en `09-decisions/` si es arquitectónica.

**Principio rector:** despliegue automatizado, inmutable y auditable. Ningún cambio llega a `prod` sin pasar por `staging` con la misma imagen y migración que se probó. Todo secreto fuera del repositorio.

---

## 2. Principios de despliegue

| # | Principio | Origen | Implicación operativa |
|---|---|---|---|
| P-01 | **Paridad de entornos** | `06` RNF-005/013 | `dev` ≈ `staging` ≈ `prod` en topología (mismos contenedores, variables por env, datos distintos). |
| P-02 | **Artefacto inmutable** | `06` RNF-015 | Una imagen Docker = un `git SHA`; se promueve, no se reconstruye entre `staging` y `prod`. |
| P-03 | **Migración versionada** | `06` RNF-033/035/036, `12` | Migraciones `V{YYYYMMDD}_{NNN}__*.sql` reproducibles; nunca `auto-sync` destructivo en `prod`. |
| P-04 | **Stateless + escalado horizontal** | `06` RNF-005, `11` §2.1 | App sin estado local; sesión vía JWT + refresh en KV externo; réplicas tras balanceador sin sticky. |
| P-05 | **Despliegue sin downtime** | `06` RNF-015 | Rolling con health checks; `0` errores 5xx por deploy en 5 min post-deploy. Blue-green solo Post-MVP. |
| P-06 | **Degradado elegante** | `06` RNF-014, `04` §9 | Email/ads/PDF no bloquean lecciones; su fallo se degrada con mensaje no bloqueante. |
| P-07 | **Observabilidad y trazabilidad** | `06` RNF-018/045, `11` §22 | Logs estructurados con `request_id`, métricas p50/p95/p99 y trazas por endpoint crítico. |
| P-08 | **Seguridad por defecto** | `06` RNF-008/009, `19` | Secretos en gestor externo, TLS obligatorio, cabeceras de seguridad, escáner de secretos en CI. |
| P-09 | **Backup probado** | `06` RNF-043 | RPO ≤ 24 h, RTO ≤ 4 h; ensayo mensual de restore en `staging` con reporte fechado en `America/Bogota`. |

---

## 3. Entornos

### 3.1 Definición

| Entorno | Propósito | Datos | Acceso | Deploy | Dominio / URL |
|---|---|---|---|---|---|
| **`dev`** | Desarrollo local y CI. Iteración rápida. | Sintéticos + seed de Python; se puede borrar sin aviso. | Solo equipo dev. | `docker compose up` local; CI en cada PR. | `https://api.duolingo-programacion.local` (local), frontend `http://localhost:5173` |
| **`staging`** | Pre-producción idéntica a `prod`. Validación de RNF, carga, seguridad y contenido antes de release. | Snapshot anonimizado de `prod` (semanal) o sintético a escala (100k intentos para `RNF-007`). | Equipo + QA + revisores de contenido. | Automático al merge a `main`; imagen promovible a `prod`. | `https://staging.duolingo-programacion.com` · API `https://staging-api.duolingo-programacion.com/api/v1` |
| **`prod`** | Producción para usuarios reales. Solo artefactos probados en `staging`. | Datos reales; PII minimizada (`06` RNF-037); retención documentada. | Público (web) + admin RBAC. | Manual con aprobación; ventana comunicada; rolling con health checks. | `https://duolingo-programacion.com` · API `https://api.duolingo-programacion.com/api/v1` |

### 3.2 Comparativa operativa

| Dimensión | `dev` | `staging` | `prod` |
|---|---|---|---|
| Réplicas app | 1 | 2 (prueba `RNF-005` 1→2) | 2–3 (HPA opcional Post-MVP) |
| BD | PostgreSQL en contenedor, sin réplica | PostgreSQL gestionado o contenedor con backup diario | PostgreSQL gestionado con standby + backup diario + PITR si el proveedor lo ofrece |
| KV / Cache | Redis en contenedor | Redis gestionado o contenedor | Redis gestionado / KV externo |
| Object Storage | MinIO local | Bucket `staging` (S3-compatible) | Bucket `prod` (S3-compatible) con versionado |
| TLS | Self-signed / mkcert local | Let's Encrypt staging o cert válido | Let's Encrypt prod / cert gestionado por proxy/CDN |
| Logs | stdout local + archivo | Agregados en Loki/ELK de staging | Agregados en Loki/ELK de prod con retención ≥ 30 días |
| Métricas / APM | Opcional local | APM + uptime sintético cada 1 min | APM + RUM + uptime sintético + alertas |
| Rate limiting | Relajado | Igual que `prod` | Estricto (`05` RF-AUTH-006) |
| Anuncios / Pagos | Mocks (`mock` provider) | Mocks + sandbox de pasarela si existe | Proveedores reales tras interfaz abstracta (`11` §13–14) |

> **Regla de paridad:** `staging` debe poder ejecutar las mismas pruebas de carga/pico/volumen que `prod` (`06` §5.1). Si `staging` usa un sustituto (ej. MinIO en lugar de S3 real), se documenta en ADR y se prueba la interfaz S3-compatible, no el proveedor.

---

## 4. Decisiones tecnológicas justificadas

> Ninguna elección se asume. Cada fila propone una opción para MVP y exige ADR si es arquitectónica (`11` §19). La alternativa queda documentada para no re-decidir sin evidencia.

| Capa | Opciones evaluadas | Decisión Oficial Koda | Justificación | ADR Vinculante |
|---|---|---|---|---|
| **Contenedores** | Docker + Compose / Podman / sin contenedores | **Docker + Compose** | Artefacto inmutable (P-02), paridad `dev`≈`staging`≈`prod`, `Dockerfile` multi-stage cacheable; evita deriva de "funciona en mi máquina". | Decidido por P-02 |
| **Orquestación MVP** | Compose en VM / Kubernetes (k3s/EKS/GKE) / PaaS | **Compose en VM (1–2 nodos) + reverse proxy** | Menor costo operativo en MVP con 100 concurrentes (`06` RNF-001); cumple `RNF-005` con 2 réplicas tras balanceador. | No requiere K8s en MVP |
| **Reverse proxy / TLS** | Caddy / Nginx / Traefik | **Caddy o Nginx** | Terminación TLS, `Cache-Control`/`ETag`, cabeceras de seguridad y balanceo a réplicas. Caddy gestiona Let's Encrypt automático. | Operativo |
| **Runtime backend** | Node.js (NestJS) / Python (FastAPI) | **Node.js (NestJS Modular Monolith)** | Monolito de 9 motores desacoplados, contratos compartidos `@koda/types`, OpenAPI Swagger v2.0.0 nativo y compatibilidad multi-core. | [`ADR-001`](adr/ADR-001-monorepo-pnpm-workspaces.md) |
| **Frontend build** | Vite / Next.js 15 / CRA | **Next.js 15 (App Router + React 19)** | SSG/ISR para páginas de verificación pública de certificados (`/verificar/[code]`), SEO optimizado y soporte para PixiJS v7. | [`ADR-001`](adr/ADR-001-monorepo-pnpm-workspaces.md) |
| **BD** | PostgreSQL ≥15 / MySQL 8 | **Supabase (PostgreSQL 15+)** | Triggers PL/pgSQL transaccionales para recálculo de estrellas y candados ($\ge 80\%$), JSONB indexable y RLS. | [`ADR-002`](adr/ADR-002-persistencia-supabase-postgresql.md) |
| **Migraciones** | Flyway / Liquibase / Supabase Migrations | **Migraciones SQL versionadas (`V*.sql`)** | Migraciones reproducibles `V{YYYYMMDD}_{NNN}__*.sql` (`12` §2.1) gestionadas con Supabase CLI o script de arranque. | [`ADR-002`](adr/ADR-002-persistencia-supabase-postgresql.md) |
| **KV / Cache** | Redis / Memcached / KV embebido | **Redis (o equivalente KV)** | Rate limit por ventana deslizante, tokens rotativos, caché de progreso e idempotencia. | Aprobado (`11` §5.2) |
| **Storage de Certificados** | S3 / R2 / Google Drive API | **Google Drive API v3 (Service Account)** | Emisión 100% en backend, sin egress fees en MVP, carpetas estructuradas y deduplicación por `pdf_sha256`. | [`ADR-003`](adr/ADR-003-certificados-backend-google-drive-storage.md) |
| **Motor Gráfico Mascotas** | CSS / Three.js / PixiJS | **PixiJS v7 (WebGL 2D Acelerado)** | 60 FPS estables para Koda 🦊, física de flotación continua, expresiones emocionales en tiempo real y emisión de confeti. | [`ADR-004`](adr/ADR-004-motor-grafico-pixijs-mascota-koda.md) |
| **Imágenes / build** | `node:20-alpine` multi-stage | **Multi-stage (`node:20-alpine`)** | Imagen final sin toolchain de desarrollo; `pnpm prune --prod`. Reduce superficie y tiempo de pull. | No |
| **CI/CD** | GitHub Actions / GitLab CI | **GitHub Actions** | Pipeline declarativo (lint → test → build → scan → push → deploy) con pnpm cacheado. | Operativo |

---

## 5. Variables de entorno

### 5.1 Reglas

1. **Nunca en repositorio.** Toda variable `SECRET` vive en gestor de secretos (Doppler / Vault / SOPS / variables del forge) y se inyecta en runtime. Escáner de secretos en CI falla el build si detecta `JWT_SECRET` o `DATABASE_URL` hardcodeados (`06` RNF-008).
2. **Tipado y validación al arranque.** El backend valida con `zod`/`pydantic` al boot; si falta una `REQUIRED`, el contenedor no pasa health check y el deploy se revierte (`06` RNF-018).
3. **Un `.env.example` versionado** documenta todas las claves sin valores reales. Cada clave indica `Env` donde aplica y si es `SECRET`.
4. **Zona horaria.** Todo timestamp en `America/Bogota` en presentación; `TIMESTAMPTZ` en UTC en BD (`12` §2.1). `TZ=America/Bogota` solo para formateo, no para lógica de racha (esa usa `user.timezone` en `12`).

### 5.2 Tabla de variables por rol

| Variable | Descripción | Requerido | Secreto | Ejemplo (`dev`) | `staging` | `prod` |
|---|---|---|---|---|---|---|
| `NODE_ENV` | Entorno lógico | Sí | No | `development` | `staging` | `production` |
| `TZ` | Zona horaria del proceso para logs | Sí | No | `America/Bogota` | `America/Bogota` | `America/Bogota` |
| `PORT` | Puerto interno del backend | Sí | No | `3000` | `3000` | `3000` |
| `API_BASE_URL` | URL pública de la API | Sí | No | `http://localhost:3000/api/v1` | `https://staging-api.duolingo-programacion.com/api/v1` | `https://api.duolingo-programacion.com/api/v1` |
| `WEB_BASE_URL` | URL pública del frontend | Sí | No | `http://localhost:5173` | `https://staging.duolingo-programacion.com` | `https://duolingo-programacion.com` |
| `DATABASE_URL` | DSN PostgreSQL (con pool) | Sí | **Sí** | `postgres://app:***@db:5432/app_dev` | `postgres://app:***@db-staging:5432/app_staging` | `postgres://app:***@db-prod:5432/app` |
| `DATABASE_POOL_SIZE` | Conexiones por réplica | No | No | `10` | `20` | `20` |
| `REDIS_URL` | DSN Redis/KV | Sí | **Sí** | `redis://redis:6379/0` | `redis://***@redis-staging:6379/0` | `redis://***@redis-prod:6379/0` |
| `JWT_SECRET` | Secreto de firma de access token (HS256) o clave privada (RS256) | Sí | **Sí** | `dev-only-not-for-prod` | `***` (32+ chars) | `***` (rotado trimestral) |
| `JWT_EXPIRES_IN` | Vida del access token | Sí | No | `15m` | `15m` | `15m` |
| `REFRESH_TOKEN_TTL` | Vida del refresh rotativo | Sí | No | `7d` | `7d` | `7d` |
| `BCRYPT_ROUNDS` / `ARGON2_PARAMS` | Factor de hash adaptativo | Sí | No | `10` / `m=19456,t=2,p=1` | `12` | `12` |
| `S3_ENDPOINT` | Endpoint S3-compatible | Sí | No | `http://minio:9000` | `https://s3.amazonaws.com` | `https://s3.amazonaws.com` |
| `S3_BUCKET` | Bucket de objetos | Sí | No | `app-dev` | `app-staging` | `app-prod` |
| `S3_REGION` | Región del bucket | Sí | No | `us-east-1` | `us-east-1` | `us-east-1` |
| `S3_ACCESS_KEY_ID` | Credencial S3 | Sí | **Sí** | `minioadmin` | `***` | `***` |
| `S3_SECRET_ACCESS_KEY` | Credencial S3 | Sí | **Sí** | `minioadmin` | `***` | `***` |
| `S3_PUBLIC_BASE_URL` | URL pública para PDFs/avatars (CDN si existe) | No | No | `http://localhost:9000/app-dev` | `https://cdn-staging.duolingo-programacion.com` | `https://cdn.duolingo-programacion.com` |
| `EMAIL_PROVIDER` | `mock` / `resend` / `ses` / `sendgrid` | Sí | No | `mock` | `mock` o `ses` | `ses` (o elegido) |
| `EMAIL_API_KEY` | Credencial del proveedor | Si no es `mock` | **Sí** | — | `***` | `***` |
| `EMAIL_FROM` | Remitente verificado | Sí | No | `noreply@local.test` | `noreply@staging.duolingo-programacion.com` | `noreply@duolingo-programacion.com` |
| `ADS_PROVIDER` | `mock` / `gam` / `adsense` | Sí | No | `mock` | `mock` | `gam` (o elegido) |
| `ADS_SLOT_ID` | Slot de anuncios | Si no es `mock` | No | — | — | `slot-prod-001` |
| `PAYMENT_PROVIDER` | `mock` / `stripe` / `paypal` | Sí | No | `mock` | `mock` | `stripe` (o elegido) |
| `PAYMENT_WEBHOOK_SECRET` | Secreto de webhook | Si no es `mock` | **Sí** | — | `***` | `***` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos | Sí | No | `http://localhost:5173` | `https://staging.duolingo-programacion.com` | `https://duolingo-programacion.com` |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limit | No | No | `60000` | `60000` | `60000` |
| `RATE_LIMIT_MAX` | Máx requests por ventana | No | No | `100` | `60` | `30` (auth más estricto) |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` | Sí | No | `debug` | `info` | `info` |
| `LOG_FORMAT` | `json` / `pretty` | Sí | No | `pretty` | `json` | `json` |
| `CONTENT_VERSION_CACHE_TTL` | TTL de cache de contenido publicado | No | No | `60` | `300` | `300` |
| `STREAK_GRACE_HOURS` | Ventana de gracia de racha | No | No | `2` | `2` | `2` |
| `THRESHOLD_QUIZ_DEFAULT` | Umbral quiz inicial | No | No | `70` | `70` | `70` |
| `THRESHOLD_EXAM_DEFAULT` | Umbral examen inicial | No | No | `80` | `80` | `80` |
| `SENTRY_DSN` / `OTEL_EXPORTER_OTLP_ENDPOINT` | APM / trazas (opcional) | No | **Sí** si se usa | — | `https://***@sentry.io/xxx` | `https://***@sentry.io/xxx` |

> **`.env.example` (extracto):**
> ```dotenv
> NODE_ENV=development
> TZ=America/Bogota
> PORT=3000
> DATABASE_URL=postgres://user:pass@host:5432/db
> REDIS_URL=redis://host:6379/0
> JWT_SECRET=change-me-32-chars-min
> S3_ENDPOINT=http://minio:9000
> S3_BUCKET=app-dev
> EMAIL_PROVIDER=mock
> PAYMENT_PROVIDER=mock
> ADS_PROVIDER=mock
> CORS_ALLOWED_ORIGINS=http://localhost:5173
> ```

---

## 6. Base de datos

### 6.1 Motor y justificación

| Aspecto | Decisión | Justificación |
|---|---|---|
| Gestor | **PostgreSQL ≥ 15** (`12` §3) | Cubre `RNF-033`–`RNF-036` (transacciones, FKs, `JSONB`/`GIN`, `TIMESTAMPTZ`) sin extensiones exóticas. Alternativa MySQL válida con ADR. |
| Migraciones | **Versionadas `V{YYYYMMDD}_{NNN}__*.sql`** (`12` §2.1) | Reproducibles, auditables, reversibles; nunca `synchronize: true` en `staging`/`prod`. |
| Conexiones | Pool por réplica (`DATABASE_POOL_SIZE` 10–20) | Evita agotar conexiones bajo `RNF-001` (100 concurrentes) y `RNF-002` (picos 300). |
| Índices | Los de `12` §6.1–6.18 + `EXPLAIN ANALYZE` en `staging` con 100k intentos (`RNF-007`) | Lecturas de progreso/ruta < 100 ms p95. |
| Integridad | FKs `ON DELETE RESTRICT` salvo hijos sin padre (`12` §2.1) + `CHECK`/`UNIQUE` | Sin huérfanos (`RNF-036`); validación en BD y en app (`05` RF-ADM-006). |

### 6.2 Esquema de despliegue por entorno

| Entorno | Cómo se despliega | Origen de datos |
|---|---|---|
| `dev` | `docker compose up db` con `postgres:15-alpine`; volumen `pgdata_dev`; migraciones al arrancar (`npm run db:migrate`). | `seed:dev` con 1 lenguaje (Python), 12 módulos, preguntas de ejemplo y usuario admin `admin@local.test / Admin!2026`. |
| `staging` | Servicio gestionado (ej. RDS/Neon/Supabase) o contenedor con volumen persistente; migraciones como job `migrate` previo al rolling. | Snapshot anonimizado de `prod` semanal (PII reemplazada) o dataset sintético a escala para pruebas de volumen. |
| `prod` | Servicio gestionado con **standby** y **PITR** si el proveedor lo ofrece; disco cifrado en reposo; `max_connections` calibrado. | Datos reales; sin seeds; solo migraciones. |

### 6.3 Migraciones y versionado

```bash
# Estructura
migrations/
  V20260829_001__users.sql
  V20260829_002__languages_modules.sql
  V20260829_003__questions_versioned.sql
  V20260829_004__attempts_idempotency.sql
  V20260830_001__certificates_cq_seq.sql

# Comandos (ejemplo con Flyway/Prisma)
npm run db:migrate        # aplica pendientes
npm run db:migrate:undo   # solo en dev; en prod se usa down-migration versionada
npm run db:seed:dev       # solo en dev
```

**Reglas:**

- Cada `Attempt`/`AttemptAnswer`/`XPTransaction` congela `content_version` y `threshold_applied` (`06` RNF-035). Editar una pregunta = `INSERT (id, version+1)`, nunca `UPDATE` destructivo (`12` §6.8).
- `Idempotency-Key` único por `(user_id, idempotency_key)` con TTL 24 h (`12` §6.12).
- Backup antes de cada migración en `prod` (ver §11.2).
- Validación pre-migración: `SELECT` de `EXPLAIN` y `CHECK` de FKs huérfanas; si falla, el job `migrate` aborta y el deploy no avanza.

---

## 7. Backend

### 7.1 Artefacto

- **Imagen Docker multi-stage** (ejemplo Node.js; equivalente para FastAPI):

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build   # tsc / nest build → dist/

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production TZ=America/Bogota
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
USER app
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/api/v1/health || exit 1
CMD ["node", "dist/main.js"]
```

- Tag: `registry.example.com/duolingo-api:<git-sha>` y `:<env>-<date>` (ej. `prod-20260829`). El SHA es el identificador canónico promovido de `staging` a `prod`.

### 7.2 Configuración y despliegue

| Entorno | Cómo corre | Escalado | Health checks |
|---|---|---|---|
| `dev` | `docker compose up api` con `watch` y `env_file: .env.dev` | 1 réplica | `GET /api/v1/health` (liveness) + `GET /api/v1/ready` (migraciones aplicadas + Redis + S3 accesible) |
| `staging` | `docker compose up -d --no-deps api` tras `migrate`; 2 réplicas tras Caddy/Nginx | 2 réplicas | Igual; rolling espera `healthy` antes de detener la anterior |
| `prod` | Igual que `staging` con 2–3 réplicas; `restart: unless-stopped`; deploy manual con aprobación | 2–3 réplicas; HPA Post-MVP | Igual; ventana de 5 min post-deploy con `0` 5xx (`06` RNF-015) |

**Endpoints operativos del backend:**

| Endpoint | Auth | Propósito |
|---|---|---|
| `GET /api/v1/health` | No | Liveness: proceso arriba. |
| `GET /api/v1/ready` | No | Readiness: BD + Redis + S3 + migraciones al día. Usado por proxy para routing. |
| `GET /api/v1/version` | No | `{ git_sha, content_version, thresholds, deployed_at: "2026-08-29T15:04:05-05:00" }` para trazabilidad. |

**Reglas transversales** (`13` §6.4): `request_id` (UUID) en cada request/response, `Idempotency-Key` obligatorio en `POST /intentos`/`/quizzes/*/enviar`/`/examenes/*/enviar`, `Cache-Control` + `ETag` en `GET /lecciones` y `GET /languages` por `content_version`.

---

## 8. Frontend

### 8.1 Artefacto

- **Build estático:** `npm run build` → `dist/` (HTML/CSS/JS con hash por chunk). `Vite` con `code-splitting` por ruta (`11` §3.2) para `RNF-011` (carga inicial < 1,5 s en 4G, transición lección→siguiente < 500 ms p95 cacheado).
- **Imagen opcional para `staging`/`prod`:** `nginx:alpine` o `caddy:alpine` sirviendo `dist/` con `try_files` para SPA + `Cache-Control` por tipo de asset. Alternativa: servir desde Object Storage + CDN (ver §9) sin contenedor de frontend.

### 8.2 Despliegue por entorno

| Entorno | Cómo se sirve | Variables inyectadas | Cache |
|---|---|---|---|
| `dev` | `npm run dev` (Vite) en `http://localhost:5173` con proxy a `API_BASE_URL` | `.env.dev` con `VITE_API_BASE_URL=http://localhost:3000/api/v1` | Sin cache |
| `staging` | Build `dist/` desplegado a `staging` (Nginx/Caddy o bucket `staging-web` + CDN) | `VITE_API_BASE_URL=https://staging-api.duolingo-programacion.com/api/v1`, `VITE_ENV=staging` | `index.html: no-cache`; chunks `immutable` 1 año |
| `prod` | Igual que `staging` en bucket `prod-web` o imagen `web` | `VITE_API_BASE_URL=https://api.duolingo-programacion.com/api/v1`, `VITE_ENV=production` | Igual; invalidación de `index.html` en cada deploy |

**Reglas:**

- Ningún secreto en el bundle del frontend; el token vive en memoria/`httpOnly` cookie según `13` §3.1.
- **Grep en CI falla si hay literales de contenido hardcodeados** fuera de `23` (`06` RNF-031, `11` §2.2).
- Lighthouse CI en `staging` verifica `RNF-004`/`RNF-010`/`RNF-011`/`RNF-024`–`RNF-027` (performance ≥ 90, accessibility ≥ 95).

---

## 9. Archivos estáticos y Object Storage

### 9.1 Qué se almacena

| Tipo | Origen | Destino | RF/RNF |
|---|---|---|---|
| PDFs de certificados (plantilla versionada, QR) | `Certification Engine` | `s3://{S3_BUCKET}/certificates/{CQ-{LANG}-{SEQ}}.pdf` | `05` RF-PDF-001/002/003/004 |
| Avatares | `PATCH /users/me` | `s3://{S3_BUCKET}/avatars/{user_id}/{uuid}.webp` | `05` RF-PROF-002 |
| Assets de lecciones (imágenes, opcional) | Contenido versionado (`23`) | `s3://{S3_BUCKET}/content/{language}/{module}/{asset}` o CDN | `06` RNF-004 |
| Frontend `dist/` (si se usa bucket para web) | Pipeline | `s3://{S3_BUCKET_WEB}/` + CDN | `06` RNF-004/011 |

### 9.2 Estrategia por entorno

| Entorno | Proveedor | Configuración |
|---|---|---|
| `dev` | **MinIO** (`minio:RELEASE` + `minio/mc`) en `docker-compose.yml`; bucket `app-dev` creado al arrancar | `S3_ENDPOINT=http://minio:9000`, credenciales `minioadmin`, sin TLS |
| `staging` | Bucket `app-staging` en proveedor S3-compatible (S3/R2/GCS) | Versionado habilitado; lifecycle: `DELETE` de objetos con `deleted_at` tras 30 días; CORS para `https://staging.duolingo-programacion.com` |
| `prod` | Bucket `app-prod` en mismo proveedor con **versionado + cifrado en reposo + bloqueo de acceso público** | Lifecycle: retención de PDFs 7 años (certificados); avatares con `Cache-Control: public, max-age=31536000, immutable`; replicación opcional a segunda región Post-MVP |

**Adapter S3-compatible** (`11` §5.2, `12` §2.3):

```ts
interface StorageAdapter {
  put(key: string, body: Buffer, contentType: string): Promise<void>
  get(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  presignedGet(key: string, ttl: number): Promise<string> // para descarga autenticada de PDF
}
```

- En `dev` la implementación apunta a MinIO; en `staging`/`prod` al SDK del proveedor sin cambiar código de negocio (`05` RF-PDF-004).
- PDFs se sirven vía **URL firmada** con TTL 5 min y `Content-Disposition: attachment; filename="CQ-PY-000001.pdf"`; solo el titular autenticado (`13` §7.11) puede obtenerla (`05` RF-PDF-002).

### 9.3 CDN (Post-MVP opcional)

- `RNF-004` es recomendación en MVP: basta con `Cache-Control` + `ETag` + compresión `gzip/br`.
- Si se añade CDN, se justifica con métrica de `staging`: TTFB p95 > 300 ms o descarga de PDF > 3 s en 3G. El CDN cachea `avatars` y `content/*` con `immutable`; `index.html` nunca se cachea.

---

## 10. Generación de certificados

### 10.1 Flujo

```
Progress Engine: ¿todos los exámenes del lenguaje aprobados? (RNF-034, 04 §7)
  → Auth: ¿email verificado? (05 RF-AUTH-005)
  → Certification Engine: UPDATE certificate_sequences SET last_seq = last_seq+1 ... RETURNING
  → code = CQ-{LANG}-{SEQ} (ej. CQ-PY-000001) con LPAD(6)
  → QR payload = https://{WEB_BASE_URL}/verificar/{code}
  → Render PDF con plantilla versionada (pdf_version) + QR + metadata { nombre, documento, lenguaje, fecha, plataforma, estado }
  → StorageAdapter.put(certificates/{code}.pdf)  (S3-compatible)
  → INSERT certificates (status='valid', pdf_object_key, pdf_version, qr_payload, language_content_version)
  → Verificación interna: GET /api/v1/certificates/{code} (público sin PII) y GET /api/v1/certificates/{code}/pdf (solo titular)
```

### 10.2 Consideraciones de despliegue

| Aspecto | MVP | Post-MVP |
|---|---|---|
| Render | Síncrono en el request de emisión (< 2 s) con librería de PDF en proceso (ej. `pdf-lib` / `puppeteer` ligero). Si tarda > 2 s, se encola y se notifica "generando". | Cola async (BullMQ / SQS) con worker dedicado; `RNF-014` garantiza que el fallo de PDF no bloquea lecciones. |
| Plantilla | Versionada en `content/certificates/template_v{N}.html` + `pdf_version` en BD (`12` §6.17). Cambio de plantilla = nueva versión sin re-escribir PDFs ya emitidos (`06` RNF-035). | Igual; preview de plantilla en `staging` antes de publicar. |
| QR | Generado en servidor con payload de verificación interna (`05` RF-CERT-004); Post-MVP verificación pública (`04` §3). | Igual. |
| Re-emisión | Cambio significativo de `language.content_version` → certificados previos `obsolete` (`05` RF-CERT-005); no coexisten dos `valid` por `(user_id, language_id)` (`12` §6.17). | Igual. |

---

## 11. Logs, métricas y observabilidad

### 11.1 Logs

| Requisito | Especificación | Origen |
|---|---|---|
| Formato | **JSON estructurado** por línea: `{ timestamp: "2026-08-29T15:04:05-05:00", level, request_id, user_id_hash, endpoint, method, status, latency_ms, content_version, git_sha, error_code, message }` | `06` RNF-018/045, `11` §22 |
| Correlación | `X-Request-Id` (UUID) generado en proxy si no viene del cliente; se propaga a todos los motores y se devuelve en response y en errores (`06` RNF-041). | `06` RNF-045 |
| PII | **Nunca** en logs: sin `email`, `password`, `document_number` ni tokens. `user_id` se hashea o anonimiza. | `06` RNF-037 |
| Niveles por env | `dev: debug` (pretty), `staging/prod: info` (json); `warn`/`error` siempre. | `06` RNF-018 |
| Transporte | `stdout` del contenedor → driver de logs del host → agregador (Loki + Grafana / ELK) con retención ≥ 30 días en `prod`. | `11` §22 |
| Verificación | Test que provoca 5xx y verifica que el log contiene `request_id` y no expone stack al cliente (`06` §5.1). | `06` RNF-018 |

### 11.2 Métricas y trazas

| Pilar | Qué se mide | Dónde | RNF |
|---|---|---|---|
| **Métricas técnicas** | p50/p95/p99 por endpoint, tasa de error, throughput, CPU/mem, conexiones de BD, cola de email | APM (Sentry / Otel + Prometheus) + Grafana; dashboard por versión | `06` RNF-001/010/012 |
| **Métricas de negocio** | Intentos, % aprobación quiz/examen, racha media, DAU/WAU, certificados emitidos, `overlap_high` de `15` | `26_ANALYTICS.md` + tabla de métricas en Grafana (seudonimizadas, `06` RNF-040) | `03` §7, `06` RNF-018 |
| **Trazas** | Por endpoint crítico (`POST /intentos`, `/examenes/*/enviar`, `/certificates`) con OpenTelemetry opcional | Tempo/Jaeger | `06` RNF-018 |
| **Uptime** | Sintético cada 1 min a `/health` y a flujo `login → lección → respuesta` | UptimeRobot / Checkly en `prod` + `staging` | `06` RNF-013 |
| **Auditoría** | `audit_log` en BD: `auth` y `admin` con `quién/qué/cuándo/versión anterior/nueva` | Tabla `audit_log` (`12` §5) | `05` RF-AUTH-008, RF-ADM-008 |

---

## 12. Backups

### 12.1 Política

| Recurso | Frecuencia | Retención | RPO | RTO | Cifrado |
|---|---|---|---|---|---|
| **BD (`prod`)** | Diario automatizado + WAL/PITR si el proveedor lo ofrece | ≥ 7 días (recomendado 30 días) | ≤ 24 h | ≤ 4 h | En reposo y en tránsito |
| **Object Storage (`prod`)** | Versionado del bucket + replicación opcional | PDFs 7 años; avatares 30 días tras `deleted_at` | ≤ 24 h | ≤ 4 h | SSE-S3 / SSE-KMS |
| **KV (Redis)** | No crítico para `RNF-014`; snapshot diario opcional | 7 días | N/A (reconstruible) | < 1 h | En tránsito |
| **Config / secretos** | Versionados en gestor de secretos con historial | Indefinida | — | — | Vault/Doppler |

### 12.2 Procedimiento de backup

```bash
# BD — ejemplo con pg_dump (si no se usa snapshot gestionado)
pg_dump --format=custom --compress=9 "$DATABASE_URL" > "backup-$(date +%Y%m%d).dump"
# + copia a bucket de backups con lifecycle
aws s3 cp backup-*.dump s3://backups-prod/db/ --storage-class STANDARD_IA

# Object Storage — versionado ya es backup; además copia cruzada semanal
aws s3 sync s3://app-prod s3://backups-prod/objects/ --storage-class STANDARD_IA
```

### 12.3 Ensayo de restauración (obligatorio `06` RNF-043)

| Paso | Acción | Frecuencia | Evidencia |
|---|---|---|---|
| 1 | Restaurar backup de `prod` en `staging` en instancia aislada | Mensual | Reporte con `fecha America/Bogota`, duración y checksum |
| 2 | Aplicar migraciones pendientes y verificar `GET /ready` | Cada ensayo | Log de `migrate` |
| 3 | Ejecutar suite de invariantes (`RNF-034`: `lenguaje completado ↔ todos los exámenes aprobados`) | Cada ensayo | Reporte de `20` |
| 4 | Medir RTO real y comparar con ≤ 4 h | Cada ensayo | Métrica en `21` |
| 5 | Registrar en `CHANGELOG.md` la fecha del último ensayo exitoso | Cada ensayo | Entrada `Fixed` o `Docs` |

> El backup sin ensayo es defecto bloqueante (`06` RNF-043). El reporte se guarda en `docs/ops/restore-YYYY-MM-DD.md` y se referencia en `CHANGELOG.md`.

---

## 13. Actualizaciones (releases)

### 13.1 Pipeline CI/CD

```mermaid
flowchart LR
    subgraph Dev["Desarrollo"]
        PR["PR → CI"]
        CI["lint + test + coverage ≥70%\n+ secret scan + SAST"]
        Build["build image :<sha>"]
        Scan["scan image (Trivy)"]
    end
    PR --> CI --> Build --> Scan --> Staging
    subgraph Staging["staging (auto)"]
        MigStag["migrate (job)"]
        DeployStag["deploy rolling :<sha>"]
        TestsStag["E2E + carga p95 + Lighthouse\n+ axe + DAST"]
    end
    Scan --> MigStag --> DeployStag --> TestsStag
    TestsStag -->|verde| Promote["promote :<sha> a prod\n(manual, aprobado)"]
    Promote --> Prod
    subgraph Prod["prod (manual)"]
        BackupProd["backup BD + snapshot"]
        MigProd["migrate (job)"]
        DeployProd["deploy rolling :<sha>"]
        VerifyProd["verify 5m sin 5xx\n+ APM p95"]
    end
    BackupProd --> MigProd --> DeployProd --> VerifyProd
    VerifyProd -->|rojo| Rollback["rollback automático"]
```

**Workflow (GitHub Actions, ejemplo):**

```yaml
name: ci
on: { pull_request: {}, push: { branches: [main] } }
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run lint && npm run test -- --coverage
      - run: npm run openapi:lint   # RNF-032
      - uses: gitleaks/gitleaks-action@v2 # secret scan RNF-008
      - run: docker build -t api:${{ github.sha }} .
      - run: trivy image api:${{ github.sha }}
  deploy-staging:
    if: github.ref == 'refs/heads/main'
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - run: ./scripts/migrate.sh staging
      - run: ./scripts/deploy.sh staging ${{ github.sha }}
      - run: npm run test:e2e -- --env=staging
      - run: npm run test:load -- --env=staging # RNF-001/002
```

### 13.2 Estrategia de despliegue

| Entorno | Estrategia | Justificación |
|---|---|---|
| `dev` | `compose up --build` directo | Iteración local sin ceremonia. |
| `staging` | **Rolling** (1 réplica a la vez) con `healthcheck` y `depends_on: condition: service_healthy` | Valida `RNF-015` sin downtime; si `ready` falla, el contenedor no entra al pool. |
| `prod` | **Rolling** con ventana comunicada + aprobación manual; **blue-green Post-MVP** (`06` RNF-015 recomendación) | Rolling basta para 2–3 réplicas y RNF-015 básico; blue-green se adopta si `prod` muestra 5xx durante rolling o si se necesita `0` downtime garantizado. |

**Comandos de deploy (Compose):**

```bash
# staging / prod
./scripts/migrate.sh $ENV          # job que aplica V{*} pendientes; aborta deploy si falla
docker compose -f docker-compose.$ENV.yml pull
docker compose -f docker-compose.$ENV.yml up -d --no-deps --build api
docker compose -f docker-compose.$ENV.yml exec caddy caddy reload  # si aplica
./scripts/verify.sh $ENV           # 5 min sin 5xx + p95 < umbrales
```

### 13.3 Versionado y compatibilidad

- **SemVer del contrato** `13` §12: `MAJOR` = breaking (nueva `/api/v2`), `MINOR` = aditivo, `PATCH` = clarificación.
- **Migraciones** nunca rompen compatibilidad hacia adelante en la misma versión: primero deploy de código que tolera ambas versiones, luego migración, luego deploy que exige la nueva.
- **Contenido y umbrales** (`05` RF-ADM-003/004, `06` RNF-017) se publican sin deploy y sin pasar por este pipeline; su versionado es independiente (`content_version`).

---

## 14. Rollback

### 14.1 Cuándo hacer rollback

| Señal | Fuente | Acción |
|---|---|---|
| Tasa 5xx > 1% en 5 min post-deploy | APM / logs | Rollback automático |
| p95 de `POST /intentos` > 500 ms sostenido 5 min | APM | Rollback o escalado |
| `ready` falla en > 50% de réplicas | Proxy health check | Rollback inmediato |
| Invariante `RNF-034` violada (certificable sin exámenes) | Test de invariantes en `staging`/`prod` | Rollback + revisión de migración |
| Reporte de QA bloqueante en `staging` | QA | No promover a `prod` |

### 14.2 Procedimiento

```bash
# 1. Identificar SHA anterior (el último verde en staging/prod)
PREV_SHA=$(cat .deployed/$ENV.sha.prev)   # ej. a1b2c3d
CURR_SHA=$(cat .deployed/$ENV.sha)        # ej. d4e5f6g

# 2. Rollback de código (imagen)
docker compose -f docker-compose.$ENV.yml pull  # asegura PREV_SHA en registry
docker tag registry.example.com/duolingo-api:$PREV_SHA registry.example.com/duolingo-api:rollback
docker compose -f docker-compose.$ENV.yml up -d --no-deps api  # rolling hacia PREV_SHA

# 3. Rollback de BD (solo si la migración es reversible)
# Opción A: down-migration versionada (preferida)
npm run db:migrate:down -- --to=$PREV_SHA  # aplica V{*}__down.sql si existe
# Opción B: restore desde backup pre-migración (si no hay down)
pg_restore --clean --if-exists -d "$DATABASE_URL" backup-pre-$CURR_SHA.dump
# Opción C: si la migración es aditiva y compatible, no se revierte BD (solo código)

# 4. Verificación
./scripts/verify.sh $ENV
# 5. Registro
echo "[$(TZ=America/Bogota date +'%Y-%m-%d %H:%M')] [Fixed] Rollback $ENV $CURR_SHA → $PREV_SHA. Motivo: 5xx post-deploy. Validado en $ENV." >> CHANGELOG.md
```

**Reglas:**

- Toda migración que no sea aditiva debe incluir `down` o documentar que requiere restore; de lo contrario se considera defecto de diseño (`12` §2.3).
- El `Object Storage` con versionado no necesita rollback de código: los PDFs ya emitidos son inmutables; solo se revierte la plantilla si la nueva está rota.
- El frontend se revierte redeplegando `dist/` del `PREV_SHA` y invalidando `index.html` en CDN (si existe).

### 14.3 Matriz de rollback por componente

| Componente | Rollback de código | Rollback de datos | Tiempo objetivo |
|---|---|---|---|
| Backend (imagen) | `up -d` a `PREV_SHA` | No (si migración aditiva) | < 5 min |
| BD (migración) | Down-migration o `pg_restore` | Restore pre-migración | < 30 min (RTO ≤ 4 h) |
| Frontend (`dist`) | Redeploy `PREV_SHA` + invalidación CDN | No | < 5 min |
| Contenido (`content_version`) | `POST /admin/content/publish --version=N-1` | No (versiones conservadas) | < 5 min |
| Certificados (plantilla) | `pdf_version N-1` | No (PDFs inmutables) | < 5 min |

---

## 15. Diagrama de despliegue (Mermaid)

```mermaid
flowchart TB
    User(["Usuario\nNavegador\n360×640 / 1280×800"])
    CDN["CDN / Caddy / Nginx\nTLS (Let's Encrypt)\nCache-Control + ETag\nWAF opcional"]

    subgraph Frontend["Frontend"]
        WEB["Web SPA\nVite + dist/\nBucket S3 o Nginx"]
    end

    subgraph Edge["Edge / API"]
        GW["API Gateway\n/api/v1 · OpenAPI\nrequest_id · Idempotency-Key"]
        AuthMW["Auth Middleware\nJWT 15m + Refresh 7d\nRBAC + Rate Limit"]
    end

    subgraph App["App — Réplicas stateless"]
        API1["api-1\n:3000\nHEALTH / READY"]
        API2["api-2\n:3000\nHEALTH / READY"]
    end

    subgraph Data["Datos"]
        DB[("PostgreSQL ≥15\nRDS / gestionado\n+ Standby + PITR")]
        KV[("Redis / KV\nRate limit\nRefresh · Cache")]
        OBJ[("Object Storage\nS3-compatible\nPDFs / Avatars")]
        BuckBack[("Bucket backups\nDB dumps + sync objects")]
    end

    subgraph Ext["Externos (abstractos)"]
        Email["Email Provider\nmock / SES / Resend"]
        Ads["Ads Provider\nmock / GAM"]
        Pay["Payment Provider\nmock / Stripe"]
    end

    subgraph Obs["Observabilidad"]
        Logs["Loki / ELK\nLogs JSON + request_id"]
        Metrics["Prometheus / APM\np50/p95/p99 · Sentry/Otel"]
        Uptime["Uptime sintético\n1 min · RUM"]
    end

    User --> CDN --> WEB
    WEB --> GW --> AuthMW --> API1 & API2
    API1 & API2 --> DB & KV & OBJ
    API1 & API2 --> Email & Ads & Pay
    API1 & API2 -.-> Logs & Metrics & Uptime
    DB -.-> BuckBack
    OBJ -.-> BuckBack
    CDN -.-> WEB

    classDef user fill:#e3f2fd,stroke:#1565c0
    classDef edge fill:#fff3e0,stroke:#ef6c00
    classDef app fill:#e8f5e9,stroke:#2e7d32
    classDef data fill:#fce4ec,stroke:#ad1457
    classDef obs fill:#f3e5f5,stroke:#6a1b9a
    class User user
    class CDN,GW,AuthMW edge
    class API1,API2 app
    class DB,KV,OBJ,BuckBack data
    class Logs,Metrics,Uptime obs
```

**Variante `dev` (Compose local):**

```mermaid
flowchart LR
    DevUser["localhost:5173"] --> CaddyDev["Caddy (dev)\n:80"]
    CaddyDev --> APIdev["api:3000\n1 réplica"]
    APIdev --> DBdev[("db:5432\npostgres:15-alpine")]
    APIdev --> KVdev[("redis:6379")]
    APIdev --> MinIO[("minio:9000\nbucket app-dev")]
```

---

## 16. Infraestructura como código y secretos

| Recurso | Cómo se declara | Dónde vive |
|---|---|---|
| `docker-compose.yml` / `docker-compose.staging.yml` / `docker-compose.prod.yml` | Compose con `healthcheck`, `restart`, `networks`, `volumes` | Repo `infra/compose/` |
| `Dockerfile` (backend) + `Dockerfile.web` (frontend) | Multi-stage, `HEALTHCHECK`, `USER app` | Repo raíz |
| `Caddyfile` / `nginx.conf` | TLS, `reverse_proxy`, `header`, `handle_path /api/*` | `infra/proxy/` |
| Variables | `.env.example` versionado + valores reales en Doppler/Vault/forge | Gestor de secretos, nunca en git |
| Backups | `scripts/backup.sh` + cron del host o tarea del proveedor | `infra/scripts/` |
| CI/CD | `.github/workflows/ci.yml` + `scripts/migrate.sh`/`deploy.sh`/`verify.sh` | Repo |

**Ejemplo `docker-compose.prod.yml` (extracto):**

```yaml
services:
  api:
    image: registry.example.com/duolingo-api:${GIT_SHA}
    env_file: [.env.prod] # inyectado por gestor de secretos en runtime, no commiteado
    depends_on:
      db: { condition: service_healthy }
      redis: { condition: service_started }
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/v1/health"]
      interval: 15s
      retries: 3
    restart: unless-stopped
    deploy:
      replicas: 2
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes: ["./Caddyfile:/etc/caddy/Caddyfile", "caddy_data:/data"]
```

---

## 17. Seguridad en despliegue

| Control | Implementación | Verificación |
|---|---|---|
| TLS | Caddy/Nginx con Let's Encrypt (ACME) o cert gestionado; `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` | `curl -I https://api...` + `testssl.sh` en `staging` |
| Secretos | Gestor externo; rotación trimestral de `JWT_SECRET`; ningún secreto en imagen ni en logs | `gitleaks` en CI + `trivy --severity HIGH` |
| Validación | Zod/Joi/Pydantic en DTOs + FKs/`CHECK` en BD | Tests de inyección/IDOR/XSS en `20` (`06` RNF-009) |
| RBAC | `USER` vs `ADMIN` en `AuthMiddleware` (`13` §3.2) | Test `403 ADMIN_REQUIRED` en `/admin/*` |
| Rate limiting | Ventana deslizante en Redis por IP+usuario en `POST /auth/*` y `POST /intentos` | Test `429 RATE_LIMITED` + `Retry-After` |
| Cabeceras | `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy` en frontend | Lighthouse + `securityheaders.com` en `staging` |

---

## 18. Checklists operativos

### 18.1 Pre-deploy a `staging`

- [ ] `CHANGELOG.md` con entrada `Added/Changed/Fixed` y fecha `America/Bogota`.
- [ ] `openapi.yaml` linteado (`RNF-032`) y versionado.
- [ ] Migraciones con `up` y `down` (o justificación de no-rollback) revisadas.
- [ ] Imagen `:<sha>` construida, escaneada y pusheada.
- [ ] `.env.example` actualizado si hay nueva variable.

### 18.2 Pre-promoción a `prod`

- [ ] `staging` verde: E2E, carga (100 concurrentes p95 < 300 ms), pico (300/5 min < 1% error), Lighthouse ≥ 90/95, axe sin violaciones críticas.
- [ ] Backup de `prod` tomado y verificado (ver §12.3).
- [ ] Ventana comunicada; `Sentry` en modo release.
- [ ] Plan de rollback escrito (SHA previo + migración down).

### 18.3 Post-deploy a `prod`

- [ ] `GET /api/v1/version` coincide con SHA desplegado.
- [ ] 5 min sin 5xx + p95 dentro de umbrales (`06` RNF-001/010/012).
- [ ] Uptime sintético verde.
- [ ] `CHANGELOG.md` actualizado con `Deployed prod <sha> a las HH:mm America/Bogota`.

---

## 19. Trazabilidad

| Elemento de este doc | RF (`05`) | RNF (`06`) | OT (`03`) | Doc relacionado |
|---|---|---|---|---|
| Entornos dev/staging/prod | RF-ADM-005 | RNF-005/013/015 | OT-09 | `11` §2, `04` §5 |
| Variables de entorno | RF-AUTH-002/006/007, RF-PREM-004 | RNF-008/009 | — | `13` §3, `19` |
| BD + migraciones | RF-PROG-001, RF-EVAL-003, RF-ADM-005 | RNF-033/035/036/043 | OT-05 | `12` |
| Backend (imagen, health, rolling) | RF-EVAL-006, RF-XP-005 | RNF-001/002/005/015/018/033/042 | OT-04 | `11` §4, `13` |
| Frontend (build, cache, SPA) | RF-SEC-004, RF-LEC-001 | RNF-004/011/024–028/032 | — | `10`, `11` §3 |
| Archivos estáticos (S3, CDN) | RF-PDF-002/004, RF-PROF-002 | RNF-004 | — | `11` §5, `12` §6.17 |
| Certificados (PDF + QR) | RF-CERT-001–006, RF-PDF-001–004, RF-AUTH-005 | RNF-014/035 | OE-06 | `17` (futuro) |
| Logs (request_id, PII) | RF-AUTH-008, RF-ADM-008 | RNF-018/037/041/045 | — | `11` §22, `19` |
| Backups (RPO/RTO) | RF-PROG-004, RF-PDF-002 | RNF-043 | — | `12` |
| Actualizaciones (pipeline, rolling) | RF-ADM-003/004 | RNF-015/017/032 | OT-09 | `11` §20, `13` §12 |
| Rollback (imagen + migración) | RF-EVAL-003/005 | RNF-015/033/043 | — | `12`, `11` §20 |

---

## 20. Referencias cruzadas

| Documento | Relación |
|---|---|
| `01_PROJECT_OVERVIEW.md` §24–§31 | Motores y principio de contenido desacoplado que el despliegue debe preservar. |
| `03_OBJECTIVES.md` OT-09 | Objetivo de despliegue por entornos con rollback que este doc implementa. |
| `04_SCOPE.md` §2.8/§5/§9 | Transversales MVP y dependencias externas (email, S3, ads, pagos) desplegables. |
| `05_FUNCTIONAL_REQUIREMENTS.md` | 128 RF origen de cada artefacto desplegable (ver §19). |
| `06_NON_FUNCTIONAL_REQUIREMENTS.md` | 45 RNF con métrica y verificación que condicionan cada decisión de §4–§14. |
| `11_SYSTEM_ARCHITECTURE.md` | Topología modular, estilo monolito con fronteras y procedimiento de agregar lenguaje sin tocar el núcleo (§18) que el pipeline respeta. |
| `12_DATABASE_DESIGN.md` | Entidades, índices, migraciones y agregado `progress` que la BD desplegada debe honrar. |
| `13_API_SPECIFICATION.md` | Contrato `/api/v1` versionado, `Idempotency-Key` y `request_id` que el proxy y el backend hacen cumplir. |
| `19_SECURITY.md` (futuro) | Detalle de hash, JWT, OWASP y PII que §17 resume. |
| `20_TESTING.md` (futuro) | Pirámide de pruebas que el pipeline ejecuta antes de promover. |
| `26_ANALYTICS.md` (futuro) | Métricas de negocio que §11.2 expone sin exponer PII a terceros. |

---

## 21. Decisiones abiertas (requieren ADR si se resuelven)

| # | Decisión | Opciones | Impacto si cambia |
|---|---|---|---|
| D-01 | ¿Orquestación en `prod` con Compose o K8s? | A: Compose en VM (actual MVP). B: K8s (k3s/EKS) con HPA y `blue-green`. | B habilita HPA y `blue-green` nativo pero exige gestión de cluster y `09-decisions/` completo. |
| D-02 | ¿CDN para frontend y assets? | A: Sin CDN en MVP (actual). B: Cloudflare/CloudFront en MVP. | B mejora TTFB global pero añade costo y configuración de invalidación. |
| D-03 | ¿Proveedor S3 y BD gestionada? | A: AWS (S3+RDS) · B: Cloudflare R2+Neon · C: Hetzner+MinIO | Cambia `S3_ENDPOINT` y `DATABASE_URL` pero no el código gracias al adapter S3-compatible. |
| D-04 | ¿Worker async para PDFs/emails? | A: Síncrono en MVP (actual, con degradado). B: Cola BullMQ/SQS desde MVP. | B aísla `RNF-014` pero añade infra de cola. |

---

*Fin de `21_DEPLOYMENT.md` — cualquier cambio en entornos, variables, BD, backend, frontend, estáticos, certificados, logs, backups, actualizaciones o rollback requiere ADR si es arquitectónico, actualización de este documento y entrada en `CHANGELOG.md` con fecha `America/Bogota`.*
