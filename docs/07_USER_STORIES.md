# 07 — Historias de Usuario

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-29
> Complementa a `01_PROJECT_OVERVIEW.md`, `02_PROBLEM_STATEMENT.md`, `03_OBJECTIVES.md`, `04_SCOPE.md`, `05_FUNCTIONAL_REQUIREMENTS.md` y `06_NON_FUNCTIONAL_REQUIREMENTS.md`. No duplica su contenido; lo materializa en historias verificables. Cada historia mapea a ≥1 `RF-*` (`05`) y a ≥1 `UC-*` (`08`). Los flujos navegables se detallan en `09_USER_FLOWS.md`.

---

## 1. Propósito y alcance

Este documento traduce los requisitos funcionales (`05`) en historias centradas en el usuario, escritas en lenguaje de negocio y evaluables por criterios de aceptación. Es la base para priorización MVP, planificación de sprints y validación con usuarios reales.

**Fuera de alcance:** especificación técnica (`11`), modelo de datos (`12`), contratos de API (`13`) y casos de uso formales (`08` — aquí se referencian, no se repiten).

---

## 2. Convenciones

### 2.1 Formato de ID

`US-{NNN}` correlativo global con ceros (ej. `US-001`). El prefijo de épica (`E0X`) es clasificatorio y no forma parte del ID.

### 2.2 Formato de historia

> **Como** [tipo de usuario],
> **quiero** [acción],
> **para** [objetivo/valor].

Cada historia **debe** contener exactamente esas tres líneas con ese formato, además de: **Épica**, **Prioridad**, **RF trazados**, **UC trazados**, **Criterios de aceptación** (checklist verificable / Gherkin) y **Notas** cuando aplique.

Ejemplo:

```
Como usuario nuevo,
quiero registrarme con email y contraseña,
para crear mi cuenta y comenzar a aprender.
```

### 2.3 Prioridad y entrega

| Prioridad | Significado | Entrega |
|---|---|---|
| **MVP — Must** | Imprescindible para considerar el MVP aceptado. Bloquea release si falta. | Fase 1 (`04` §2) |
| **MVP — Should** | Deseable en MVP; se difiere solo con justificación y ADR. | Fase 1 |
| **Post-MVP** | Diseñado para no bloquear MVP; implementación en roadmap (`22`). | Post-MVP (`04` §3) |

### 2.4 Tipos de usuario

| Código | Tipo de usuario | Descripción |
|---|---|---|
| UN | Usuario nuevo | Sin cuenta o con cuenta recién creada; sin progreso previo. |
| UR | Usuario recurrente | Con cuenta, progreso parcial y uso continuado (días/semanas). |
| UA | Usuario avanzado | `MEDIUM`/`SEMI_PROFESSIONAL`/`PROFESSIONAL`; busca entrada adaptativa y validación rigurosa. |
| UP | Usuario premium | Suscriptor activo USD $1/mes; sin anuncios. |
| UG | Usuario gratuito | Plan gratuito con publicidad entre secciones. |
| UC | Usuario que completa un curso | Completa todos los módulos de un lenguaje. |
| UCert | Usuario que obtiene un certificado | Subconjunto de UC que genera y exporta certificado. |
| ADM | Administrador | Gestiona contenido, configuración y publicación (`RF-ADM-*`). |

---

## 3. Mapa de épicas

| Épica | Código | Historias | Objetivo |
|---|---|---|---|
| Autenticación y Cuenta | E01 | US-001 – US-007 | Acceso seguro y gestión de cuenta |
| Perfil y Progreso Visible | E02 | US-008 – US-012 | Identidad, avance y estadísticas |
| Onboarding y Ruta Adaptativa | E03 | US-013 – US-022 | Lenguaje, nivel, diagnóstico y ruta personalizada |
| Aprendizaje — Módulos, Secciones y Lecciones | E04 | US-023 – US-030 | Consumo de contenido con reanudación |
| Evaluación — Preguntas, Quiz y Examen | E05 | US-031 – US-040 | Práctica anclada y certificación de dominio por módulo |
| Gamificación — XP, Rachas y Logros | E06 | US-041 – US-049 | Motivación sostenida |
| Repaso y Refuerzo | E07 | US-050 – US-053 | Memoria a largo plazo |
| Certificación | E08 | US-054 – US-060 | Acreditación y portabilidad |
| Monetización — Gratuito y Premium | E09 | US-061 – US-066 | Modelo de negocio no intrusivo |
| Administración de Contenido | E10 | US-067 – US-072 | Autoría sin reescribir el motor |

> Total: **72 historias**. Cobertura: los 128 `RF-*` de `05` quedan cubiertos por al menos una historia (ver §5).

---

## 4. Historias de usuario

### E01 — Autenticación y Cuenta

#### US-001 — Registro con email y contraseña

- **Épica:** E01
- **Historia:**
  Como usuario nuevo,
  quiero registrarme con email y contraseña,
  para crear mi cuenta y comenzar a aprender.
- **Prioridad:** MVP — Must
- **RF:** RF-AUTH-001, RF-USR-001, RF-USR-005
- **UC:** UC-AUTH-01
- **Criterios de aceptación:**
  - [ ] Dado que estoy en la pantalla de registro, cuando ingreso email válido, contraseña que cumple fortaleza mínima y nombre visible, y confirmo, entonces el sistema crea la cuenta en estado activo, hashea la contraseña y envía email de verificación.
  - [ ] Dado que el email ya existe, cuando intento registrarme, entonces recibo mensaje genérico sin revelar existencia y no se crea duplicado.
  - [ ] Dado que el email o la contraseña no cumplen validación, cuando envío el formulario, entonces veo mensajes accionables por campo (RNF-022) y el formulario no se envía.
- **Notas:** Verificación no bloquea el aprendizaje inicial (RF-AUTH-005); sí bloquea emisión de certificado.

#### US-002 — Inicio de sesión

- **Épica:** E01
- **Historia:**
  Como usuario recurrente,
  quiero iniciar sesión con mi email y contraseña,
  para retomar mi progreso donde lo dejé.
- **Prioridad:** MVP — Must
- **RF:** RF-AUTH-002, RF-AUTH-006, RF-AUTH-007, RF-RUTA-005
- **UC:** UC-AUTH-02
- **Criterios de aceptación:**
  - [ ] Dado que ingresé credenciales válidas, cuando inicio sesión, entonces recibo token con expiración y refresh, y soy redirigido a mi ruta (módulo/sección/lección donde quedé).
  - [ ] Dado que fallo credenciales ≥ N intentos, cuando reintento, entonces aplica rate limiting y mensaje genérico sin revelar existencia del email.
  - [ ] Dado que mi sesión expira durante una lección activa, cuando continúo interactuando, entonces el refresh silencioso renueva la sesión sin obligar a re-login ni perder avance (RNF-023).
- **Notas:** Evento auditado (RF-AUTH-008).

#### US-003 — Cierre de sesión

- **Épica:** E01
- **Historia:**
  Como usuario recurrente,
  quiero cerrar sesión de forma segura,
  para proteger mi cuenta en dispositivos compartidos.
- **Prioridad:** MVP — Must
- **RF:** RF-AUTH-003, RF-AUTH-008
- **UC:** UC-AUTH-02
- **Criterios de aceptación:**
  - [ ] Dado que estoy autenticado, cuando cierro sesión, entonces el token vigente se invalida en servidor y soy redirigido a login/inicio.
  - [ ] Dado que cerré sesión, cuando intento acceder a una ruta protegida con el token anterior, entonces recibo 401 y se me pide re-autenticar.

#### US-004 — Recuperación de contraseña

- **Épica:** E01
- **Historia:**
  Como usuario recurrente,
  quiero recuperar mi contraseña vía email,
  para recuperar el acceso si la olvidé.
- **Prioridad:** MVP — Must
- **RF:** RF-AUTH-004, RF-AUTH-008
- **UC:** UC-AUTH-03
- **Criterios de aceptación:**
  - [ ] Dado que solicito recuperación, cuando ingreso mi email, entonces — exista o no — veo mensaje genérico y, si existe, se envía token de un solo uso con expiración corta.
  - [ ] Dado que uso un token válido, cuando defino nueva contraseña, entonces se actualiza hasheada y el token queda invalidado; puedo iniciar sesión con la nueva.
  - [ ] Dado que el token expiró o ya fue usado, cuando intento usarlo, entonces veo error accionable y opción de solicitar uno nuevo.

