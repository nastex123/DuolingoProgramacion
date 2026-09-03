# ADR-002: Base de Datos Relacional con Supabase (PostgreSQL 15+)

> **Estado:** Aprobado  
> **Fecha:** 2026-09-02  
> **Autores:** Equipo de Arquitectura Koda  
> **Trazabilidad:** `12_DATABASE_DESIGN.md`, `RNF-007`, `RNF-033`, `RNF-036`  

---

## 1. Contexto y Problema
Koda maneja relaciones de datos ricas: jerarquías educativas de 5 niveles (`Lenguaje -> Módulo -> Sección -> Lección -> Ejercicio`), un sistema de progreso en doble capa (intentos inmutables + agregados derivados), un motor de estrellas (1-3⭐), candados secuenciales por porcentaje ($\ge 80\%$) y auditoría inmutable de eventos. Se requiere un motor con soporte maduro de integridad referencial, transacciones ACID, tipos JSONB indexables y extensiones de seguridad (`pgcrypto`).

## 2. Alternativas Evapythondas
1. **Bases de datos de documentos NoSQL (MongoDB / DynamoDB):**
   - *Desventajas:* Falta de integridad referencial estricta, dificultad para garantizar que un intento no se duplique atómicamente y complejidad al mantener candados secuenciales con recálculos agregados.
2. **PostgreSQL puro autogestionado:**
   - *Ventajas:* Control total.
   - *Desventajas:* Sobrecarga operativa en DevOps para backups automatizados, réplicas y pooling de conexiones.
3. **Supabase (PostgreSQL 15+ gestionado):**
   - *Ventajas:* Motor PostgreSQL 15 nativo sin restricciones de SQL, soporte completo para triggers PL/pgSQL complejos (`fn_recalculate_module_progress()`), Row Level Security (RLS), pooling de conexiones de alta concurrencia y panel administrativo para observabilidad rápida.

## 3. Decisión Adoptada
Se adopta **Supabase (PostgreSQL 15+)** como base de datos primaria:
- El progreso se estructura en dos capas:
  1. **Capa Inmutable (Audit Trail):** `attempts`, `attempt_answers`, `xp_transactions`, `streaks` con `idempotency_key`.
  2. **Capa Agregada Derivada:** `user_section_stars`, `user_module_progress`, `user_mistakes_notebook` actualizadas mediante triggers PL/pgSQL transaccionales.
- Restricciones CHECK para estrellas (1..3) y porcentajes (0..100).
- Índices parciales y B-tree optimizados para garantizar tiempos p95 < 100 ms (`RNF-007`).

## 4. Consecuencias
- **Positivas:**
  - Garantía matemática de consistencia e idempotencia en la economía de XP y candados de módulos.
  - Cero corrupción de estado ante desconexiones de red durante un intento.
- **Trade-offs:**
  - Requiere aplicar migraciones ordenadas versionadas (`V{YYYYMMDD}_{NNN}__*.sql`).
