# 04 — Alcance (Scope)

> Define con precisión qué **sí** y qué **no** incluye el proyecto. Complementa a `01`, `03` y `22_ROADMAP.md`. Si un elemento no aparece aquí, no debe implementarse sin actualizar este documento y `CHANGELOG.md`.

---

## 1. Principio

Priorizar un **MVP funcional con validación pedagógica inicial (Python 3.12)** y ruta troncal de 12 módulos (Python), demostrando la promesa arquitectónica de contenido pedagógico desacoplado (`RNF-006`). Ver detalle en `22_ROADMAP.md` y [`ADR-005`](adr/ADR-005-adopcion-python-lenguaje-oficial-mvp.md).

---

## 2. IN SCOPE — MVP (Fase 1)

Funcionalidad mínima que debe estar completa y probada para considerar el MVP entregado:

### 2.1 Autenticación y perfil
- Registro, login, logout, recuperación de contraseña, verificación de email (ver `05` RF-AUTH-*, `19_SECURITY.md`).
- Perfil: nombre, avatar, XP, nivel, rachas, progreso por lenguaje, logros, certificados.

### 2.2 Aprendizaje base
- Selección de lenguaje (Python 3.12 como curso piloto operativo con 190 lecciones y Python como ruta troncal) y declaración de nivel (Beginner/Medium/Semi-Pro/Professional).
- Diagnóstico inicial y recomendación de punto de entrada (ver `14_LEARNING_SYSTEM.md`).
- Jerarquía `Lenguaje → Módulo → Sección → Lección` con arquitectura desacoplada (`23_CONTENT_SPECIFICATION.md`).
- Sesiones reanudables y lección con explicación → ejemplo → ejercicio → feedback formativo sin spoilers.

### 2.3 Evapythonción
- Banco de preguntas tipificadas (ver `15_QUIZ_EXAM_SYSTEM.md`).
- Quiz intermedio por módulo y Examen final con calificación automática.
- Umbrales configurables (Quiz 70%, Examen 80%) y reintentos con revisión de errores.

### 2.4 Progreso y gamificación esencial
- Registro de progreso por lección/intento, XP, rachas diarias, logros base (ver `16_GAMIFICATION.md`).
- Repaso priorizado por errores y bajo rendimiento.

### 2.5 Certificación
- Certificado de finalización al completar todos los módulos, con ID único, datos mínimos y exportación PDF (ver `17_CERTIFICATION.md`).
- Verificación interna por ID/QR.

### 2.6 Monetización mínima
- Plan gratuito con publicidad entre secciones (no intra-ejercicio) y plan premium USD $1/mes sin anuncios (ver `18_MONETIZATION.md`).

### 2.7 Administración mínima
- CRUD de lenguajes/módulos/secciones/lecciones/preguntas y publicación/ocultamiento (ver `25_ADMIN_SYSTEM.md`).

### 2.8 Transversales MVP
- API REST (`13`), modelo de datos (`12`), seguridad base (`19`), tests de pirámide (`20`), despliegue dev/staging/prod (`21`), analytics esenciales (`26`), UI responsive (`27`).

---

## 3. IN SCOPE — Versiones posteriores (Post-MVP)

Documentadas como roadmap, **no** parte del MVP. Ver `22_ROADMAP.md` para orden y criterios:

- Lenguajes adicionales: JavaScript, TypeScript, Java, C, C++, C#, Go.
- Editor de código y ejecución en sandbox.
- Proyectos prácticos y proyecto final evapythondo.
- Retos, rankings, competencias, tablas de clasificación.
- Sistema de amigos, perfiles públicos.
- Cursos creados por terceros (marketplace).
- Modo offline y apps móvil/escritorio.
- IA tutor, recomendaciones personalizadas, repetición espaciada avanzada.
- Verificación pública de certificados.

> Estas funciones deben estar **diseñadas para no bloquear** el MVP (arquitectura extensible en `11`), pero no implementadas prematuramente.

---

## 4. OUT OF SCOPE — Exclusiones deliberadas del MVP

