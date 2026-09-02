# ⚙️ Koda Backend API (`apps/api`) 🦊

> Servicio backend monolito modular construido con **NestJS**, **TypeScript**, **OpenAPI 3.0.3 (Swagger)** y diseñado para desacoplar los motores pedagógico, de certificación, gamificación y analítica.

---

## 🏗️ Arquitectura Modular

La API se organiza en módulos de dominio cohesivos dentro de `src/modules/`:

- **`languages/`:** Catálogo y consulta de lenguajes de programación y sus hojas de ruta.
- **`learning/`:** Entrega de micro-lecciones, verificación de respuestas y máquina de estados pedagógica.
- **`notebook/`:** Gestión del cuaderno de errores persistente (+5 XP al remediar) y cola de repaso activa.
- **`certification/`:** Generación backend de certificados con QR, streaming y caché con Google Drive API v3.

---

## 🚀 Comandos de Ejecución

Desde la raíz del monorepo o dentro de `apps/api`:

```bash
# Desarrollo con recarga en caliente (Watch Mode)
pnpm --filter api start:dev

# Compilación de producción
pnpm --filter api build

# Ejecución en producción
pnpm --filter api start:prod

# Linters y formato
pnpm --filter api lint

# Pruebas unitarias
pnpm --filter api test
```

---

## 📚 Documentación Interactiva de la API (Swagger)

Cuando el servidor está en ejecución (puerto por defecto: `4000`):
- **Base URL:** `http://localhost:4000/api/v1`
- **Swagger UI en vivo:** `http://localhost:4000/api/docs`

---

## 🔑 Variables de Entorno

Copia el archivo de ejemplo para configurar tus credenciales locales:

```bash
cp .env.example .env
```

Consulta [`../../docs/21_DEPLOYMENT.md`](../../docs/21_DEPLOYMENT.md) para más detalles sobre cada variable requerida.
