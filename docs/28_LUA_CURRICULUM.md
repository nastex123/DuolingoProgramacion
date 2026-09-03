# 28 — Currículo de Lua (Ruta Educativa Lua)

> **Estado:** Propuesta · **Versión del documento:** 1.3.0 · **Fecha:** 2026-08-30 · **Zona horaria:** America/Bogota (UTC-5)
> Complementa a `01_PROJECT_OVERVIEW.md` §7.1/§30–§34, `03_OBJECTIVES.md` OT-02/OT-03, `04_SCOPE.md` §2.2/§3/§10.3, `05_FUNCTIONAL_REQUIREMENTS.md` RF-LANG/RF-MOD/RF-SEC/RF-LEC/RF-PREG/RF-ADM, `06_NON_FUNCTIONAL_REQUIREMENTS.md` RNF-006/RNF-017/RNF-031/RNF-035/RNF-036, `11_SYSTEM_ARCHITECTURE.md` §15/§18, `12_DATABASE_DESIGN.md` §6.3–§6.11, `14_LEARNING_SYSTEM.md` §2–§6/§10, `15_QUIZ_EXAM_SYSTEM.md` §3–§5, `16_GAMIFICATION.md`, `23_CONTENT_SPECIFICATION.md` y `24_CONTENT_AUTHORING_GUIDE.md`. No duplica; es la **fuente de verdad pedagógica del lenguaje Lua**.
> **Principio rector:** `01` §31 — agregar Lua es solo `content/languages/lua/` + config; 0 cambios en `src/modules/*` (`11` §18, `06` RNF-006).
> **Cambio v1.3.0:** Se expande el Módulo 02 (Variables y Tipos de Datos) a un estándar de **10 micro-lecciones por sección (100 lecciones en total)** con secuencia pedagógica optimizada: variables directas sin 'local' en S01-S03, tipos concretos en S04-S06, e introducción formal de 'nil' y 'local' en S07 tras booleanos. Ver §4.2.


---

## 1. Propósito y alcance

Este documento define **cómo se enseña Lua** dentro de la jerarquía `Lenguaje → Módulo → Sección → Lección → Ejercicio` (`14` §2.1). Es el espejo de la ruta Python de `01` §34, pero reescrito con **semántica idiomática de Lua**, no por traducción literal (ver `24` §11.4).

**Sí incluye:** 12 módulos Lua con objetivo, 8-10 secciones por módulo, lecciones (`concept_id` estables), ejemplos idiomáticos, cobertura de tipos de pregunta (T-01..T-11), distribución de dificultad, prerrequisitos DAG, `B_min` y trazabilidad a `23`/`24`/`14`/`15`.

**No incluye:** DDL (`12`), contratos OpenAPI (`13`), ni UI (`27`). Cada lección/pregunta aquí descrita se materializa como JSON/YAML validado por `23` §7–§8 y versionado (`RNF-035`).

**Audiencia:** autores de contenido Lua, revisores pedagógicos/técnicos y publicadores (`24` §1.1).

**Justificación de 8-10 secciones por módulo y lecciones por sección:**
- Sesión = 1 sección = 8-15 min (`14` §9.2). Con 4-6 sesiones, un módulo se completa en 40-90 min; con 8-10, el progreso es más visible, el `Score_repaso` es más fino y el abandono por módulo (`26` M-08) se detecta antes.
- Total Lua: 12 módulos × 9 promedio = **108 secciones**. En el Módulo 01 (Fundamentos) se aplica el estándar expandido de **10 micro-lecciones atómicas por sección (90 lecciones en total)** para garantizar máxima accesibilidad a novatos absolutos sin sobrecarga cognitiva; en módulos posteriores (M02–M12) la progresión continúa en 2-4 lecciones por sección (~280 lecciones totales en la ruta). Tiempo estimado ruta completa: 16-20 h + evaluaciones.
- Implicación XP: con `XP-SEC +10` por sección y `XP-EJ-CORR +5` por ejercicio (`16` §5.2), el Módulo 01 otorga ~540 XP (~90 XP de secciones + ~450 XP de ejercicios), impulsando al estudiante novato a través de sus primeros niveles de forma gratificante y no punitiva.


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

### 3.1 Matriz de Progresión Desbloqueable y Estrellas Mínimas

El roadmap se visualiza completo en la interfaz. El acceso a cada módulo requiere **100% de secciones completadas del módulo anterior + examen aprobado + umbral mínimo de estrellas ($\ge 80\%$)**:

