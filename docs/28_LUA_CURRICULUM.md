# 28 — Currículo de Lua (Ruta Educativa Lua)

> **Estado:** Propuesta · **Versión del documento:** 1.1.0 · **Fecha:** 2026-08-30 · **Zona horaria:** America/Bogota (UTC-5)
> Complementa a `01_PROJECT_OVERVIEW.md` §7.1/§30–§34, `03_OBJECTIVES.md` OT-02/OT-03, `04_SCOPE.md` §2.2/§3/§10.3, `05_FUNCTIONAL_REQUIREMENTS.md` RF-LANG/RF-MOD/RF-SEC/RF-LEC/RF-PREG/RF-ADM, `06_NON_FUNCTIONAL_REQUIREMENTS.md` RNF-006/RNF-017/RNF-031/RNF-035/RNF-036, `11_SYSTEM_ARCHITECTURE.md` §15/§18, `12_DATABASE_DESIGN.md` §6.3–§6.11, `14_LEARNING_SYSTEM.md` §2–§6/§10, `15_QUIZ_EXAM_SYSTEM.md` §3–§5, `16_GAMIFICATION.md`, `23_CONTENT_SPECIFICATION.md` y `24_CONTENT_AUTHORING_GUIDE.md`. No duplica; es la **fuente de verdad pedagógica del lenguaje Lua**.
> **Principio rector:** `01` §31 — agregar Lua es solo `content/languages/lua/` + config; 0 cambios en `src/modules/*` (`11` §18, `06` RNF-006).
> **Cambio v1.1.0:** se amplía cada módulo de 4-6 a **8-10 secciones** (96-120 totales) para ruta más granular y sesiones de 8-15 min, manteniendo 12 módulos. Ver §4.

---

## 1. Propósito y alcance

Este documento define **cómo se enseña Lua** dentro de la jerarquía `Lenguaje → Módulo → Sección → Lección → Ejercicio` (`14` §2.1). Es el espejo de la ruta Python de `01` §34, pero reescrito con **semántica idiomática de Lua**, no por traducción literal (ver `24` §11.4).

**Sí incluye:** 12 módulos Lua con objetivo, 8-10 secciones por módulo, lecciones (`concept_id` estables), ejemplos idiomáticos, cobertura de tipos de pregunta (T-01..T-11), distribución de dificultad, prerrequisitos DAG, `B_min` y trazabilidad a `23`/`24`/`14`/`15`.

**No incluye:** DDL (`12`), contratos OpenAPI (`13`), ni UI (`27`). Cada lección/pregunta aquí descrita se materializa como JSON/YAML validado por `23` §7–§8 y versionado (`RNF-035`).

**Audiencia:** autores de contenido Lua, revisores pedagógicos/técnicos y publicadores (`24` §1.1).

**Justificación de 8-10 secciones por módulo:**
- Sesión = 1 sección = 8-15 min (`14` §9.2). Con 4-6 sesiones, un módulo se completa en 40-90 min; con 8-10, el progreso es más visible, el `Score_repaso` es más fino y el abandono por módulo (`26` M-08) se detecta antes.
- Total Lua: 12 módulos × 9 promedio = **108 secciones**, ~220 lecciones (2-3 por sección), ~540 ejercicios (sin contar quiz/examen). Tiempo estimado ruta completa: 14-18 h (108 × 10 min) + evaluaciones.
- Implicación XP: con `XP-SEC +10` por sección, el módulo pasa de ~50 XP a **~90 XP** (9 secciones) sin cambiar `16` §5.2; la tabla de nivel (`16` §6) no se toca, solo acelera la progresión hacia `CODE_MASTER_PY` equivalente `CODE_MASTER_LUA`.

---

## 2. Principios específicos de Lua

