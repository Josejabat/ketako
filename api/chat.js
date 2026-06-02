export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });
    const AK = process.env.ANTHROPIC_API_KEY;
    const BK = process.env.BRAVE_API_KEY;
    const msg = message.toLowerCase();
    const isES = /\b(el|la|los|las|de|en|que|es|un|una|para|por|con|del|al|hay|si|hoy|resultado|partido|futbol|noticias|final|ayer|farmacia|guardia|agenda|fiestas|horario|tren|cuantos|cuantas|personas|mayores|quien|hubo|fue|habitantes|poblacion|datos)\b/i.test(message);
    const lang = isES ? 'SPANISH' : 'BASQUE';
    const msg2 = msg;

    // Comarcas
    const isDB = ['elgoibar','eibar','ermua','deba','soraluze','mallabia','mendaro','debabarrena'].some(w => msg2.includes(w));
    const isDG = ['arrasate','mondragon','bergara','onati','eskoriatza','aretxabaleta'].some(w => msg2.includes(w));
    const isGO = ['beasain','zumarraga','ordizia','lazkao','goierri'].some(w => msg2.includes(w));
    const isTL = ['tolosa','ibarra','villabona','tolosaldea'].some(w => msg2.includes(w));
    const isUR = ['zarautz','zumaia','azpeitia','azkoitia','urola'].some(w => msg2.includes(w));
    const isBD = ['irun','hondarribia','bidasoa'].some(w => msg2.includes(w));
    const isOA = ['errenteria','oiartzun','pasaia','lezo'].some(w => msg2.includes(w));
    const isDS = ['donostia','san sebastian','hernani','lasarte'].some(w => msg2.includes(w));
    const isMU = msg2.includes('mutriku');
    const comarca = isDB?'db':isDG?'dg':isGO?'go':isTL?'tl':isUR?'ur':isBD?'bd':isOA?'oa':isDS?'ds':'uk';

    // Behagi municipios - datos sociales y demograficos
    const behagis = {
      'elgoibar': 'https://behagi.eus/eu/adierazleak/elgoibar/p-132/',
      'eibar': 'https://behagi.eus/eu/adierazleak/eibar/p-133/',
      'ermua': 'https://behagi.eus/eu/adierazleak/ermua/p-134/',
      'deba': 'https://behagi.eus/eu/adierazleak/deba/p-135/',
      'soraluze': 'https://behagi.eus/eu/adierazleak/soraluze/p-136/',
      'mendaro': 'https://behagi.eus/eu/adierazleak/mendaro/p-137/',
      'mallabia': 'https://behagi.eus/eu/adierazleak/mallabia/p-138/',
      'arrasate': 'https://behagi.eus/eu/adierazleak/arrasate-mondragon/p-139/',
      'mondragon': 'https://behagi.eus/eu/adierazleak/arrasate-mondragon/p-139/',
      'bergara': 'https://behagi.eus/eu/adierazleak/bergara/p-140/',
      'onati': 'https://behagi.eus/eu/adierazleak/onati/p-141/',
      'beasain': 'https://behagi.eus/eu/adierazleak/beasain/p-142/',
      'zumarraga': 'https://behagi.eus/eu/adierazleak/zumarraga/p-143/',
      'ordizia': 'https://behagi.eus/eu/adierazleak/ordizia/p-144/',
      'tolosa': 'https://behagi.eus/eu/adierazleak/tolosa/p-145/',
      'zarautz': 'https://behagi.eus/eu/adierazleak/zarautz/p-146/',
      'zumaia': 'https://behagi.eus/eu/adierazleak/zumaia/p-147/',
      'azpeitia': 'https://behagi.eus/eu/adierazleak/azpeitia/p-148/',
      'azkoitia': 'https://behagi.eus/eu/adierazleak/azkoitia/p-149/',
      'irun': 'https://behagi.eus/eu/adierazleak/irun/p-150/',
      'hondarribia': 'https://behagi.eus/eu/adierazleak/hondarribia/p-151/',
      'errenteria': 'https://behagi.eus/eu/adierazleak/errenteria/p-152/',
      'oiartzun': 'https://behagi.eus/eu/adierazleak/oiartzun/p-153/',
      'pasaia': 'https://behagi.eus/eu/adierazleak/pasaia/p-154/',
      'donostia': 'https://behagi.eus/eu/adierazleak/donostia-san-sebastian/p-132/',
      'san sebastian': 'https://behagi.eus/eu/adierazleak/donostia-san-sebastian/p-132/',
      'hernani': 'https://behagi.eus/eu/adierazleak/hernani/p-155/',
      'mutriku': 'https://behagi.eus/eu/adierazleak/mutriku/p-156/'
    };

    // Deteccion de temas
    const isFA = ['farmazia','farmacia','guardia','guardiako'].some(w => msg2.includes(w));
    const isAG = ['agenda','ekitaldi','evento','concierto','teatro','zinema','cine','asteburu','hoy','gaur','programa','jaiak','fiestas','zer dago'].some(w => msg2.includes(w));
    const isPI = ['pilota','pelota','manomanista','pelotari','frontoi','pala','remonte'].some(w => msg2.includes(w));
    const isAR = ['arraun','remo','trainera','regata','estropadak','bandera'].some(w => msg2.includes(w));
    const isFU = ['futbol','futbola','partido','liga','gol'].some(w => msg2.includes(w));
    const isHB = ['eskubaloia','balonmano'].some(w => msg2.includes(w));
    const isKI = ['kirola','deporte','kirol','emaitza'].some(w => msg2.includes(w));
    const isTR = ['tren','autobus','lurraldebus','euskotren','renfe','horario'].some(w => msg2.includes(w));
    const isNO = ['noticia','albiste','berri','gertatu'].some(w => msg2.includes(w));
    const isDemografia = ['mayores','mayores de','habitantes','poblacion','biztanleria','adingabe','langabezia','paro','dependencia','dependentzia','gizarte','social','personas con','servicios sociales'].some(w => msg2.includes(w));

    const DS = 'site:naiz.info OR site:berria.eus OR site:noticiasdegipuzkoa.eus';

    // Agenda urls
    const agendaUrls = {
      db: 'https://barrena.eus/agenda/',
      dg: 'https://goiena.eus/agenda/gaur/',
      go: 'https://goiena.eus/agenda/gaur/',
      tl: 'https://tolosaldea.hitza.eus/agenda/gaur/',
      bd: 'https://bidasoa.hitza.eus/agenda/gaur/',
      oa: 'https://oarsoaldea.hitza.eus/agenda/gaur/',
      ds: 'https://donostia.hitza.eus/agenda/gaur/',
      ur: 'https://urolakosta.hitza.eus/agenda/gaur/',
      uk: 'https://barrena.eus/agenda/'
    };

    const noticiaUrls = {
      db: 'https://barrena.eus/',
      dg: 'https://goiena.eus/',
      go: 'https://goiena.eus/',
      tl: 'https://tolosaldea.hitza.eus/',
      oa: 'https://oarsoaldea.hitza.eus/',
      ur: 'https://urolakosta.hitza.eus/',
      bd: 'https://bidasoa.hitza.eus/'
    };

    let fetchUrl = null;
    let searchQuery = null;

    if (isFA) {
      fetchUrl = 'https://cofgipuzkoa.eus/ciudadano/farmacias-gipuzkoa/farmacias-de-guardia-2/';
    } else if (isDemografia) {
      // Buscar municipio en behagi
      const municipio = Object.keys(behagis).find(k => msg2.includes(k));
      if (municipio) {
        fetchUrl = behagis[municipio];
      } else {
        searchQuery = message + ' site:behagi.eus OR site:euskadi.eus OR site:gipuzkoa.eus';
      }
    } else if (isAG) {
      fetchUrl = isMU ? 'https://lea-artibaietamutriku.hitza.eus/agenda/gaur/' : (agendaUrls[comarca] || agendaUrls.uk);
    } else if (isPI) {
      searchQuery = message + ' resultado 2026 site:naiz.info OR site:berria.eus OR site:noticiasdegipuzkoa.eus';
    } else if (isAR) {
      searchQuery = message + ' resultado 2026 ' + DS + ' OR site:actremo.com';
    } else if (isFU) {
      searchQuery = message + ' resultado 2026 ' + DS + ' OR site:realsociedad.com OR site:sdeibar.com';
    } else if (isHB) {
      searchQuery = message + ' resultado 2026 ' + DS + ' OR site:gieskubaloia.eus';
    } else if (isKI) {
      searchQuery = message + ' resultado 2026 ' + DS;
    } else if (isTR) {
      if (msg2.includes('euskotren')) {
        fetchUrl = 'https://www.euskotren.eus/es/tren/horarios';
      } else if (msg2.includes('renfe') || msg2.includes('tren')) {
        fetchUrl = 'https://www.renfe.com/es/es/cercanias/cercanias-pais-vasco/horarios';
      } else {
        searchQuery = message + ' site:lurraldebus.eus OR site:euskotren.eus';
      }
    } else if (isNO) {
      const nurl = isMU ? 'https://lea-artibaietamutriku.hitza.eus/' : (noticiaUrls[comarca] || null);
      if (nurl) { fetchUrl = nurl; } else { searchQuery = message + ' site:naiz.info OR site:berria.eus'; }
    } else {
      searchQuery = message + ' site:naiz.info OR site:berria.eus OR site:gipuzkoa.eus OR site:euskadi.eus';
    }

    let ctx = '';
    if (fetchUrl) {
      try {
        const r = await fetch(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await r.text();
        ctx = 'Fuente: ' + fetchUrl + '\n' + html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 6000);
      } catch(e) { ctx = 'Error: ' + fetchUrl; }
    } else if (searchQuery && BK) {
      try {
        const r = await fetch('https://api.search.brave.com/res/v1/web/search?q=' + encodeURIComponent(searchQuery) + '&count=5&country=es', {
          headers: { 'Accept': 'application/json', 'X-Subscription-Token': BK }
        });
        const d = await r.json();
        ctx = (d.web?.results || []).map(x => '- ' + x.title + ': ' + x.description + ' (' + x.url + ')').join('\n');
      } catch(e) { ctx = ''; }
    }

    const sys = 'You are Ketako, local assistant for Gipuzkoa and Euskal Herria. User wrote in ' + lang + '. Reply ENTIRELY in ' + lang + '. 2-3 sentences max. NO bullet points. NO markdown. NO bold text. One source link at end if available. Year is 2026. Never say Espana, always say Euskal Herria. Never cite Diario Vasco or El Correo. If source data has exact numbers, use them - do not approximate.';
    const userContent = ctx ? '[REPLY IN ' + lang + ']\n\nQuestion: ' + message + '\n\nSource data:\n' + ctx : '[REPLY IN ' + lang + ']\n\nQuestion: ' + message;
    const r2 = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 300, system: sys, messages: [{ role: 'user', content: userContent }] })
    });
    const d2 = await r2.json();
    res.json({ reply: d2.content?.[0]?.text || 'Barkatu, ezin izan dut erantzun.' });
  } catch(err) { res.status(500).json({ error: err.message }); }
}