| Módulo | Nombre | Secciones | Lecciones | Estrellas Máx (Secciones) | Estrellas Mín Requeridas (80%) | Estado Inicial |
|---|---|---|---|---|---|---|
| **M01** | Fundamentos de Lua | 9 | 90 | 27 ⭐ | 22 ⭐ (para desbloquear M02) | 🟢 **Desbloqueado (S01 abierta)** |
| **M02** | Variables y Tipos | 10 | 100 | 30 ⭐ | 24 ⭐ (para desbloquear M03) | 🔒 *Bloqueado (Requiere M01 + 22⭐)* |
| **M03** | Operadores | 9 | ~30 | 27 ⭐ | 22 ⭐ (para desbloquear M04) | 🔒 *Bloqueado (Requiere M02 + 24⭐)* |
| **M04** | Condicionales | 9 | ~30 | 27 ⭐ | 22 ⭐ (para desbloquear M05) | 🔒 *Bloqueado (Requiere M03 + 22⭐)* |
| **M05** | Bucles | 9 | ~30 | 27 ⭐ | 22 ⭐ (para desbloquear M06) | 🔒 *Bloqueado (Requiere M04 + 22⭐)* |
| **M06** | Funciones | 10 | ~35 | 30 ⭐ | 24 ⭐ (para desbloquear M07) | 🔒 *Bloqueado (Requiere M05 + 22⭐)* |
| **M07** | Tablas como Arreglos | 9 | ~30 | 27 ⭐ | 22 ⭐ (para desbloquear M08) | 🔒 *Bloqueado (Requiere M06 + 24⭐)* |
| **M08** | Tablas como Mapas | 9 | ~30 | 27 ⭐ | 22 ⭐ (para desbloquear M09) | 🔒 *Bloqueado (Requiere M07 + 22⭐)* |
| **M09** | Cadenas y Libs | 9 | ~30 | 27 ⭐ | 22 ⭐ (para desbloquear M10) | 🔒 *Bloqueado (Requiere M08 + 22⭐)* |
| **M10** | Errores y Módulos | 9 | ~30 | 27 ⭐ | 22 ⭐ (para desbloquear M11) | 🔒 *Bloqueado (Requiere M09 + 22⭐)* |
| **M11** | Metatablas y POO | 10 | ~35 | 30 ⭐ | 24 ⭐ (para desbloquear M12) | 🔒 *Bloqueado (Requiere M10 + 22⭐)* |
| **M12** | Corrutinas e IO | 8 | ~25 | 24 ⭐ | 20 ⭐ (Certificación Final) | 🔒 *Bloqueado (Requiere M11 + 24⭐)* |