| # | Principio | Regla operativa | Origen |
|---|---|---|---|
| L-01 | **Una sola estructura: la tabla** | `list`/`dict` de Python son `table` en Lua. Se enseña `table` en dos módulos progresivos (M07 array, M08 mapa) para evitar colapso conceptual. | `01` §7.2 vs Lua idiomático |
| L-02 | **Local por defecto** | Toda variable Lua debe ser `local` salvo justificación; global es excepción. Se introduce en M02 y se exige en todos los ejemplos posteriores (`24` EJ-07). | Lua `_ENV` / `24` §11.2 |
| L-03 | **1-based y `#` con huecos** | El índice 1 es el primero; `#` no es fiable con huecos/nils. Se dedica lección explícita y distractor dedicado. | `24` §8.1 |
| L-04 | **Nil y falsy único** | Solo `nil` y `false` son falsos; `0` y `""` son verdaderos. Contraste directo con Python/JS. | `14` §2.5 |
| L-05 | **Funciones de primera clase** | Retorno múltiple, `...` varargs y closures se enseñan como mecanismo nativo, no como truco. | `01` §7.2 |
| L-06 | **Metatablas para POO** | No hay `class`; hay `__index` y prototipos. POO se enseña vía metatablas, no por analogía a Python. | `11` §15 |
| L-07 | **Errores con `pcall/xpcall`** | No hay `try/except`; hay `pcall`. Se enseña antes que POO. | `04` §6 |
| L-08 | **Contenido desacoplado** | Ningún `if language == "lua"` en el motor; todo vive en `content/languages/lua/` (`06` RNF-031, `24` AP-C01). | `03` OT-03 |

---

## 3. Ruta Lua — 12 módulos vs Python

| Pos | Python (`01` §34) | **Lua (esta ruta)** | Objetivo Lua | Hereda concepto_id transversal |
|---|---|---|---|---|
| 01 | Fundamentos | **01 Fundamentos de Lua** | Chunk, REPL, comentarios `--`, `print`, ejecutar script | `lua-fund-*` |
| 02 | Variables y tipos de datos | **02 Variables y tipos** | `local`, 8 tipos (`nil/boolean/number/string/table/function/thread/userdata`), `type()` | `lua-var-*` |
| 03 | Operadores | **03 Operadores** | Aritméticos, relacionales, lógicos (`and/or/not`), concatenación `..`, longitud `#` | `lua-op-*` |
| 04 | Condicionales | **04 Condicionales** | `if/elseif/else`, `and/or` como ternario, `nil/false` falsy | `cond-if` adaptado |
| 05 | Bucles | **05 Bucles** | `while`, `repeat-until`, `for` numérico, `for` genérico `pairs/ipairs` | `lua-loop-*` |
| 06 | Funciones | **06 Funciones** | Definición, params, retorno múltiple, `...`, closures, alcance | `lua-func-*` |
| 07 | Listas y colecciones | **07 Tablas como arreglos** | `table` array 1-based, `#`, `table.insert/remove/sort`, `ipairs` | `lua-table-array` |
| 08 | Diccionarios y estructuras | **08 Tablas como mapas** | `table` mapa, `pairs`, claves, tablas anidadas, referencias vs copia | `lua-table-map` |
| 09 | Manejo de errores | **09 Cadenas y librerías estándar** | `string.*` (sub/gsub/find/format, patrones), `math`, `table` lib | `lua-str-*` |
| 10 | Programación orientada a objetos | **10 Manejo de errores y módulos** | `pcall/xpcall/error/assert`, `require`, `package.path`, crear módulo | `lua-err-*`, `lua-mod-*` |
| 11 | Archivos | **11 Metatablas y POO** | `setmetatable`, `__index/__newindex/__tostring/__add`, prototipos, herencia | `lua-meta-*`, `oop-*` |
| 12 | Proyecto final | **12 Archivos, corrutinas y proyecto final** | `io.open/read/write`, `os`, `coroutine.create/resume/yield`, proyecto integrador | `lua-io-*`, `lua-co-*` |

> **Justificación del orden:** M07/M08 separan la tabla en dos modelos mentales (array vs mapa) — patrón validado en enseñanza de Lua (Lua PIL). M09 antes de errores permite practicar `string` sin `pcall`; M10 antes de POO porque POO en Lua exige entender `pcall` y `require` para no confundir `:` con `.`.