#### US-005 — Verificación de email

- **Épica:** E01
- **Historia:**
  Como usuario nuevo,
  quiero verificar mi email tras el registro,
  para habilitar la emisión de certificados y recuperar mi cuenta.
- **Prioridad:** MVP — Must
- **RF:** RF-AUTH-005
- **UC:** UC-AUTH-01
- **Criterios de aceptación:**
  - [ ] Dado que me registré, cuando abro el enlace de verificación, entonces mi cuenta queda marcada como verificada.
  - [ ] Dado que no estoy verificado, cuando intento generar un certificado, entonces el sistema me indica que debo verificar el email antes de emitirlo, sin bloquear lecciones/quizzes/exámenes.

#### US-006 — Actualizar datos y contraseña

- **Épica:** E01
- **Historia:**
  Como usuario recurrente,
  quiero actualizar mi nombre visible y cambiar mi contraseña,
  para mantener mis datos al día y mi cuenta segura.
- **Prioridad:** MVP — Must
- **RF:** RF-USR-002
- **UC:** UC-USR-02
- **Criterios de aceptación:**
  - [ ] Dado que estoy autenticado, cuando cambio mi nombre visible, entonces se persiste y se refleja en perfil y certificados futuros.
  - [ ] Dado que quiero cambiar contraseña, cuando ingreso la actual y una nueva válida, entonces se actualiza hasheada; con la actual incorrecta, se rechaza.

#### US-007 — Eliminar cuenta y portabilidad de datos

- **Épica:** E01
- **Historia:**
  Como usuario recurrente,
  quiero solicitar la eliminación de mi cuenta y exportar mis datos,
  para ejercer control sobre mi información personal.
- **Prioridad:** MVP — Must (eliminación/anonimización); MVP — Should (exportación)
- **RF:** RF-USR-003, RF-USR-006, RF-USR-004
- **UC:** UC-USR-03
- **Criterios de aceptación:**
  - [ ] Dado que solicito eliminación, cuando confirmo, entonces mis datos personales se borran/anonimizan, progreso y certificados se anonimizan y el email no se reutiliza sin confirmación.
  - [ ] Dado que solicito exportación, cuando confirmo, entonces recibo mis datos personales registrados en formato portátil.
  - [ ] Dado que mi cuenta está bloqueada (RF-USR-004), cuando intento acceder, entonces veo mensaje de bloqueo y no puedo operar.

---

### E02 — Perfil y Progreso Visible

#### US-008 — Consultar mi perfil y progreso

- **Épica:** E02
- **Historia:**
  Como usuario recurrente,
  quiero ver mi perfil con XP, nivel, rachas y progreso por lenguaje,
  para saber dónde estoy y qué me falta.
- **Prioridad:** MVP — Must
- **RF:** RF-PROF-001, RF-PROF-003, RF-PROF-006, RF-PROF-007, RF-PROG-002, RF-PROG-003, RF-RACHA-003
- **UC:** UC-PROF-01
- **Criterios de aceptación:**
  - [ ] Dado que accedo a mi perfil, cuando se carga, entonces veo nombre, avatar (o por defecto), nivel derivado de XP, XP total, racha actual/máxima, lenguajes estudiados con % y módulo/sección actual, y estadísticas (lecciones, preguntas, quizzes/exámenes).
  - [ ] Dado que tengo progreso en varios lenguajes, cuando consulto, entonces cada lenguaje muestra su % independiente y el agregado de cuenta.
  - [ ] Dado que no tengo actividad, cuando consulto estadísticas, entonces veo ceros coherentes sin errores.

#### US-009 — Cambiar avatar

- **Épica:** E02
- **Historia:**
  Como usuario recurrente,
  quiero cambiar mi avatar,
  para personalizar mi perfil.
- **Prioridad:** MVP — Should
- **RF:** RF-PROF-002
- **UC:** UC-PROF-02
- **Criterios de aceptación:**
  - [ ] Dado que subo una imagen válida (formato/tamaño), cuando confirmo, entonces se actualiza y se refleja en perfil.
  - [ ] Dado que subo un archivo inválido, cuando intento guardar, entonces veo error accionable y no se persiste.

#### US-010 — Ver logros y certificados en el perfil

- **Épica:** E02
- **Historia:**
  Como usuario recurrente,
  quiero ver mis logros y certificados desde el perfil,
  para celebrar mis avances y acceder a mis acreditaciones.
- **Prioridad:** MVP — Must
- **RF:** RF-PROF-004, RF-PROF-005, RF-LOGRO-003
- **UC:** UC-PROF-03, UC-PROF-04
- **Criterios de aceptación:**
  - [ ] Dado que accedo a perfil → logros, cuando se listan, entonces veo obtenidos con fecha de desbloqueo y pendientes descriptivos.
  - [ ] Dado que accedo a perfil → certificados, cuando se listan, entonces veo ID, lenguaje, fecha, estado y acceso a descarga PDF.

#### US-011 — Consultar historial filtrable

- **Épica:** E02
- **Historia:**
  Como usuario recurrente,
  quiero filtrar mi historial de lecciones, preguntas, quizzes y exámenes por lenguaje,
  para revisar mi evolución.
- **Prioridad:** MVP — Should
- **RF:** RF-PROG-005, RF-EVAL-003
- **UC:** UC-PROF-01
- **Criterios de aceptación:**
  - [ ] Dado que tengo historial, cuando filtro por lenguaje/módulo, entonces veo solo intentos del filtro con puntaje, %, umbral aplicado y fecha.
  - [ ] Dado que no hay resultados para el filtro, cuando aplico, entonces veo estado vacío con mensaje guía.

#### US-012 — Navegación jerárquica siempre visible

- **Épica:** E02
- **Historia:**
  Como usuario recurrente,
  quiero ver siempre la jerarquía Lenguaje → Módulo → Sección → Lección,
  para no perderme mientras aprendo.
- **Prioridad:** MVP — Must
- **RF:** RF-SEC-004
- **UC:** UC-SEC-01, UC-PROF-01
- **Criterios de aceptación:**
  - [ ] Dado que estoy en cualquier vista de aprendizaje, cuando miro la navegación, entonces veo breadcrumb/contexto con mi posición exacta.
  - [ ] Dado que navego entre lecciones, cuando avanzo/retrocedo, entonces el contexto se actualiza en < 500 ms p95 (RNF-011).

---

### E03 — Onboarding y Ruta Adaptativa

#### US-013 — Seleccionar lenguaje disponible

- **Épica:** E03
- **Historia:**
  Como usuario nuevo,
  quiero ver y seleccionar el lenguaje que deseo aprender,
  para iniciar mi ruta.
- **Prioridad:** MVP — Must
- **RF:** RF-LANG-001, RF-LANG-002
- **UC:** UC-LANG-01, UC-LANG-02
- **Criterios de aceptación:**
  - [ ] Dado que accedo a selección de lenguaje, cuando se listan, entonces veo Python como disponible y el resto como "próximamente" sin acceso.
  - [ ] Dado que selecciono Python, cuando confirmo, entonces queda como lenguaje activo y determina módulos/ruta visibles.

#### US-014 — Cambiar de lenguaje conservando progreso

- **Épica:** E03
- **Historia:**
  Como usuario recurrente,
  quiero cambiar de lenguaje activo sin perder mi progreso anterior,
  para aprender varios lenguajes en paralelo.
- **Prioridad:** MVP — Must
- **RF:** RF-LANG-003, RF-LANG-005
- **UC:** UC-LANG-02
- **Criterios de aceptación:**
  - [ ] Dado que tengo progreso en Python, cuando cambio a otro lenguaje disponible (cuando exista), entonces mi progreso de Python permanece intacto y veo la ruta del nuevo lenguaje.
  - [ ] Dado que vuelvo a Python, cuando retomo, entonces continúo exactamente donde quedé.

#### US-015 — Declarar nivel inicial

- **Épica:** E03
- **Historia:**
  Como usuario nuevo,
  quiero declarar mi nivel (Beginner / Medium / Semi-Professional / Professional),
  para que el sistema ubique mi punto de partida.