**Glosario mapeado (`24` §11.3):**
- `lista` (Python) → `tabla (array)` (Lua, `ipairs`)
- `diccionario` (Python) → `tabla (mapa)` (Lua, `pairs`)
- `método` (Python `self`) → `función con `:` y `self` en Lua
- `None` → `nil`

---

## 4. Detalle por módulo (8-10 secciones cada uno)

> Cada sección = 1 sesión de 8-15 min (`14` §9.2) con `concepto → explicación → ejemplo → ejercicio → feedback → recompensa`. El quiz del módulo aparece tras ~50% de secciones (`01` §13); el examen al cerrar todas. Todo `position` sin huecos y `prerequisite_module_id` DAG validado por `RF-ADM-006` (`23` V-M02/V-M03).

### 4.1 Módulo 01 — Fundamentos de Lua (9 secciones · 10 lecciones c/u · 90 lecciones en total)

**Objetivo:** Entender qué es Lua, cómo se ejecuta un chunk en orden secuencial, dominar `print`, notas/comentarios, gestión de archivos `.lua`, depuración básica y lectura de errores. **Sin tipos formales aún (se introducen en M02).**

> **Estándar Expandido:** Cada sección contiene exactamente **10 micro-lecciones atómicas** (90 lecciones en total) de 40–70 palabras, con 1 ejemplo de código directo y 1 ejercicio interactivo obligatorio (`24` §1.2). Esto elimina brechas conceptuales para personas que entran sin ningún conocimiento previo de programación.

#### 4.1.1 Desglose de Secciones y Lecciones (90 lecciones)

##### S01: ¿Qué es Lua y dónde se usa? (10 lecciones · theory)
- **L01:** ¿Qué es un lenguaje de programación? (`lua-fund-intro-lenguaje`) — La computadora necesita órdenes claras en un idioma común.
- **L02:** El nacimiento de Lua en Brasil (`lua-fund-historia-origen`) — Creado en la PUC-Río como software libre para ser portable.
- **L03:** ¿Por qué Lua es tan ligero y veloz? (`lua-fund-ligereza-peso`) — Pesa menos de 300 KB y arranca al instante.
- **L04:** Lua en videojuegos: El fenómeno Roblox (`lua-fund-roblox`) — Cómo los creadores dan vida a sus mundos con scripts en Lua.
- **L05:** Lua en otros videojuegos famosos (`lua-fund-juegos-famosos`) — World of Warcraft, Angry Birds y motores 2D como LÖVE.
- **L06:** ¿Qué significa que Lua es un lenguaje "incrustado"? (`lua-fund-incrustado`) — Funcionar dentro de un programa mayor sin estorbar.
- **L07:** Lua en servidores web de alta velocidad (`lua-fund-servidores-web`) — Su uso en NGINX y Redis para procesar millones de peticiones.
- **L08:** La primera regla especial de Lua: contamos desde el 1 (`lua-fund-indice-uno`) — En Lua la primera casilla es la 1, no la 0.
- **L09:** Lo que es verdad y lo que es falso en Lua (`lua-fund-falsy-intro`) — Solo `false` y `nil` son falsos; todo lo demás cuenta como verdadero.
- **L10:** Mini-repaso de la Sección 1 (`lua-fund-s01-repaso`) — Evaluación integradora de los fundamentos de Lua.

##### S02: Cómo se organiza y prueba tu código (10 lecciones · example)
- **L01:** ¿Qué es una instrucción o comando? (`lua-fund-instruccion`) — Una orden individual que le indica a la computadora qué hacer.
- **L02:** La computadora lee en orden secuencial (`lua-fund-secuencia`) — Lectura estricta de arriba hacia abajo sin saltarse pasos.
- **L03:** ¿Qué es un bloque de código (chunk)? (`lua-fund-chunk`) — Un conjunto de instrucciones que se evalúan juntas.
- **L04:** Tu archivo completo es un chunk (`lua-fund-archivo-chunk`) — Todo el archivo `.lua` se procesa como una unidad.
- **L05:** ¿Qué es la consola interactiva (REPL)? (`lua-fund-repl-intro`) — Un cuaderno borrable para probar código al vuelo.
- **L06:** Abrir el modo interactivo con `lua -i` (`lua-fund-repl-comando`) — El comando en la terminal para entrar a Lua.
- **L07:** El símbolo de espera `>` (`lua-fund-prompt-simbolo`) — El cursor que indica que Lua está listo para recibir tu orden.
- **L08:** Probar tu primera orden en vivo (`lua-fund-repl-en-vivo`) — Escribir código y ver la respuesta al instante con Enter.
- **L09:** Salir de la consola interactiva sin miedo (`lua-fund-repl-salir`) — Uso de `os.exit()` o `Ctrl + D`.
- **L10:** Mini-repaso de la Sección 2 (`lua-fund-s02-repaso`) — Evaluación de chunks y ejecución interactiva.

##### S03: Tu primer print (10 lecciones · example)
- **L01:** ¿Para qué sirve `print`? (`lua-fund-print-para-que`) — La herramienta para que tu programa muestre mensajes en pantalla.
- **L02:** Los paréntesis `()` en las órdenes (`lua-fund-print-parentesis`) — Encerrar los datos que la función debe procesar.
- **L03:** Mostrar tu primer mensaje: `"Hola, mundo"` (`lua-fund-print-hola`) — La tradición universal de bienvenida.
- **L04:** Por qué usamos comillas en los textos (`lua-fund-print-comillas`) — Delimitar el mensaje sin confundirlo con órdenes del lenguaje.
- **L05:** Comillas dobles `""` vs comillas simples `''` (`lua-fund-comillas-tipos`) — Ambas formas son válidas e intercambiables en Lua.
- **L06:** Mostrar números sin comillas: `print(100)` (`lua-fund-print-numeros`) — Los números se escriben directos para poder calcular con ellos.
- **L07:** La computadora calculadora: `print(10 + 5)` (`lua-fund-print-calculo`) — Lua resuelve la operación antes de imprimir.
- **L08:** Mostrar varios datos juntos usando comas (`lua-fund-print-multiples`) — Pasar varios argumentos: `print("Nivel:", 1)`.
- **L09:** El espacio automático que crea la coma (`lua-fund-print-espacios`) — Cómo Lua separa automáticamente cada elemento con un espacio.
- **L10:** Mini-repaso de la Sección 3 (`lua-fund-s03-repaso`) — Ejercicio de consolidación de salidas con `print`.

##### S04: Comentarios (10 lecciones · exercise)
- **L01:** ¿Qué es un comentario en programación? (`lua-fund-comentario-que-es`) — Notas personales que la computadora ignora por completo.
- **L02:** Escribir notas para tu "yo del futuro" (`lua-fund-comentario-empatia`) — Documentar el motivo detrás de tu código.
- **L03:** Comentarios de una sola línea con `--` (`lua-fund-comentario-linea`) — Dos guiones seguidos desactivan el resto del renglón.
- **L04:** Comentarios al final de una línea (`lua-fund-comentario-inline`) — Código a la izquierda y nota explicativa a la derecha.
- **L05:** Comentarios de bloque con `--[[` y `]]` (`lua-fund-comentario-bloque`) — Desactivar párrafos completos de varias líneas.
- **L06:** Apagar una orden temporalmente sin borrarla (`lua-fund-debug-apagar-linea`) — Desactivar código para hacer pruebas rápidas.
- **L07:** Apagar un bloque sospechoso de código (`lua-fund-debug-apagar-bloque`) — Aislar varias líneas dudosas con `--[[ ... ]]`.
- **L08:** Buenas prácticas: comentar el *por qué* y no el *qué* (`lua-fund-comentario-estilo`) — Evitar comentarios obvios o redundantes.
- **L09:** Los comentarios no hacen tu programa más lento (`lua-fund-comentario-rendimiento`) — La máquina los descarta en milisegundos.
- **L10:** Mini-repaso de la Sección 4 (`lua-fund-s04-repaso`) — Dominio de comentarios simples y multilínea.

##### S05: Archivos .lua (10 lecciones · exercise)
- **L01:** Por qué guardamos código en archivos (`lua-fund-archivo-por-que`) — Conservar tu trabajo para reutilizarlo cuantas veces quieras.
- **L02:** La extensión `.lua`: la etiqueta de tu código (`lua-fund-archivo-extension`) — Indicar al sistema operativo el tipo de archivo.
- **L03:** Editores de código vs procesadores de texto (`lua-fund-editores-vs-word`) — Por qué programamos en editores puros y no en Word.
- **L04:** El archivo principal: por qué lo llamamos `main.lua` (`lua-fund-archivo-main`) — La convención estándar para el punto de arranque.
- **L05:** Guardar cambios antes de ejecutar (`lua-fund-archivo-guardar`) — El hábito esencial de pulsar `Ctrl + S`.
- **L06:** Dónde vive tu archivo (Carpetas y rutas) (`lua-fund-carpetas-rutas`) — Conocer la ubicación exacta de tus scripts en disco.
- **L07:** Múltiples archivos en un mismo proyecto (`lua-fund-multiples-archivos`) — Separar personajes, niveles y utilidades en archivos distintos.
- **L08:** Nombres limpios para archivos (`lua-fund-nombres-archivos`) — Evitar espacios, tildes y caracteres extraños (`juego_01.lua`).
- **L09:** Consola interactiva vs archivo guardado (`lua-fund-repl-vs-archivo`) — Probar ideas al vuelo vs construir aplicaciones duraderas.
- **L10:** Mini-repaso de la Sección 5 (`lua-fund-s05-repaso`) — Gestión de archivos y carpetas en Lua.

##### S06: Ejecutar código (10 lecciones · exercise)
- **L01:** Abrir la terminal en tu carpeta de trabajo (`lua-fund-terminal-abrir`) — Situar la consola en la carpeta de tu script.
- **L02:** El comando maestro: `lua main.lua` (`lua-fund-comando-ejecutar`) — Ordenar al intérprete leer y ejecutar tu archivo.
- **L03:** Qué ocurre por dentro al pulsar Enter (`lua-fund-ejecucion-interna`) — Cómo Lua traduce tu texto a acciones de la máquina.
- **L04:** Ver el resultado de tu programa en la terminal (`lua-fund-leer-terminal`) — Comprobar la salida limpia de tus prints.
- **L05:** Ejecutar archivos con otros nombres (`lua-fund-ejecutar-otros`) — Usar `lua otro_script.lua`.
- **L06:** Qué es un bloque con apertura y cierre (`lua-fund-bloque-apertura`) — Estructuras que agrupan órdenes dependientes.
- **L07:** La palabra obligatoria `end` (`lua-fund-palabra-end`) — Cerrar la puerta con llave al terminar cada bloque (`if`, `function`).
- **L08:** El error más famoso: `'end' expected` (`lua-fund-error-end-expected`) — Por qué ocurre y cómo solucionarlo en segundos.
- **L09:** El ciclo de trabajo del programador (`lua-fund-ciclo-desarrollo`) — Editar → Guardar (`Ctrl+S`) → Ejecutar en terminal → Verificar.
- **L10:** Mini-repaso de la Sección 6 (`lua-fund-s06-repaso`) — Ejecución de scripts y prevención de errores de bloque.

##### S07: Palabras reservadas y Estilo limpio (10 lecciones · theory)
- **L01:** ¿Qué son las palabras reservadas? (`lua-fund-reservadas-concepto`) — Las 21 palabras que el lenguaje se reserva para sus propias reglas.
- **L02:** Palabras prohibidas para nombres: `local`, `if`, `while`, `function` (`lua-fund-palabras-prohibidas`) — Por qué no puedes bautizar variables con ellas.
- **L03:** Qué ocurre si usas una palabra reservada (`lua-fund-error-reservada`) — El error de sintaxis inesperado (`unexpected symbol`).
- **L04:** Reglas para inventar nombres válidos (`lua-fund-nombres-reglas`) — Solo letras, números y el guión bajo `_`.
- **L05:** La regla prohibida: nunca empezar un nombre con número (`lua-fund-nombres-no-numero`) — `nivel1` es válido; `1nivel` es un error.
- **L06:** Nombres claros y expresivos (`lua-fund-nombres-claros`) — Escribir `puntos_vida` en lugar de letras misteriosas como `p`.
- **L07:** La sangría o indentación de 2 espacios (`lua-fund-indentacion`) — Escalonar el código hacia adentro para leer la jerarquía visual.
- **L08:** Lua es libre: el punto y coma `;` no es obligatorio (`lua-fund-puntoycoma-opcional`) — Escribir código limpio y despejado sin `;`.
- **L09:** Mayúsculas y minúsculas: Lua distingue cada letra (`lua-fund-case-sensitive`) — `jugador`, `Jugador` y `JUGADOR` son tres cosas distintas.
- **L10:** Mini-repaso de la Sección 7 (`lua-fund-s07-repaso`) — Reglas de estilo y nombres limpios.

##### S08: Kit para entender errores (10 lecciones · review)
- **L01:** Perder el miedo a los errores (`lua-fund-perder-miedo-error`) — En programación, equivocarse es parte natural del aprendizaje.
- **L02:** ¿Qué es un traceback? (`lua-fund-traceback-concepto`) — El mapa de pistas que Lua te entrega cuando algo tropieza.
- **L03:** Anatomía del mensaje de error (`lua-fund-anatomia-error`) — Cómo leer `archivo.lua:línea: descripción del problema`.
- **L04:** Error al escribir (Syntax Error) (`lua-fund-syntax-error`) — Cuando falta cerrar una comilla o un paréntesis antes de ejecutar.
- **L05:** Error al ejecutar (Runtime Error) (`lua-fund-runtime-error`) — Cuando la sintaxis es correcta pero la orden intenta algo imposible.
- **L06:** El error `attempt to index a nil value` (`lua-fund-error-nil-index`) — Qué significa intentar usar una caja vacía que no existe.
- **L07:** La técnica detectivesca de apagar líneas con `--[[ ]]` (`lua-fund-debug-aislar-error`) — Aislar fallos desactivando secciones sospechosas.
- **L08:** Depuración con `print` (`lua-fund-debug-con-print`) — Colocar `print("pasó por aquí")` para saber hasta dónde llegó la computadora.
- **L09:** Probar la sospecha en la consola `lua -i` (`lua-fund-debug-repl`) — Verificar una sola orden aislada antes de modificar el archivo.
- **L10:** Mini-repaso de la Sección 8 (`lua-fund-s08-repaso`) — Tu botiquín de primeros auxilios para resolver fallos.

##### S09: Checkpoint y Proyecto Integrador (10 lecciones · review)
- **L01:** Mapa mental general de Fundamentos (`lua-fund-mapa-mental`) — Los 8 grandes pilares aprendidos en el Módulo 01.
- **L02:** Repaso activo 1: La naturaleza de Lua (`lua-fund-repaso-naturaleza`) — Consolidar qué es Lua y por qué se usa en videojuegos.
- **L03:** Repaso activo 2: De la terminal al archivo (`lua-fund-repaso-archivos`) — Consolidar el REPL `lua -i` y los archivos `.lua`.
- **L04:** Repaso activo 3: La salida con `print` (`lua-fund-repaso-print`) — Consolidar textos, números y comas.
- **L05:** Repaso activo 4: El valor de las notas (`lua-fund-repaso-comentarios`) — Consolidar comentarios de una línea y de bloque.
- **L06:** Repaso activo 5: La regla del cierre con `end` (`lua-fund-repaso-cierre-end`) — Consolidar la estructura de bloques sin olvidar el `end`.
- **L07:** Repaso activo 6: Nombres legales y estilo (`lua-fund-repaso-estilo`) — Consolidar palabras reservadas e indentación limpia.
- **L08:** Repaso activo 7: Diagnóstico de fallos (`lua-fund-repaso-diagnostico`) — Consolidar la lectura de tracebacks y depuración.
- **L09:** Gran Desafío Práctico: Tu primer script firmado (`lua-fund-desafio-integrador`) — Escribir tu presentación con comentarios y cálculos.
- **L10:** Graduación del Módulo 01 y bienvenida al Módulo 02 (`lua-fund-graduacion-m01`) — Resumen de logros y qué descubrirás en Variables y Tipos.

---

**Prerrequisito:** ninguno. **Evaluación:** Quiz del módulo con 15 preguntas y examen final con 20 preguntas calibradas. **Dedicación estimada:** 9 secciones × 10–12 min = ~90–110 min totales.

**Ejemplo representativo del Módulo 01 (Script de Graduación):**
```lua
-- ==========================================
-- Mi Primer Programa en Lua
-- Autor: Nuevo Programador
-- ==========================================

