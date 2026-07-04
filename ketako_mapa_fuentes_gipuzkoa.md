# KETAKO — Mapa de fuentes Gipuzkoa (documento maestro)
Actualizado: 2026-07-04. Leer SIEMPRE antes de tocar api/chat.js.

## 1. FUENTES VERIFICADAS (con curl + limpieza HTML)

### Fetcheables ✅ (contenido real en el HTML)
| Fuente | Comarca | URL patrón | Notas |
|---|---|---|---|
| barrena.eus | Debabarrena | barrena.eus/MUNICIPIO/ | elgoibar, eibar, deba, soraluze, mendaro, mutriku, ermua. Solo portada de hoy. Buscador ?s= NO filtra (confirmado) |
| ataria.eus | Tolosaldea | ataria.eus/MUNICIPIO/ | tolosa, ibarra, villabona, andoain, zizurkil, legorreta |
| noaua.eus | Donostialdea rural | noaua.eus/usurbil/ | Solo Usurbil tiene URL propia; hernani/lasarte/urnieta/astigarraga caen a portada general |
| hernani.eus/eu/albisteak | Ayuntamiento | — | Verificado con contenido real. Modelo a replicar en otros ayuntamientos |

### NO fetcheables ❌ (JS-rendered, HTML basura — confirmado con curl)
- goierri.hitza.eus, oarsoaldea.hitza.eus, bidasoa.hitza.eus, irutxulo.hitza.eus
- Presumiblemente TODAS las *.hitza.eus (lea-artibaietamutriku incluida — sin verificar)
- Para estas comarcas: Brave Search con site: (NO fetch directo)

### Pendientes de verificar ⏳
- etakitto.eus (Eibar/Ermua) — segunda fuente Debabarrena, trabajada antes, URL sin confirmar con curl
- zarautzguka.eus (Urola) — mapeada pero nunca verificado su contenido con curl limpio
- Ayuntamientos restantes: elgoibar.eus, errenteria.eus, zumarraga.eus, irun.org... ¿patrón /eu/albisteak? ¿fetcheables o JS?
- Fuente única provincial (Diputación, agenda cultural Gipuzkoa)

## 2. ARQUITECTURA ACORDADA (direccionamiento)
1. Clasificar la pregunta por TIPO: eguraldia ✅ (resuelto, NO tocar) / noticias / agenda-eventos / trámites-udala / transporte / deporte / salud
2. Prensa comarcal fetcheable → fetch directo sección municipio
3. Comarca hitza.eus → Brave Search site:
4. Ayuntamiento como respaldo universal (cuando esté verificado)
5. Hemeroteca (pasado): sin solución aún; Brave indexa mal la prensa local vasca

## 3. PROBLEMAS CONOCIDOS DEL CÓDIGO (a 2026-07-04, commit ce6145f)
- CUATRO mapas solapados: agendaUrls (L27), noticiaUrls (L28), prentsaAO (L159), prentsaSekzioak (L187+). Unificar en UNO
- agendaUrls y noticiaUrls AÚN contienen hitza.eus para fetch (inútil)
- Fallback genérico = barrena.eus para municipios no mapeados → respuestas incorrectas fuera de Debabarrena
- Detección por msg2.includes(municipio): frágil ante variantes de pregunta
- Goierri, Oarsoaldea, Bidasoa, Donostia centro: SIN fuente de fetch real

## 4. QUÉ NO REPETIR
- No fetchear hitza.eus (JS)
- No usar buscador ?s= de barrena (no filtra)
- No inventar/mapear URLs sin verificarlas antes con: curl -s URL | limpieza HTML
- No parchear caso a caso sin mirar los 4 mapas: cambiar uno no cambia el comportamiento si la pregunta entra por otro
- Cada sesión: leer este documento ANTES de tocar código, y actualizarlo DESPUÉS con commit