- **Prioridad:** MVP — Must
- **RF:** RF-LVL-001, RF-LVL-003, RF-LVL-002
- **UC:** UC-LVL-01, UC-LVL-02
- **Criterios de aceptación:**
  - [ ] Dado que seleccioné lenguaje, cuando declaro nivel, entonces veo descripciones de `01` §8 y el valor se registra como entrada para la recomendación.
  - [ ] Dado que aún no completé el diagnóstico, cuando quiero corregir mi nivel, entonces puedo modificarlo (RF-LVL-002).

#### US-016 — Realizar diagnóstico inicial

- **Épica:** E03
- **Historia:**
  Como usuario avanzado,
  quiero realizar una prueba diagnóstica por lenguaje,
  para validar mi nivel real y evitar repetir lo que ya domino.
- **Prioridad:** MVP — Must
- **RF:** RF-DIAG-001, RF-DIAG-002, RF-DIAG-005, RF-DIAG-006
- **UC:** UC-DIAG-01, UC-DIAG-02
- **Criterios de aceptación:**
  - [ ] Dado que declaré nivel, cuando inicio el diagnóstico, entonces recibo preguntas representativas de distintos módulos sin asumir ejecución de código.
  - [ ] Dado que completo el diagnóstico, cuando se califica, entonces veo puntaje por área y el resultado queda registrado en mi perfil/historial.
  - [ ] Dado que completé el diagnóstico, cuando consulto, entonces entiendo que no otorga aprobación de módulos (solo ubicación).

#### US-017 — Recibir recomendación de punto de entrada

- **Épica:** E03
- **Historia:**
  Como usuario avanzado,
  quiero recibir una recomendación de módulo/sección de inicio combinando mi nivel y el diagnóstico,
  para empezar en el lugar correcto.
- **Prioridad:** MVP — Must
- **RF:** RF-DIAG-003, RF-RUTA-001
- **UC:** UC-DIAG-02, UC-RUTA-01
- **Criterios de aceptación:**
  - [ ] Dado que tengo nivel + diagnóstico, cuando se genera la recomendación, entonces veo módulo/sección sugerida con justificación (puntaje por área).
  - [ ] Dado que no estoy de acuerdo, cuando ajusto la sugerencia, entonces puedo hacerlo dentro de límites pedagógicos sin romper prerrequisitos críticos.

#### US-018 — Visualizar ruta personalizada

- **Épica:** E03
- **Historia:**
  Como usuario recurrente,
  quiero ver mi ruta con módulos en orden y su estado,
  para planificar mi aprendizaje.
- **Prioridad:** MVP — Must
- **RF:** RF-RUTA-002, RF-MOD-001, RF-MOD-003
- **UC:** UC-RUTA-02, UC-MOD-01
- **Criterios de aceptación:**
  - [ ] Dado que tengo ruta generada, cuando la visualizo, entonces veo los 12 módulos de Python en orden canónico con estado (bloqueado/disponible/en progreso/aprobado) y % de avance.
  - [ ] Dado que aprobé un examen, cuando vuelvo a la ruta, entonces el siguiente módulo pasa a disponible y el anterior queda en aprobado.

#### US-019 — Ruta que respeta prerrequisitos

- **Épica:** E03
- **Historia:**
  Como usuario recurrente,
  quiero que el sistema bloquee el avance si no aprobé el examen del módulo anterior,
  para asegurar que domino los fundamentos antes de avanzar.
- **Prioridad:** MVP — Must
- **RF:** RF-RUTA-004, RF-EXAM-004, RF-MOD-003
- **UC:** UC-RUTA-02, UC-EXAM-03
- **Criterios de aceptación:**
  - [ ] Dado que reprobé el examen, cuando intento acceder al siguiente módulo, entonces permanece bloqueado y veo CTA de revisión/repaso.
  - [ ] Dado que mi punto de entrada adaptativo validó un salto, cuando inicio, entonces los módulos previos quedan como omitidos por diagnóstico sin exigir su examen.

#### US-020 — Reanudar ruta donde la dejé

- **Épica:** E03
- **Historia:**
  Como usuario recurrente,
  quiero retomar exactamente donde dejé (módulo/sección/lección/ejercicio),
  para no perder tiempo ni progreso.
- **Prioridad:** MVP — Must
- **RF:** RF-RUTA-005, RF-LEC-002, RF-PROG-004
- **UC:** UC-RUTA-03, UC-LEC-02
- **Criterios de aceptación:**
  - [ ] Dado que cerré sesión/dispositivo en mitad de una lección, cuando vuelvo a entrar, entonces retomo en el mismo punto con respuestas ya enviadas visibles en < 2 s (RNF-023).
  - [ ] Dado que perdí conexión durante una lección, cuando reconecto, entonces el progreso confirmado en servidor se sincroniza sin corrupción (RNF-044, RF-PROG-004).

#### US-021 — Re-tomar diagnóstico sin borrar progreso validado

- **Épica:** E03
- **Historia:**
  Como usuario avanzado,
  quiero volver a realizar el diagnóstico,
  para recalibrar mi ruta sin perder módulos ya aprobados.
- **Prioridad:** MVP — Should
- **RF:** RF-DIAG-004
- **UC:** UC-DIAG-03
- **Criterios de aceptación:**
  - [ ] Dado que ya tengo exámenes aprobados, cuando re-tomo el diagnóstico, entonces el nuevo resultado no borra aprobaciones previas.
  - [ ] Dado que completo el nuevo diagnóstico, cuando se genera nueva recomendación, entonces se ajusta solo el contenido no validado.

#### US-022 — Bloqueo de cambio de nivel tras iniciar aprendizaje

- **Épica:** E03
- **Historia:**
  Como usuario recurrente,
  quiero que mi nivel declarado no cambie arbitrariamente una vez iniciado el aprendizaje,
  para mantener coherencia pedagógica salvo re-diagnóstico.
- **Prioridad:** MVP — Should
- **RF:** RF-LVL-004
- **UC:** UC-LVL-01
- **Criterios de aceptación:**
  - [ ] Dado que ya inicié lecciones, cuando intento cambiar nivel directamente, entonces el sistema me dirige a re-diagnóstico explícito.
  - [ ] Dado que completo re-diagnóstico, cuando se recalcula, entonces se registra el nuevo nivel efectivo.

---

### E04 — Aprendizaje — Módulos, Secciones y Lecciones

#### US-023 — Listar y consultar módulos

- **Épica:** E04
- **Historia:**
  Como usuario recurrente,
  quiero listar los módulos de mi lenguaje y ver el detalle de cada uno,
  para entender qué aprenderé y en qué orden.
- **Prioridad:** MVP — Must
- **RF:** RF-MOD-001, RF-MOD-002, RF-MOD-005
- **UC:** UC-MOD-01, UC-MOD-02
- **Criterios de aceptación:**
  - [ ] Dado que seleccioné Python, cuando listo módulos, entonces veo los 12 en orden pedagógico con objetivo, secciones, estado, requisitos y evaluaciones.
  - [ ] Dado que consulto un módulo, cuando se abre, entonces veo fecha de inicio, última actividad y estado de aprobación.

#### US-024 — Consumir una lección con flujo completo

- **Épica:** E04
- **Historia:**
  Como usuario nuevo,
  quiero estudiar una lección que siga concepto → explicación → ejemplo → ejercicio → feedback → recompensa,
  para aprender haciendo sin sobrecarga.
- **Prioridad:** MVP — Must
- **RF:** RF-LEC-001, RF-SEC-002, RF-PREG-003, RF-PREG-004, RF-LEC-004
- **UC:** UC-LEC-01, UC-SEC-02
- **Criterios de aceptación:**
  - [ ] Dado que abro una lección, cuando avanzo, entonces cada concepto presenta explicación breve, ejemplo y al menos un ejercicio anclado al contenido.
  - [ ] Dado que respondo un ejercicio, cuando envío, entonces recibo validación inmediata (< 1 s p95, RNF-010), acierto/error, explicación y XP correspondiente si aplica.
  - [ ] Dado que no cumplí prerrequisito de lección, cuando intento acceder, entonces se bloquea con mensaje guía (RF-LEC-004).

#### US-025 — Completar una sección

- **Épica:** E04
- **Historia:**
  Como usuario recurrente,
  quiero completar una sección al finalizar todas sus lecciones/ejercicios obligatorios,
  para avanzar de forma medible.
