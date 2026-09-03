# ADR-005: Adopción de Python 3.12 como Lenguaje Oficial de Lanzamiento del MVP

> **Estado:** Aprobado  
> **Fecha:** 2026-09-03  
> **Autores:** Equipo de Producto y Arquitectura Koda  
> **Trazabilidad:** `01_PROJECT_OVERVIEW.md`, `04_SCOPE.md`, `11_SYSTEM_ARCHITECTURE.md`, `22_ROADMAP.md`  

---

## 1. Contexto y Problema
Koda nace con la misión de enseñar programación desde cero a personas sin conocimientos previos mediante micro-lecciones atómicas ultra accesibles. 
La elección del primer lenguaje formativo define la propuesta de valor y el alcance de mercado del producto. Se requiere un lenguaje que combine:
1. Máxima popularidad y demanda en el mercado profesional (desarrollo web, ciencia de datos, inteligencia artificial y automatización).
2. Sintaxis limpia, libre de símbolos crípticos innecesarios y cercana al lenguaje natural.
3. Enorme ecosistema de recursos educativos para principiantes.

## 2. Decisión Adoptada
Se adopta **Python 3.12 como el lenguaje oficial de lanzamiento del MVP de Koda**.
- La plataforma debuta con la ruta formativa de **12 módulos oficiales de Python** (`01` §34): desde *Fundamentos*, *Variables y Tipos*, pasando por *Condicionales*, *Funciones*, *Colecciones* y *POO*, hasta el *Proyecto Final Integrador*.
- Toda la experiencia inicial de usuario, onboarding y certificación se centra al 100% en Python.

## 3. Consecuencias
- **Positivas:**
  - Máximo atractivo para nuevos estudiantes que buscan aprender programación para empleabilidad, ciencia de datos o IA.
  - Gran coherencia didáctica: la sintaxis de Python encaja a la perfección con la regla de micro-lecciones de 40 a 70 palabras sin fricción cognitiva.
  - Desacoplamiento total del motor: el backend y frontend consumen la ruta de Python declarativa desde `content/languages/python/`.
- **Trade-offs:**
  - Desincorporación de los prototipos y currículos de lenguajes secundarios en esta primera fase para enfocar todos los recursos del equipo en pulir la experiencia de Python.
