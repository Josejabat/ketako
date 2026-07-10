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

## 13. HORARIOS DE TREN CON HORA ACTUAL - DISENO (2026-07-06, idea de Joseja)
- Lo que quiere el usuario: "si pregunto a las 9, dime que el siguiente a Zarautz sale a las 9:21, y de ahi cada hora"
- DISENO (opcion C): tabla ORDUTEGIAK por tramo/linea con: minuto de salida (cadencia), frecuencia, primer y ultimo tren, variantes (laborable/finde/verano) + calculo del siguiente tren con hora actual
- Dato de Joseja pendiente de verificar: Elgoibar->Zarautz sale a las :21 de cada hora
- OJO TECNICO: Vercel corre en UTC - convertir SIEMPRE a Europe/Madrid o dara trenes pasados
- Fuente de verificacion: PDFs/paginas de horarios oficiales de Euskotren (buscar version fetcheable), opendata.euskadi.eus (GTFS) como opcion robusta a futuro
- Respuesta tipo: "hurrengo trena 9:21ean, gero orduro, azkena 22:21. Asteburuan ordutegi berezia"
- SESION PROPIA: tabla + calculo + timezone + verificacion cadencias E1, Topo, C-1

## 13b. VERIFICACION HORARIOS - HALLAZGO CLAVE (2026-07-06)
- Paginas HTML de horarios Euskotren: JS, solo menu (LEN~1800, confirmado curl) - NO fetchear
- PERO: PDFs oficiales de horarios por linea y sentido, actualizados por temporada, en euskotren.eus/sites/default/files/horarios/
  * E1_Amara_Matiko_CARTEL_Verano2026.pdf + E1_Matiko_Amara (la de la costa, la nuestra)
  * E2_HendaiaLasarte + E2_Lasarte_Hendaia (Topo), E3, E4 - todos Verano2026
- PLAN sesion horarios: descargar PDFs E1 y E2 -> extraer cadencias y minutos exactos -> tabla ORDUTEGIAK verificada -> calculo siguiente tren con hora actual (timezone Europe/Madrid)
- El patron de nombre incluye temporada (Verano2026): al cambiar temporada cambia el PDF - anotar verificacion estacional
- GTFS opendata: la query API no devolvio nada por esa via, explorar otra ruta si hiciera falta (los PDFs bastan para empezar)

## 15. PRINCIPIO DE ARQUITECTURA: OBSERVATORIOS COMO ENCICLOPEDIA (Joseja, 2026-07-06)
- Behagi (y todo observatorio: Seguridad Social, Eustat, Dipu) = ENCICLOPEDIA, no web de noticias. Se extraen los datos UNA VEZ, verificados, y se sirven con precision y cita ("Behagi 2024")
- Las preguntas de ESTRUCTURA ("cuantas residencias publicas/concertadas/privadas en Gipuzkoa", "cuantos pisos tutelados") no necesitan dato fresco - necesitan dato EXACTO. 2024 vale; "unas 60, creo" no vale
- Este tipo de respuesta es herramienta de argumentacion para Duintasuna - la precision es politica, no cosmetica
- Rama social en 3 capas: (1) estructura -> datos Behagi embebidos con fuente y ano, mantenimiento anual; (2) directorio -> fetch behagi.eus/recursos (verificar curl); (3) tramites -> Dipu/udala/SegSocial/GV
- Mismo principio aplicable a futuro: pensiones (SegSocial, datos revista Duintasuna), Eustat, presupuestos forales

## 15b. MATIZ AL PRINCIPIO (Joseja): SEGURIDAD SOCIAL = FUENTE VIVA, NO ENCICLOPEDIA
- La web de la Seguridad Social SI da datos provinciales (pensiones por provincia) y los ACTUALIZA (mensual) -> via FETCH directo, no embeber
- Regla refinada: no es "observatorio = embeber". Es: dato alcanzable con curl y actualizado -> FETCH (fuente viva); dato encerrado en JS/Tableau -> extraer y embeber con cita (enciclopedia)
- Clasificacion por organismo (verificar cada uno con curl antes de decidir):
  * Behagi municipal: Tableau -> embeber (confirmado sesiones previas)
  * Seguridad Social provincial: web actualizada -> fetch (pendiente localizar URL exacta de estadisticas Gipuzkoa legible con curl)
  * Eustat, Dipu, GV: pendientes de clasificar