- **Prioridad:** MVP — Must
- **RF:** RF-SEC-001, RF-SEC-003, RF-LEC-003
- **UC:** UC-SEC-02
- **Criterios de aceptación:**
  - [ ] Dado que finalicé todos los ejercicios obligatorios de la sección, cuando se evalúa, entonces la sección pasa a completada y otorga XP (+10 inicial) y se dispara `Sección completada → Recompensa → (Publicidad si gratuito) → Siguiente sección`.
  - [ ] Dado que aún faltan ejercicios, cuando intento marcar completada, entonces permanece en progreso y veo qué falta.

#### US-026 — Persistencia atómica de progreso intra-lección

- **Épica:** E04
- **Historia:**
  Como usuario recurrente,
  quiero que cada respuesta quede guardada de forma atómica,
  para no perder intentos si falla la red o el servidor.
- **Prioridad:** MVP — Must
- **RF:** RF-LEC-003, RF-PREG-005, RF-PROG-001, RF-PROG-004
- **UC:** UC-LEC-01, UC-PROG-01
- **Criterios de aceptación:**
  - [ ] Dado que envío una respuesta, cuando hay fallo a mitad de request, entonces no queda intento a medias; reintento con idempotencia no duplica (RNF-042, RNF-033).
  - [ ] Dado que reenvío la misma respuesta con `Idempotency-Key`, cuando se procesa, entonces no duplica registro ni XP.

#### US-027 — Revisar lecciones ya completadas

- **Épica:** E04
- **Historia:**
  Como usuario recurrente,
  quiero revisar lecciones ya completadas sin penalización,
  para reforzar conceptos.
- **Prioridad:** MVP — Should
- **RF:** RF-LEC-005
- **UC:** UC-LEC-03
- **Criterios de aceptación:**
  - [ ] Dado que completé una lección, cuando la revisito, entonces veo contenido y respuestas previas sin perder progreso ni XP.

#### US-028 — Sesión reanudable (cierre de pestaña/dispositivo)

- **Épica:** E04
- **Historia:**
  Como usuario recurrente,
  quiero abandonar y retomar mi sesión sin pérdida percibida,
  para aprender en sesiones cortas.
- **Prioridad:** MVP — Must
- **RF:** RF-LEC-002, RF-PROG-004
- **UC:** UC-LEC-02
- **Criterios de aceptación:**
  - [ ] Dado que cerré la pestaña a mitad de sección, cuando reabro, entonces retomo en el mismo ejercicio con respuestas ya enviadas restauradas.
  - [ ] Dado que cambié de dispositivo, cuando inicio sesión, entonces retomo en el mismo punto (persistencia en servidor).

#### US-029 — Contenido desacoplado (visión administrador)

- **Épica:** E04
- **Historia:**
  Como administrador,
  quiero que el contenido (lenguaje/módulo/sección/lección) esté desacoplado del motor,
  para agregar o modificar cursos sin reconstruir la app.
- **Prioridad:** MVP — Must
- **RF:** RF-LANG-004, RF-MOD-004, RF-ADM-001
- **UC:** UC-ADM-01, UC-ADM-02
- **Criterios de aceptación:**
  - [ ] Dado que agrego un lenguaje nuevo, cuando publico, entonces solo se requiere contenido + config + migración de datos de contenido, 0 cambios en motor (RNF-006, RNF-031).
  - [ ] Dado que modifico orden de módulos, cuando publico, entonces el cambio se refleja sin rebuild (RNF-017).

#### US-030 — Tiempo dedicado por sección (métrica interna)

- **Épica:** E04
- **Historia:**
  Como administrador,
  quiero que el sistema registre tiempo dedicado por sección,
  para medir engagement sin exponer ranking en MVP.
- **Prioridad:** MVP — Should
- **RF:** RF-SEC-005, RF-PROG-006
- **UC:** UC-SEC-02
- **Criterios de aceptación:**
  - [ ] Dado que el usuario completa una sección, cuando se registra, entonces el tiempo dedicado queda disponible para `26_ANALYTICS.md` sin mostrar ranking al usuario en MVP.

---

### E05 — Evaluación — Preguntas, Quiz y Examen

#### US-031 — Banco de preguntas tipificadas

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero responder preguntas de tipos variados (múltiple, V/F, completar código, predecir output, etc.),
  para practicar de forma interactiva y no solo leer.
- **Prioridad:** MVP — Must
- **RF:** RF-PREG-001, RF-PREG-002, RF-PREG-007
- **UC:** UC-PREG-01, UC-LEC-01, UC-QUIZ-01, UC-EXAM-01
- **Criterios de aceptación:**
  - [ ] Dado que estoy en una lección/quiz/examen, cuando se presenta una pregunta, entonces es de uno de los tipos soportados, anclada al contenido actual y con metadatos completos.
  - [ ] Dado que la pregunta es de selección, cuando se muestra, entonces el orden de opciones puede estar aleatorizado manteniendo trazabilidad de la correcta.

#### US-032 — Feedback inmediato por pregunta

- **Épica:** E05
- **Historia:**
  Como usuario nuevo,
  quiero saber inmediatamente si acerté o fallé y por qué,
  para corregir en el momento.
- **Prioridad:** MVP — Must
- **RF:** RF-PREG-004
- **UC:** UC-LEC-01, UC-PREG-02
- **Criterios de aceptación:**
  - [ ] Dado que envío una respuesta, cuando se valida en servidor, entonces veo acierto/error, explicación en lenguaje del usuario y XP si corresponde, en < 1 s (RNF-010).
  - [ ] Dado que fallo, cuando veo el feedback, entonces entiendo la causa y el siguiente paso sin ver stack traces (RNF-022).

#### US-033 — Realizar Quiz por módulo

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero realizar un quiz por módulo para verificar mi comprensión antes del examen,
  para saber si estoy listo.
- **Prioridad:** MVP — Must
- **RF:** RF-QUIZ-001, RF-QUIZ-002, RF-QUIZ-003, RF-QUIZ-006
- **UC:** UC-QUIZ-01, UC-QUIZ-02
- **Criterios de aceptación:**
  - [ ] Dado que avancé en un módulo, cuando corresponde quiz, entonces se genera con preguntas del módulo actual según composición configurable.
  - [ ] Dado que envío el quiz, cuando se califica (< 2 s, RNF-012), entonces veo %, aprobación (≥70% inicial) y XP otorgada.

#### US-034 — Revisión de errores tras Quiz

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero revisar mis errores del quiz con la respuesta correcta y explicación,
  para aprender de mis fallos sin ver el banco completo.
- **Prioridad:** MVP — Must
- **RF:** RF-QUIZ-004
- **UC:** UC-QUIZ-03
- **Criterios de aceptación:**
  - [ ] Dado que completé un quiz, cuando abro revisión, entonces veo por cada fallo: pregunta, mi respuesta, correcta y explicación, sin exponer preguntas no evaluadas.

#### US-035 — Reintentar Quiz

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero reintentar un quiz tras repasar,
  para mejorar mi comprensión sin ocultar mi historial.
- **Prioridad:** MVP — Must
- **RF:** RF-QUIZ-005
- **UC:** UC-QUIZ-04
- **Criterios de aceptación:**
  - [ ] Dado que reprobé un quiz, cuando reintento, entonces se registra nuevo intento, la mejor nota no oculta el historial y el umbral vigente se conserva por intento.

#### US-036 — Realizar Examen final por módulo

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero realizar el examen final de cada módulo que evalúe todo el módulo,
  para demostrar dominio y desbloquear el siguiente.
- **Prioridad:** MVP — Must
- **RF:** RF-EXAM-001, RF-EXAM-002, RF-EXAM-003, RF-EXAM-007
- **UC:** UC-EXAM-01, UC-EXAM-02
- **Criterios de aceptación:**
  - [ ] Dado que completé las secciones del módulo, cuando inicio el examen, entonces se compone con distribución configurable (ej. 5 múltiple, 5 predicción, 3 completar, 2 detectar errores, 5 V/F).
  - [ ] Dado que envío el examen, cuando se califica, entonces veo %, aprobación (≥80% inicial), XP y estado del módulo (aprobado/reprobado).

#### US-037 — Bloqueo por examen reprobado

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero que el sistema me bloquee el siguiente módulo si reprobé y me ofrezca repaso,
  para no avanzar con vacíos críticos.