print("¡Hola, mundo!")
print("Estoy aprendiendo Lua para crear videojuegos.")
print("Mi nivel inicial es:", 1)

-- Operación matemática básica directa:
print("Horas dedicadas hoy:", 1 + 1)

--[[
  Todo este bloque está comentado temporalmente.
  No se ejecutará hasta que retiremos los corchetes.
]]
print("¡Listo para el Módulo 02: Variables y Tipos de Datos!")
```


### 4.2 Módulo 02 — Variables y tipos de datos (10 secciones · 100 lecciones)

**Código:** `LUA_MOD_02` · **Slug:** `variables-y-tipos-de-datos` · **Posición:** 2
**Objetivo:** Dominar el almacenamiento de datos en memoria, asignación, reasignación, el sistema completo de 8 tipos nativos de Lua, la inspectora `type()`, la regla de oro de *falsy*, la palabra clave obligatoria `local` (introducida junto con `nil` en S07), y conversiones seguras.

**Progresión Pedagógica Específica:**
- **S01 a S03 (Intuición pura sin `local`):** El estudiante aprende qué es una variable (`nombre = "Ana"`, `vidas = 3`), cómo reasignar valores y cómo consultar tipos con `type()` sin ruido sintáctico ni sobrecarga cognitiva de alcance (*scope*).
- **S04 a S06 (Tipos tangibles y lógica binaria):** Números enteros y decimales en S04, cadenas de texto y bloques multilínea `[[ ]]` en S05, y valores booleanos con `true`, `false` y `not` en S06.
- **S07 (La llegada de `nil` y la revelación de `local`):** Conexión inmediata con booleanos (los únicos dos falsos son `false` y `nil`). Se introduce `local` demostrando que una variable declarada vacía (`local x`) contiene `nil`. A partir de este momento, se establece `local` como el estándar profesional para evitar fugas en el entorno global.
- **S08 a S10 (Conversiones, tipos avanzados y graduación):** Conversión con `tostring` y `tonumber`, vista previa a `table` y `function`, y Proyecto Integrador de Ficha de Héroe RPG.

---

#### Mapa de Secciones y Lecciones del Módulo 02:

##### S01: ¿Qué es una variable y cómo guardar datos? (10 lecciones · theory)
- **L01:** ¿Qué es una variable? La cajita con etiqueta (`lua-var-concepto`) — Guardar datos en memoria para reutilizarlos.
- **L02:** Guardar un número en una variable: `vidas = 3` (`lua-var-guardar-numero`) — Tu primera asignación numérica.
- **L03:** El operador de asignación `=` (`lua-var-operador-asignacion`) — La flecha que guarda lo de la derecha en la caja de la izquierda.
- **L04:** Leer el valor guardado con `print(vidas)` (`lua-var-leer-print`) — Mostrar lo que está adentro de la cajita.
- **L05:** Guardar texto en una variable: `nombre = "Ana"` (`lua-var-guardar-texto`) — Variables con cadenas protegidas por comillas.
- **L06:** La diferencia entre `"palabra"` con comillas y `palabra` variable (`lua-var-vs-string`) — Texto literal vs identificador.
- **L07:** Nombres de variables descriptivos y claros (`lua-var-nombres-descriptivos`) — Escribir `puntos_oro` en vez de `p`.
- **L08:** Crear varias variables en renglones separados (`lua-var-varias-lineas`) — Organizar el estado de tu programa.
- **L09:** Usar el valor de una variable en cálculos: `print(puntos + 10)` (`lua-var-usar-calculos`) — Operar con datos almacenados.
- **L10:** Mini-repaso de la Sección 1 (`lua-var-s01-repaso`) — Variables y asignación directa dominadas.

##### S02: Reasignación y cambio de valores (10 lecciones · example)
- **L01:** ¿Qué significa reasignar una variable? (`lua-var-reasignar-concepto`) — Sobrescribir el contenido de la cajita.
- **L02:** Cambiar el valor: de `vidas = 3` a `vidas = 2` (`lua-var-cambiar-valor`) — El paso del tiempo en el programa.
- **L03:** Las variables solo recuerdan su último valor (`lua-var-ultimo-valor`) — La memoria reemplaza lo anterior por completo.
- **L04:** Incrementar un contador: `puntos = puntos + 1` (`lua-var-contador-incrementar`) — Tomar el valor actual y sumarle uno.
- **L05:** Reducir un contador: `vidas = vidas - 1` (`lua-var-contador-reducir`) — Restar unidades al recibir daño.
- **L06:** Copiar el valor de una variable en otra (`lua-var-copiar-variable`) — `copia = original`.
- **L07:** Las variables copiadas son independientes (`lua-var-independencia-copias`) — Modificar la copia no altera la original.
- **L08:** Cambiar de tipo de dato sobre la marcha (`lua-var-cambio-tipo-dinamico`) — Lua es de tipado dinámico.
- **L09:** El orden secuencial importa al leer y reasignar (`lua-var-secuencia-reasignar`) — La lectura depende del momento exacto.
- **L10:** Mini-repaso de la Sección 2 (`lua-var-s02-repaso`) — Reasignación y contadores dominados.

##### S03: El sistema de tipos y la función `type()` (10 lecciones · theory)
- **L01:** ¿Qué es un "tipo de dato"? (`lua-type-concepto-tipo`) — La naturaleza de lo que guardas en la cajita.
- **L02:** El catálogo completo: los 8 tipos nativos de Lua (`lua-type-ocho-tipos`) — nil, boolean, number, string, table, function, thread, userdata.
- **L03:** Conoce la función inspectora: `type()` (`lua-type-funcion-inspectora`) — La lupa para saber qué tipo es cualquier valor.
- **L04:** `type()` siempre responde con una palabra de texto (`lua-type-retorna-string`) — El resultado siempre es un string.
- **L05:** Inspeccionar números: `type(100)` devuelve `"number"` (`lua-type-test-number`) — Reconocimiento numérico.
- **L06:** Inspeccionar textos: `type("hola")` devuelve `"string"` (`lua-type-test-string`) — Reconocimiento de cadenas.
- **L07:** Inspeccionar booleanos: `type(true)` devuelve `"boolean"` (`lua-type-test-boolean`) — Reconocimiento booleano.
- **L08:** Inspeccionar variables: `type(vidas)` consulta el valor adentro (`lua-type-test-variable`) — Las variables no tienen tipo fijo; el valor sí.
- **L09:** Errores comunes al comparar el resultado de `type()` (`lua-type-errores-comparar`) — Comparar con `"number"` con comillas.
- **L10:** Mini-repaso de la Sección 3 (`lua-type-s03-repaso`) — La inspectora de tipos dominada.

##### S04: El tipo `number`: Enteros y decimales (10 lecciones · example)
- **L01:** Números enteros (`integer`) en Lua (`lua-num-enteros`) — Cifras exactas sin decimales (1, 42, 1000).
- **L02:** Números decimales (`float`) con punto `.` (`lua-num-decimales`) — Usar punto y nunca coma para decimales (3.14).
- **L03:** Números negativos con el signo menos `-` (`lua-num-negativos`) — Valores bajo cero (-10, -0.5).
- **L04:** Notación científica para números gigantes (`1e6`) (`lua-num-cientifica`) — Representar millones de forma compacta.
- **L05:** Números hexadecimales con `0x` (`lua-num-hexadecimal`) — Base 16 para colores y memoria (`0xFF`).
- **L06:** Precisión y límites numéricos de 64 bits (`lua-num-limites-64bit`) — La inmensa capacidad numérica de Lua moderno.
- **L07:** División entera `//` vs división decimal `/` (`lua-num-division-entera`) — Obtener cocientes enteros limpios.
- **L08:** El operador módulo `%` para residuos (`lua-num-modulo-residuo`) — Detectar números pares y ciclos de juego.
- **L09:** La potencia con el acento circunflejo `^` (`lua-num-potencia`) — Elevar al cuadrado o al cubo (`2^3 = 8`).
- **L10:** Mini-repaso de la Sección 4 (`lua-num-s04-repaso`) — Números y matemáticas en Lua dominados.

