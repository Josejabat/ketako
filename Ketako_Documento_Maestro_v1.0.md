# KETAKO — Documento Maestro v1.0

**Proyecto:** Ketako — Gipuzkoako laguntzailea (asistente de voz para mayores en euskera/castellano)
**URL producción:** https://ketako.eus (+ www.ketako.eus)
**Repositorio local:** `~/ketako` (Mac de Joseja) + GitHub: github.com/josejabat/ketako
**Despliegue:** Vercel (Node serverless)
**Actualizado:** 2026-07-26
**Última sesión de código:** 2026-07-11
**Fase actual:** Preparando prueba con usuarios reales antes de abrir nuevas ramas

> **LEER ANTES de tocar `api/chat.js` o `index.html`. Actualizar DESPUÉS con commit.**

---

## 0. Qué es Ketako y para quién

Asistente de voz + texto instalable como PWA. Pensado para el perfil real de Duintasuna: **mayores, móvil, micrófono, euskera con toponimia**. Le hablas o le escribes en euskera (o castellano) sobre Gipuzkoa y responde con datos verificados de prensa comarcal, agenda cultural, transporte, ayuntamientos, farmacias, sanidad, deporte, patrimonio, etc.

**Filosofía asumida:**
- La **precisión es política**, no cosmética. Publico Duintasuna. Un dato inventado hace más daño que un "no lo sé".
- Cuando Ketako no sabe, **debe ser honesto** ("beste bilaketa bat egin beharko nuke" / "tendría que hacer otra búsqueda").
- Primero que **responda bien**; el diseño visual está aparcado a propósito.

---

## 1. Estado actual (resumen ejecutivo)

Lo esencial ya funciona en producción y verificado por voz en Mac y móvil:

- ✅ **Eguraldia** — municipio a municipio + "Gipuzkoan eguraldia" con tres paisajes (Kostaldea/Debagoiena/Goierri)
- ✅ **Noticias comarcales** — prensa local fetcheable + Brave para las que van por JS
- ✅ **Agenda cultural** — kulturklik.euskadi.eus cubre TODA Euskadi
- ✅ **Transporte** — líneas de tren y bus con tabla fija en código
- ✅ **Micro iPhone** — Whisper con prompt euskera + toponimos (era el bloqueante para probadores)
- ✅ **Voz en euskera** — números vigesimales + limpieza fonética para Monica es-ES
- ✅ **Icono iOS** — apple-touch-icon + PNG opaco (misterio de junio cerrado)
- ✅ **DNS apex** ketako.eus sin www — verificado sano

**Fase inmediata:** prueba con 1-2 usuarios reales de confianza (mayores, Duintasuna). Método: dar solo la URL sin instrucciones ni ejemplos. Cada pregunta real vale más que diez nuestras. Lo que salga alimentará ERRATAK, prioridades y hoja de ruta.

---

## 2. Arquitectura acordada (cómo Ketako decide dónde buscar)

1. **Clasificar la pregunta por TIPO**: eguraldia / noticias / agenda-eventos / trámites-udala / transporte / deporte / salud / social / turismo-patrimonio
2. **Prensa comarcal fetcheable** → fetch directo sección municipio
3. **Comarca `*.hitza.eus`** → Brave Search con `site:` (nunca fetch)
4. **Ayuntamiento como respaldo universal** (cuando esté verificado)
5. **Datos estables** (líneas de tren, teléfonos, direcciones) → **tabla fija en código > fetch**
6. **Observatorios**:
   - Si Tableau/JS (Behagi datos municipales) → **embeber** con cita ("Behagi 2024")
   - Si web viva actualizada (SegSocial pensiones) → **fetch**
7. **Rama social en 3 capas**: (1) estructura embebida con año y fuente, (2) directorio behagi.eus, (3) trámites Dipu/udala/SegSocial/GV
8. **Hemeroteca** (pasado): sin solución aún; Brave indexa mal la prensa local vasca

---