- **Prioridad:** MVP — Must
- **RF:** RF-EXAM-004, RF-RUTA-004
- **UC:** UC-EXAM-03
- **Criterios de aceptación:**
  - [ ] Dado que reprobé, cuando intento avanzar, entonces el siguiente módulo permanece bloqueado y veo CTA de revisión de errores y repaso.

#### US-038 — Reintentos ilimitados de examen

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero reintentar el examen las veces que necesite,
  para alcanzar el dominio sin promediar intentos.
- **Prioridad:** MVP — Must
- **RF:** RF-EXAM-005
- **UC:** UC-EXAM-04
- **Criterios de aceptación:**
  - [ ] Dado que reprobé, cuando reintento, entonces cada intento se registra y el desbloqueo exige un intento aprobado (no promedio).

#### US-039 — Revisión detallada tras examen

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero ver revisión detallada por tipo de pregunta y conceptos con bajo rendimiento,
  para enfocar mi repaso.
- **Prioridad:** MVP — Must
- **RF:** RF-EXAM-006, RF-EVAL-004
- **UC:** UC-EXAM-03, UC-EVAL-03
- **Criterios de aceptación:**
  - [ ] Dado que completé un examen, cuando abro revisión, entonces veo desglose por tipo y lista de conceptos con bajo rendimiento expuestos para repaso.

#### US-040 — Calificación auditable y en servidor

- **Épica:** E05
- **Historia:**
  Como usuario recurrente,
  quiero que mi calificación sea determinista, auditable y calculada en servidor,
  para confiar en la justicia de la evaluación.
- **Prioridad:** MVP — Must
- **RF:** RF-EVAL-001, RF-EVAL-002, RF-EVAL-003, RF-EVAL-005, RF-EVAL-006
- **UC:** UC-EVAL-01, UC-EVAL-02
- **Criterios de aceptación:**
  - [ ] Dado que envío quiz/examen, cuando se califica, entonces el servidor calcula puntaje, %, detalle por pregunta y aprobación según umbral vigente al momento del intento, registrando versión de contenido y umbral histórico.
  - [ ] Dado que manipulo el cliente, cuando intento alterar la calificación, entonces el servidor la recalcula y prevalece su decisión.

---

### E06 — Gamificación — XP, Rachas y Logros

#### US-041 — Ganar XP por acciones

- **Épica:** E06
- **Historia:**
  Como usuario recurrente,
  quiero ganar XP por completar secciones, acertar ejercicios, aprobar quizzes y exámenes,
  para sentir progreso constante.
- **Prioridad:** MVP — Must
- **RF:** RF-XP-001, RF-XP-005, RF-XP-003
- **UC:** UC-GAM-01, UC-GAM-02
- **Criterios de aceptación:**
  - [ ] Dado que completo una sección/ejercicio/quiz/examen, cuando se valida en servidor, entonces se otorga XP según valores configurables (ej. +10, +5, +25, +100, +150) y reintentos indebidos no duplican XP.
  - [ ] Dado que consulto mi historial de XP, cuando se lista, entonces veo por evento: acción, XP, referencia y fecha.

#### US-042 — Ver nivel derivado de XP

- **Épica:** E06
- **Historia:**
  Como usuario recurrente,
  quiero ver mi nivel calculado desde XP con curva configurable,
  para tener una meta clara de crecimiento.
- **Prioridad:** MVP — Must
- **RF:** RF-XP-002, RF-XP-003, RF-PROF-001
- **UC:** UC-GAM-01
- **Criterios de aceptación:**
  - [ ] Dado que acumulo XP, cuando consulto perfil, entonces veo nivel determinista según curva vigente y el historial de XP por evento.

#### US-043 — XP configurable sin despliegue

- **Épica:** E06
- **Historia:**
  Como administrador,
  quiero configurar valores de XP sin desplegar código,
  para ajustar la economía del juego rápidamente.
- **Prioridad:** MVP — Must
- **RF:** RF-XP-004, RF-ADM-004
- **UC:** UC-ADM-04
- **Criterios de aceptación:**
  - [ ] Dado que modifico XP en configuración, cuando guardo, entonces el nuevo valor aplica en < 5 min sin rebuild y afecta solo a eventos futuros.

#### US-044 — Mantener racha diaria

- **Épica:** E06
- **Historia:**
  Como usuario recurrente,
  quiero mantener mi racha con al menos una actividad válida al día,
  para sostener el hábito.
- **Prioridad:** MVP — Must
- **RF:** RF-RACHA-001, RF-RACHA-003, RF-RACHA-004, RF-RACHA-005
- **UC:** UC-GAM-03
- **Criterios de aceptación:**
  - [ ] Dado que completo una lección/quiz/examen/repaso hoy, cuando se registra, entonces mi racha incrementa en 1 con corte por zona horaria documentada.
  - [ ] Dado que consulto perfil, cuando veo rachas, entonces veo actual y máxima histórica y el historial diario para auditoría.

#### US-045 — Perder y reiniciar racha

- **Épica:** E06
- **Historia:**
  Como usuario recurrente,
  quiero que mi racha se reinicie si no tengo actividad en un día,
  para que la métrica sea honesta y motivadora.
- **Prioridad:** MVP — Must
- **RF:** RF-RACHA-002
- **UC:** UC-GAM-03
- **Criterios de aceptación:**
  - [ ] Dado que no registré actividad en un día calendario, cuando llega el corte, entonces la racha vuelve a 0 (con ventana de gracia configurable si aplica).

#### US-046 — Obtener logro ON FIRE (7 días)

- **Épica:** E06
- **Historia:**
  Como usuario recurrente,
  quiero obtener el logro ON FIRE al alcanzar 7 días de racha,
  para celebrar mi constancia.
- **Prioridad:** MVP — Must
- **RF:** RF-LOGRO-001, RF-LOGRO-002, RF-LOGRO-005
- **UC:** UC-GAM-04
- **Criterios de aceptación:**
  - [ ] Dado que alcanzo 7 días consecutivos, cuando se evalúa, entonces el logro se desbloquea automáticamente con fecha y sin duplicarse.

#### US-047 — Catálogo de logros y desbloqueo automático

- **Épica:** E06
- **Historia:**
  Como usuario recurrente,
  quiero que los logros se desbloqueen automáticamente al cumplir condiciones verificables,
  para no tener que reclamarlos manualmente.
- **Prioridad:** MVP — Must
- **RF:** RF-LOGRO-001, RF-LOGRO-002, RF-LOGRO-005
- **UC:** UC-GAM-04
- **Criterios de aceptación:**
  - [ ] Dado que cumplo FIRST CODE / FIRST MODULE / PERFECT SCORE / etc., cuando se verifica, entonces el logro se otorga una sola vez y queda registrado.
  - [ ] Dado que ya obtuve un logro, cuando vuelvo a cumplir la condición, entonces no se duplica.

#### US-048 — Ver logros obtenidos y pendientes

- **Épica:** E06
- **Historia:**
  Como usuario recurrente,
  quiero ver qué logros tengo y cuáles me faltan,
  para motivarme sin spoilers sensibles.
- **Prioridad:** MVP — Must
- **RF:** RF-LOGRO-003
- **UC:** UC-PROF-03
- **Criterios de aceptación:**
  - [ ] Dado que accedo a logros, cuando se listan, entonces veo obtenidos con fecha y pendientes con descripción sin revelar contenido sensible.

#### US-049 — Configurar logros sin tocar el motor

- **Épica:** E06
- **Historia:**
  Como administrador,
  quiero agregar o configurar logros sin modificar el motor,
  para evolucionar la gamificación con contenido.
- **Prioridad:** MVP — Should
- **RF:** RF-LOGRO-004, RF-ADM-001
- **UC:** UC-ADM-05
- **Criterios de aceptación:**
  - [ ] Dado que creo un logro nuevo, cuando lo publico, entonces queda disponible sin cambios en código del motor.

---

### E07 — Repaso y Refuerzo

#### US-050 — Repaso priorizado automático

- **Épica:** E07
- **Historia:**
  Como usuario recurrente,
  quiero recibir sesiones de repaso con preguntas de contenido ya visto, priorizadas por mis errores,
  para no olvidar lo aprendido.