## 14. BEHAGI - HISTORICO TABLEAU + HOJA DE RUTA COMPLETA (2026-07-06)
### Behagi: dos partes, dos tecnicas (NO repetir el error)
- DATOS MUNICIPALES (indicadores, listas espera, RGI): Tableau/JS. fetchUrl NO puede (ya invento "176 RGI"). CSV automatico: 403. PDF Deskargatu: reducido
- PLAN acordado sesiones previas: CSVs descargados A MANO (Elgoibar ya hecho, serie 2018-2024) subidos a Vercel como estaticos. Mantenimiento anual
- DIRECTORIO DE CENTROS (behagi.eus/es/recursos/...): HTML normal (Egurtzegi vista hoy) - probablemente fetcheable, VERIFICAR con curl
### Hoja de ruta de pendientes (inventario con Joseja, 2026-07-06)
1. Horarios tren/bus (PDFs Euskotren localizados, sec 13b)
2. Social/behagi 3 capas (secs 11, 15, 15b) - CON CALMA
3. Sanidad Osakidetza (centros, PAC, cita previa) - sensible
4. Farmacias: verificar si cofgipuzkoa da la guardia del dia fetcheable
5. Deportes 2 capas (Joseja): noticias=prensa local OK; datos=webs CLUBS y FEDERACIONES - verificar
6. Montana/rutas: Aizkorri, Ernio, Izarraitz - explorar fuentes
7. Diputacion + GV (Gipuzkoa): ayudas, gipuzkoa.eus, euskadi.eus
8. Turismo/patrimonio (sec 12, alucinacion Arantzazu confirmada 2x)
9. Fiestas patronales (tabla con Joseja) 10. Lea-Artibai via Brave (Mutriku)
11. Hemeroteca 12. System prompt ("beste bilaketa bat egin beharko nuke")

## 16. SIGUIENTE FASE: PRUEBA CON USUARIOS REALES (decision Joseja, 2026-07-06)
- Antes de seguir con los 12 pendientes: probar con 1-2 personas de confianza del perfil real (mayores, Duintasuna, movil/microfono)
- Metodo: dar solo ketako.eus + "preguntale lo que le preguntarias a un vecino que sabe todo de Gipuzkoa". SIN ejemplos ni instrucciones (contaminan)
- Recoger: preguntas LITERALES + respuestas (pantallazos o tomar nota al lado). Cada pregunta real vale mas que 10 nuestras
- Lo que saldra: erratas reales, temas no cubiertos, formas de preguntar no anticipadas -> alimenta ERRATAK, la hoja de ruta y las prioridades
- Diseno visual: aparcado a proposito - primero que responda bien (decision Joseja)
- Las preguntas que fallen se anotan AQUI y marcan el orden de ataque de los 12 pendientes

## 17. VOZ Y VELOCIDAD - DETECTADOS 2026-07-06 (Joseja)
### 13. MICRO/VOZ (afecta a la prueba con usuarios - se hara POR ESCRITO de momento)
- Problema: el micro no entiende euskera ni nombres de pueblos (escribe mal Azkoitia, Oñati...)
- Causa probable: Web Speech API del navegador configurada a es-ES en index.html
- Vias: (a) probar lang='eu-ES' (cambio 1 linea, verificar calidad), (b) doble boton eus/cast, (c) Whisper API (robusta: bilingue + toponimos, coste pequeno)
- BONUS de probar por escrito: las erratas escritas reales alimentan la lista ERRATAK
### 14. VELOCIDAD
- Respuestas lentas: fetch(es) + Claude en serie. Vias: fetches en paralelo, recortar contexto (hoy 3000-6000), modelo rapido para preguntas simples, cache de fetches frecuentes
- Sesion propia de optimizacion - medir antes de tocar (donde se va el tiempo: fetch vs Claude)

## 18. VOZ - RESUELTO PARCIAL 2026-07-06 (verificado por Joseja con micro real)
- CAUSA encontrada: rec.lang tenia 'eu-ES,es-ES' (valor INVALIDO, la API solo acepta uno) -> caia a castellano. iOS ademas forzado a es-ES
- FIX: rec.lang = 'eu-ES'. VERIFICADO por voz: azkoitia OK, elgoibar OK, arrasate OK (toponimos = el problema principal, RESUELTO)
- Caso nuevo: "Anoeta" -> micro escribe "ano eta" (segmentacion). FIX: anadido a ERRATAK. La normalizacion de erratas sirve TAMBIEN para erratas del micro - anotar futuras igual
- Contraprueba castellano: "farmacias de guardia" -> "formazioaz eguardia" (eu-ES retuerce castellano)... PERO Ketako respondio bien igual: includes() de 'guardia' dentro de 'eguardia' + toponimo limpio = doble red de seguridad
- Decision: eu-ES como default (publico euskaldun + toponimos). Solucion completa (doble boton eus/cast o Whisper API): sesion propia si la prueba con usuarios lo pide
- AMBIGUEDAD detectada (Joseja): "Anoeta" = estadio Y pueblo. Ketako dio solo estadio; deberia presentar AMBOS y preguntar. Regla de system prompt para nombres ambiguos - pendiente

