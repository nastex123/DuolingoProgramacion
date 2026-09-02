# ADR-004: Renderizado WebGL de Mascota Koda y Efectos con PixiJS v7

> **Estado:** Aprobado  
> **Fecha:** 2026-09-02  
> **Autores:** Equipo de Frontend Koda  
> **Trazabilidad:** `27_UI_UX_SPECIFICATION.md`, `16_GAMIFICATION.md`, `RNF-010`  

---

## 1. Contexto y Problema
La plataforma requiere una experiencia de gamificación altamente emocional e inmersiva similar a Duolingo, encarnada por la mascota **🦊 Koda**. La mascota debe reaccionar en tiempo real al comportamiento del estudiante:
- Respiración y física de flotación continua.
- Ojos y expresiones de alegría y celebración al acertar ejercicios.
- Gestos de reflexión y empatía al equivocarse (sin punitividad).
- Emisión masiva de partículas de confeti 3D/2D aceleradas por hardware en checkpoints.
El uso de GIFs, videos o animaciones CSS complejas satura el hilo principal de renderizado del navegador, degrada los FPS en dispositivos modestos y no permite transiciones procedurales fluidas.

## 2. Alternativas Evaluadas
1. **Lottie / Bodymovin (SVG/Canvas):**
   - *Desventajas:* Archivos JSON pesados, sobrecarga de nodos en el DOM con SVG, poca flexibilidad para efectos procedurales dinámicos de partículas concurrentes.
2. **Three.js (3D completo):**
   - *Desventajas:* Excesivo peso del bundle (~600 KB gzip), shaders 3D complejos innecesarios para el estilo visual estilizado 2D/2.5D de Koda.
3. **PixiJS v7 (Motor WebGL 2D de ultra alto rendimiento):**
   - *Ventajas:* Renderizado acelerado por hardware GPU a 60 FPS estables, sistema de `PIXI.Application`, `ticker` liviano, control programático total de sprites, geometría vectorial y motor de partículas ultra veloz.

## 3. Decisión Adoptada
Se adopta **PixiJS v7** (`pixi.js: ^7.4.2`) tanto en los entornos de validación rápida ([`test_m01.html`](../../test_m01.html) y [`test_m02.html`](../../test_m02.html)) como en el frontend oficial de Next.js ([`apps/web/src/components/KodaMascot.tsx`](../../apps/web/src/components/KodaMascot.tsx)).

## 4. Consecuencias
- **Positivas:**
  - 60 FPS garantizados sin congelar la UI ni el editor de código.
  - Reacciones emocionales inmediatas (<16 ms) ante aciertos o fallos.
  - Efectos visuales de confeti con físicas de aceleración y gravedad.
- **Trade-offs:**
  - Requiere soporte WebGL en el navegador cliente (con fallback automático a Canvas 2D provisto por PixiJS).