- **Prioridad:** MVP — Must
- **RF:** RF-REP-001, RF-REP-002, RF-RUTA-003, RF-EVAL-004
- **UC:** UC-REP-01
- **Criterios de aceptación:**
  - [ ] Dado que tengo historial, cuando se genera repaso, entonces prioriza: respuestas incorrectas, conceptos con bajo rendimiento, no repasados hace días y prerrequisitos de próximos contenidos.
  - [ ] Dado que completo repaso, cuando se registra, entonces retroalimenta al motor de evaluación sin penalizar progreso del módulo.

#### US-051 — Repaso opcional sin bloquear ruta

- **Épica:** E07
- **Historia:**
  Como usuario recurrente,
  quiero que el repaso sea opcional y no bloquee mi avance,
  para elegir cuándo reforzar.
- **Prioridad:** MVP — Must
- **RF:** RF-REP-003
- **UC:** UC-REP-02, UC-LEC-02
- **Criterios de aceptación:**
  - [ ] Dado que se sugiere repaso, cuando lo omito, entonces puedo continuar la ruta principal sin bloqueo.
  - [ ] Dado que acepto repaso, cuando lo completo, entonces vuelvo a la ruta sin perder posición.

#### US-052 — Repaso manual por módulo/tema

- **Épica:** E07
- **Historia:**
  Como usuario recurrente,
  quiero elegir manualmente qué módulo o tema repasar,
  para focalizarme donde me siento débil.
- **Prioridad:** MVP — Should
- **RF:** RF-REP-005
- **UC:** UC-REP-02
- **Criterios de aceptación:**
  - [ ] Dado que selecciono un módulo/tema, cuando inicio repaso manual, entonces recibo preguntas de ese ámbito ya estudiado.

#### US-053 — Repaso que no penaliza y retroalimenta

- **Épica:** E07
- **Historia:**
  Como usuario recurrente,
  quiero que el repaso no penalice mi progreso pero sí ajuste la priorización futura,
  para practicar sin miedo.
- **Prioridad:** MVP — Must
- **RF:** RF-REP-004
- **UC:** UC-REP-01
- **Criterios de aceptación:**
  - [ ] Dado que fallo en repaso, cuando se registra, entonces no baja % de módulo ni bloquea avance, pero sí ajusta la próxima priorización.

---

### E08 — Certificación

#### US-054 — Obtener certificado al completar un lenguaje

- **Épica:** E08
- **Historia:**
  Como usuario que completa un curso,
  quiero obtener un certificado de finalización al aprobar todos los módulos de un lenguaje,
  para acreditar mi logro.
- **Prioridad:** MVP — Must
- **RF:** RF-CERT-001, RF-CERT-002, RF-CERT-003, RF-CERT-004
- **UC:** UC-CERT-01
- **Criterios de aceptación:**
  - [ ] Dado que aprobé todos los exámenes del lenguaje con umbral vigente, cuando se verifica, entonces se genera certificado con: nombre, documento, lenguaje, fecha, ID único `KODA-{LANG}-{SEQ}`, plataforma y estado, y QR interno.
  - [ ] Dado que aún no aprobé todos los módulos, cuando solicito certificado, entonces no se genera y veo qué módulos faltan.

#### US-055 — Verificación interna por ID/QR

- **Épica:** E08
- **Historia:**
  Como usuario que obtiene un certificado,
  quiero verificar un certificado por ID o QR dentro de la plataforma,
  para confirmar su validez.
- **Prioridad:** MVP — Must
- **RF:** RF-CERT-004, RF-CERT-006
- **UC:** UC-CERT-02
- **Criterios de aceptación:**
  - [ ] Dado que escaneo QR o ingreso ID, cuando consulto, entonces veo validez, lenguaje, fecha y titular sin exponer datos sensibles de terceros.
  - [ ] Dado que el certificado es inválido/obsoleto, cuando consulto, entonces veo estado correspondiente con explicación.

#### US-056 — Exportar certificado a PDF

- **Épica:** E08
- **Historia:**
  Como usuario que obtiene un certificado,
  quiero exportar mi certificado a PDF,
  para guardarlo y compartirlo.
- **Prioridad:** MVP — Must
- **RF:** RF-PDF-001, RF-PDF-002, RF-PDF-003, RF-PDF-004
- **UC:** UC-CERT-04
- **Criterios de aceptación:**
  - [ ] Dado que tengo certificado vigente, cuando solicito PDF, entonces se genera con plantilla versionada (datos + QR) y queda almacenado para descarga autenticada.
  - [ ] Dado que solicito descarga, cuando accedo, entonces solo el titular (autenticado) puede descargar; el PDF corresponde bit-a-bit al certificado vigente.

#### US-057 — Re-emisión e invalidación por cambio de contenido

- **Épica:** E08
- **Historia:**
  Como usuario que obtiene un certificado,
  quiero que mi certificado se invalide si el contenido del lenguaje cambia significativamente y poder revalidar,
  para que la acreditación siga siendo confiable.
- **Prioridad:** MVP — Must
- **RF:** RF-CERT-005
- **UC:** UC-CERT-03
- **Criterios de aceptación:**
  - [ ] Dado que el contenido del lenguaje cambió de forma significativa, cuando se evalúa, entonces el certificado previo pasa a obsoleto y se me indica cómo revalidar.
  - [ ] Dado que revalido, cuando apruebo lo requerido, entonces se emite nuevo certificado y no coexisten dos vigentes para el mismo lenguaje.

#### US-058 — Un certificado por lenguaje (no duplicación)

- **Épica:** E08
- **Historia:**
  Como usuario que completa un curso,
  quiero que no se dupliquen certificados vigentes para el mismo lenguaje,
  para mantener trazabilidad clara.
- **Prioridad:** MVP — Must
- **RF:** RF-CERT-001, RF-CERT-005
- **UC:** UC-CERT-01, UC-CERT-03
- **Criterios de aceptación:**
  - [ ] Dado que ya tengo certificado vigente para Python, cuando completo de nuevo todos los módulos, entonces no se crea duplicado vigente; se mantiene el existente salvo invalidación por contenido.

#### US-059 — Email verificado como requisito para certificado

- **Épica:** E08
- **Historia:**
  Como usuario que obtiene un certificado,
  quiero que el sistema exija email verificado antes de emitir,
  para asegurar titularidad.
- **Prioridad:** MVP — Must
- **RF:** RF-AUTH-005, RF-CERT-001
- **UC:** UC-CERT-01
- **Criterios de aceptación:**
  - [ ] Dado que no verifiqué email, cuando intento generar certificado pese a tener todos los módulos aprobados, entonces se me pide verificar antes de emitir.

#### US-060 — Consultar certificados desde el perfil

- **Épica:** E08
- **Historia:**
  Como usuario recurrente,
  quiero ver y descargar mis certificados desde el perfil,
  para acceder rápidamente a mis acreditaciones.
- **Prioridad:** MVP — Must
- **RF:** RF-PROF-005, RF-CERT-001
- **UC:** UC-PROF-04, UC-CERT-04
- **Criterios de aceptación:**
  - [ ] Dado que accedo a perfil → certificados, cuando se listan, entonces veo cada certificado con ID, lenguaje, fecha y acción de descarga PDF.

---

### E09 — Monetización — Gratuito y Premium

#### US-061 — Experiencia gratuita con publicidad no intrusiva

- **Épica:** E09
- **Historia:**
  Como usuario gratuito,
  quiero ver publicidad solo entre secciones completadas,
  para aprender sin interrupciones durante ejercicios.
- **Prioridad:** MVP — Must
- **RF:** RF-ADS-001, RF-ADS-002, RF-ADS-003, RF-ADS-005
- **UC:** UC-ADS-01
- **Criterios de aceptación:**
  - [ ] Dado que soy gratuito y completé una sección, cuando veo recompensa, entonces aparece anuncio entre secciones y nunca durante ejercicio/quiz/examen.
  - [ ] Dado que el proveedor de anuncios falla o es lento, cuando cargo la siguiente sección, entonces el aprendizaje no se bloquea (carga asíncrona, degradado).

#### US-062 — Sin tracking invasivo en publicidad

- **Épica:** E09
- **Historia:**
  Como usuario gratuito,
  quiero que la publicidad no use tracking invasivo,
  para preservar mi privacidad.