##### S05: El tipo `string`: Textos y bloques (10 lecciones · example)
- **L01:** Qué es una cadena o `string` (`lua-str-concepto`) — Secuencias de letras, números y símbolos.
- **L02:** Comillas dobles `""` para textos directos (`lua-str-comillas-dobles`) — El estándar más habitual.
- **L03:** Comillas simples `''` para textos con comillas dobles (`lua-str-comillas-simples`) — Anidar diálogos sin romper el código.
- **L04:** Salto de línea con `\n` (`lua-str-escape-newline`) — Bajar de renglón dentro del mismo texto.
- **L05:** Tabulador con `\t` para columnas limpias (`lua-str-escape-tab`) — Alinear tablas y datos en consola.
- **L06:** Escapar comillas con barra invertida `\"` (`lua-str-escape-comilla`) — Proteger comillas internas.
- **L07:** Cadenas multilínea con corchetes dobles `[[ ]]` (`lua-str-bloque-multilinea`) — Párrafos enteros sin caracteres de escape.
- **L08:** Conservar saltos exactos en bloques `[[ ]]` (`lua-str-bloque-saltos`) — Arte ASCII y diálogos largos de RPG.
- **L09:** El operador longitud `#` para contar letras (`lua-str-longitud-hash`) — `#"hola"` devuelve 4.
- **L10:** Mini-repaso de la Sección 5 (`lua-str-s05-repaso`) — Cadenas y textos dominados.