## 3. Ramas del código y su estado

| Rama | Estado | Notas |
|---|---|---|
| Eguraldia | ✅ Cerrada | 3 paisajes para Gipuzkoa entera (c8ee521). No tocar. |
| Noticias | ✅ Funciona | Mapa único ITURRIAK (5940b0b). Contexto 6000 chars. |
| Agenda | ✅ Funciona | kulturklik como fuente universal (b5b24df) |
| Transporte | ✅ Funciona | Tabla fija (8a63ce5+bcc5705+1e99e0f). Horas exactas pendientes. |
| Trámites udala | ⚠️ Básico | Vía web municipal. Sin diseño propio. |
| Micro/Voz | ✅ Resuelto | Whisper prompt (9121dea) + números euskera + limpieza voz |
| Deporte | ⏳ Pendiente | Diseño 2 capas: noticias=prensa OK; datos=clubs/federaciones |
| Salud/Osakidetza | ⏳ Pendiente | Sensible. Centros, PAC, cita previa. Sesión propia. |
| Social/Behagi | ⏳ Pendiente | Diseño 3 capas. Con calma. Precisión crítica. |
| Turismo/Patrimonio | ⏳ Pendiente | Alucinación Arantzazu confirmada 2×. Sesión propia. |
| Montaña/Rutas | ⏳ Pendiente | Aizkorri, Ernio, Izarraitz — sin fuentes exploradas. |
| Farmacias | ⏳ Verificar | Comprobar si cofgipuzkoa da guardia del día fetcheable. |
| Diputación + GV | ⏳ Pendiente | Ayudas, gipuzkoa.eus, euskadi.eus. |
| Fiestas patronales | ⏳ Pendiente | Tabla con Joseja. |
| Hemeroteca | ⏳ Sin solución | Brave indexa mal prensa local. |

---

## 4. Fuentes verificadas (fetch directo con curl)

Verificado 2026-07-04 con curl + limpieza HTML, contenido real con fechas.

| Fuente | Cubre | URL patrón | Notas |
|---|---|---|---|
| barrena.eus | Debabarrena | `barrena.eus/MUNICIPIO/` | Solo portada, `?s=` no filtra |
| etakitto.eus | Eibar + Debabarrena | `etakitto.eus/albisteak` | Noticias con fechas |
| ataria.eus | Tolosaldea | `ataria.eus/MUNICIPIO/` | |
| noaua.eus | Usurbil | `noaua.eus/usurbil/` | |
| zarautzguka.eus | Zarautz | `zarautzguka.eus/zarautz/` | Red GUKA + Agenda con horas |
| baleike.eus | Zumaia | `baleike.eus` | Red GUKA (Zumaiaguka) |
| uztarria.eus | Azpeitia | `uztarria.eus` | Red GUKA (Azpeitiaguka) |
| maxixatzen.eus | Azkoitia | `maxixatzen.eus` | Red GUKA (Azkoitiaguka) |
| karkara.eus | Orio + Aia | `karkara.eus` | Red GUKA (Orioguka) |
| elgoibar.eus | Elgoibar (udala) | `elgoibar.eus/eu/albisteak` | Noticias municipales |
| errenteria.eus | Errenteria (udala) | `errenteria.eus/eu/albisteak` | 11k chars con mucho menú |
| hernani.eus | Hernani (udala) | `hernani.eus/eu/albisteak` | |
| goiena.eus | Debagoiena | — | Verificado de facto (Eskoriatza OK) |
| kulturklik.euskadi.eus | Agenda TODA Euskadi | `sacarAgendaDia?locale=eu` | Devuelve todo; código extrae por `[Municipio]` |

**Descubrimiento clave:** red GUKA (zarautzguka/baleike/uztarria/maxixatzen/karkara) = misma plataforma. Urola COMPLETA cubierta municipio a municipio.

**Ojo:** zarautzguka NO cubre Zumaia/Azpeitia/Azkoitia (cada una tiene su GUKA).

---

