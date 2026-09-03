# Changelog: 03-09-2026

- [Thursday]-[03/09/2026]-[11:26] : Added "dev": "nest start --watch" to apps/api/package.json and updated root package.json dev script so that "pnpm dev" compiles @koda/types and launches both backend (api) and frontend (web) concurrently.
- [Thursday]-[03/09/2026]-[11:28] : Created AppController with root GET /api/v1 healthcheck and metadata endpoint returning status, docs link and active endpoints.
- [Thursday]-[03/09/2026]-[11:41] : Desincorporación y eliminación total de Lua en todo el proyecto (content/languages/lua, test_m01.html, test_m02.html, docs/28_LUA_CURRICULUM.md, ADR-005). Creación de content/languages/python/ con 12 módulos canónicos, módulo 01 de Fundamentos y nuevo ADR-005 para adopción de Python 3.12 como lenguaje oficial del MVP. Adaptación completa de apps/api, apps/web y documentación.