- **Prioridad:** MVP — Must
- **RF:** RF-ADS-004
- **UC:** UC-ADS-02
- **Criterios de aceptación:**
  - [ ] Dado que veo anuncios, cuando se registran impresiones/clics, entonces solo se usan métricas esenciales sin fingerprinting ni cross-site tracking (RNF-039, RNF-040).

#### US-063 — Activar premium y eliminar anuncios

- **Épica:** E09
- **Historia:**
  Como usuario premium,
  quiero activar el plan premium de USD $1/mes y dejar de ver anuncios,
  para tener experiencia continua sin interrupciones.
- **Prioridad:** MVP — Must
- **RF:** RF-PREM-001, RF-PREM-004, RF-PREM-005
- **UC:** UC-PREM-01, UC-PREM-03
- **Criterios de aceptación:**
  - [ ] Dado que activo premium (pasarela abstraída), cuando se confirma, entonces dejo de ver anuncios de forma inmediata en toda la experiencia.
  - [ ] Dado que mi suscripción está activa, cuando navego, entonces nunca veo intersticial de publicidad.

#### US-064 — Ciclo de suscripción (renovación, expiración, cancelación)

- **Épica:** E09
- **Historia:**
  Como usuario premium,
  quiero gestionar mi suscripción (renovar, cancelar, ver expiración),
  para controlar mi gasto y acceso.
- **Prioridad:** MVP — Must
- **RF:** RF-PREM-002, RF-PREM-006
- **UC:** UC-PREM-02
- **Criterios de aceptación:**
  - [ ] Dado que estoy suscrito, cuando consulto estado, entonces veo `activa` / `expirada` / `cancelada` con fechas y, al expirar/cancelar, vuelvo a plan gratuito sin perder progreso.
  - [ ] Dado que ocurre un evento de facturación, cuando se registra, entonces queda auditado sin almacenar datos de tarjeta en el núcleo.

#### US-065 — Progreso conservado al cambiar de plan

- **Épica:** E09
- **Historia:**
  Como usuario premium,
  quiero que mi progreso se conserve al cambiar de plan,
  para no temer al cambiar de suscripción.
- **Prioridad:** MVP — Must
- **RF:** RF-PREM-003, RF-PROG-001
- **UC:** UC-PREM-02
- **Criterios de aceptación:**
  - [ ] Dado que paso de gratuito a premium o viceversa, cuando se efectúa el cambio, entonces mi progreso, XP, rachas y logros permanecen intactos.

#### US-066 — Premium sin contenido exclusivo en MVP

- **Épica:** E09
- **Historia:**
  Como usuario gratuito,
  quiero que el premium en MVP solo elimine anuncios y no bloquee contenido,
  para que el aprendizaje sea accesible para todos.
- **Prioridad:** MVP — Must
- **RF:** RF-PREM-001
- **UC:** UC-PREM-01
- **Criterios de aceptación:**
  - [ ] Dado que soy gratuito, cuando accedo a módulos/lecciones/quizzes/exámenes, entonces tengo acceso completo al mismo contenido que un premium; la única diferencia es la publicidad.

---

### E10 — Administración de Contenido

#### US-067 — CRUD de estructura educativa

- **Épica:** E10
- **Historia:**
  Como administrador,
  quiero crear, editar y eliminar lenguajes, módulos, secciones y lecciones validando la jerarquía,
  para mantener la oferta educativa.
- **Prioridad:** MVP — Must
- **RF:** RF-ADM-001, RF-ADM-006
- **UC:** UC-ADM-01, UC-ADM-02
- **Criterios de aceptación:**
  - [ ] Dado que creo un módulo, cuando guardo, entonces se valida `Lenguaje → Módulo → Sección → Lección` sin ciclos ni huérfanos.
  - [ ] Dado que intento publicar con referencias rotas, cuando valido, entonces se rechaza con errores accionables.

#### US-068 — CRUD de preguntas con versionado

- **Épica:** E10
- **Historia:**
  Como administrador,
  quiero gestionar el banco de preguntas con versionado,
  para corregir sin reescribir el historial de intentos.
- **Prioridad:** MVP — Must
- **RF:** RF-ADM-002, RF-PREG-002, RF-PREG-006, RF-EVAL-003
- **UC:** UC-ADM-03
- **Criterios de aceptación:**
  - [ ] Dado que edito una pregunta publicada, cuando guardo, entonces se crea nueva versión y los intentos previos conservan la versión original.
  - [ ] Dado que creo una pregunta, cuando la guardo, entonces se valida tipo, dificultad, respuestas y explicación completas.

#### US-069 — Publicar y ocultar sin despliegue

- **Épica:** E10
- **Historia:**
  Como administrador,
  quiero publicar u ocultar contenido sin desplegar código, con efecto inmediato o programado,
  para operar con agilidad.
- **Prioridad:** MVP — Must
- **RF:** RF-ADM-003, RF-ADM-005
- **UC:** UC-ADM-02
- **Criterios de aceptación:**
  - [ ] Dado que publico un módulo, cuando confirmo, entonces queda disponible en < 5 min sin rebuild y con versión trazable por intento (RNF-017).
  - [ ] Dado que programo publicación futura, cuando llega la fecha, entonces se publica automáticamente.

#### US-070 — Configurar umbrales, XP y composición sin código

- **Épica:** E10
- **Historia:**
  Como administrador,
  quiero configurar umbrales (70/80), valores de XP, orden de módulos y composición de quizzes/exámenes sin código,
  para ajustar la experiencia sin depender de desarrollo.
- **Prioridad:** MVP — Must
- **RF:** RF-ADM-004, RF-EVAL-005, RF-XP-004
- **UC:** UC-ADM-04
- **Criterios de aceptación:**
  - [ ] Dado que cambio umbral o XP, cuando guardo, entonces aplica a intentos futuros, conservando umbral histórico por intento previo.
  - [ ] Dado que reordeno módulos, cuando publico, entonces la ruta refleja el nuevo orden sin cambios en motor.

#### US-071 — Validación de coherencia antes de publicar

- **Épica:** E10
- **Historia:**
  Como administrador,
  quiero que el sistema valide coherencia antes de publicar (IDs únicos, prerrequisitos sin ciclos, referencias íntegras),
  para evitar contenido roto en producción.
- **Prioridad:** MVP — Must
- **RF:** RF-ADM-006
- **UC:** UC-ADM-02
- **Criterios de aceptación:**
  - [ ] Dado que intento publicar con IDs duplicados o ciclo en prerrequisitos, cuando valido, entonces se bloquea publicación con detalle de errores.
  - [ ] Dado que todo es coherente, cuando publico, entonces pasa validación y queda disponible.

#### US-072 — Auditoría y control de acceso administrativo

- **Épica:** E10
- **Historia:**
  Como administrador,
  quiero que toda operación administrativa esté restringida por RBAC y auditada,
  para trazar quién cambió qué y cuándo.
- **Prioridad:** MVP — Must (RBAC mínimo + auditoría); Post-MVP (flujo autor/revisor/publicador)
- **RF:** RF-ADM-007, RF-ADM-008, RF-ADM-009
- **UC:** UC-ADM-05
- **Criterios de aceptación:**
  - [ ] Dado que no tengo rol administrador, cuando intento acceder a administración, entonces recibo 403.
  - [ ] Dado que publico contenido, cuando se registra auditoría, entonces queda quién, qué, cuándo y versión anterior/nueva.
  - [ ] Post-MVP: Dado que existe flujo autor→revisor→publicador, cuando propongo contenido, entonces pasa por estados borrador→revisión→publicado.

---

## 5. Trazabilidad

### 5.1 Cobertura RF → US

