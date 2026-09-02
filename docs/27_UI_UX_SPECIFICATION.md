# 27 — UI/UX Specification

> Define la experiencia e interfaz de usuario completa. Complementa a `10_INFORMATION_ARCHITECTURE.md` (dónde está cada cosa) y a `06_NON_FUNCTIONAL_REQUIREMENTS.md` (RNF de usabilidad/accesibilidad). No duplica; referencia.

---

## 1. Principios de diseño

| # | Principio | Implicación directa |
|---|---|---|
| P-01 | Claridad sobre estética | Sin sobrecarga; jerarquía tipográfica y espacio en blanco priorizan comprensión. |
| P-02 | Progreso visible siempre | Barra/ruta/XP/racha presentes en cada pantalla de aprendizaje (ver `10` § Ruta). |
| P-03 | Feedback inmediato | < 1 s tras cada ejercicio/quiz/examen (RNF-010) con explicación, no solo "correcto/incorrecto". |
| P-04 | Móvil primero, responsive | Breakpoints 360 / 768 / 1280; touch target ≥ 44 px. |
| P-05 | Accesibilidad no negociable | WCAG 2.1 AA, teclado, lector de pantalla, contraste ≥ 4.5:1. |
| P-06 | Consistencia | Design tokens únicos; mismos patrones para lección/quiz/examen. |
| P-07 | Respeto al foco | Publicidad nunca intra-ejercicio (ver `18`); sin modales que interrumpan escritura. |

---

## 2. Navegación

### 2.1 Shell global
- **Header:** logo + Biblioteca | Mi Ruta | Repaso | Perfil (avatar) + Premium badge. En móvil: hamburger + bottom nav.
- **Bottom nav (móvil):** Biblioteca / Ruta / Repaso / Perfil (4 ítems, icon + label).
- **Breadcrumbs:** `Biblioteca › Python › Módulo 3 › Sección 2 › Lección 4` (trunca en móvil, landmarks ARIA).
- **Regla 3 clics:** cualquier lección accesible en ≤ 3 clics desde Mi Ruta.

### 2.2 Navegación contextual y Roadmap Desbloqueable
- **Ruta / Roadmap Completo:** Visualización completa del camino de aprendizaje con todos sus módulos (1 a 12) y secciones.
  - **Nodo Bloqueado (`🔒`):** Opacidad al 50%, icono de candado, interacción deshabilitada y tooltip indicando prerrequisitos ("Completa la Sección X y alcanza Y ⭐ para desbloquear").
  - **Nodo Disponible / Activo:** Iluminado con borde de acento y pulso visual sutil.
  - **Nodo Completado:** Muestra la insignia de calificación obtenida (**1 a 3 Estrellas: ⭐ / ⭐⭐ / ⭐⭐⭐**).
  - **Banner de Módulo:** Muestra el total de estrellas acumuladas vs. estrellas mínimas requeridas para desbloquear el siguiente módulo ($\ge 80\%$).
- **Lección:** Layout split-screen 50/50, selector stepper superior de 10 píldoras de lección con estados, atajos de teclado ergonómicos (`1-4`, `A-D`, flechas `←/→`).
- **Evaluación:** paginación, progreso `3/10`, botón "Enviar intento" con confirmación.

---

## 3. Jerarquía visual

- **Tipografía:** escala 12/14/16/20/24/32; interlineado 1.5 para lectura; monoespaciada para bloques de código.
- **Color:** tokens semánticos `--color-primary`, `--color-success` (acierto), `--color-error` (fallo), `--color-warning` (repaso), `--bg`, `--text`. Contraste auditado con axe.
- **Elevación:** 0/1/2 niveles; sombras sutiles solo en cards/modales.
- **Iconografía:** tamaño 16/20/24; siempre con label accesible.

---

## 4. Pantallas clave

| Pantalla | Propósito | Componentes principales |
|---|---|---|
| S-Login/Registro | Autenticación | Form + validación inline + CTA social (post-MVP) |
| S-Biblioteca | Elegir lenguaje | Grid de cards lenguaje + filtro + badge "En progreso" |
| S-Ruta Python | Ver avance | Stepper 12 módulos + XP/racha + CTA "Continuar" |
| S-Lección | Aprender | Explicación + ejemplo código + ejercicio + feedback + recompensa +10 XP |
| S-Quiz | Evaluar parcial | Lista preguntas + timer opcional + revisión inmediata |
| S-Examen | Evaluar módulo | 20 preguntas + resumen por tipo/dificultad + 80% umbral |
| S-Repaso | Reforzar | 5-10 preguntas priorizadas por Score_repaso (ver `14`) |
| S-Perfil | Identidad | Tabs: progreso/racha/logros/certificados/estadísticas |
| S-Certificado | Verificar | PDF + QR + código `CQ-PY-000001` + botón Exportar |
| S-Premium | Monetización | Tabla comparativa + CTA USD $1/mes |

---

## 5. Componentes

### 5.1 Atómicos
Botón (primary/secondary/ghost, estados default/hover/active/disabled/loading), Input, Select, Badge, Chip, Progress bar, Skeleton, Toast, Tooltip.

