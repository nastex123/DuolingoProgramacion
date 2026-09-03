# 📦 Koda Shared Types (`@koda/types`) 🦊

> Contratos de datos, modelos de dominio, DTOs y tipos compartidos entre el Frontend (`apps/web`), el Backend (`apps/api`) y herramientas de validación de contenido.

---

## 📚 Secciones del Paquete

El archivo principal [`src/index.ts`](src/index.ts) define los contratos formales organizados en dominios:

1. **Autenticación y Usuario:** `User`, `UserProfile`, `AuthTokens`, `UserRole`.
2. **Currículo y Aprendizaje:** `ProgrammingLanguage`, `ModuleProgress`, `SectionStars`, `RoadmapModule`, `RoadmapSection`, `RoadmapResponse`.
3. **Lección y Ejercicio:** `LessonDetailResponse`, `SubmitAnswerDto`, `AnswerEvaluationResponse`.
4. **Cuaderno de Errores:** `MistakeItem`, `ResolveMistakeDto`, `ResolveMistakeResponse`.
5. **Gamificación y Rachas:** `UserStreak`, `XpAwardResponse`.
6. **Certificación:** `CertificateVerificationResponse`.

---

## 🛠️ Compilación

```bash
# Compilar definiciones .d.ts y binarios JavaScript
pnpm --filter "@koda/types" build

# Modo observación (Watch)
pnpm --filter "@koda/types" dev
```
