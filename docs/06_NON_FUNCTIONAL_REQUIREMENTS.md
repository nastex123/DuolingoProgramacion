# 06 — Requisitos No Funcionales

> **Estado:** En planificación · **Versión del documento:** 1.0.0 · **Fecha:** 2026-08-29
> Complementa a `01_PROJECT_OVERVIEW.md`, `02_PROBLEM_STATEMENT.md`, `03_OBJECTIVES.md` y `04_SCOPE.md`. Especifica **cómo debe comportarse el sistema**, no qué hace (ver `05` para el qué). Referencia arquitectura (`11`), datos (`12`), seguridad (`19`), despliegue (`21`) y pruebas (`20`) sin duplicarlos.

---

## 1. Propósito y alcance

Este documento establece los atributos de calidad que el sistema debe satisfacer para ser usable, seguro, mantenible y escalable. Cada requisito incluye una métrica objetivo y un método de verificación objetiva; sin ambos, no es aceptable como RNF.

**Fuera de alcance:** requisitos funcionales (`05`), casos de uso (`08`) y roadmap temporal (`22`). Las decisiones de tecnología concreta se documentan en `09-decisions/`; aquí se especifican exigencias, no soluciones.

---

## 2. Convenciones

### 2.1 Formato de ID

`RNF-{NNN}` correlativo global con ceros (ej. `RNF-001`). La categoría se indica en columna dedicada para filtrado; no forma parte del ID para mantener estabilidad ante reclasificaciones.

### 2.2 Atributos por requisito

| Columna | Valores |
|---|---|
| **Categoría** | Una de §3: Rendimiento, Escalabilidad, Seguridad, Disponibilidad, Mantenibilidad, Usabilidad, Accesibilidad, Compatibilidad, Modularidad, Tiempo de respuesta, Integridad de datos, Privacidad, Recuperación ante errores |
| **Tipo** | `Obligatorio` (bloquea aceptación del MVP si se incumple) / `Recomendación` (exigible en Post-MVP o cuando el costo lo justifique; se mide igual) |
| **Métrica objetivo** | Valor cuantitativo o criterio binario verificable |
| **Cómo se verifica** | Instrumento, entorno y frecuencia (ver `20_TESTING.md` y `21_DEPLOYMENT.md`) |
| **Entrega** | `MVP` / `Post-MVP` (coherente con `04_SCOPE.md`) |

### 2.3 Obligatorio vs. recomendación

- **Obligatorio:** debe cumplirse en la entrega indicada; su incumplimiento es defecto bloqueante. Se exige evidencia en `20` y `21` (tests, métricas, auditoría).
- **Recomendación:** el sistema se diseña para alcanzarla sin re-arquitectura (ver `11`), pero puede entregarse con cumplimiento parcial documentado y plan de cierre en `22`. No se usa como excusa para deuda técnica indefinida.

### 2.4 Principio de no-asunción tecnológica

Cuando se menciona una técnica o herramienta (ej. CDN, caché, WAF, S3-compatible, OpenAPI), se hace como **ejemplo de verificación o interfaz**, no como elección cerrada. La elección concreta requiere ADR en `09-decisions/` si es arquitectónica.

---

## 3. Requisitos por categoría

### 3.1 Rendimiento

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-001 | El sistema debe mantener rendimiento estable bajo carga nominal de MVP sin degradar la experiencia de aprendizaje. | Obligatorio | p95 de latencia de lectura de lección/pregunta < 300 ms en red de referencia (ver RNF-010); p95 de envío de respuesta < 500 ms. Carga nominal inicial: 100 usuarios concurrentes. | Pruebas de carga en `staging` con k6/JMeter o equivalente; APM (`21`) con percentiles p50/p95/p99 por endpoint; reporte por versión. | MVP |
| RNF-002 | El sistema debe soportar picos breves sin colapso. | Obligatorio | Hasta 3× carga nominal (300 concurrentes) durante 5 min con tasa de error < 1% y sin pérdida de intentos ya enviados. | Prueba de pico/spike en `staging` (ver `20` § pruebas no funcionales); ensayo de degradado: lecturas deben seguir disponibles aunque la cola de escritura tenga retardo. | MVP |
| RNF-003 | El sistema debe paginar/listar colecciones grandes sin transferir volúmenes excesivos. | Obligatorio | Listados (módulos, preguntas, historial) paginados; ninguna respuesta > 100 ítems sin paginación; tamaño de payload de lección < 200 KB JSON sin assets. | Revisión de contrato OpenAPI (`13`); test de integración que falla si un listado no pagina; inspección de payload en CI. | MVP |
| RNF-004 | El sistema debe optimizar entrega de assets estáticos de lecciones y PDFs. | Recomendación | Assets (imágenes, PDFs) servidos con caché HTTP y compresión; tiempo de descarga de PDF de certificado < 3 s en 3G simulado. | Lighthouse / WebPageTest en `staging`; cabeceras `Cache-Control`/`ETag` verificadas en test; métrica RUM si se habilita. | MVP (básico) → Post-MVP (CDN) |

