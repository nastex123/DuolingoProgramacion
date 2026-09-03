# ADR-005: Priorización de Lua como Lenguaje Piloto del MVP

> **Estado:** Aprobado  
> **Fecha:** 2026-09-02  
> **Autores:** Equipo Pedagógico y Técnico Koda  
> **Trazabilidad:** `01_PROJECT_OVERVIEW.md`, `04_SCOPE.md`, `28_LUA_CURRICULUM.md`, `24_CONTENT_AUTHORING_GUIDE.md`  

---

## 1. Contexto y Problema
Originalmente, las especificaciones conceptuales iniciales (Docs 01–05, 22) proponían a Python como el único lenguaje del MVP. Sin embargo, para validar empíricamente la pedagogía de **micro-lecciones atómicas (40-70 palabras, sin spoilers, 1 concepto = 1 práctica)** en personas sin ninguna experiencia previa, se requería un lenguaje con características didácticas únicas:
1. Sintaxis ultra minimalista y transparente (solo 21 palabras reservadas vs 35+ en Python o 50+ en Java).
2. Huella en memoria diminuta (<300 KB) que facilita su ejecución WebAssembly cliente sin tiempos de carga perceptibles.
3. Enorme atractivo lúdico para principiantes gracias a su uso extendido en videojuegos (Roblox Studio, World of Warcraft, Defold, LÖVE2D).

## 2. Alternativas Evaluadas
1. **Lanzar exclusivamente con Python como primer lenguaje (opción descartada):**
   - *Desventajas:* El peso del runtime WebAssembly de Python (Pyodide) supera los 6–10 MB en primera descarga en red móvil, provocando latencia de arranque. La indentación semántica suele generar tropiezos sintácticos invisibles para principiantes absolutos.
2. **Priorizar Lua como curso piloto de validación pedagógica:**
   - *Ventajas:* Ejecución instantánea con `wasmoon` (<200 KB), sintaxis explícita con bloques delimitados por `end`, y enorme interés de aprendizaje por el ecosistema de creación de videojuegos. Permite validar los módulos M01 y M02 (190 micro-lecciones completadas) antes de escalar la ruta de 12 módulos de Python.

## 3. Decisión Adoptada
Se adopta **Lua como el lenguaje pionero del MVP para validar el sistema pedagógico**, estableciendo:
- **Módulo 01:** Fundamentos de Lua (`LUA_MOD_01`) — 9 secciones × 10 lecciones = 90 lecciones atómicas.
- **Módulo 02:** Variables y Tipos de Datos (`LUA_MOD_02`) — 10 secciones × 10 lecciones = 100 lecciones atómicas + 20 preguntas de examen.
- **Python** se mantiene como la ruta troncal de expansión curricular de 12 módulos, validando la promesa arquitectónica de **contenido desacoplado del motor** (`RNF-006`).

## 4. Consecuencias
- **Positivas:**
  - Validación inmediata de la pedagogía en usuarios reales con 190 lecciones probadas en sandboxes interactivos ([`test_m01.html`](../../test_m01.html) y [`test_m02.html`](../../test_m02.html)).
  - Demostración tangible de la capacidad multi-lenguaje de Koda desde su fase inicial.
- **Trade-offs:**
  - Requiere alinear la narrativa de los documentos 01, 04, 05 y 22 para reflejar la estrategia de co-existencia (Lua piloto + Python troncal).