**Glosario mapeado (`24` §11.3):**
- `lista` (Python) → `tabla (array)` (Lua, `ipairs`)
- `diccionario` (Python) → `tabla (mapa)` (Lua, `pairs`)
- `método` (Python `self`) → `función con `:` y `self` en Lua
- `None` → `nil`

---

## 4. Detalle por módulo (8-10 secciones cada uno)

> Cada sección = 1 sesión de 8-15 min (`14` §9.2) con `concepto → explicación → ejemplo → ejercicio → feedback → recompensa`. El quiz del módulo aparece tras ~50% de secciones (`01` §13); el examen al cerrar todas. Todo `position` sin huecos y `prerequisite_module_id` DAG validado por `RF-ADM-006` (`23` V-M02/V-M03).

### 4.1 Módulo 01 — Fundamentos de Lua (9 secciones)

**Objetivo:** Entender qué es Lua, cómo se ejecuta un chunk y escribir el primer `print`. **Sin tipos aún.**

| # | Sección | Tipo | Lecciones (concept_id) |
|---|---|---|---|
| S01 | ¿Qué es Lua y dónde se usa? | theory | L01 Qué es Lua (embebido, ligero, Roblox/Nginx/Games) (`lua-fund-que-es`) · L02 Lua vs Python/JS (`lua-fund-vs`) |
| S02 | Chunk y REPL | example | L01 Qué es un chunk · L02 REPL `lua -i` (`lua-fund-chunk`, `lua-fund-repl`) |
| S03 | Tu primer `print` | example | L01 `print("Hola")` · L02 `print` con múltiples args (`lua-fund-print`) |
| S04 | Comentarios | exercise | L01 `--` una línea · L02 `--[[ ]]` multilínea y `--[=[ ]=]` (`lua-fund-comentario`) |
| S05 | Archivos `.lua` | exercise | L01 Crear `main.lua` · L02 Estructura de carpetas (`lua-fund-archivo`) |
| S06 | Ejecutar código | exercise | L01 `lua main.lua` · L02 Mensajes de error por olvidar `end` (`lua-fund-ejecutar`, `lua-fund-error-lectura`) |
| S07 | Palabras reservadas | theory | L01 `and/break/do/else/elseif/end/for/function/if/in/local/nil/not/or/repeat/return/then/until/while` · L02 Estilo: indentación y `;` opcional (`lua-fund-reservadas`) |
| S08 | Kit de supervivencia | review | L01 Leer traceback · L02 Comentar para debug (`lua-fund-debug`) |
| S09 | Checkpoint | review | L01 Repaso · L02 Mini-desafío: comentar y ejecutar (`lua-fund-check`) |

**Prerrequisito:** ninguno. **Evaluación:** quiz 10Q (4E: chunk, `print`, `--`; 4M: predecir `print` con `..`; 2H: identificar línea sin `end`). **Proyecto:** `S03→S09` = 9 sesiones → ~90 min.

**Ejemplo (S04):**
```lua
-- comentario de una línea
local nombre = "Brandon"  -- local: variable propia de este chunk
print(nombre)             -- Salida: Brandon
--[[ multilínea
     con niveles ]=] ]]