### 5.2 Moleculares
Card lenguaje, Card módulo (con barra % y contador de estrellas acumuladas vs. requeridas), Card sección con candado `🔒` o estrellas (`⭐⭐⭐`), Pregunta renderer (11 tipos en `15`), Feedback inline (acierto con explicación + error con pista anti-spoilers), Mascota compañera interactiva (**Koda 🦊** con WebGL PixiJS y reacciones anímicas en tiempo real), Streak flame `🔥 7 días`, XP toast `+10 XP`, Star rating badge `⭐⭐⭐`.

### 5.3 Organismos
Header, Bottom nav, Stepper ruta, Lección layout (2 col desktop / stacked móvil), Quiz/Examen shell, Perfil dashboard, Certificado viewer.

---

## 6. Estados

| Estado | Tratamiento |
|---|---|
| **Loading** | Skeleton + spinner con `aria-busy`; no bloquear navegación global. |
| **Empty** | Ilustración + mensaje + CTA ("Aún no has iniciado Python → Explorar Ruta"). |
| **Error** | Mensaje humano + código `ERR-XXX` + CTA reintentar; nunca stacktrace al usuario (ver `19`). |
| **Success** | Toast 3 s + animación XP sutil (sin distraer). |
| **Disabled** | `aria-disabled` + tooltip "Completa el módulo anterior". |
| **Offline degradado** | Banner "Sin conexión" + deshabilitar envío; lectura cacheada permitida. |

---

## 7. Feedback

- **Ejercicio:** tras enviar, highlight verde/rojo en opción + explicación ≤ 60 palabras + botón "Siguiente".
- **Quiz/Examen:** tras envío, pantalla revisión con desglose por tipo/dificultad y CTA "Repasar errores".
- **Racha:** al completar actividad diaria, animación flame + contador incrementado.
- **Logro:** modal celebración con badge + `+25 XP` (cierre con Esc).

---

## 8. Errores

- Validación inline bajo el campo, no solo en submit.
- Mensajes: "La contraseña debe tener ≥ 8 caracteres, una mayúscula y un símbolo" (no "Error 400").
- Rate limit: "Demasiados intentos. Intenta en 2 min" con `Retry-After` (ver `19` §12).

---

## 9. Loading states

- **Lección:** skeleton de 3 bloques (explicación/ejemplo/ejercicio) 400 ms máx antes de contenido.
- **Lista (Biblioteca/Ruta):** skeleton grid 6 cards.
- **Envío (quiz/examen):** botón en `loading` + overlay 30% sin bloquear header.

---

## 10. Empty states

- **Biblioteca vacía (admin):** "Aún no hay lenguajes publicados" + CTA "Crear lenguaje" (solo admin).
- **Sin racha:** `0 días` + mensaje motivador + CTA "Completa tu primera lección".
- **Sin certificados:** ilustración diploma + "Completa los 12 módulos de Python para obtener tu certificado" + progreso `3/12`.

---

## 11. Responsive design

| Breakpoint | Layout | Navegación |
|---|---|---|
| 360–767 (móvil) | 1 columna, cards full-width, código con scroll horizontal | Bottom nav + header compacto |
| 768–1279 (tablet) | 2 columnas, sidebar colapsable | Header + sidebar icon-only |
| ≥1280 (desktop) | 3 columnas (nav + contenido + progreso lateral) | Header + sidebar expandido |

Touch target 44 px, fuente base 16 px en móvil, sin hover-only interactions.

---

## 12. Accesibilidad (WCAG 2.1 AA)

- **Teclado:** todo operable con Tab/Shift+Tab/Enter/Esc; focus ring visible 2 px.
- **Lector:** landmarks `header/nav/main/aside`, `aria-label` en icon-only, `aria-live` para feedback.
- **Contraste:** texto 4.5:1, UI 3:1, auditado con axe (≥ 95 en `20`).
- **Código:** bloques con `role="code"` + botón copiar con `aria-label`.
- **Animación:** respeta `prefers-reduced-motion`.

---

## 13. Design tokens (extracto)

```yaml
color:
  primary: "#3B82F6"
  success: "#16A34A"
  error: "#DC2626"
  warning: "#F59E0B"
  bg: "#FFFFFF"
  text: "#111827"
spacing: [4, 8, 12, 16, 24, 32]
radius: { sm: 6, md: 8, lg: 12 }
font: { sans: "Inter", mono: "JetBrains Mono" }
```

Sin emojis en tokens ni en código; flame/racha es texto con clase.

---

## 14. Trazabilidad

| Requisito | Cubierto en |
|---|---|
| RNF-010 < 1 s feedback | §7 |
| RNF-021 usabilidad | §1-§5 |
| RNF-022 accesibilidad AA | §12 |
| RNF-023 responsive | §11 |
| US-010..US-050 | §4 pantallas |
| UC-005..UC-013 | §4 + §6-7 |

> Fuente de verdad visual: este documento + `10_INFORMATION_ARCHITECTURE.md`. Implementación no debe asumir librería UI sin ADR.