##### S06: El tipo `boolean`: La lógica de la verdad (10 lecciones · exercise)
- **L01:** Qué es un valor booleano (`lua-bool-concepto`) — La toma de decisiones en dos estados.
- **L02:** Los únicos dos estados: `true` y `false` (`lua-bool-estados`) — Encendido o apagado, sí o no.
- **L03:** La regla de oro: los únicos dos falsos son `false` y `nil` (`lua-bool-regla-falsy`) — El pilar fundamental de Lua.
- **L04:** El número `0` cuenta como verdadero en Lua (`lua-bool-cero-es-true`) — Cero es un número real y no apaga condiciones.
- **L05:** El texto vacío `""` cuenta como verdadero en Lua (`lua-bool-vacio-es-true`) — Una cadena existe aunque no tenga letras.
- **L06:** El operador lógico `not` para invertir verdades (`lua-bool-operador-not`) — `not true` es `false`.
- **L07:** Doble negación `not not x` para extraer el booleano (`lua-bool-doble-not`) — Convertir cualquier valor a true/false puro.
- **L08:** Comparaciones directas que producen booleanos (`lua-bool-comparacion-resultado`) — `vidas > 0` produce true.
- **L09:** Errores clásicos de los que vienen de Python o JS (`lua-bool-comparativa-lenguajes`) — Evitar trampas de falsy ajenas.
- **L10:** Mini-repaso de la Sección 6 (`lua-bool-s06-repaso`) — La lógica booleana dominada.