print("Hola, " .. nombre) -- Salida: Hola, Brandon
```

### 4.2 Módulo 02 — Variables y tipos de datos (10 secciones)

**Objetivo:** Dominar `local` vs global, los 8 tipos y `type()`.

| # | Sección | Tipo | Lecciones |
|---|---|---|---|
| S01 | Variables y `local` | theory | L01 `local` vs global (`_G`) · L02 Por qué `local` por defecto (`lua-var-local`, `lua-var-global`) |
| S02 | Reasignación y shadowing | example | L01 Reasignación · L02 Shadowing en `do end` (`lua-var-reasignacion`, `lua-var-shadow`) |
| S03 | El sistema de 8 tipos | theory | L01 `nil/boolean/number/string/table/function/thread/userdata` · L02 `type(v)` (`lua-type-sistema`, `lua-type-typeof`) |
| S04 | `nil` como ausencia | exercise | L01 `nil` y variable no inicializada · L02 Borrar clave con `nil` (`lua-type-nil`) |
| S05 | Números | example | L01 `number` (int 64b / float) · L02 Notación científica, `0x` hex (`lua-type-number`) |
| S06 | Cadenas | example | L01 `"" '' [[]] [=[ ]=]` · L02 Escape `\n \t` (`lua-type-string`) |
| S07 | Conversión | exercise | L01 `tostring/tonumber` · L02 Coerción automática (`lua-type-coercion`) |
| S08 | Booleanos y falsy | exercise | L01 `true/false` · L02 `nil/false` únicos falsos (`0` y `""` son verdaderos) (`lua-type-boolean`, `lua-type-falsy`) |
| S09 | `local` en la práctica | exercise | L01 Declarar kit de variables · L02 Inspeccionar `_G` contaminado (`lua-var-practica`) |
| S10 | Checkpoint tipos | review | L01 Predecir `type()` · L02 Quiz de tipos (`lua-var-check`) |

**Regla crítica:** todo ejemplo usa `local`; global se muestra como anti-patrón.

### 4.3 Módulo 03 — Operadores (9 secciones)

| # | Sección | Tipo | Lecciones |
|---|---|---|---|
| S01 | Aritméticos | theory | `+ - * / // % ^` , `-` unario (`lua-op-arit`) |
| S02 | Precedencia y paréntesis | exercise | Orden `^` > unario > `* / // %` > `+ -` (`lua-op-prec`) |
| S03 | Relacionales | exercise | `== ~= < > <= >=`, sin coerción (`0 ~= false`) (`lua-op-rel`) |
| S04 | Lógicos `and/or/not` | theory | Cortocircuito, `not` solo para `nil/false` (`lua-op-logic`) |
| S05 | Truco `and/or` como ternario | example | `x = cond and "sí" or "no"` (`lua-op-ternario`) |
| S06 | Concatenación `..` | example | `..` concatena, no suma; `..` vs `+` (`lua-op-concat`) |
| S07 | Longitud `#` | exercise | `#s`, `#t` sin huecos (`lua-op-len`) |
| S08 | Coerción | exercise | `"5" + 2 == 7` pero `"5" .. 2 == "52"` (`lua-op-coercion`) |
| S09 | Checkpoint operadores | review | Predecir `2^3^2`, `not nil`, `"a" + 1` error (`lua-op-check`) |

**Pregunta T-06 FIND_ERROR:** `local x = "hola" + 1` → error aritmética con string.

### 4.4 Módulo 04 — Condicionales (8 secciones)

| # | Sección | Tipo |
|---|---|---|
| S01 | `if` básico (`if cond then ... end`) |
| S02 | `else` y `elseif` |
| S03 | Falsy: solo `nil/false` (comparar con Python `0/""`) |
| S04 | `and/or` como ternario y guard (`x and f(x)`) |
| S05 | Anidamiento y `then/end` obligatorios |
| S06 | Operador relacional con strings y números |
| S07 | Ejercicios de decisión (predecir `and/or`) |
| S08 | Checkpoint: reescribir `if` con ternario y viceversa |

**Ejemplo S04:**
```lua
local edad = 20
local msg = edad >= 18 and "mayor" or "menor"
print(msg) -- mayor
```

### 4.5 Módulo 05 — Bucles (9 secciones)

| # | Sección | Tipo | Notas |
|---|---|---|---|
| S01 | `while` | `while cond do ... end` | Cond al inicio |
| S02 | `repeat-until` | `repeat ... until cond` | Al menos 1 ejecución |
| S03 | `for` numérico | `for i=1,10,2 do` | `1`-based, `step` opcional |
| S04 | `for` numérico avanzado | `for i=10,1,-1 do` | Descendente |
| S05 | `for` genérico `pairs` | `for k,v in pairs(t) do` | Orden no garantizado |
| S06 | `for` genérico `ipairs` | `for i,v in ipairs(t) do` | Solo array secuencial |
| S07 | `pairs` vs `ipairs` con hueco | `{10,nil,30}` → `#` y `ipairs` se detienen | Lección bloqueante |
| S08 | `break` y `goto` (no hay `continue`) | Patrón `if ... goto continue` | Diferencia Python |
| S09 | Checkpoint bucles | Dibujar triángulo con `for` anidado | Práctica |

