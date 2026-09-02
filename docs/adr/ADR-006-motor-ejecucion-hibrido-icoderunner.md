# ADR-006: Motor de Ejecución de Código Híbrido (`ICodeRunner`)

> **Estado:** Aprobado  
> **Fecha:** 2026-09-02  
> **Autores:** Equipo de Arquitectura Koda  
> **Trazabilidad:** `11_SYSTEM_ARCHITECTURE.md`, `19_SECURITY.md`, `RNF-001`, `RNF-010`  

---

## 1. Contexto y Problema
Koda enseña programación práctica interactiva. La verificación de código de los estudiantes puede demandar miles de ejecuciones por minuto con alta concurrencia. Ejecutar cada script en servidores backend Docker introduce altos costos de infraestructura cloud, cuellos de botella de latencia (>1 s) y riesgos de seguridad (escape de sandbox, denegación de servicio por bucles infinitos).

## 2. Alternativas Evaluadas
1. **Ejecución 100% en Servidor (Docker Sandbox / Judge0 / Piston):**
   - *Desventajas:* Costo de servidores elevado en fases tempranas, latencia de red en cada comprobación de código, riesgo de sobrecarga de CPU por scripts maliciosos del usuario.
2. **Ejecución 100% en Cliente (Wasm / Web Workers):**
   - *Desventajas:* Lenguajes compilados (Rust, C/C++, C#, Go) no pueden compilarse ni ejecutarse eficientemente en el navegador sin descargar herramientas de gigabytes.
3. **Arquitectura Híbrida (`ICodeRunner`):**
   - *Ventajas:* Lo mejor de ambos mundos:
     - **Modo Cliente (Wasm / Web Workers):** Para lenguajes interpretados/scripting (Lua con `wasmoon`, Python con `Pyodide`, JavaScript en Web Worker). Latencia < 50 ms, cero costo de servidor.
     - **Modo Servidor (Piston / Docker Sandbox):** Para lenguajes compilados o tareas pesadas, aislado y con rate limiting estricto.

## 3. Decisión Adoptada
Se adopta el **Motor de Ejecución Híbrido** gobernado por el contrato TypeScript común:

```typescript
export interface ICodeRunner {
  execute(sourceCode: string, stdin?: string, timeoutMs?: number): Promise<ExecutionResult>;
}
```

- Para **Lua**: ejecución en cliente mediante `wasmoon` (WebAssembly de Lua 5.4).
- Para **Python**: ejecución en cliente mediante `Pyodide` con Web Worker.
- Para lenguajes compilados futuros: llamada al micro-servicio sandbox en backend.

## 4. Consecuencias
- **Positivas:**
  - Costo de infraestructura prácticamente nulo para los cursos de Lua y Python en el 90% de los ejercicios interactivos.
  - Feedback instantáneo (<100 ms) para el estudiante, satisfaciendo ampliamente `RNF-010`.
  - Protección de seguridad nativa al ejecutar el código en el entorno aislado del navegador del propio usuario.
- **Trade-offs:**
  - Requiere empaquetar y gestionar los binarios Wasm en el build estático del cliente web.