### 3.2 Escalabilidad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-005 | La arquitectura debe permitir escalar horizontalmente la capa de aplicación sin re-arquitectura. | Obligatorio | Añadir una réplica de app reduce p95 de latencia bajo carga o aumenta throughput linealmente en prueba controlada; sin estado local pegajoso que impida balanceo. | ADR de arquitectura (`11`); prueba de escalado en `staging` con 1→2 réplicas; verificación de sesiones stateless (JWT/token) y almacenamiento externo. | MVP |
| RNF-006 | El contenido debe escalar sin tocar el motor. | Obligatorio | Agregar un lenguaje nuevo = solo contenido + configuración + migración de datos de contenido; 0 cambios en código del motor; tiempo de incorporación de un lenguaje de referencia < 5 días-hombre de autoría (no incluye creación pedagógica). | Ensayo en `staging` con lenguaje de prueba (ej. Lua mínimo con 1 módulo); checklist de `23_CONTENT_SPECIFICATION.md`; revisión de que no hay hardcodeo de `Python` en el motor. | MVP |
| RNF-007 | El sistema debe escalar en datos sin degradar consultas críticas. | Recomendación | Consultas de progreso/ruta por usuario < 100 ms p95 con 100k intentos en tabla de intentos; índices y plan de consulta documentados. | `EXPLAIN ANALYZE` en `staging` con dataset sintético; pruebas de volumen en `20`; revisión de `12_DATA_MODEL.md`. | MVP (índices base) → Post-MVP (particionado si se justifica) |

### 3.3 Seguridad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-008 | Autenticación y contraseñas deben seguir prácticas vigentes sin inventar criptografía propia. | Obligatorio | Contraseñas hasheadas con función adaptativa (ej. Argon2/bcrypt, factor calibrado); tokens con expiración corta y refresh rotativo; ningún secreto en repositorio ni en logs. | Revisión de código + test unitario de hash/verify; escáner de secretos en CI; auditoría de `19_SECURITY.md`; prueba de expiración/refresh. | MVP |
| RNF-009 | El sistema debe proteger contra OWASP Top 10 relevante para web/API. | Obligatorio | Validación y saneamiento en servidor para toda entrada; protección contra inyección, XSS, CSRF (donde aplique), IDOR/Broken Access Control; cabeceras de seguridad base. | Tests de seguridad en `20` (inyección, IDOR, XSS almacenado); revisión de `19`; escáner SAST/DAST en pipeline; checklist OWASP ASVS nivel 1 en `staging`. | MVP |

### 3.4 Tiempo de respuesta (subconjunto medible de rendimiento, ver `03` OUX-03)

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-010 | Feedback inmediato en ejercicios. | Obligatorio | Respuesta a envío de ejercicio individual < 1 s extremo a extremo en p95 (ver `03` OUX-03); indicador de carga si supera 500 ms. | Medición RUM + APM en `staging`/`prod`; test E2E que mide tiempo de feedback y falla si > 1 s p95 en 100 intentos. | MVP |
| RNF-011 | Navegación entre lecciones/secciones sin espera perceptible. | Obligatorio | Transición lección→siguiente < 500 ms p95 (contenido ya cacheado en cliente tras primera carga); carga inicial de lección < 1,5 s en 4G simulado. | Lighthouse performance + test E2E con throttling; métricas de `26_ANALYTICS.md` (tiempo hasta siguiente lección). | MVP |
| RNF-012 | Calificación de quiz/examen con respuesta en tiempo interactivo. | Obligatorio | Resultado de quiz/examen disponible < 2 s tras envío en p95, incluyendo cálculo y persistencia. | Test de carga del motor de evaluación (`15`, `05` RF-EVAL-001) con 50 envíos concurrentes; APM por endpoint. | MVP |