##### S07: El tipo `nil` y la llegada de `local` (10 lecciones · exercise)
- **L01:** ¿Qué es `nil`? La ausencia total de valor (`lua-nil-concepto-vacio`) — El vacío de la cajita.
- **L02:** Presentando a `local`: la palabra clave para crear variables seguras (`lua-var-intro-local`) — El estándar profesional.
- **L03:** Declarar `local x` sin valor inicial: ¡adentro hay `nil`! (`lua-nil-local-sin-valor`) — La cajita existe pero no tiene dato.
- **L04:** `type(nil)` devuelve la palabra `"nil"` (`lua-nil-type-inspect`) — El octavo tipo inspectable.
- **L05:** `nil` no es el número `0` ni el texto vacío `""` (`lua-nil-vs-cero-y-vacio`) — La nada vs valores existentes vacíos.
- **L06:** Conexión con booleanos: `false` y `nil` como los únicos falsos (`lua-nil-falsy-conexion`) — Unión de conceptos.
- **L07:** Borrar una variable asignándole `nil` (`lua-nil-borrar-variable`) — Eliminar el dato de la memoria.
- **L08:** Por qué a partir de ahora siempre usaremos `local` (`lua-var-por-que-local-siempre`) — Aislamiento y rendimiento.
- **L09:** El peligro de olvidar `local` (fugas globales en `_G`) (`lua-var-peligro-global-intro`) — Contaminación de scripts ajenos.
- **L10:** Mini-repaso de la Sección 7 (`lua-nil-s07-repaso`) — `nil` y variables locales dominados.

