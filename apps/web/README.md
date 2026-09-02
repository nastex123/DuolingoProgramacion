# 💻 Koda Web Client (`apps/web`) 🦊

> Aplicación web moderna construida con **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, **PixiJS v7** y **Zustand**.

---

## 🎨 Componentes Clave

- **`src/components/KodaMascot.tsx`:** Componente de renderizado WebGL acelerado por GPU con **PixiJS v7** para la mascota Koda 🦊 (física de flotación continua, reacciones emocionales a aciertos/fallos y emisión de confeti).
- **`src/components/RoadmapModuleNode.tsx`:** Representación interactiva de la ruta de aprendizaje, mostrando módulos, candados secuenciales ($\ge 80\%$) y sistema de calificación de 1 a 3 estrellas (`⭐ / ⭐⭐ / ⭐⭐⭐`).
- **`src/components/Sidebar.tsx`:** Navegación lateral ergonómica de escritorio con estado de racha (`🔥`), nivel y XP acumulado.
- **`src/lib/store.ts`:** Gestión reactiva del estado global del usuario con Zustand.

---

## 🚀 Comandos de Ejecución

Desde la raíz del monorepo o dentro de `apps/web`:

```bash
# Servidor de desarrollo Next.js (Puerto 3000)
pnpm --filter web dev

# Compilación optimizada para producción
pnpm --filter web build

# Iniciar servidor de producción
pnpm --filter web start

# Linters
pnpm --filter web lint
```

---

## 🔗 Dependencias Internas

Este paquete consume contratos TypeScript tipados directamente desde el monorepo mediante `@koda/types` (`workspace:*`).
Antes de compilar la web por primera vez, asegúrate de haber compilado los tipos:

```bash
pnpm --filter "@koda/types" build
```