### 3.5 Disponibilidad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-013 | El sistema debe estar disponible para aprendizaje en horario de uso principal. | Obligatorio | Disponibilidad mensual ≥ 99,5% en `prod` (ventana de mantenimiento programada excluida y comunicada). Sin punto único de fallo en capa de app y BD con backups. | Monitor sintético + uptime check (`21`); reporte mensual de `21`; ensayo de reinicio de réplica sin downtime. | MVP |
| RNF-014 | Degradado elegante ante fallo de dependencias no críticas. | Obligatorio | Fallo de servicio de email, anuncios o generación de PDF no impide completar lecciones/quizzes/exámenes; el usuario ve mensaje no bloqueante y el intento se registra. | Test de caos controlado en `staging` (deshabilitar mock de email/ads); verificación de `04` §9 y `RF-ADS-003`. | MVP |
| RNF-015 | Despliegue sin downtime para el usuario. | Recomendación | Deploy a `prod` con estrategia rolling/blue-green; 0 errores 5xx por despliegue en ventana de 5 min post-deploy. | Pipeline de `21` con health checks y rollback automático; verificación de logs y métricas tras cada deploy. | MVP (rolling básico) → Post-MVP (blue-green) |

### 3.6 Mantenibilidad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-016 | El código debe ser testeable y con cobertura mínima en el núcleo educativo. | Obligatorio | Cobertura de líneas ≥ 70% en motores Learning/Question/Evaluation/Progress/Gamification/Certification; toda `RF` Must tiene al menos 1 test asociado. | Reporte de cobertura en CI (`20`); matriz `RF`→test en `20`; fallo de CI si cobertura < umbral. | MVP |
| RNF-017 | Cambios de contenido y configuración sin despliegue de código. | Obligatorio | Umbrales, XP, orden de módulos, composición de quizzes/exámenes y contenido versionado se cambian vía `25`/config y se reflejan sin rebuild (ver `05` RF-ADM-003/004). | Prueba de cambio en `staging` sin deploy: modificar XP/umbral y verificar efecto en < 5 min; revisión de `11` y `23`. | MVP |
| RNF-018 | Observabilidad mínima para operar y depurar. | Obligatorio | Logs estructurados con correlación por request/usuario anonimizado; métricas de negocio (intentos, aprobaciones, rachas) y técnicas (latencia, errores, uso de recursos) en `21`/`26`; trazas por endpoint crítico. | Inspección de `21`; test que verifica que un error 5xx genera log con `request_id` y no expone stack al cliente. | MVP |
| RNF-019 | Documentación y decisiones trazables. | Obligatorio | Toda decisión arquitectónica relevante tiene ADR en `09-decisions/`; `CHANGELOG.md` refleja cada cambio con fecha `America/Bogota`; `01`–`27` sin contradicciones. | Revisión de `09` y `CHANGELOG.md` en cada PR; checklist de `03` §7.3. | MVP |

### 3.7 Usabilidad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-020 | Onboarding hasta la primera lección en < 3 minutos. | Obligatorio | Tiempo mediano registro→primera lección < 3 min en test con 5 usuarios nuevos sin ayuda (ver `03` OUX-01). | Test de usabilidad moderado (`20`/`26`); analytics de funnel en `staging`/`prod`. | MVP |
| RNF-021 | Navegación siempre revela dónde estoy. | Obligatorio | Jerarquía `Lenguaje → Módulo → Sección → Lección` visible en toda vista de aprendizaje (ver `03` OUX-02, `05` RF-SEC-004). | Heurística de `10_INFORMATION_ARCHITECTURE.md`; test UI que falla si breadcrumb/contexto no está presente. | MVP |
| RNF-022 | Feedback de error pedagógico, no técnico. | Obligatorio | Todo error de validación/evaluación muestra mensaje en lenguaje del usuario, causa y siguiente paso; nunca stack traces ni códigos internos. | Revisión de `15` y `05` RF-PREG-004/RF-QUIZ-004; test UI de casos de error. | MVP |
| RNF-023 | Sesión reanudable sin pérdida percibida. | Obligatorio | Abandonar y retomar lección restaura posición exacta y respuestas ya enviadas en < 2 s (ver `03` OUX-04, `05` RF-LEC-002). | Test E2E de reanudación (cerrar pestaña, reabrir, verificar estado); verificación de `RF-PROG-001`. | MVP |