### 4.6 Módulo 06 — Funciones (10 secciones)

| # | Sección | Tipo |
|---|---|---|
| S01 | Definición: `function f(a,b) return a+b end` y `local function` |
| S02 | Llamada y `()` opcional con string/tabla |
| S03 | Parámetros y `nil` por defecto |
| S04 | Retorno múltiple `return a,b` y `x,y = f()` |
| S05 | `...` varargs y `select("#",...)` |
| S06 | Funciones como valores `local f = function() end` |
| S07 | Closures: capturar `local` |
| S08 | Factoría de contadores con closure |
| S09 | Alcance: `do end`, `local function` y forward declaration |
| S10 | Checkpoint: `factorial` recursivo + closure contador (T-07 ORDER_LINES) |

**Ejemplo S04+S07:**
```lua
local function divide(a,b)
  if b==0 then return nil, "cero" end
  return a/b, nil
end
local res, err = divide(10,2) -- 5  nil
local function crearContador()
  local n=0; return function() n=n+1; return n end
end
local c=crearContador(); print(c(), c()) -- 1 2
```

### 4.7 Módulo 07 — Tablas como arreglos (10 secciones)

| # | Sección | Tipo |
|---|---|---|
| S01 | Crear arreglos `{"a","b"}` y `t[1]` 1-based |
| S02 | Índices explícitos `[1]="a"` y constructor mixto |
| S03 | Longitud `#t` sin huecos |
| S04 | Huecos `nil` y por qué `#` falla |
| S05 | `table.insert(t, pos, val)` |
| S06 | `table.remove(t, pos)` y `table.sort` |
| S07 | Iterar: `ipairs` vs `for i=1,#t` |
| S08 | `table.concat` y `unpack`/`table.unpack` |
| S09 | Patrones: pila/cola con `insert/remove` |
| S10 | Checkpoint: predecir `#` con hueco (HARD) |

**Ejemplo S03-S04:**
```lua
local t={10,20,30}; print(#t) --3; print(t[1]) --10 (no t[0])
t[2]=nil; print(#t) -- 1 o 3: ¡no fiable!
```

### 4.8 Módulo 08 — Tablas como mapas (9 secciones)

| # | Sección | Tipo |
|---|---|---|
| S01 | Mapas `{nombre="Ana", edad=30}` y `t.clave` vs `t["clave"]` |
| S02 | `pairs` iteración y orden no garantizado |
| S03 | Claves no string: `[expr]` y números |
| S04 | Tablas anidadas `{{x=1},{x=2}}` |
| S05 | Referencias `b=a` no copia |
| S06 | Copia superficial vs profunda (patrón loop) |
| S07 | Patrones híbridos: array de mapas `{{id=1},{id=2}}` |
| S08 | Borrar con `nil` y `#` no aplica a mapas |
| S09 | Checkpoint: construir agenda `personas` array de mapas |

**Ejemplo S05:**
```lua
local a={x=10}; local b=a; b.x=99; print(a.x) --99 misma tabla
```

### 4.9 Módulo 09 — Cadenas y librerías estándar (9 secciones)

| # | Sección | Tipo |
|---|---|---|
| S01 | `string.len/sub/reverse/upper/lower` y `..` |
| S02 | `string.find(s, pat)` y `string.sub` |
| S03 | `string.gsub(s, pat, repl)` |
| S04 | `string.format("Hola %s %d", n, e)` |
| S05 | Patrones `%d %a %s . * + - ? ^ $` |
| S06 | Clases `[]`, capturas `()` y `%1` |
| S07 | `math` (`random/floor/sqrt/max`) y `table` lib (`concat/pack`) |
| S08 | Ejercicios de patrones: validar email simple |
| S09 | Checkpoint: `gsub` con función |

**Ejemplo S03:**
```lua
local s="Hola 123"; print((string.gsub(s, "%d+", "NUM"))) -- Hola NUM
```

