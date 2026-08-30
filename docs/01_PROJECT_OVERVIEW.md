# Project Overview — Plataforma Educativa Interactiva y Gamificada

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-28

---

## 1. Información general

| Campo | Valor |
|---|---|
| Nombre del proyecto | [Nombre provisional del proyecto] |
| Nombre corto / código | [Nombre corto / código del proyecto] |
| Tipo de proyecto | Plataforma educativa interactiva y gamificada |
| Categoría | Educación / Programación / Tecnología |
| Estado | En planificación |
| Versión del documento | 1.0.0 |
| Fecha | 2026-08-28 |

---

## 2. Descripción general

Plataforma interactiva orientada a la enseñanza y aprendizaje de programación de manera didáctica, progresiva y gamificada, dirigida a cualquier persona interesada — con o sin conocimientos previos.

El usuario selecciona el lenguaje que desea aprender y realiza una evaluación inicial para determinar su nivel. A partir de ese diagnóstico, el sistema establece una ruta de aprendizaje adecuada.

Niveles contemplados:

- **Beginner**
- **Medium**
- **Semi-Professional**
- **Professional**

La plataforma combina características de apps de aprendizaje gamificado, plataformas de programación y sistemas de evaluación, inspirada conceptualmente en modelos como Duolingo y CodeDex, pero enfocada específicamente en el aprendizaje progresivo de múltiples lenguajes de programación.

---

## 3. Propósito

Facilitar el aprendizaje de programación reduciendo la dificultad inicial mediante una experiencia interactiva que divide el contenido en pequeñas unidades acompañadas de ejercicios, preguntas, evaluaciones y recompensas, favoreciendo sesiones cortas y frecuentes con registro permanente del progreso.

---

## 4. Problema que busca solucionar

Dificultades habituales al iniciarse en programación:

- Exceso de información técnica.
- Documentación difícil de interpretar.
- Falta de práctica inmediata.
- Dificultad para saber por dónde comenzar.
- Falta de retroalimentación inmediata.
- Ausencia de ruta de aprendizaje estructurada.
- Pérdida de motivación.
- Dificultad para medir el progreso.
- Brecha entre principiantes y usuarios con experiencia.
- Recursos limitados a un único lenguaje o poco interactivos.

La plataforma responde con:

- Aprendizaje progresivo.
- Ejercicios interactivos.
- Evaluaciones.
- Retroalimentación.
- Gamificación.
- Seguimiento del progreso.
- Adaptación al nivel del usuario.
- Soporte multi-lenguaje.

---

## 5. Propuesta de solución

Flujo principal del usuario:

1. Crear una cuenta.
2. Seleccionar un lenguaje de programación.
3. Indicar conocimiento previo.
4. Realizar evaluación diagnóstica.
5. Recibir ruta de aprendizaje.
6. Estudiar mediante módulos y secciones.
7. Resolver ejercicios interactivos.
8. Realizar quizzes.
9. Realizar exámenes.
10. Obtener puntos y experiencia (XP).
11. Mantener rachas de aprendizaje.
12. Desbloquear logros.
13. Consultar progreso.
14. Reforzar con preguntas de repaso.
15. Completar todos los módulos de un lenguaje.
16. Obtener certificado de finalización.
17. Exportar certificado en PDF.

---

## 6. Filosofía de aprendizaje

Modelo basado en pequeños bloques de conocimiento. Cada concepto se presenta de forma progresiva y va acompañado de práctica directa, evitando grandes bloques teóricos previos a la ejercitación.

```
Concepto → Explicación → Ejemplo → Ejercicio → Retroalimentación → Recompensa → Siguiente concepto
```

---

## 7. Estructura educativa

Jerarquía:

```
Lenguaje → Nivel / Ruta → Módulo → Sección → Lección → Ejercicios
```

### 7.1 Lenguaje