## 5. Fuentes NO fetcheables (NO tocar)

JS-rendered, HTML basura al hacer curl. Para estas comarcas → **Brave Search con `site:`**:
- `goierri.hitza.eus`, `oarsoaldea.hitza.eus`, `bidasoa.hitza.eus`, `irutxulo.hitza.eus`
- Presumiblemente TODAS las `*.hitza.eus` (lea-artibaietamutriku sin verificar)
- `deba.eus` (solo menú, `/eu/albisteak` no existe) — udala Deba descartado
- Páginas HTML de horarios Euskotren (JS, LEN~1800). **Usar PDFs oficiales**.

---

## 6. Sin fuente propia todavía

- **Bidasoa/Irun**: `irun.org/eu/albisteak` da 404. Localizar URL correcta.
- **Goierri**: ayuntamientos sin verificar (beasain.eus, ordizia.eus, zumarraga.eus…). Agenda cubierta por kulturklik.
- **Donostia centro**: irutxulo.hitza.eus vive (curl 200) pero `site:irutxulo` en Brave devuelve vacío. Solución diseñada: rama Donostia propia con irutxulo como fuente principal, como barrena/goiena.
- **Fuente única provincial** (Diputación, agenda cultural Gipuzkoa) — kulturklik lo cubre en agenda.

---

## 7. Lo que funciona (verificado en producción con commit)

- **Mapa único ITURRIAK** — 5940b0b — noticias unificadas, sin fallback barrena universal, contexto 3000→6000
- **Kulturklik agenda universal** — b5b24df — "zer egin ordizian" → Goierriko Jazzaldia con horas
- **Transporte tabla fija** — 8a63ce5+bcc5705+1e99e0f — E1, E2 Topo, Renfe C-1, Alvia, TGV, PESA/Lurraldebus/ALSA
- **Micro iPhone** — 9121dea — formData prompt euskera + 28 toponimos (Zumaia dentro)
- **Voz euskera número vigesimal** — zenbakiEuskaraz/zenbakiakEuskaraz en index.html, solo si `isEu`, pantalla intacta
- **Truco ventrílocuo** — decenas escritas foneticamente para la voz Monica es-ES: `oguei`, `berroguei`, `hiruroguei`, `lauroguei` (para que suene "guei" con /g/ y no "gei" con /x/)
- **Limpieza de voz** — max→gehienez, min→gutxienez, uzt→uztaila, mm→milimetro, km/h→kilometro orduko, paréntesis/dos puntos→comas
- **Eguraldia 3 paisajes** — c8ee521 — un fetch con 3 coordenadas (Donostia/Arrasate/Ordizia). "Kostaldean 23 gradu, Debagoienan 20, Goierrin 19"
- **Alias Errenteria/Orereta** — Whisper y respuesta funcionando. No-regresión OK.
- **DNS apex** — sano (307→www vía Vercel, TTL 300, sin AAAA/CAA). El "falla a ratos" era cobertura móvil.
- **Icono iOS** — `<link apple-touch-icon>` + PNG opaco sin alpha (iOS pinta alpha de negro). icon-ios.png 180px + 192/512 regenerados.

---

## 8. Lo que NO funciona / averías conocidas (con motivo)