### 4.10 Módulo 10 — Manejo de errores y módulos (9 secciones)

| # | Sección | Tipo |
|---|---|---|
| S01 | `error("msg", level)` |
| S02 | `assert(cond, "msg")` |
| S03 | `pcall(func, ...)` → `ok,res` |
| S04 | `xpcall(func, handler)` y `debug.traceback` |
| S05 | Patrón `local ok, err = pcall(...) if not ok then` |
| S06 | `require("mod")` y `package.path` |
| S07 | `package.loaded` y cache |
| S08 | Crear módulo: `local M={}; function M.hola() end; return M` |
| S09 | Checkpoint: módulo `calc` con `pcall` para división |

**Ejemplo S03:**
```lua
local function div(a,b) if b==0 then error("cero") end return a/b end
local ok,res=pcall(div,10,0); print(ok,res) -- false main.lua:1: cero
```

### 4.11 Módulo 11 — Metatablas y POO (10 secciones)

| # | Sección | Tipo |
|---|---|---|
| S01 | `setmetatable(t, mt)` y `getmetatable` |
| S02 | `__index` como tabla |
| S03 | `__index` como función |
| S04 | `__newindex` |
| S05 | `__tostring` y `__add` |
| S06 | Patrón clase: `Cuenta={}; Cuenta.__index=Cuenta` |
| S07 | Constructor `function Cuenta:nueva(saldo) return setmetatable({saldo=saldo}, self) end` |
| S08 | `:` vs `.` (`obj:metodo(a)` → `obj.metodo(obj,a)`) |
| S09 | Herencia `setmetatable(Hija,{__index=Padre})` |
| S10 | Checkpoint POO: `Cuenta` con `depositar/retirar/__tostring` + herencia `CuentaPremium` |

**Ejemplo S06-S07:**
```lua
local Cuenta={}; Cuenta.__index=Cuenta
function Cuenta:nueva(s) return setmetatable({saldo=s or 0}, self) end
function Cuenta:depositar(v) self.saldo=self.saldo+v end
local c=Cuenta:nueva(100); c:depositar(50); print(c.saldo) --150
```

### 4.12 Módulo 12 — Archivos, corrutinas y proyecto final (10 secciones)

| # | Sección | Tipo |
|---|---|---|
| S01 | `io.open(path,"r/w/a")` y modos |
| S02 | `:read("*l"/*a/*n/*L)` `:write` `:close` |
| S03 | `io.lines(path)` iterador |
| S04 | `os.date/time/execute/remove/rename` |
| S05 | `coroutine.create(func)` y `status` |
| S06 | `coroutine.resume(co, ...)` |
| S07 | `coroutine.yield(...)` y productor-consumidor |
| S08 | `coroutine.wrap` |
| S09 | Diseño del proyecto: inventario CLI con archivo + módulos + `pcall` + metatablas |
| S10 | Proyecto final: implementar, probar y empaquetar |

**Ejemplo S02+S05:**
```lua
local f=io.open("datos.txt","w"); f:write("Hola\n"); f:close()
for l in io.lines("datos.txt") do print(l) end
local co=coroutine.create(function() for i=1,3 do print("co",i); coroutine.yield() end end)
coroutine.resume(co); coroutine.resume(co)
```

**Proyecto final:** CLI gestor de tareas con `tareas.lua` (módulo), `storage.lua` (io), `task` metatabla, corrutina para animación de carga.

---

## 5. Métricas de la ampliación

| Métrica | v1.0.0 (4-6 sec/mod) | **v1.1.0 (8-10 sec/mod)** | Delta |
|---|---|---|---|
| Secciones totales | 60 (5 avg) | **108** (9 avg) | +48 (+80%) |
| Lecciones est. | ~130 | **~240** (2.2 avg/sec) | +110 |
| Ejercicios est. | ~320 | **~560** | +240 |
| Sesiones (sección) | 60 ×10 min =10h | **108 ×10 min =18h** | +8h |
| XP por ruta (`+10`×sec + ejercicios) | ~600 XP solo secciones | **~1080 XP** secciones + ~560×5 ejercicios = **~3800 XP total ruta** | Ajustar `16` §6 curva no requiere cambio, solo recalcula nivel |
| Módulos con quiz | 12 quizzes | 12 quizzes (quiz tras ~4-5 sec, no 2-3) | Quiz reposicionado |
| Tiempo p95 rutas | Ruta <100 ms | Sin impacto (índice `language_id, position` ya existe) | — |