| RF | US que lo cubren |
|---|---|
| RF-AUTH-001 | US-001 |
| RF-AUTH-002 | US-002 |
| RF-AUTH-003 | US-003 |
| RF-AUTH-004 | US-004 |
| RF-AUTH-005 | US-005, US-059 |
| RF-AUTH-006 | US-002 |
| RF-AUTH-007 | US-002 |
| RF-AUTH-008 | US-001, US-003, US-004 |
| RF-USR-001 | US-001 |
| RF-USR-002 | US-006 |
| RF-USR-003 | US-007 |
| RF-USR-004 | US-007 |
| RF-USR-005 | US-001 |
| RF-USR-006 | US-007 |
| RF-PROF-001 | US-008 |
| RF-PROF-002 | US-009 |
| RF-PROF-003 | US-008 |
| RF-PROF-004 | US-010 |
| RF-PROF-005 | US-010, US-060 |
| RF-PROF-006 | US-008 |
| RF-PROF-007 | US-008 |
| RF-LANG-001 | US-013 |
| RF-LANG-002 | US-013 |
| RF-LANG-003 | US-014 |
| RF-LANG-004 | US-029 |
| RF-LANG-005 | US-014 |
| RF-LVL-001 | US-015 |
| RF-LVL-002 | US-015 |
| RF-LVL-003 | US-015 |
| RF-LVL-004 | US-022 |
| RF-DIAG-001 | US-016 |
| RF-DIAG-002 | US-016 |
| RF-DIAG-003 | US-017 |
| RF-DIAG-004 | US-021 |
| RF-DIAG-005 | US-016 |
| RF-DIAG-006 | US-016 |
| RF-RUTA-001 | US-017 |
| RF-RUTA-002 | US-018 |
| RF-RUTA-003 | US-050 |
| RF-RUTA-004 | US-019, US-037 |
| RF-RUTA-005 | US-020 |
| RF-MOD-001 | US-018, US-023 |
| RF-MOD-002 | US-023 |
| RF-MOD-003 | US-018, US-019 |
| RF-MOD-004 | US-029 |
| RF-MOD-005 | US-023 |
| RF-SEC-001 | US-025 |
| RF-SEC-002 | US-024 |
| RF-SEC-003 | US-025 |
| RF-SEC-004 | US-012 |
| RF-SEC-005 | US-030 |
| RF-LEC-001 | US-024 |
| RF-LEC-002 | US-020, US-028 |
| RF-LEC-003 | US-025, US-026 |
| RF-LEC-004 | US-024 |
| RF-LEC-005 | US-027 |
| RF-PREG-001 | US-031 |
| RF-PREG-002 | US-031, US-068 |
| RF-PREG-003 | US-024 |
| RF-PREG-004 | US-024, US-032 |
| RF-PREG-005 | US-026 |
| RF-PREG-006 | US-068 |
| RF-PREG-007 | US-031 |
| RF-QUIZ-001 | US-033 |
| RF-QUIZ-002 | US-033 |
| RF-QUIZ-003 | US-033 |
| RF-QUIZ-004 | US-034 |
| RF-QUIZ-005 | US-035 |
| RF-QUIZ-006 | US-033 |
| RF-EXAM-001 | US-036 |
| RF-EXAM-002 | US-036 |
| RF-EXAM-003 | US-036 |
| RF-EXAM-004 | US-037 |
| RF-EXAM-005 | US-038 |
| RF-EXAM-006 | US-039 |
| RF-EXAM-007 | US-036 |
| RF-EVAL-001 | US-040 |
| RF-EVAL-002 | US-040 |
| RF-EVAL-003 | US-040 |
| RF-EVAL-004 | US-039, US-050 |
| RF-EVAL-005 | US-040, US-070 |
| RF-EVAL-006 | US-040 |
| RF-PROG-001 | US-026 |
| RF-PROG-002 | US-008 |
| RF-PROG-003 | US-008 |
| RF-PROG-004 | US-020, US-028 |
| RF-PROG-005 | US-011 |
| RF-PROG-006 | US-030 |
| RF-XP-001 | US-041 |
| RF-XP-002 | US-042 |
| RF-XP-003 | US-042 |
| RF-XP-004 | US-043, US-070 |
| RF-XP-005 | US-041 |
| RF-RACHA-001 | US-044 |
| RF-RACHA-002 | US-045 |
| RF-RACHA-003 | US-044 |
| RF-RACHA-004 | US-044 |
| RF-RACHA-005 | US-044 |
| RF-LOGRO-001 | US-046, US-047 |
| RF-LOGRO-002 | US-046, US-047 |
| RF-LOGRO-003 | US-048 |
| RF-LOGRO-004 | US-049 |
| RF-LOGRO-005 | US-047 |
| RF-REP-001 | US-050 |
| RF-REP-002 | US-050 |
| RF-REP-003 | US-051 |
| RF-REP-004 | US-053 |
| RF-REP-005 | US-052 |
| RF-CERT-001 | US-054, US-058, US-059 |
| RF-CERT-002 | US-054 |
| RF-CERT-003 | US-054 |
| RF-CERT-004 | US-055 |
| RF-CERT-005 | US-057, US-058 |
| RF-CERT-006 | US-055 |
| RF-PDF-001 | US-056 |
| RF-PDF-002 | US-056 |
| RF-PDF-003 | US-056 |
| RF-PDF-004 | US-056 |
| RF-ADS-001 | US-061 |
| RF-ADS-002 | US-061 |
| RF-ADS-003 | US-061 |
| RF-ADS-004 | US-062 |
| RF-ADS-005 | US-061 |
| RF-PREM-001 | US-063, US-066 |
| RF-PREM-002 | US-064 |
| RF-PREM-003 | US-065 |
| RF-PREM-004 | US-063 |
| RF-PREM-005 | US-063 |
| RF-PREM-006 | US-064 |
| RF-ADM-001 | US-067, US-029 |
| RF-ADM-002 | US-068 |
| RF-ADM-003 | US-069 |
| RF-ADM-004 | US-070 |
| RF-ADM-005 | US-069 |
| RF-ADM-006 | US-071 |
| RF-ADM-007 | US-072 |
| RF-ADM-008 | US-072 |
| RF-ADM-009 | US-072 |

> Ningún `RF` queda sin historia. Verificación automatizable: cada `RF` debe tener ≥1 test en `20` que ejercite su `US`.

### 5.2 Cobertura por tipo de usuario solicitado

| Tipo de usuario solicitado | Historias representativas |
|---|---|
| Usuario nuevo | US-001, US-005, US-013, US-015, US-016, US-017, US-024 |
| Usuario recurrente | US-002, US-008, US-014, US-018, US-020, US-025, US-033–US-040, US-041, US-044, US-050 |
| Usuario avanzado | US-016, US-017, US-019, US-021 |
| Usuario premium | US-063, US-064, US-065 |
| Usuario que completa un curso | US-054, US-058 |
| Usuario que obtiene un certificado | US-054, US-055, US-056, US-057, US-059, US-060 |
| Administrador | US-029, US-030, US-043, US-049, US-067–US-072 |

### 5.3 Resumen de prioridades

| Prioridad | Cantidad | IDs |
|---|---|---|
| MVP — Must | 62 | US-001–US-008, US-010, US-012–US-020, US-023–US-026, US-028–US-029, US-031–US-048, US-050–US-051, US-053–US-072 |
| MVP — Should | 9 | US-009, US-011, US-021, US-022, US-027, US-030, US-049, US-052 |
| Post-MVP (parte de Must) | 1 | US-072 (flujo autor/revisor) |

---

## 6. Criterio de aceptación global

Una historia se considera **aceptada** solo si:

1. Cumple todos sus criterios de aceptación verificables en `staging` con datos de prueba.
2. Tiene `UC` en `08` que la ejercita end-to-end y `RF` trazado en `05`.
3. Tiene prueba en `20` (unitaria/integración/API/UI según pirámide) que pasa y está vinculada en la matriz.
4. La API que la expone está documentada en `13` y el dato persiste según `12`.

---

## 7. Referencias

- `01_PROJECT_OVERVIEW.md` — flujo principal §5, filosofía §6, estructura §7, diagnóstico §8, gamificación §17–§19, certificación §21–§22, modelo §23
- `02_PROBLEM_STATEMENT.md` — PS-01 a PS-10 y usuarios afectados §5
- `03_OBJECTIVES.md` — OE, OED, OUX, OT y criterios §7
- `04_SCOPE.md` — MVP §2, Post-MVP §3, límites §5–§8, anti-scope-creep §10
- `05_FUNCTIONAL_REQUIREMENTS.md` — 128 RF por dominio
- `06_NON_FUNCTIONAL_REQUIREMENTS.md` — RNF de rendimiento, seguridad, usabilidad y disponibilidad
- `08_USE_CASES.md` — casos de uso formales (UC-*)
- `09_USER_FLOWS.md` — flujos navegables con Mermaid

---

*Fin de `07_USER_STORIES.md` — cualquier adición, cambio de prioridad o nueva historia requiere actualizar `05`, `08`, `12`, `13` y `CHANGELOG.md` con fecha `America/Bogota`.*