- **irutxulo.hitza.eus rama Donostia** — el sitio vive (curl 200) pero `site:irutxulo` en rama genérica devuelve vacío. Donostia se queda sin eventos. → *Sesión propia rama Donostia*.
- **Whisper con frases cortas** — "gipuzkoa" suelto → "el ti gipuzkoa". Con "gipuzkoan eguraldia" acierta. → *Instrucción a probadores: hablar frases enteras*.
- **Whisper con Antzuola** → italiano ("Che tempo ave en Anzula"). tz/ts no existen en castellano. → *Añadir anclas Debagoiena pequeños al prompt Whisper*.
- **Modelo inventa cuando ctx vacío** — "en gipuzkoa zen" (sin palabra eguraldia) → temperaturas y cielo inventados imitando formato. **Violación de "never fill from memory"**. → *Reforzar prompt o detectar respuestas meteo sin ctx*.
- **Modelo inventa toponimia** — "irrereta" → interpretó Irura y la puso en Goierri (es Tolosaldea).
- **Rama social — primer resultado ≠ respuesta** — "pisos tutelados en usurbil" dio Aukera Fundazioa (discapacidad intelectual, verdadero pero irrelevante). La respuesta real es el proyecto municipal **Egurtzegi** (110 viviendas, centro de día, Sendian, Matia entró después). → *Rama social 3 capas, sesión propia*.
- **Rama turismo — alucinación Arantzazu** — "arantzazun zer ikusi" da "Gantzabal auzoko baserriak" (sospecha de alucinación). La respuesta buena: Oteiza (12+ apóstoles), Basterretxea cripta, Sáenz de Oíza + Laorga arquitectos, Chillida puertas, Iglesia paralizó por "ateos".
- **Nombres ambiguos** — "Anoeta" = estadio Y pueblo. Ketako dio solo estadio. → *Regla de system prompt: presentar AMBOS y preguntar*.
- **Behagi datos municipales** — Tableau/JS. fetchUrl inventó "176 RGI". CSV automático: 403. → *CSVs descargados a mano y subidos a Vercel como estáticos. Ya hay serie Elgoibar 2018-2024. Mantenimiento anual*.
- **Detección por `msg2.includes(municipio)`** — frágil ante variantes: "debegoienanastebururako" (erratas, palabras pegadas) no reconoce comarca. → *Normalización de texto ANTES del includes()*.
- **Horas exactas de tren** — HTML de Euskotren es JS y llega vacío. → *PDFs oficiales `euskotren.eus/sites/default/files/horarios/` (E1_Amara_Matiko_CARTEL_Verano2026.pdf). Sesión propia con timezone Europe/Madrid*.

---

## 9. Decisiones técnicas y lecciones aprendidas

- **Verificar SIEMPRE parámetros API antes de usarlos**. Lección dolorosa: instalamos `language=eu` en Whisper — la API no lo soporta, rompió todo.
- **Tabla fija > fetch para datos estables** (líneas, teléfonos, direcciones, farmacias, sedes udala).
- **Observatorios**: si Tableau → embeber con cita; si web viva → fetch. No confundir.
- **Datos estructurales** ("cuántas residencias públicas/concertadas/privadas") no necesitan dato fresco: necesitan dato **EXACTO**. 2024 vale; "unas 60, creo" no vale. Herramienta de argumentación política.
- **Vercel corre en UTC** → convertir SIEMPRE a Europe/Madrid o darás trenes pasados.
- **Icono iOS**: etiqueta `<link apple-touch-icon>` propia + PNG sin alpha (iOS ignora manifest para icono y pinta alpha de negro).
- **Whisper alucina el propio prompt** si el audio llega mudo/raro (devuelve el prompt como transcripción). Visto en producción.
- **Un bloque, un Enter, esperar OK**. Pegar varios comandos de golpe en terminal = atasco de comillas (dquote).
- **Deploy siempre atado con && al OK del parche**. Un parche sin captura de OK es un parche que no existe (se nos escapó la limpieza de voz y perseguimos fantasma).
- **Reproducir fallos desde Mac** con `say + afconvert + python urllib` contra `/api/transcribe` — más rápido que `vercel logs`.
- **En lo social y en patrimonio, el primer resultado de búsqueda NO es la respuesta**. Hace falta panorama, no primer link.
- **Whisper es probabilista** — frases cortas fallarán a veces. Consejo a probadores: repetir con frase entera.
- **Alias de pueblos con doble nombre** — mapa pendiente: Errenteria/Orereta/Renteria, Donostia/San Sebastián, Arrasate/Mondragón, Soraluze/Placencia… para Whisper y respuestas.

---

## 10. Pendientes priorizados