**Ubicación del quiz (ajuste):** con 9 secciones, el quiz va tras **S05** (mitad) como `M → S01-S05 → QUIZ → S06-S09 → EXAMEN`. Se actualiza en `23` `module.quiz_refs.position`.

**Validación:** sigue cumpliendo `23` V-M06 (≥3 sec/mod) — ahora 8-10, y V-M02 (position sin huecos 1..N). `B_min` y `max_easy_ratio` sin cambio.

---

## 6. Mapeo de `concept_id` y progresión

### 6.1 `concept_id` estables (para `Score_repaso` y `RF-EVAL-004`)

```
lua-fund-*           → fundamentos
lua-var-local/global → variables
lua-type-*           → tipos (nil, number, string, boolean, type)
lua-op-arit/prec/rel/logic/ternario/concat/len/coercion
lua-cond-if/elseif/falsy
lua-loop-while/repeat/fornum/forgeneric/break/goto
lua-func-def/call/retmulti/varargs/closure/scope
lua-table-array/len/insert/ipairs, lua-table-map/pairs/nested/ref
lua-str-sub/gsub/pattern/format, lua-math-*
lua-err-pcall/xpcall/require/module
lua-meta-index/newindex/tostring, lua-oop-class/herencia
lua-io-file/lines, lua-co-create/yield/wrap
```

Cada `question.concept_ids` ⊆ `lessons[].concept_id` (`23` V-M04). `Score_repaso` prioriza por `Tasa_error` y `Es_prerrequisito_proximo`.

### 6.2 Prerrequisitos DAG

```
M01 → M02 → M03 → M04 → M05 → M06 → M07 → M08 → M09 → M10 → M11 → M12
M02 → M03, M04
M06 → M10, M11
M07 → M08
```

Sin ciclos; `position` 1..12.

---

## 7. Tipos de pregunta por módulo Lua (adaptación `15` §3)

| Módulo | Tipos enfatizados | Justificación Lua |
|---|---|---|
| M01 Fundamentos | T-03, T-01 | `--` y `print` |
| M02 Variables | T-05, T-03 | `local` vs global |
| M03 Operadores | T-05, T-04 (`..`), T-06 (`+` con string) | `..` vs `+` |
| M04 Condicionales | T-01, T-05 (ternario) | `and/or` |
| M05 Bucles | T-07, T-05, T-08 (`pairs` vs `ipairs`) | Iteradores |
| M06 Funciones | T-04 (`...`), T-07, T-10 | Retorno múltiple |
| M07 Tablas array | T-05 (`#` con hueco), T-06 | 1-based |
| M08 Tablas mapa | T-09 MATCHING, T-05 | `pairs/ipairs` |
| M09 Cadenas | T-04, T-06 | Patrones `%` |
| M10 Errores/Módulos | T-06, T-01 | `pcall` |
| M11 Metatablas/POO | T-08 (`:` vs `.`), T-07 | `:` azúcar |
| M12 Archivos/Coroutines | T-04, T-05, T-07 | IO + corrutinas |

Distribución dificultad y `B_min` idénticos a `15`: Quiz 10Q 40/40/20, Examen 20Q 30/40/30.

---

## 8. Diagnóstico Lua (24 preguntas)

| Bloque | Módulos | Preguntas | Qué mide |
|---|---|---|---|
| A Fundamentos | M01–M03 | 6 | Chunk, `local`, `..` vs `+`, `type()` |
| B Control | M04–M05 | 4 | `nil/false` falsy, `for` genérico |
| C Tablas | M06–M08 | 6 | Retorno múltiple, 1-based, `pairs/ipairs` |
| D Avanzado | M09–M12 | 8 | Patrones `%d`, `pcall`, `__index`, `coroutine` |