### 3.8 Accesibilidad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-024 | Cumplimiento de accesibilidad base. | Obligatorio | WCAG 2.1 AA en flujos críticos (registro, lección, quiz, examen, perfil, certificado) — ver `03` OUX-06. | Auditoría con axe/Lighthouse accessibility ≥ 95 en `staging`; revisión manual de teclado y lector de pantalla en flujos críticos; checklist en `27_UI_DESIGN.md`. | MVP |
| RNF-025 | Navegación por teclado y foco visible. | Obligatorio | Todos los controles interactivos alcanzables por teclado en orden lógico; foco visible; sin trampas de teclado. | Test manual con solo teclado + axe; test E2E que navega quiz completo sin mouse. | MVP |
| RNF-026 | Contraste y tipografía legible. | Obligatorio | Contraste AA, tipografía escalable y espaciado que no rompe layout a 200% de zoom. | Lighthouse + inspección visual a 200% en `staging`; guía de `27`. | MVP |

### 3.9 Compatibilidad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-027 | Web responsive mobile-first. | Obligatorio | Layout funcional en 360×640, 768×1024 y 1280×800 sin scroll horizontal; touch targets ≥ 44×44 px; ver `04` §5 y `03` OUX-06. | Test visual en 3 viewports en `staging`; Lighthouse mobile; pruebas en `20` con Playwright/Cypress. | MVP |
| RNF-028 | Compatibilidad de navegadores objetivo. | Obligatorio | Funciona en últimas 2 versiones estables de Chrome, Firefox, Edge y Safari (desktop y mobile) sin polyfills invasivos. | Matriz de compatibilidad en `20`; test automatizado en 2 motores (Chromium + WebKit/Firefox) en CI. | MVP |
| RNF-029 | Sin dependencia de plugins ni instalación. | Obligatorio | Acceso vía navegador estándar sin extensiones, sin Flash/Java ni instalación nativa en MVP (ver `04` §5). | Verificación de `10` y `11`; test de acceso en navegador limpio. | MVP |

### 3.10 Modularidad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-030 | Separación de responsabilidades por motor. | Obligatorio | Motores `Learning`, `Question`, `Evaluation`, `Progress`, `Gamification`, `Certification` desacoplados con contratos estables (ver `01` §24, `03` OT-01, `11`). Cambio en Gamificación no exige cambiar Evaluation. | Revisión de `11_SYSTEM_ARCHITECTURE.md`; análisis de dependencias (import graph) en CI que falla si hay acoplamiento prohibido. | MVP |
| RNF-031 | Contenido desacoplado del código. | Obligatorio | Contenido en formato declarativo versionado (`23`); ningún texto de lección ni pregunta hardcodeado en UI/motor. | Grep en CI que falla si se detectan literales de contenido fuera de `23`; ensayo `RNF-006`. | MVP |
| RNF-032 | Contratos de API versionados y documentados. | Obligatorio | API REST versionada (`/v1`), autenticada y documentada en OpenAPI (`13`); cambio breaking exige nueva versión, no ruptura silenciosa (ver `03` OT-04). | Lint de OpenAPI en CI; test de compatibilidad de contrato; revisión de `13`. | MVP |

### 3.11 Integridad de datos

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-033 | Persistencia atómica de intentos. | Obligatorio | Cada respuesta/intento de quiz/examen se persiste transaccionalmente; ningún intento queda a medias ante fallo de red/servidor (ver `05` RF-EVAL-003, RF-PROG-001). | Tests de integración con fallo inyectado (kill de request a mitad); verificación de transacciones en `12`; idempotencia por `Idempotency-Key` o equivalente. | MVP |
| RNF-034 | Consistencia de progreso y certificabilidad. | Obligatorio | Progreso, XP, rachas y estado de módulo son consistentes tras reintentos, re-diagnóstico y cambio de lenguaje; un certificado solo se emite si todos los exámenes están aprobados en la versión vigente (ver `04` §7). | Tests de invariantes en `20` (propiedad: `lenguaje completado ↔ todos los exámenes aprobados`); auditoría de `17`. | MVP |
| RNF-035 | Versionado de contenido con trazabilidad. | Obligatorio | Cada intento guarda la versión de contenido evaluada; cambios de contenido no reescriben historial (ver `05` RF-ADM-005, RF-PREG-006). | Inspección de `12` y `23`; test que modifica una pregunta y verifica que intentos previos conservan versión original. | MVP |
| RNF-036 | Validación de integridad referencial. | Obligatorio | No existen huérfanos: toda pregunta referencia lenguaje/módulo/sección válidos; todo certificado referencia usuario y lenguaje válidos; validación en servidor y en BD (FKs). | Migraciones con FKs en `12`; test de validación `RF-ADM-006` que intenta publicar contenido roto y debe ser rechazado. | MVP |