### 10.1. Candidatos para próxima sesión (últimos elegidos 2026-07-11)

1. **Rama Donostia + irutxulo** (sesión propia)
2. **Anclas Whisper Debagoiena pequeños** (Antzuola y vecinos — grep pendiente)
3. `'guraldi'` a lista `isEguraldia` (2 min — la errata "ze guraldi" esquiva el tiempo)
4. `git config` nombre/email (2 min — quita el aviso al commit)

### 10.2. Hoja de ruta de ramas (inventario Joseja 2026-07-06)

1. Horarios tren/bus (PDFs Euskotren localizados, sec. Anexo)
2. Social/Behagi 3 capas — con calma
3. Sanidad Osakidetza — sensible
4. Farmacias — verificar si cofgipuzkoa da guardia del día fetcheable
5. Deportes 2 capas (prensa + clubs/federaciones)
6. Montaña/rutas — Aizkorri, Ernio, Izarraitz
7. Diputación + GV — ayudas, gipuzkoa.eus, euskadi.eus
8. Turismo/patrimonio
9. Fiestas patronales — tabla con Joseja
10. Lea-Artibai vía Brave (Mutriku)
11. Hemeroteca
12. System prompt — nombres ambiguos, "beste bilaketa bat egin beharko nuke"

### 10.3. Sospechosas fichadas (no reincidentes aún)

- **"eskimpo"** (el tiempo en castellano) — origen sin identificar
- **"irrereta" → Irura mal ubicada** — familia de inventos cuando ctx vacío
- **"Anoeta"** ambigüedad estadio/pueblo

### 10.4. Nevera (aparcado a propósito)

- Behagi/Tableau CSVs a mano — mantenimiento anual
- Vercel CLI update 54.4→54.20 — día tranquilo, no en sesión
- Doble botón eus/cast o Whisper API — solo si prueba de usuarios lo pide
- Horas exactas de tren — sesión propia, PDFs Euskotren
- Diseño visual — primero que responda bien

---

## 11. Reglas de oro (qué NO repetir)

- ❌ **No fetchear** `*.hitza.eus` (JS)
- ❌ **No usar** buscador `?s=` de barrena (no filtra)
- ❌ **No inventar/mapear URLs** sin verificarlas antes con `curl -s URL | limpieza HTML`
- ❌ **No parchear caso a caso** sin mirar los 4 mapas: cambiar uno no cambia el comportamiento si la pregunta entra por otro
- ❌ **No instalar parámetros API** sin verificar que están soportados
- ❌ **No pegar varios bloques de golpe** en terminal
- ❌ **No dar deploy sin && al OK** del parche
- ✅ **LEER este documento ANTES** de tocar código
- ✅ **ACTUALIZARLO DESPUÉS** con commit

---

## 12. ERRATAK (transcripciones que se arreglan)

Lista viva mantenida en `api/transcribe.js` (array `fixes`). Ejemplos actuales:
- `algoibar` → `elgoibar`
- `sumajana`, `sumaia` → `zumaia`
- `orelleta` → `orereta` (alias de Errenteria)
- `ano eta` → `anoeta`

**Regla:** la normalización de erratas sirve TAMBIÉN para erratas del micro. Cuando aparezca una nueva, anotar aquí y añadir al array.

---

## Anexo A — Registro cronológico de sesiones

### Sesión 2026-07-04 — Mapa único ITURRIAK
Commit 5940b0b: mapa único ITURRIAK, red GUKA en Urola, etakitto, udalas, hitza.eus fuera del fetch. Commit 7102af3: sin fallback barrena (desconocidos → Brave), contexto 3000→6000. Verificado Zumaia→baleike, Zizurkil→ataria, Elgoibar OK, Donostia→Brave, Errenteria→kulturklik.

