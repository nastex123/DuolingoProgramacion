# 02 — Problem Statement

> Complementa a `01_PROJECT_OVERVIEW.md` sin duplicar su contenido. Define formalmente el problema, no la solución técnica.

---

## 1. Problema principal

Aprender programación es percibido como difícil, fragmentado y desmotivador para la mayoría de personas que inician — incluso cuando existe abundante material disponible. La oferta actual no logra transformar información en habilidad progresiva y medible.

**Enunciado:** Personas interesadas en programar — con o sin experiencia previa — no disponen de una ruta única, progresiva, interactiva y gamificada que les permita aprender múltiples lenguajes practicando desde el primer concepto y recibiendo retroalimentación inmediata.

---

## 2. Problemas secundarios

| # | Problema secundario | Evidencia / síntoma |
|---|---|---|
| PS-01 | Sobrecarga cognitiva | Tutoriales extensos, jerga técnica sin andamiaje previo. |
| PS-02 | Documentación poco accesible | Docs de referencia pensadas para consulta, no para aprendizaje guiado. |
| PS-03 | Falta de práctica inmediata | Brecha teoría → ejercicio de horas o días. |
| PS-04 | Ausencia de ruta estructurada | El usuario no sabe por dónde empezar ni qué sigue. |
| PS-05 | Sin retroalimentación inmediata | Errores detectados tarde o nunca explicados. |
| PS-06 | Progreso no medible | Sin métricas de avance, el abandono aumenta. |
| PS-07 | Experiencia one-size-fits-all | Principiantes obligados a repetir lo básico; avanzados sin punto de entrada. |
| PS-08 | Motivación no sostenida | Sin rachas, logros o recompensas, la constancia decae. |
| PS-09 | Contenido mono-lenguaje | Cada lenguaje exige una plataforma distinta. |
| PS-10 | Interactividad limitada | Lectura pasiva en lugar de preguntas, código y predicción de output. |

---

## 3. Causas

- **Causa pedagógica:** enfoque expositivo (video largo + doc extensa) en lugar de micro-learning con práctica integrada (ver `01` §6).
- **Causa de diseño de contenido:** teoría desacoplada de evaluación; preguntas genéricas no ancladas al concepto recién enseñado.
- **Causa estructural:** contenido hardcodeado en la UI, sin modelo `Lenguaje → Módulo → Sección → Lección` reutilizable (ver `01` §31).
- **Causa de personalización:** falta de diagnóstico inicial y de adaptación basada en historial de errores y rendimiento (ver `01` §8-§9).
- **Causa motivacional:** ausencia de mecánicas de gamificación (XP, rachas, logros) y de seguimiento visual del progreso.
- **Causa de mercado:** recursos dispersos por lenguaje, sin arquitectura multi-lenguaje ni escalabilidad de contenido.

---

## 4. Consecuencias

- Abandono temprano (primeras 2 semanas) por frustración o falta de guía.
- Aprendizaje superficial: copia de ejemplos sin comprensión verificada por Quiz/Examen.
- Tiempo perdido repitiendo contenido dominado o saltando prerrequisitos críticos.
- Incapacidad para demostrar competencia (sin certificados verificables).
- Costo de oportunidad: usuarios pagan cursos extensos que no completan.

---

## 5. Usuarios afectados

| Segmento | Necesidad crítica | Dolor principal |
|---|---|---|
| **Principiante absoluto** | Ruta desde cero, lenguaje sencillo (Lua) | No sabe por dónde empezar |
| **Principiante con nociones** | Validar nivel real y evitar repetición | Contenido redundante |
| **Intermedio (Medium / Semi-Professional)** | Entrada adaptativa a mitad de ruta | Pérdida de tiempo en fundamentos |
| **Avanzado (Professional)** | Evaluación rigurosa y certificación | Falta de reconocimiento |
| **Usuario recurrente** | Repaso espaciado y rachas | Olvido de conceptos |
| **Administrador de contenido** | Autoría sin reescribir el motor | Contenido acoplado al código |

> Personas y flujos detallados en `07_USER_STORIES.md` y `08_USE_CASES.md`.

---

## 6. Situación actual

- **Recursos existentes:** documentación oficial, tutoriales en video, plataformas de ejercicios aislados. Útiles pero desintegrados.
- **Plataformas gamificadas (ej. Duolingo, CodeDex):** validan el modelo de micro-lecciones + recompensas, pero no cubren la progresión multi-lenguaje con evaluación y certificación descrita en `01` §34-§37.
- **Alternativa de no hacer nada:** el usuario combina 3-4 herramientas (docs + juez en línea + videos + apuntes) sin trazabilidad de progreso ni adaptación.

---

## 7. Cómo la aplicación pretende solucionar el problema

Sin detallar implementación técnica (reservada para `11_SYSTEM_ARCHITECTURE.md` y siguientes), la solución actúa sobre cada causa:

- **Micro-learning integrado:** cada concepto → explicación → ejemplo → ejercicio → feedback → recompensa (`01` §6).
- **Estructura jerárquica independiente:** contenido desacoplado del motor (`01` §31, `23_CONTENT_SPECIFICATION.md`).
- **Diagnóstico + adaptatividad:** nivel declarado + prueba diagnóstica determinan punto de entrada; historial de errores y rendimiento reajustan la ruta (`01` §8-§9, `14_LEARNING_SYSTEM.md`).
- **Evaluación continua:** preguntas ancladas al módulo, Quiz intermedio (70%) y Examen final (80%) con revisión de errores (`01` §11-§15).
- **Gamificación y progreso:** XP, rachas, logros y perfil visual sostienen la constancia (`01` §16-§19).
- **Multi-lenguaje escalable:** arquitectura modular; agregar un lenguaje es agregar contenido, no reescribir el núcleo (`01` §30).

---

## 8. Justificación del proyecto

1. **Demanda:** la programación es habilidad transversal; la barrera de entrada sigue alta pese a la abundancia de recursos.
2. **Brecha no resuelta:** ninguna solución combina en un solo lugar ruta adaptativa + práctica inmediata + evaluación rigurosa + gamificación + certificación multi-lenguaje.
3. **Viabilidad:** MVP de un solo lenguaje (Lua) permite validar el núcleo educativo con costo contenido (ver `04_SCOPE.md` y `22_ROADMAP.md`).
4. **Impacto:** reduce el tiempo hasta la primera habilidad demostrable y aumenta la retención mediante motivación intrínseca y extrínseca.

---

## 9. Beneficios esperados

| Beneficio | Indicador (ver `26_ANALYTICS.md`) |
|---|---|
| Reducción de la fricción inicial | Tiempo hasta completar primera sección; tasa de finalización Módulo 1 |
| Práctica desde el primer concepto | % de lecciones con ejercicio completado |
| Ruta personalizada | % de usuarios que no repiten módulos dominados |
| Comprensión verificada | % de aprobación Quiz/Examen; reintentos |
| Retención y constancia | Racha media; DAU/WAU; tasa de abandono |
| Progreso visible | % de usuarios que consultan perfil/progreso semanalmente |
| Portabilidad de habilidad | Certificados emitidos; verificación QR |
| Escalabilidad de oferta | Tiempo para agregar un nuevo lenguaje (solo contenido) |

> Criterios de cumplimiento cuantificados en `03_OBJECTIVES.md`. Límites de lo que **no** se promete en el MVP en `04_SCOPE.md`.