##### S08: Conversión de tipos y Coerción (10 lecciones · exercise)
- **L01:** Por qué necesitamos convertir tipos (`lua-conv-por-que-convertir`) — Adaptar datos de entrada a operaciones.
- **L02:** De número a texto con `tostring()` (`lua-conv-tostring`) — Convertir 100 en "100" para imprimirlo o unirlo.
- **L03:** De texto a número con `tonumber()` (`lua-conv-tonumber`) — Convertir "50" en 50 para sumarlo.
- **L04:** Qué pasa si `tonumber()` no puede convertir (devuelve `nil`) (`lua-conv-tonumber-falla-nil`) — Validar entradas no numéricas.
- **L05:** Conversión en bases numéricas con `tonumber(str, base)` (`lua-conv-tonumber-bases`) — Convertir binario y hexadecimal.
- **L06:** La coerción implícita: cuando Lua intenta adivinar (`lua-conv-coercion-implicita`) — Operaciones mixtas automáticas.
- **L07:** El peligro de sumar texto y número (`"5" + 2`) (`lua-conv-peligro-coercion`) — Errores sutiles y buenas prácticas.
- **L08:** Diferencia entre sumar `+` y concatenar `..` (`lua-conv-suma-vs-concat`) — Sumar calcula cifras; concatenar une textos.
- **L09:** Buenas prácticas: nunca depender de la coerción mágica (`lua-conv-buenas-practicas`) — Usar conversiones explícitas siempre.
- **L10:** Mini-repaso de la Sección 8 (`lua-conv-s08-repaso`) — Conversiones seguras dominadas.

##### S09: Vistazo a los 4 tipos avanzados (10 lecciones · theory)
- **L01:** Los tipos simples vs los tipos contenedores (`lua-adv-simples-vs-complejos`) — Valores atómicos vs estructuras.
- **L02:** `table`: La estructura reina de Lua (`lua-adv-intro-table`) — El único contenedor nativo para listas y mapas.
- **L03:** Una tabla vacía `{}` y qué dice `type({})` (`lua-adv-tabla-vacia`) — Declarar una tabla y verificar `"table"`.
- **L04:** `function`: El código como valor de primera clase (`lua-adv-intro-function`) — Las funciones son valores manipulables.
- **L05:** Guardar una función en una variable local (`lua-adv-funcion-en-variable`) — `local saludar = function() ... end`.
- **L06:** Qué dice `type()` sobre una función (`lua-adv-type-function`) — Verifica `"function"`.
- **L07:** `thread`: Introducción conceptual a corrutinas (`lua-adv-intro-thread`) — Tareas concurrentes cooperativas.
- **L08:** `userdata`: Datos externos que vienen de C/C++ (`lua-adv-intro-userdata`) — Objetos nativos del motor gráfico.
- **L09:** Resumen de los 8 tipos nativos conviviendo juntos (`lua-adv-ocho-conviviendo`) — El ecosistema completo de tipos.
- **L10:** Mini-repaso de la Sección 9 (`lua-adv-s09-repaso`) — Los 8 tipos identificados al 100%.

##### S10: Checkpoint, Proyecto RPG y Graduación (10 lecciones · review)
- **L01:** Gran mapa mental de Variables y Tipos (`lua-mod02-mapa-mental`) — Síntesis de los 10 temas del Módulo 02.
- **L02:** Repaso activo 1: Asignaciones y nombres claros (`lua-mod02-repaso-asignacion`) — Crear variables puras.
- **L03:** Repaso activo 2: Reasignación y contadores (`lua-mod02-repaso-contadores`) — Modificar valores en el tiempo.
- **L04:** Repaso activo 3: La inspectora `type()` (`lua-mod02-repaso-type`) — Clasificar cualquier dato.
- **L05:** Repaso activo 4: `nil` y la seguridad de `local` (`lua-mod02-repaso-nil-local`) — Ausencia de valor y variables seguras.
- **L06:** Repaso activo 5: Números y cadenas (`lua-mod02-repaso-num-str`) — Manipular cifras y textos.
- **L07:** Repaso activo 6: Booleanos y la regla falsy (`lua-mod02-repaso-bool`) — Tomar decisiones con verdad y mentira.
- **L08:** Repaso activo 7: Conversiones con `tostring` y `tonumber` (`lua-mod02-repaso-conv`) — Transformar datos con seguridad.
- **L09:** Gran Desafío Práctico: Ficha de Personaje RPG en Lua (`lua-mod02-desafio-rpg`) — Script integrador completo con múltiples tipos.
- **L10:** Graduación del Módulo 02 y Bienvenida al Módulo 03: Operadores (`lua-mod02-graduacion`) — Celebración y preparación para expresiones.

---

**Prerrequisito:** Módulo 01 (Fundamentos de Lua). **Evaluación:** Quiz del módulo con 15 preguntas y examen final con 20 preguntas calibradas. **Dedicación estimada:** 10 secciones × 10–12 min = ~100–120 min totales.

**Ejemplo representativo del Módulo 02 (Ficha de Personaje RPG):**
```lua
-- ==========================================
-- Ficha de Héroe RPG - Módulo 02
-- ==========================================

-- Variables con diferentes tipos de datos:
local nombre = "Aria la Valiente"   -- string
local nivel = 5                      -- number (entero)
local salud = 98.5                   -- number (decimal)
local esta_vivo = true               -- boolean
local gremio = nil                   -- nil (aún no pertenece a ningún clan)

print("Héroe:", nombre)
print("Nivel:", nivel, "| Tipo:", type(nivel))
print("Salud:", salud)
print("¿Está en combate?:", esta_vivo)
print("Clan:", gremio) -- Muestra: nil

-- Reasignación dinámica al subir de nivel:
nivel = nivel + 1
print("¡Subiste de nivel! Nuevo nivel:", nivel)
```


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
- **Progreso (`14` §10.2):** `Progreso_lenguaje = aprobados/12*100`, habilita `KODA-LUA-000001` (`17`).
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