## 19. PENDIENTE MANANA: MICRO EN LA APP/MOVIL (Joseja, 2026-07-06)
- El micro de la app (PWA/movil) NO entiende - distinto del arreglo de hoy (que fue Chrome/Mac)
- Sospechoso n1: el codigo tiene isIOS2 que fuerza es-ES en iOS (linea ~244) - hoy solo cambiamos la rama no-iOS a eu-ES
- Verificar manana: (1) probar micro en el movil real de Joseja tras el cambio de hoy, (2) si iOS, cambiar tambien la rama isIOS2 a eu-ES, (3) revisar permisos de micro en la PWA, (4) recordar que Safari/WebKit tiene reglas propias de SpeechRecognition
- Empezar la sesion AQUI

## 15. SESION 2026-07-08 - MICRO IPHONE RESUELTO
- Micro iPhone NUNCA habia funcionado: whisper sin idioma transcribia euskera castellanizado (por eso existia el array fixes en transcribe.js)
- ERROR PROPIO: instalamos language=eu y ROMPIO todo - la API NO soporta 'eu'. LECCION: verificar que un parametro esta soportado ANTES de instalarlo
- SOLUCION FINAL (commit 9121dea): formData prompt con frase euskera + toponimos - orienta a whisper sin forzar
- Whisper ALUCINA: si el audio llega mudo/raro devuelve el prompt como transcripcion (visto en produccion)
- Tecnica nueva: reproducir fallos desde Mac con say + afconvert + python urllib contra /api/transcribe - mas rapido que vercel logs
- PENDIENTE 1: DNS apex ketako.eus sin www falla a ratos en movil (www siempre va) - dig + arreglo
- PENDIENTE 2 (proxima sesion): speakReply lee numeros en castellano (Monica es-ES, iOS sin voz eu) - convertir cifras a palabras euskera (21 -> hogeita bat)
- PENDIENTE 3: doble toque del micro iPhone - funciona pero observar si los mayores lo entienden
- Vercel CLI update 54.4->54.20 pendiente, dia tranquilo

## 16. SESION 2026-07-10 - VOZ EUSKARAZ + PENDIENTE 1 CERRADO
- PENDIENTE 1 (DNS apex) CERRADO: config sana (apex 307 -> www via Vercel, TTL 300, sin AAAA/CAA). El "falla a ratos" era cobertura movil de Zarautz + dias de deploys. Verificado 4/4 en iPhone por datos moviles. Nada que arreglar.
- PENDIENTE 2 (numeros euskera) HECHO: zenbakiEuskaraz/zenbakiakEuskaraz en index.html - vigesimal, decimales (koma), horas. Solo para la voz (esana), pantalla intacta, solo si isEu.
- TRUCO VENTRILOCUO: Monica (es-ES) lee "gei" con jota -> decenas escritas foneticamente para la voz: oguei, berroguei, hiruroguei, lauroguei. La palabra escrita se adapta a la boca de la voz.
- LIMPIEZA DE VOZ: max->gehienez, min->gutxienez, uzt->uztaila, mm->milimetro, km/h->kilometro orduko, parentesis/dos puntos->comas (pausas). Solo en esana.
- WHISPER: prompt engordado 5->28 toponimos (Zumaia dentro). Erratas nuevas en fixes: algoibar->elgoibar, sumajana/sumaia->zumaia. "Zumaia" suelto ya no se va a lituano.
- FILOSOFIA ASUMIDA: whisper es probabilista, frases cortas fallaran a veces. Consejo a probadores: repetir con frase entera.
- LECCION METODO: parche sin captura de OK es parche que no existe (limpieza de voz se quedo sin ejecutar y perseguimos fantasma). Deploy siempre atado con && al OK del parche.
- SOSPECHOSA fichada (no reincidente aun): "eskimpo" (el tiempo en castellano). "Orelleta" pendiente de saber que se dijo (Orereta/Errenteria?).
- PENDIENTE ESTRELLA proxima sesion: "Gipuzkoan eguraldia" da UNA temperatura - mal. Diseno decidido: 3 paisajes en una frase (Kostaldea/Donostia, Debagoiena/Arrasate, Goierri/Ordizia). Vive en la logica del tiempo del backend (sin mapear aun).
- PENDIENTE 3 sigue vivo: observar doble toque micro con probadores. Behagi/tableau y Vercel CLI update siguen en nevera.