### 3.12 Privacidad

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-037 | Minimización y protección de datos personales. | Obligatorio | Solo se recogen datos necesarios para `01` §21 y operación (nombre, email, documento para certificado, progreso); ningún dato sensible se expone en logs, URLs ni respuestas a terceros. | Revisión de `12` y `19`; test que inspecciona logs y respuestas API en busca de PII inesperada; checklist de `06` vs. `26` (analytics esencial, sin tracking cross-site). | MVP |
| RNF-038 | Derechos del titular (acceso, rectificación, eliminación). | Obligatorio | Usuario puede consultar, rectificar y solicitar eliminación/anonimización de sus datos (ver `05` RF-USR-003/006) con respuesta en ≤ 30 días. | Test E2E de flujo de eliminación/anonimización; verificación de `19` y de que certificados anonimizados no re-identifican. | MVP |
| RNF-039 | Consentimiento y transparencia. | Obligatorio | Política de privacidad y términos accesibles antes del registro; consentimiento explícito para email y analytics esencial; sin fingerprinting ni tracking cross-site en MVP (ver `04` §4). | Revisión de `27` y `26`; test que verifica banner/consentimiento y que sin consentimiento no se cargan scripts de terceros no esenciales. | MVP |
| RNF-040 | Retención y seudonimización en analytics. | Recomendación | Métricas de `26` seudonimizadas; retención máxima documentada y configurable; ningún dato de progreso se comparte con red de anuncios. | Revisión de `26` y `18`; inspección de payloads a terceros en `staging`. | MVP (diseño) → Post-MVP (auditoría externa si se requiere) |

### 3.13 Recuperación ante errores

| ID | Descripción | Tipo | Métrica objetivo | Cómo se verifica | Entrega |
|---|---|---|---|---|---|
| RNF-041 | Mensajes de error accionables y sin fuga de información. | Obligatorio | Todo error 4xx/5xx devuelve código estable, mensaje para usuario y `request_id` para soporte; nunca stack traces ni detalles internos al cliente. | Tests de API que provocan 400/401/403/404/409/422/500 y verifican contrato de error en `13`; revisión de `19`. | MVP |
| RNF-042 | Reintentos seguros para el usuario. | Obligatorio | Reintento de envío de respuesta/quiz/examen no duplica intentos ni XP (idempotencia `05` regla 3); el usuario ve confirmación clara de éxito o fallo. | Tests de idempotencia con doble envío del mismo `Idempotency-Key`; verificación de `RF-XP-005` y `RNF-033`. | MVP |
| RNF-043 | Backups y capacidad de restauración. | Obligatorio | Backup diario automatizado de BD y objetos (PDFs) con retención ≥ 7 días; restauración probada; RPO ≤ 24 h, RTO ≤ 4 h en `prod`. | Ensayo de restauración en `staging` por versión (ver `21`); reporte de `21` con fecha del último ensayo exitoso. | MVP |
| RNF-044 | Tolerancia a pérdida de conectividad del cliente. | Obligatorio | Pérdida de conexión durante lección no corrompe progreso; al reconectar, el cliente sincroniza y retoma sin pérdida de intentos ya confirmados en servidor. | Test E2E con corte de red simulado (offline/online) durante lección; verificación de `RF-PROG-004`. | MVP |
| RNF-045 | Trazabilidad de fallos para soporte. | Obligatorio | Cada fallo genera log estructurado con `request_id`, usuario anonimizado, endpoint, versión de contenido y marca temporal `America/Bogota`; disponible en `21` sin exponer PII. | Inspección de `21`; test que provoca fallo y verifica log con correlación. | MVP |

---

## 4. Resumen: obligatorios vs. recomendaciones

| Tipo | Cantidad | Entrega | Intención |
|---|---|---|---|
| **Obligatorio** | 40 | MVP (38) + Post-MVP (2 con base en MVP) | Bloquea aceptación del MVP; se exige evidencia en `20`/`21` y en `CHANGELOG.md`. |
| **Recomendación** | 5 | MVP con cumplimiento básico + Post-MVP completo | Diseño sin re-arquitectura desde MVP; cierre planificado en `22_ROADMAP.md`. |