| Área | Excluido en MVP | Motivo |
|---|---|---|
| Ejecución de código | Editor y runner | Complejidad de sandbox; se valida primero comprensión sin ejecución |
| Multi-lenguaje | Todo excepto Python | Enfoque en validar el motor |
| Certificación oficial | Validez profesional externa | Certificado es de finalización de plataforma (`17`) |
| Pagos | Proveedor específico hardcodeado | Se abstrae pasarela; no asumir Stripe/PayPal aún (`18`) |
| Redes sociales | Amigos, feed, chat | No aporta al núcleo educativo |
| Marketplace | Cursos de terceros | Requiere moderación y modelo de negocio separado |
| Offline | PWA/offline-first | Añade complejidad de sincronización |
| IA generativa | Tutor conversacional | Costo y riesgo; se diseña el hook pero no se implementa |
| Analytics invasivo | Tracking cross-site, fingerprinting | Privacidad; solo métricas esenciales (`26`) |

Cualquier solicitud fuera de este listado debe pasar por actualización de este documento y ADR si es arquitectónica (ver `09-decisions/`).

---

## 5. Límites del sistema

- **Frontera:** la plataforma es un sistema de **aprendizaje y evapythonción**, no un IDE ni un juez online con ejecución arbitraria en MVP.
- **Integraciones externas:** solo email (verificación/recuperación), almacenamiento de PDFs y servicio de anuncios; pagos abstraídos tras interfaz.
- **Plataformas:** web responsive en MVP; móvil/escritorio nativo es post-MVP.
- **Escalabilidad MVP:** diseñada para escalar en contenido y usuarios sin re-arquitectura, pero sin prometer multi-región en fase 1 (ver `06` y `11`).

---

## 6. Límites educativos

- No se promete equivalencia a título universitario o certificación profesional oficial; el certificado acredita finalización en la plataforma.
- No se evalúa código ejecutado en MVP (solo preguntas tipificadas); la escritura de código se evalúa por completado/orden/selección, no por ejecución.
- El diagnóstico ubica al usuario, no certifica nivel previo; puede ser re-tomado pero no sustituye exámenes de módulo.

---

## 7. Límites de certificación

- Un certificado por lenguaje completado; requiere aprobar **todos** los exámenes del lenguaje con umbral vigente.
- ID único con formato `KODA-{LANG}-{SEQ}` y QR de verificación interna; verificación pública es post-MVP.
- Re-emisión no duplica certificados; se invalida el anterior si cambia el contenido del lenguaje (ver `17`).

---

## 8. Límites del modelo de negocio

- Publicidad solo entre secciones completadas, nunca durante ejercicios/quizzes/exámenes.
- Premium USD $1/mes (precio inicial) elimina anuncios y mantiene progreso/acceso; no desbloquea contenido adicional en MVP.
- Suscripción gestionada por estado (activa/expirada/cancelada); renovación y facturación detalladas en `18`.

---

## 9. Dependencias externas

| Dependencia | Uso en MVP | Riesgo / mitigación |
|---|---|---|
| Servicio de email | Verificación y recuperación | Proveedor intercambiable; cola con reintentos |
| Almacenamiento de objetos | PDFs de certificados | Abstraído (S3-compatible) |
| Red de anuncios | Plan gratuito | Carga asíncrona; no bloquea aprendizaje |
| Pasarela de pagos | Premium | Interfaz abstracta; no acoplar a un proveedor |
| Base de datos relacional | Persistencia principal | Migraciones versionadas (`12`) |

> Ninguna dependencia externa debe ser crítica para completar una lección en modo degradado (ver `06` disponibilidad).

---

## 10. Criterios para evitar scope creep

1. Todo nuevo requisito debe mapear a un `RF-*` en `05` y a un caso de uso en `08`; si no mapea, se rechaza o se mueve a roadmap.
2. Ninguna funcionalidad post-MVP se implementa sin ADR y sin actualizar `22_ROADMAP.md` y `CHANGELOG.md`.
3. Agregar un lenguaje post-MVP debe ser **solo contenido + config** (ver `23`); si exige cambiar el motor, la propuesta se revisa.
4. Revisiones de alcance requieren aprobación explícita y actualización de este documento.
