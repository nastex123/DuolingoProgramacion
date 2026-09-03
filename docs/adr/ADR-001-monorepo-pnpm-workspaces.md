# ADR-001: Adopción de Monorepo con PNPM Workspaces

> **Estado:** Aprobado  
> **Fecha:** 2026-09-02  
> **Autores:** Equipo de Arquitectura Koda  
> **Trazabilidad:** `11_SYSTEM_ARCHITECTURE.md`, `RNF-005`, `RNF-032`  

---

## 1. Contexto y Problema
El sistema Koda requiere sincronización estricta de contratos TypeScript entre el cliente web (Next.js 15), la API de backend (NestJS modular) y las herramientas de validación de contenido pedagógico. Mantener repositorios separados introduce riesgo de desincronización de DTOs, duplicación de interfaces y fricción en la integración continua.

## 2. Alternativas Evapythondas
1. **Multi-repo (Repositorios Git separados):**
   - *Ventajas:* Aislamiento estricto de despliegues.
   - *Desventajas:* Necesidad de publicar `@koda/types` en un registro privado (npm o GitHub Packages), demora en propagar cambios y riesgo constante de tipos incompatibles.
2. **Monorepo con Turborepo + PNPM Workspaces:**
   - *Ventajas:* Vinculación simbiótica local (`workspace:*`), cacheo determinista de builds, deduplicación de dependencias por hardlinks en disco (ahorro masivo de espacio) y compilación unificada.
   - *Desventajas:* Curva de aprendizaje inicial en scripts de pipeline.
3. **Monolito único en una sola aplicación:**
   - *Desventajas:* Mezcla preocupaciones de backend y frontend, impidiendo escalar o aislar la API de certificación y ejecución.

## 3. Decisión Adoptada
Se adopta **PNPM Workspaces** como gestor de monorepo oficial:
- `apps/web`: Aplicación web en Next.js 15 (App Router, React 19, Tailwind CSS).
- `apps/api`: Backend monolito modular en NestJS (Express, OpenAPI 3.0.3, Swagger).
- `packages/types`: Paquete central de contratos y modelos compartidos (`@koda/types`).

## 4. Consecuencias
- **Positivas:**
  - Tipado de extremo a extremo sin fricción; un cambio en un DTO se refleja instantáneamente en el frontend y backend.
  - Comandos unificados (`pnpm dev`, `pnpm build`, `pnpm lint`).
  - Eficiencia en CI/CD con instalaciones de dependencias ultra rápidas.
- **Trade-offs:**
  - Requiere PNPM instalado en entornos locales y contenedores Docker (`packageManager: pnpm@12.0.0`).
