export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message, lat: geoLat, lon: geoLon } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });
    const AK = process.env.ANTHROPIC_API_KEY;
    const BK = process.env.BRAVE_API_KEY;
    const msg = message.toLowerCase();
    const isES = /\b(el|la|los|las|de|en|que|es|un|una|para|por|con|del|al|hay|si|hoy|resultado|partido|futbol|noticias|final|ayer|farmacia|guardia|agenda|fiestas|renteria|errenteria|orereta|tolosa|zarautz|eibar|elgoibar|horario|tren|cuantos|personas|mayores|quien|hubo|fue|habitantes|poblacion|datos)\b/i.test(msg);
    const lang = isES ? 'SPANISH' : 'BASQUE';
    const msg2 = msg;
    const isDB = ['elgoibar','eibar','ermua','deba','soraluze','mallabia','mendaro','debabarrena'].some(w => msg2.includes(w));
    const isDO = ['arrasate','mondragon','bergara','onati','eskoriatza','aretxabaleta'].some(w => msg2.includes(w));
    const isGO = ['beasain','zumarraga','ordizia','lazkao','goierri'].some(w => msg2.includes(w));
    const isTL = ['tolosa','ibarra','villabona','tolosaldea'].some(w => msg2.includes(w));
    const isUR = ['zarautz','zumaia','azpeitia','azkoitia','urola'].some(w => msg2.includes(w));
    const isBD = ['irun','hondarribia','bidasoa'].some(w => msg2.includes(w));
    const isOA = ['errenteria','oiartzun','pasaia','lezo'].some(w => msg2.includes(w));
    const isDS = ['donostia','san sebastian','hernani','lasarte'].some(w => msg2.includes(w));
    const isMU = msg2.includes('mutriku');
    const comarca = isDB?'db':isDO?'dg':isGO?'go':isTL?'tl':isUR?'ur':isBD?'bd':isOA?'oa':isDS?'ds':'uk';
    const DS = isDB?'Debabarrena':isDO?'Debagoiena':isGO?'Goierri':isTL?'Tolosaldea':isUR?'Urola':isBD?'Bidasoa':isOA?'Oarsoaldea':isDS?'Donostia':'Gipuzkoa';
    const agendaUrls = {db:'https://barrena.eus/agenda/',dg:'https://goiena.eus/',go:'https://goiena.eus/',tl:'https://tolosaldea.hitza.eus/',oa:'https://oarsoaldea.hitza.eus/',ur:'https://zarautzguka.eus/agenda/',bd:'https://bidasoa.hitza.eus/',uk:'https://lea-artibaietamutriku.hitza.eus/agenda/gaur/'};
    const noticiaUrls = {db:'https://barrena.eus/',eibar:'https://etakitto.eus/',dg:'https://goiena.eus/',go:'https://goiena.eus/',tl:'https://tolosaldea.hitza.eus/',oa:'https://oarsoaldea.hitza.eus/',ur:'https://zarautzguka.eus/agenda/',bd:'https://bidasoa.hitza.eus/',uk:'https://lea-artibaietamutriku.hitza.eus/'};
    const behagis = {'elgoibar':'https://behagi.eus/eu/adierazleak/elgoibar/p-132/','eibar':'https://behagi.eus/eu/adierazleak/eibar/p-133/','ermua':'https://behagi.eus/eu/adierazleak/ermua/p-134/','deba':'https://behagi.eus/eu/adierazleak/deba/p-135/','soraluze':'https://behagi.eus/eu/adierazleak/soraluze/p-136/','mendaro':'https://behagi.eus/eu/adierazleak/mendaro/p-137/','mallabia':'https://behagi.eus/eu/adierazleak/mallabia/p-138/','arrasate':'https://behagi.eus/eu/adierazleak/arrasate-mondragon/p-139/','mondragon':'https://behagi.eus/eu/adierazleak/arrasate-mondragon/p-139/','bergara':'https://behagi.eus/eu/adierazleak/bergara/p-140/'};
    const muniCoords = {'elgoibar':{lat:43.214,lon:-2.413},'eibar':{lat:43.185,lon:-2.471},'deba':{lat:43.295,lon:-2.351},'arrasate':{lat:43.065,lon:-2.490},'mondragon':{lat:43.065,lon:-2.490},'bergara':{lat:43.118,lon:-2.413},'beasain':{lat:43.045,lon:-2.197},'tolosa':{lat:43.131,lon:-2.074},'zarautz':{lat:43.284,lon:-2.172},'zumaia':{lat:43.296,lon:-2.252},'irun':{lat:43.337,lon:-1.789},'hondarribia':{lat:43.372,lon:-1.796},'donostia':{lat:43.321,lon:-1.984},'mutriku':{lat:43.308,lon:-2.381},'errenteria':{lat:43.312,lon:-1.900},'errenderia':{lat:43.312,lon:-1.900},'orereta':{lat:43.312,lon:-1.900},'renteria':{lat:43.312,lon:-1.900},'legazpi':{lat:43.053,lon:-2.335},'azpeitia':{lat:43.180,lon:-2.268},'azkoitia':{lat:43.177,lon:-2.307},'onati':{lat:43.034,lon:-2.416},'oñati':{lat:43.034,lon:-2.416},'zumarraga':{lat:43.081,lon:-2.314},'ordizia':{lat:43.048,lon:-2.172},'gipuzkoa':{lat:43.215,lon:-2.150}};
    const isEguraldia = ['eguraldia','eguraldi','euraldia','euraldi','tiempo','temperatura','euri','lluvia','elur','nieve','haize','viento','hotza','beroa','laino','lanbro','eguzkia','sol','zerua','eguraldi'].some(w => msg2.includes(w));
    const isFA = ['farmazia','farmacia','botika','guardia'].some(w => msg2.includes(w));
    const isDemografia = ['habitantes','biztanle','populazio','poblacion','cuantos vive','cuantas personas'].some(w => msg2.includes(w));
    const isAO = ['agenda','ekitaldi','fiestas','jaiak','kontzertua','concierto','exposicion','erakusketa','que hacer','zer egin','fin de semana','asteburua','plan','planek'].some(w => msg2.includes(w)); const isEibar = msg2.includes('eibar') && !msg2.includes('elgoibar');
    const isPI = ['pilota','pelota'].some(w => msg2.includes(w));
    const isAR = ['arraun','remo'].some(w => msg2.includes(w));
    const isFU = ['futbol','futbola','real sociedad','sd eibar'].some(w => msg2.includes(w));
    const isHB = ['eskubaloia','balonmano'].some(w => msg2.includes(w));
    const isKI = ['kirol','deporte','kirola'].some(w => msg2.includes(w));
    const isTR = ['tren','euskotren','renfe','autobusa','autobus','lurraldebus','ordutegia','horario'].some(w => msg2.includes(w));
    const isNO = ['noticia','albiste','berri','azken'].some(w => msg2.includes(w));
    let ctx = '';
    let fetchUrl = null;
    let searchQuery = null;
    if (isEguraldia) {
      const mk = geoLat ? 'geolocated' : (Object.keys(muniCoords).find(k => msg2.includes(k)) || 'gipuzkoa'); if(mk === 'geolocated'){ muniCoords['geolocated'] = {lat: geoLat, lon: geoLon}; }
      const {lat, lon} = muniCoords[mk];
      try {
        const wr = await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,precipitation,windspeed_10m,weathercode&hourly=temperature_2m,precipitation_probability,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe/Madrid&forecast_days=3');
        const wd = await wr.json(); const rt = (n) => Math.round(n);
        const c = wd.current;
        const d = wd.daily;
        const wc = {0:'eguzkia',1:'ia argia',2:'hodeitsu',3:'lainotuta',51:'euri arina',53:'euria',61:'euri arina',63:'euria',71:'elur arina',73:'elurra',80:'zaparrada',95:'ekaitza'};
        const h = wd.hourly; const now = new Date(); const todayStr = now.toISOString().slice(0,10); const h12 = h.time.findIndex(t => t === todayStr+'T12:00'); const h18 = h.time.findIndex(t => t === todayStr+'T18:00'); const t12 = h12>=0 ? rt(h.temperature_2m[h12])+' gradu '+(wc[h.weathercode[h12]]||'') : ''; const t18 = h18>=0 ? rt(h.temperature_2m[h18])+' gradu '+(wc[h.weathercode[h18]]||'') : ''; const days=['igandea','astelehena','asteartea','asteazkena','osteguna','ostirala','larunbata']; const months=['urt','ots','mar','api','mai','eka','uzt','abu','ira','urr','aza','abe']; const d1=new Date(d.time[1]+'T12:00'); const d2=new Date(d.time[2]+'T12:00'); const bihar_str=days[d1.getDay()]+' '+d1.getDate()+' '+months[d1.getMonth()]; const etzi_str=days[d2.getDay()]+' '+d2.getDate()+' '+months[d2.getMonth()]; ctx = 'EGURALDIA '+mk+': Orain '+rt(c.temperature_2m)+' gradu '+(wc[c.weathercode]||'')+' haizea:'+c.windspeed_10m+'kmh. Eguerdian(12h):'+t12+'. Arratsaldean(18h):'+t18+'. Bihar('+bihar_str+') max'+rt(d.temperature_2m_max[1])+' gradu min'+rt(d.temperature_2m_min[1])+' gradu. Etzi('+etzi_str+') max'+rt(d.temperature_2m_max[2])+' gradu min'+rt(d.temperature_2m_min[2])+'C';
      } catch(e) { ctx = 'Ezin lortu eguraldi datuak'; }
    } else if (isFA) {
      fetchUrl = 'https://cofgipuzkoa.eus/ciudadano/farmacias-gipuzkoa/farmacias-de-guardia-2/';
    } else if (isDemografia) {
      const municipio = Object.keys(behagis).find(k => msg2.includes(k));
      if (municipio) { fetchUrl = behagis[municipio]; } else { searchQuery = message + ' site:behagi.eus OR site:euskadi.eus'; }
    } else if (isAO) {
      fetchUrl = isMU ? 'https://lea-artibaietamutriku.hitza.eus/agenda/gaur/' : isEibar ? 'https://etakitto.eus/debabarrena/asteburuko-agenda/' : (agendaUrls[comarca] || agendaUrls.uk);
    } else if (isPI) {
      searchQuery = message + ' resultado 2026 site:naiz.info OR site:berria.eus';
    } else if (isAR) {
      searchQuery = message + ' resultado 2026 ' + DS + ' OR site:actremo.com';
    } else if (isFU) {
      searchQuery = message + ' resultado 2026 OR site:realsociedad.com OR site:sdeibar.com';
    } else if (isHB) {
      searchQuery = message + ' resultado 2026 OR site:gieskubaloia.eus';
    } else if (isKI) {
      searchQuery = message + ' resultado 2026 ' + DS;
    } else if (isTR) {
      if (msg2.includes('euskotren')) { fetchUrl = 'https://www.euskotren.eus/es/tren/horarios'; }
      else if (msg2.includes('renfe')) { fetchUrl = 'https://www.renfe.com/es/es/cercanias/cercanias-pais-vasco/horarios'; }
      else { searchQuery = message + ' site:lurraldebus.eus OR site:euskotren.eus'; }
    } else if (isNO) {
      const nurl = isMU ? 'https://lea-artibaietamutriku.hitza.eus/' : (noticiaUrls[comarca] || null);
      if (nurl) { fetchUrl = nurl; } else { searchQuery = message + ' site:naiz.info OR site:berria.eus OR site:orain.eus'; }
    } else {
      searchQuery = message + ' site:naiz.info OR site:berria.eus OR site:gipuzkoa.eus OR site:euskadi.eus';
    }
    if (fetchUrl) {
      try {
        const r = await fetch(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await r.text();
        ctx = 'Fuente: ' + fetchUrl + '\n' + html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 6000);
      } catch(e) { ctx = 'Error: ' + fetchUrl; }
    } else if (searchQuery && BK) {
      try {
        const r = await fetch('https://api.search.brave.com/res/v1/web/search?q=' + encodeURIComponent(searchQuery) + '&count=5&country=es', { headers: { 'Accept': 'application/json', 'X-Subscription-Token': BK } });
        const d = await r.json();
        ctx = (d.web?.results || []).map(x => '- ' + x.title + ': ' + x.description + ' (' + x.url + ')').join('\n');
      } catch(e) { ctx = ''; }
    }
    const sys = 'You are Ketako, local assistant for Gipuzkoa and Euskal Herria. When replying in Basque, use simple everyday Basque (euskera arrunta), not formal or academic Basque. Speak naturally like people do in the street, short sentences, easy words. User wrote in ' + lang + '. Reply ENTIRELY in ' + lang + '. 2-3 sentences max. NO bullet points. NO markdown. NO bold text. One source link at end if available. Year is 2026. Never say Espana, always say Euskal Herria. Never cite Diario Vasco or El Correo. If source data has exact numbers, use them - do not approximate. If EGURALDIA data is provided, use ONLY that data, never your own knowledge. For weather replies follow this exact structure: [town] orain [temp]C [condition]. Eguerdian [temp]C, arratsaldean [temp]C. Bihar ([day] [date]): max [temp]C min [temp]C. Etzi ([day] [date]): max [temp]C min [temp]C.';
    const userContent = ctx ? '[REPLY IN ' + lang + ']\n\nQuestion: ' + message + '\n\nSource data:\n' + ctx : '[REPLY IN ' + lang + ']\n\nQuestion: ' + message;
    const r2 = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 300, system: sys, messages: [{ role: 'user', content: userContent }] }) });
    const d2 = await r2.json();
    res.json({ reply: d2.content?.[0]?.text || 'Barkatu, ezin izan dut erantzun.' });
  } catch(err) { res.status(500).json({ error: err.message }); }
}