Lenguaje que el usuario desea aprender (ej.: Python, Lua, Java, C, C++, C#, Go, JavaScript, TypeScript). La arquitectura debe permitir agregar nuevos lenguajes sin rework mayor.

### 7.2 Módulo

División temática de cada lenguaje. Ejemplo para Python:

- Fundamentos
- Variables
- Tipos de datos
- Operadores
- Condicionales
- Bucles
- Funciones
- Colecciones
- Manejo de errores
- Programación orientada a objetos
- Proyecto final

### 7.3 Sección

Cada módulo se divide en secciones. Ejemplo — Módulo Variables:

1. ¿Qué es una variable?
2. Declaración y asignación
3. Tipos de datos
4. Modificación de variables
5. Ejercicios

---

## 8. Diagnóstico inicial

El usuario declara uno de los niveles:

- **BEGINNER** — sin conocimientos o mínimos.
- **MEDIUM** — conocimientos básicos, algunos programas realizados.
- **SEMI-PROFESSIONAL** — experiencia considerable, conceptos intermedios/avanzados.
- **PROFESSIONAL** — experiencia avanzada y dominio considerable.

El nivel declarado se complementa con una prueba diagnóstica que verifica la autoevaluación y permite recomendar el módulo/sección de inicio.

---

## 9. Aprendizaje adaptativo

Se evita obligar a usuarios experimentados a repetir contenido dominado.

- Un usuario **Beginner** puede iniciar en: Fundamentos → Variables → Operadores → Condicionales.
- Un usuario con experiencia puede iniciar directamente en: Operadores → Condicionales → Funciones.

Criterios de adaptación:

- Nivel seleccionado.
- Resultado del diagnóstico.
- Resultados de quizzes y exámenes.
- Historial de errores.
- Progreso anterior.

---

## 10. Sistema de sesiones

Una sesión es una unidad de estudio en un período determinado y puede contener: preguntas de repaso, contenido nuevo, ejemplos, ejercicios, preguntas interactivas, recompensas y progreso. El usuario puede abandonar y retomar la sesión desde donde la dejó.

---

## 11. Sistema de preguntas

Las preguntas están directamente relacionadas con el contenido del módulo actual (no aleatorias).

Tipos contemplados:

- Selección múltiple.
- Verdadero o falso.
- Completar código / completar una línea.
- Predecir el resultado de un programa.
- Identificar errores.
- Ordenar líneas de código.
- Seleccionar el código correcto.
- Relacionar conceptos.
- Escribir código.
- Resolver pequeños problemas.

**Ejemplo — selección múltiple:**

```python
x = 5
print(x + 5)
```

> ¿Qué resultado producirá el programa?  
> A. 5 · B. 10 · C. 55 · D. Error → **Respuesta: B**

**Ejemplo — completar código:**

```python
name = "Brandon"
print(_____)
```

> Completa para mostrar el contenido de la variable → `name`

**Ejemplo — verdadero o falso:**

> Una variable puede almacenar información que posteriormente puede ser modificada. → **Verdadero**

---

## 12. Sistema de repaso

Preguntas entre sesiones basadas en contenido ya estudiado, priorizando:

- Respuestas incorrectas previas.
- Conceptos con bajo rendimiento.
- Conceptos no repasados hace días.
- Conceptos fundamentales para contenidos posteriores.

Objetivo: reforzar memoria y evitar regresión.

---

## 13. Sistema de Quiz

Al menos un quiz por módulo para verificar comprensión antes del examen final:

```
Módulo → Sección 1 → Sección 2 → Sección 3 → QUIZ → Sección 4 → Sección 5 → EXAMEN FINAL
```

El resultado se registra en el perfil del usuario.

---

## 14. Sistema de examen

Al finalizar cada módulo, examen que evalúa todo el módulo con múltiples tipos de pregunta.

Ejemplo — Módulo Variables:

- 5 de selección múltiple
- 5 de predicción de output
- 3 de completar código
- 2 de detectar errores
- 5 de verdadero o falso

El sistema calcula el resultado automáticamente.

---

## 15. Aprobación de módulos

Umbrales configurables (valores iniciales):

- Quiz: **70%**
- Examen: **80%**

```
Aprobado  → Recompensa → XP → Desbloquear siguiente módulo
No aprobado → Revisión de errores → Repaso → Nuevo intento
```

---

## 16. Sistema de progreso

Datos registrados por usuario:

- Lenguaje seleccionado, módulo y sección actuales
- Lecciones completadas
- Preguntas respondidas / correctas / incorrectas
- Puntuaciones, quizzes y exámenes realizados
- Módulos aprobados
- XP acumulada y nivel
- Racha actual y máxima
- Logros y certificados obtenidos

---

## 17. Sistema de gamificación

Elementos: XP, puntos, niveles, rachas, logros, recompensas, progreso visual.

Ejemplo de XP (valores configurables):

| Acción | XP |
|---|---|
| Completar una sección | +10 |
| Ejercicio correcto | +5 |
| Completar un Quiz | +25 |
| Aprobar un examen | +100 |
| Completar un módulo | +150 |

---

## 18. Sistema de rachas

Días consecutivos con al menos una actividad educativa (ej.: Día 1 → 1 día, Día 7 → 7 días). Incentiva práctica constante.

---

## 19. Sistema de logros

Ejemplos:

| Logro | Condición |
|---|---|
| FIRST CODE | Escribir el primer código |
| FIRST MODULE | Completar el primer módulo |
| ON FIRE | Racha de 7 días |
| PERFECT SCORE | 100% en una evaluación |
| PYTHON BEGINNER | Completar fundamentos de Python |
| CODE MASTER | Completar todos los módulos de un lenguaje |
| MULTI LANGUAGE | Completar al menos dos lenguajes |

---

## 20. Perfil del usuario

Muestra: nombre, avatar, nivel, XP, lenguajes estudiados, progreso por lenguaje, racha actual/máxima, logros, estadísticas y certificados.

```
PERFIL — Brandon — Nivel 12 — XP 1.240 — Racha 7 días
Python  ██████████████░░ 85%
Lua     ██████░░░░░░░░░░ 40%
Logros: 12
```

---

## 21. Certificación

Al completar todos los módulos de un lenguaje se genera un certificado con al menos: nombre del usuario, número de documento, lenguaje completado, fecha de finalización, identificador único, nombre de la plataforma y estado de finalización. Exportable a PDF.

---

## 22. Identificación del certificado

Identificador único, ej.: `CQ-PY-000001` (`CQ` = CodeQuest, `PY` = Python, `000001` = consecutivo). Opcionalmente incluye código QR para verificación dentro de la plataforma.

---

## 23. Modelo de negocio

**Usuario gratuito:** acceso a funciones principales con anuncios tras completar secciones.

```
Sección completada → Recompensa → Publicidad → Siguiente sección
```

**Usuario premium — USD $1/mes (propuesto):** sin anuncios, acceso continuo a rutas, progreso conservado y experiencia sin interrupciones. Ampliable con beneficios adicionales a futuro.

---

## 24. Arquitectura conceptual

Diseño modular con responsabilidades separadas:

```
USER → AUTHENTICATION → USER PROFILE → LEARNING ENGINE → CONTENT ENGINE
     → QUESTION ENGINE → EVALUATION ENGINE → PROGRESS ENGINE
     → GAMIFICATION ENGINE → CERTIFICATION ENGINE
```

---

## 25. Motor de aprendizaje (Learning Engine)

- Determina qué contenido mostrar.
- Registra contenidos completados y desbloquea nuevos.
- Decide cuándo realizar Quiz / examen.
- Recomienda repasos y adapta la ruta.

---

## 26. Motor de preguntas (Question Engine)

Administra: tipos de preguntas, banco de preguntas, respuestas, dificultad, categoría, lenguaje/módulo/sección e historial de respuestas.

---

## 27. Motor de evaluación (Evaluation Engine)

Calcula puntuaciones y porcentajes, determina aciertos/errores, aprobación, registra resultados e identifica conceptos con bajo rendimiento.

---

## 28. Motor de gamificación (Gamification Engine)

Gestiona XP, puntos, niveles, rachas, logros y recompensas.

---

## 29. Motor de certificación (Certification Engine)

Verifica requisitos, genera certificado, asigna identificador único, produce el PDF y habilita verificación.

---

## 30. Escalabilidad

Diseñada para agregar lenguajes sin cambios significativos en el núcleo.

- Versión inicial: Python
- Posteriormente: Lua, JavaScript, TypeScript, Java, C, C++, C#, Go

El contenido educativo debe estar desacoplado de la lógica principal.

---

## 31. Principio de contenido independiente

El contenido no debe estar hardcodeado en la interfaz. Se requiere una estructura que almacene: lenguaje, módulo, sección, lección, explicación, ejemplos, preguntas, respuestas, dificultad, requisitos y puntuación. Permite agregar/modificar contenido sin reconstruir la app.

---

## 32. Futuras funcionalidades

- Editor y ejecución de código
- Proyectos prácticos y retos
- Rankings, competencias, tablas de clasificación
- Sistema de amigos y perfiles públicos
- Cursos creados por terceros
- Modo offline
- App móvil y de escritorio
- Más lenguajes y proyectos finales
- IA como tutor, recomendaciones personalizadas
- Repetición espaciada
- Verificación pública de certificados

---

## 33. Alcance inicial (MVP)

Mínimo viable:

- Registro e inicio de sesión
- Perfil de usuario
- Selección de lenguaje y nivel
- Diagnóstico inicial
- Módulos, secciones y lecciones
- Preguntas interactivas, Quiz y Examen
- Sistema de puntuación, XP y rachas
- Registro de progreso
- Certificado PDF

Lenguaje recomendado para MVP: **Python**.

---

## 34. Primera ruta educativa propuesta (Python)

1. Fundamentos
2. Variables y tipos de datos
3. Operadores
4. Condicionales
5. Bucles
6. Funciones
7. Listas y colecciones
8. Diccionarios y estructuras de datos
9. Manejo de errores
10. Programación orientada a objetos
11. Archivos
12. Proyecto final

> La estructura definitiva podrá ajustarse durante el desarrollo.

---

## 35. Resultado esperado

Plataforma capaz de guiar al usuario desde conocimientos iniciales hasta un nivel avanzado mediante una ruta estructurada donde pueda aprender, practicar, ser evaluado, recibir retroalimentación, visualizar su progreso y obtener recompensas. Experiencia sencilla para principiantes y flexible para usuarios con conocimientos previos.

---

## 36. Visión a largo plazo

Convertirse en una plataforma multiplataforma, accesible e interactiva donde cualquier persona aprenda múltiples lenguajes mediante rutas personalizadas, desarrollando habilidades reales de programación — no solo sintaxis — a través de teoría, práctica, resolución de problemas, proyectos y evaluación continua.

---

## 37. Resumen del flujo principal

```
USUARIO → REGISTRO → SELECCIÓN DE LENGUAJE → NIVEL DE CONOCIMIENTO → DIAGNÓSTICO
  → RUTA PERSONALIZADA → MÓDULO → SECCIONES → EJERCICIOS → QUIZ
  → CONTINUAR APRENDIZAJE → EXAMEN → MÓDULO APROBADO → XP + RECOMPENSAS
  → SIGUIENTE MÓDULO → COMPLETAR TODOS LOS MÓDULOS → CERTIFICADO → EXPORTAR PDF
```

---

## 38. Principio fundamental del proyecto

> "Aprender programación debe consistir en aprender, practicar, equivocarse, recibir retroalimentación y volver a intentarlo."

Cada concepto debe tener una oportunidad de práctica y evaluación asociada. El objetivo no es solo completar módulos, sino demostrar comprensión de los conceptos enseñados.