### Sesión 2026-07-04 (extendida) — Kulturklik en producción
Commit b5b24df: kulturklik.euskadi.eus como fuente de agenda + extracción por `[Municipio]`. URL devuelve toda Euskadi (~100-180k chars, parámetro municipio NO filtra). Código extrae fragmentos alrededor de `[Municipio]`. "zer egin ordizian" → Goierriko Jazzaldia con horas. Goierri cerrado. deba.eus descartado. goiena.eus verificado de facto.

### Sesión 2026-07-04 — Transporte cerrado
Claude inventaba líneas (E2 Topo para Zarautz-Donostia) porque HTML Euskotren es JS. Solución (8a65ce5+bcc5705+1e99e0f): tabla fija en ctx de la rama tren. **Bug importante de paso:** el bucle de fetch hacía `ctx=''` y borraba contexto previo. Ahora `ctx = ctx || ''`. Verificado "zarautzetik donostiara trenak" → E1 kostaldekoa con Orio, Usurbil.

### Sesión 2026-07-06 — Voz euskera (Chrome/Mac)
Causa: `rec.lang = 'eu-ES,es-ES'` (valor inválido, la API solo acepta uno) → caía a castellano. iOS además forzado a es-ES. Fix: `rec.lang = 'eu-ES'`. Verificado azkoitia OK, elgoibar OK, arrasate OK. Caso "Anoeta" → "ano eta" añadido a ERRATAK. Contraprueba castellano funcionó gracias a doble red de seguridad. Decisión: eu-ES como default.

### Sesión 2026-07-08 — Micro iPhone RESUELTO
Whisper sin idioma transcribía euskera castellanizado (por eso existía el array `fixes`). **Error propio:** `language=eu` no soportado por la API, rompió todo. **Solución final** (commit 9121dea): `formData` prompt con frase euskera + toponimos. Whisper alucina el prompt si audio mudo. Técnica nueva: reproducir fallos desde Mac con `say + afconvert + python urllib`.

### Sesión 2026-07-10 — Voz euskera + DNS apex
DNS apex CERRADO: config sana, el "falla a ratos" era cobertura móvil. Números euskera HECHO: `zenbakiEuskaraz` vigesimal, decimales (koma), horas. Solo voz, pantalla intacta. **Truco ventrílocuo:** decenas foneticamente escritas (`oguei`, `berroguei`) para Monica es-ES. Limpieza de voz: max→gehienez, mm→milimetro, etc. Whisper prompt engordado 5→28 toponimos. Erratas nuevas: algoibar→elgoibar, sumajana/sumaia→zumaia. **Lección método:** parche sin captura de OK es parche que no existe.

### Sesión 2026-07-11 — Eguraldia 3 paisajes + Icono iOS
Icono iOS resuelto (misterio de junio): faltaba `<link apple-touch-icon>` + PNG con alpha (iOS pinta alpha de negro). "Orelleta" era errata por ORERETA (alias popular de Errenteria). Nueva tarea: mapa de alias de pueblos doble nombre. **Eguraldia 3 paisajes cerrado** (commit c8ee521): un fetch con 3 coordenadas (Donostia/Arrasate/Ordizia), verificado array de 3 con curl antes de deploy. Sospechosa seria: modelo inventa temperaturas con ctx vacío. Averías nuevas: irutxulo no conecta desde site:, Antzuola → italiano.

---

## Anexo B — Comandos frecuentes

```bash
# Ver estado del maestro
cat ~/ketako/ketako_mapa_fuentes_gipuzkoa.md

# Ir al proyecto
cd ~/ketako

# Ver últimas líneas de index.html o chat.js
sed -n 'INICIO,FINp' index.html

# Buscar en el código
grep -n "TERMINO" api/chat.js

# Deploy a producción (siempre con && al final del parche)
vercel --prod

# Verificar HTML de una fuente antes de fiarnos
curl -s URL | head -c 3000

# Commit y push
git add ARCHIVO && git commit -m "MENSAJE" && git push
```

---

*Fin del documento maestro v1.0.*
*Cuando cambie el estado del proyecto: subir versión (v1.1, v2.0…) y volver a subir al proyecto de claude.ai.*