Recomendaciones en este documento: `RNF-004` (CDN), `RNF-007` (particionado), `RNF-015` (blue-green), `RNF-040` (auditoría externa de privacidad). Todas tienen base obligatoria en MVP y evolución Post-MVP.

---

## 5. Verificación transversal

### 5.1 Matriz de verificación

| Método | RNF cubiertos | Frecuencia | Entorno |
|---|---|---|---|
| Tests unitarios/integración/API/UI (`20`) | RNF-001, 003, 008, 009, 016, 022, 033–036, 041, 042 | Cada PR / CI | `dev` + `staging` |
| Pruebas de carga/pico/volumen | RNF-001, 002, 007, 012 | Por versión y antes de release | `staging` |
| Lighthouse / axe / WebPageTest | RNF-004, 010, 011, 024–027 | Por versión | `staging` |
| Tests de usabilidad moderados (5 usuarios) | RNF-020, 021, 023 | Por hito (MVP y cada lenguaje nuevo) | `staging`/`prod` (cohorte) |
| Auditoría de seguridad (SAST/DAST, OWASP ASVS L1) | RNF-008, 009, 041 | Cada release | `staging` |
| Inspección de arquitectura y contratos | RNF-005, 006, 030–032, 017 | Cada ADR / PR relevante | Repo + `staging` |
| Uptime sintético + RUM/APM | RNF-001, 010–015, 018 | Continuo | `prod` |
| Ensayo de backup/restore y caos controlado | RNF-014, 043–045 | Mensual | `staging` |

### 5.2 Criterio de aceptación global

Un `RNF` se considera cumplido solo si:

1. La métrica objetivo está medida en el entorno indicado.
2. La evidencia está registrada (reporte de `20`/`21`/`26`, artefacto de CI o ADR).
3. La medición se repite sin regresión en la siguiente versión (no es un pico aislado).

---

## 6. Conflictos y trade-offs declarados

| Conflicto potencial | Decisión |
|---|---|
| Tiempo de respuesta vs. costo de infraestructura | Priorizar p95 < 1 s en feedback (`RNF-010`) sobre p99 extremo; escalar réplicas solo si `RNF-001` se incumple sostenidamente. |
| Disponibilidad 99,5% vs. multi-región | `RNF-013` exige 99,5% sin prometer multi-región en MVP (`04` §5); multi-región es Post-MVP si `26` lo justifica. |
| Analytics esencial vs. privacidad | `RNF-037`/`039` prevalecen sobre granularidad de `26`; ningún dato de progreso se comparte con ads (`RNF-040`). |
| Publicidad vs. rendimiento | `RNF-014` y `05` `RF-ADS-003` exigen carga asíncrona no bloqueante; anuncio lento nunca retrasa lección. |

> Cualquier trade-off que afecte un `RNF` obligatorio requiere ADR en `09-decisions/` y actualización de este documento y de `CHANGELOG.md`.

---

## 7. Trazabilidad a objetivos y problemas

| RNF | OE/OT/OUX (`03`) | PS (`02`) | RF relacionado (`05`) |
|---|---|---|---|
| RNF-001–004, 010–012 | OT-04, OUX-03 | PS-05 | RF-PREG-004, RF-EVAL-001, RF-QUIZ-003, RF-EXAM-003 |
| RNF-005–007, 030–032 | OT-01, OT-02, OT-03 | PS-09, causa estructural | RF-LANG-004, RF-MOD-004, RF-ADM-001/005 |
| RNF-008, 009, 037–040, 041 | OT-06 | — | RF-AUTH, RF-USR, RF-PREM |
| RNF-013–015, 043–045 | OT-07, OT-09 | — | RF-PROG-004, RF-ADS-003, RF-PDF-002 |
| RNF-016–019 | OT-08, OT-07 | — | Todos los `RF` Must |
| RNF-020–023 | OUX-01–05 | PS-01, PS-04, PS-06 | RF-LEC, RF-SEC, RF-RUTA-005 |
| RNF-024–029 | OUX-06 | PS-02 | RF-LEC-001, RF-PROF |

---

*Fin de `06_NON_FUNCTIONAL_REQUIREMENTS.md` — cualquier adición o relajación de un RNF obligatorio requiere ADR, actualización de `04_SCOPE.md` si afecta al MVP, y entrada en `CHANGELOG.md` con fecha `America/Bogota`.*
