# KETAKO — Mapa de fuentes Gipuzkoa (documento maestro)
Actualizado: 2026-07-04. Leer SIEMPRE antes de tocar api/chat.js.

## 1. FUENTES VERIFICADAS (con curl + limpieza HTML)

### Fetcheables ✅ VERIFICADO 2026-07-04 (curl + limpieza, contenido real con fechas)
| Fuente | Cubre | URL verificada | Notas |
|---|---|---|---|
| barrena.eus | Debabarrena | barrena.eus/MUNICIPIO/ | Solo portada hoy. ?s= no filtra |
| etakitto.eus | Eibar + Debabarrena | etakitto.eus/albisteak | Noticias con fechas. Tiene seccion Debabarrena |
| ataria.eus | Tolosaldea | ataria.eus/MUNICIPIO/ | |
| noaua.eus | Usurbil | noaua.eus/usurbil/ | Resto Donostialdea rural: solo portada general |
| zarautzguka.eus | Zarautz | zarautzguka.eus/zarautz/ | Red GUKA. Noticias + AGENDA con horas |
| baleike.eus | Zumaia | baleike.eus | Red GUKA (Zumaiaguka). Noticias + agenda |
| uztarria.eus | Azpeitia | uztarria.eus | Red GUKA (Azpeitiaguka). Menu con Farmaziak, Hemeroteka |
| maxixatzen.eus | Azkoitia | maxixatzen.eus | Red GUKA (Azkoitiaguka). Menu con Eguraldia |
| karkara.eus | Orio + Aia | karkara.eus | Red GUKA (Orioguka) |
| elgoibar.eus | Elgoibar (udala) | elgoibar.eus/eu/albisteak | Noticias municipales reales |
| errenteria.eus | Errenteria (udala) | errenteria.eus/eu/albisteak | HTML real 11k chars PERO mucho menu: noticias mas alla del corte de 3000 |
| hernani.eus | Hernani (udala) | hernani.eus/eu/albisteak | Verificado sesion anterior |

DESCUBRIMIENTO CLAVE: red GUKA (zarautzguka/baleike/uztarria/maxixatzen/karkara) = misma plataforma,
todas fetcheables, con Agenda y Hemeroteka propias. Urola COMPLETA cubierta municipio a municipio.
ERROR CORREGIDO: zarautzguka NO cubre Zumaia/Azpeitia/Azkoitia (cada una tiene su GUKA).
OARSOALDEA ya tiene fuente real: errenteria.eus (udala).

### NO fetcheables ❌ (JS-rendered, HTML basura — confirmado con curl)
- goierri.hitza.eus, oarsoaldea.hitza.eus, bidasoa.hitza.eus, irutxulo.hitza.eus
- Presumiblemente TODAS las *.hitza.eus (lea-artibaietamutriku incluida — sin verificar)
- Para estas comarcas: Brave Search con site: (NO fetch directo)

### Pendientes de verificar ⏳
- irun.org/eu/albisteak da 404: buscar URL correcta noticias Irun (Bidasoa sigue sin fuente)
- Ayuntamientos Goierri: beasain.eus, ordizia.eus, zumarraga.eus... sin verificar (Goierri sigue sin fuente)
- Donostia centro: sin fuente
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
- Goierri, Bidasoa, Donostia centro: SIN fuente de fetch real (Oarsoaldea resuelta via errenteria.eus)
- chat.js corta ctx a substring(0,3000): en webs con mucho menu (errenteria.eus) las noticias quedan FUERA del corte. Subir limite o recortar menu

## 4. QUÉ NO REPETIR
- No fetchear hitza.eus (JS)
- No usar buscador ?s= de barrena (no filtra)
- No inventar/mapear URLs sin verificarlas antes con: curl -s URL | limpieza HTML
- No parchear caso a caso sin mirar los 4 mapas: cambiar uno no cambia el comportamiento si la pregunta entra por otro
- Cada sesión: leer este documento ANTES de tocar código, y actualizarlo DESPUÉS con commit
