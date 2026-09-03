# 🤝 Guía de Contribución a Koda 🦊

¡Gracias por tu interés en contribuir a Koda! Esta guía detalla los estándares de ingeniería, flujo de trabajo con Git, normas de autoría pedagógica y proceso de Pull Request para asegurar que el proyecto mantenga la más alta calidad técnica y didáctica.

---

## 🏗️ Flujo de Trabajo y Ramas

1. **Ramas principales:**
   - `main`: Código y especificaciones listas para producción y staging.
2. **Nomenclatura de ramas:**
   - Nuevas funcionalidades: `feat/nombre-descriptivo` (ej. `feat/python-module-03`).
   - Corrección de bugs: `fix/nombre-bug` (ej. `fix/pixi-mascot-resize`).
   - Documentación: `docs/nombre-doc` (ej. `docs/update-api-spec`).
   - Refactorización: `refactor/area` (ej. `refactor/types-cleanup`).

---

## 💬 Convención de Commits (Conventional Commits)

Los mensajes de commit deben seguir el estándar **Conventional Commits**:

```
<tipo>(<ámbito opcional>): <descripción concisa en imperativo o pasado claro>
```

### Tipos admitidos:
- `feat:` Para nuevas funcionalidades en la API, cliente web o motor.
- `fix:` Para corrección de errores de código o bugs visuales.
- `docs:` Para documentación, especificaciones en `docs/` o guías.
- `refactor:` Para reestructuración de código sin alterar su comportamiento externo.
- `chore:` Para mantenimiento de dependencias, scripts de pnpm o configuración.
- `content:` Para adición o ajuste de micro-lecciones, bancos de preguntas o módulos en `content/`.

---

## ✍️ Estándares Pedagógicos para Creación de Contenido

Si estás colaborando en la creación de nuevas lecciones o ejercicios en [`content/`](content/):

1. **Consulta obligatoria:** Lee atentamente [`docs/24_CONTENT_AUTHORING_GUIDE.md`](docs/24_CONTENT_AUTHORING_GUIDE.md).
2. **Micro-Lecciones Atómicas:**
   - Longitud estricta: entre **40 y 70 palabras** en segunda persona (*"tú"*).
   - Estructura en máximo 3 pasos lógicos.
   - Cero jerga intimidante o asunciones de conocimiento previo.
3. **Regla de Oro Anti-Spoilers:**
   - Al fallar un ejercicio, proporciona una pista orientadora (*hint*) inteligente, pero **nunca reveles la opción correcta**.
   - Los distractores deben originarse en errores mentales verosímiles del principiante.
4. **Validación del Contenido:**
   - Asegúrate de que los archivos `module.json` y `bank.json` cumplan con la especificación de [`docs/23_CONTENT_SPECIFICATION.md`](docs/23_CONTENT_SPECIFICATION.md).
   - Cada pregunta debe tener `id` único, `concept_id`, `difficulty` (`easy`, `medium`, `hard`) y balance de alternativas.

---

## 🛠️ Entorno de Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/nastex123/DuolingoProgramacion.git
cd DuolingoProgramacion

# 2. Instalar dependencias con pnpm
pnpm install

# 3. Compilar paquetes compartidos
pnpm --filter "@koda/types" build

# 4. Iniciar servidores en modo desarrollo
pnpm dev

# Servidores disponibles:
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000/api/v1
# Swagger Docs: http://localhost:4000/api/docs
```

---

## 📋 Checklist antes de enviar un Pull Request

- [ ] ¿El código compila sin errores con `pnpm build`?
- [ ] ¿Los linters pasan sin advertencias con `pnpm lint`?
- [ ] ¿Se actualizaron las especificaciones relevantes en `docs/` si hubo cambios arquitectónicos o de datos?
- [ ] Si se tomó una decisión arquitectónica clave, ¿se añadió su respectivo ADR en `docs/adr/`?
- [ ] ¿Se registró el cambio en `CHANGELOG.md` con fecha y hora local `America/Bogota`?