Calificación `P_i` y `entry_module` con clamping `BEGINNER ≤3` etc. (`14` §6.3).

---

## 9. Ejemplos idiomáticos Lua vs Python (anti-traducción)

| Concepto | Python (no usar) | Lua idiomático |
|---|---|---|
| Variable | `x = 5` | `local x = 5` |
| Lista | `nums = [1,2,3]; nums[0]` | `local nums = {1,2,3}; nums[1]` |
| Función | `def suma(a,b): return a+b` | `local function suma(a,b) return a+b end` |
| Comentario | `#` | `--` |

> `24` §11.4: ver Lua real, no Python disfrazado.

---

## 10. Formato físico (`23` §5–§6)

```
content/languages/lua/
├── manifest.json              # { code:"LUA", slug:"lua", name:"Lua", status:"coming_soon"→"available", sort_order:2, content_version:1 }
├── config/
│   ├── thresholds.json        # { quiz:70, exam:80 }
│   ├── xp.json
│   └── compositions.json
└── modules/
    ├── 01_fundamentos/module.json  # 9 sections, quiz tras S05
    └── 12_proyecto_final/module.json
```

JSON validado por `content/schemas/content.schema.json` (`23` §7). Cada `question.version` con `PK(id,version)` y `content_version` para `RNF-035`.

---

## 11. Configuración y publicación (`23` §8–§9)

| Clave | Default | Dónde se edita |
|---|---|---|
| `threshold.quiz` / `exam` | 70 / 80 | `PUT /admin/config/thresholds` |
| `xp.*` | `01` §17 | `PUT /admin/config/xp` |
| `bank.min_ratio` | `3.0` / `4.0` | `12` §6.11 |

**Publicación:** `POST /admin/content/validate` → `POST /admin/content/publish` (atómico, <5 min).

---

## 12. Evaluación, progreso y gamificación

- **Evaluación (`15`):** `round(P_obt/P_max*100,2)`, pesos 1.0/1.5/2.0, XP decaimiento.
- **Progreso (`14` §10.2):** `Progreso_lenguaje = aprobados/12*100`, habilita `CQ-LUA-000001` (`17`).
- **Gamificación (`16`):** misma tabla XP; racha `America/Bogota`.

---

## 13. Checklist de autoría Lua

- [ ] Cada lección 60–180 palabras, 1 concepto, ≥1 ejercicio (`24` L-01..L-04).
- [ ] Cada ejemplo 1–8 líneas, `local`, `1`-based (`24` EJ-02).
- [ ] Banco mínimo 30/80 y cobertura por concepto ≥1.
- [ ] `grep -R "python" content/languages/lua/` == 0 (`06` RNF-031).

---

## 14. Trazabilidad

| Elemento | RF | RNF | Docs |
|---|---|---|---|
| 12 módulos × 8-10 sec | RF-LANG-004, RF-MOD-001–004, RF-SEC-001–005 | RNF-006/031 | `01` §30, `11` §18, `23` |
| Quiz 70% / Examen 80% | RF-QUIZ/EXAM/EVAL | RNF-010/012 | `15` |
| Lua sin tocar motor | RF-LANG-004 | RNF-006/031 | `11` §18 |

---

## 15. Próximos pasos

1. Crear `content/languages/lua/manifest.json` con `status: coming_soon` + `sort_order:2`.
2. Poblar `modules/01..12/` siguiendo este doc (un módulo por PR).
3. Generar banco: 30/80 preguntas por evaluación.
4. Ensayo `RNF-006` en `staging`: publicar Lua 1 módulo y verificar 0 cambios en `src/modules/*`.
5. `status → available` y `POST /admin/content/publish`.

---

*Fin de `28_LUA_CURRICULUM.md` v1.1.0 — ampliación a 8-10 secciones por módulo (108 totales). Cualquier cambio requiere actualizar `05`, `23`, `24`, `14`, `15` y `CHANGELOG.md`.*
