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

## 5. SESION 2026-07-04 — IMPLEMENTADO Y DESPLEGADO
- Paso 1 (5940b0b): mapa unico ITURRIAK, red GUKA en Urola, etakitto, udalas, hitza.eus fuera del fetch
- Pasos 3-4 (7102af3): sin fallback barrena (desconocidos -> Brave), contexto 3000->6000
- VERIFICADO en ketako.eus: Zumaia->baleike OK, Zizurkil->ataria OK, Elgoibar OK, Donostia->Brave OK (lento pero correcto), Errenteria OK (evento real via kulturklik), preguntas sin respuesta -> honesto + enlace (correcto)
- CANDIDATA ESTRELLA: kulturklik.euskadi.eus — agenda cultural GV, URL parametrizable por municipio
  (sacarAgendaDia?locale=eu&municipio=X). Aparecio sola 3 veces en pruebas. Si fetcheable: agenda directa para TODOS los municipios
- CONFIRMADO problema deteccion: "debegoienanastebururako" (erratas/palabras pegadas) no reconoce comarca.
  Solucion futura: normalizar texto antes de includes(). Usuarios mayores escribiran asi
- PENDIENTE proxima sesion: 1) verificar kulturklik con curl 2) normalizacion erratas 3) URL Irun 4) Goierri 5) hemeroteca

## 6. SESION EXTENDIDA 2026-07-04 — KULTURKLIK EN PRODUCCION
- Commit b5b24df: kulturklik.euskadi.eus como fuente de agenda + extraccion por [Municipio]
- Como funciona: la URL sacarAgendaDia devuelve TODA Euskadi (~100-180k chars, el parametro municipio NO filtra);
  el codigo extrae solo los fragmentos alrededor de '[Municipio]' (formato: evento lugar [Herria] hora)
- VERIFICADO: "zer egin ordizian" -> Goierriko Jazzaldia con horas, Altamirako Jaiak, bertsos. GOIERRI CERRADO
- Cobertura nueva: agenda cultural para TODOS los municipios via kulturklik (Donostia, Bidasoa, Oarsoaldea incluidos)
- deba.eus verificado NO util (solo menu, /eu/albisteak no existe) — udala Deba descartado
- goiena.eus funciona en la practica para Debagoiena (Eskoriatza OK con datos reales) — verificado de facto
- PENDIENTE (prioridad): 1) normalizar erratas ("ordician", "debegoiena...") ANTES del includes()
  2) hemeroteca  3) municipios pequenos de Goierri en lista herriIzenak si faltan

## 7. TRANSPORTE — CERRADO 2026-07-04
- Problema detectado: Claude inventaba lineas (dijo E2 Topo para Zarautz-Donostia) porque el HTML de Euskotren es JS y llega vacio
- Solucion (8a63ce5 + bcc5705 + 1e99e0f): TABLA FIJA de lineas en ctx de la rama tren (E1 costa, E2 Topo, Renfe C-1, Alvia Madrid, TGV Hendaia, buses PESA/Lurraldebus/ALSA)
- BUG importante arreglado de paso: el bucle de fetch hacia ctx='' y borraba cualquier contexto previo. Ahora ctx = ctx || ''
- VERIFICADO: "zarautzetik donostiara trenak" -> E1 kostaldekoa con paradas correctas (Orio, Usurbil)
- LECCION DE ARQUITECTURA: para datos estables (lineas, telefonos, direcciones) tabla fija en codigo > fetch. Aplicable a futuro: telefonos urgencia, farmacias de pueblo, sedes udala
- Horas exactas de tren: pendiente, requiere API Euskotren/Renfe o GTFS (sesion propia)

## 11. LECCION EGURTZEGI - LA RAMA SOCIAL NECESITA DISENO, NO PARCHES (2026-07-06)
- "pisos tutelados en usurbil" tras el fix dio el piso de Aukera Fundazioa (discapacidad intelectual): VERDADERO pero NO responde la pregunta real
- La respuesta real (Joseja la conoce en persona, visito Egurtzegi): proyecto MUNICIPAL de Usurbil, pueblo entero volcado, 110 viviendas con cuidados + centro de dia + Sendian. Matia Fundazioa y Diputacion entraron cuando el proyecto se quedo sin fondos - el merito y el origen es del ayuntamiento y del pueblo
- LECCION: en lo social, el primer resultado de busqueda no es la respuesta. Hace falta: (1) behagi.eus como fuente principal (directorio oficial de TODOS los centros), (2) web municipal como contexto, (3) que Claude presente el panorama (que recursos hay, para quien es cada uno) y no un solo resultado
- Publico de Ketako = mayores de Duintasuna. Aqui la precision importa mas que en ninguna otra rama. SESION PROPIA con calma, sin prisa (peticion expresa de Joseja)
- Diseno tentativo rama social: isUD social -> fetch/busqueda behagi.eus + site municipal, system prompt que pida enumerar recursos por tipo de destinatario

## 12. RAMA TURISMO/PATRIMONIO - DETECTADA 2026-07-06 (pendiente, sesion propia)
- "arantzazun zer ikusi" cae a Brave generico: respuesta pobre y con probable relleno ("Gantzabal auzoko baserriak" - sin confirmar, sospecha de alucinacion)
- Datos verificados por Joseja (conocimiento local) para Arantzazu: friso de Oteiza con MAS de 12 apostoles (deliberado, gran polemica), Basterretxea pinto la cripta, la Iglesia paralizo la obra por considerar el arte demasiado moderno ("ateos") - historia clave del arte vasco s.XX. Arquitectos: Saenz de Oiza y Laorga. Chillida: puertas
- Fuentes candidatas para la rama: oficinas de turismo oficiales (getariaturismo.eus/festak ya vista, onatiturismo, zarauzturismo, turismo.euskadi.eus, gipuzkoaturismoa), eitb.eus para reportajes patrimoniales
- Diseno tentativo: isTURISMO (zer ikusi, que visitar, bisita, turismo, museo, santutegia...) -> fetch/site: webs oficiales de turismo. Solapa con agenda (isAO) - definir prioridad
- Como en lo social: en patrimonio la respuesta buena es la historia bien contada, no el primer resultado
