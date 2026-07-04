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
    const isDB = ['elgoibar','eibar','ermua','deba','soraluze','mallabia','mendaro','debabarrena','mutriku'].some(w => msg2.includes(w));
    const isDO = ['arrasate','mondragon','bergara','onati','eskoriatza','aretxabaleta'].some(w => msg2.includes(w));
    const isGO = ['beasain','zumarraga','ordizia','lazkao','goierri','segura','ataun','zaldibia','ormaiztegi','gabiria','idiazabal','lazkao','olaberria','mutiloa','ezkio','itsaso'].some(w => msg2.includes(w));
    const isTL = ['tolosa','ibarra','villabona','tolosaldea','andoain','berrobi','baztan','alegia','amezketa','abaltzisketa','aduna','albiztur','alkiza','altzaga','anoeta','belauntza','berastegi','bidania','gaztelu','hernialde','ikaztegieta','irura','larraul','leaburu','lizartza','orendain','orexa','zizurkil','legorreta'].some(w => msg2.includes(w));
    const isUR = ['zarautz','zumaia','azpeitia','azkoitia','urola','getaria','orio','zestoa','errezil','aia'].some(w => msg2.includes(w));
    const isBD = ['irun','hondarribia','bidasoa','oiartzun'].some(w => msg2.includes(w));
    const isOA = ['errenteria','orereta','oiartzun','pasaia','lezo','oarsoaldea','renteria'].some(w => msg2.includes(w));
    const isDS = ['donostia','san sebastian','hernani','lasarte','astigarraga','urnieta','usurbil','andoain'].some(w => msg2.includes(w));
    const isMU = msg2.includes('mutriku');
    const comarca = isDB?'db':isDO?'dg':isGO?'go':isTL?'tl':isUR?'ur':isBD?'bd':isOA?'oa':isDS?'ds':'uk';
    const DS = isDB?'Debabarrena':isDO?'Debagoiena':isGO?'Goierri':isTL?'Tolosaldea':isUR?'Urola':isBD?'Bidasoa':isOA?'Oarsoaldea':isDS?'Donostia':'Gipuzkoa';
    const ITURRIAK = {
      // MAPA UNICO DE FUENTES — solo URLs verificadas (ver ketako_mapa_fuentes_gipuzkoa.md)
      municipios: {
        // Debabarrena — barrena.eus
        'elgoibar':'https://barrena.eus/elgoibar/','eibar':'https://barrena.eus/eibar/','deba':'https://barrena.eus/deba/','soraluze':'https://barrena.eus/soraluze/','mendaro':'https://barrena.eus/mendaro/','mutriku':'https://barrena.eus/mutriku/','ermua':'https://barrena.eus/ermua/',
        // Tolosaldea — ataria.eus
        'tolosa':'https://ataria.eus/tolosa/','ibarra':'https://ataria.eus/ibarra/','villabona':'https://ataria.eus/villabona/','andoain':'https://ataria.eus/andoain/','zizurkil':'https://ataria.eus/zizurkil/','legorreta':'https://ataria.eus/legorreta/',
        // Urola — red GUKA, cada municipio su web
        'zarautz':'https://zarautzguka.eus/zarautz/','zumaia':'https://baleike.eus','azpeitia':'https://uztarria.eus','azkoitia':'https://maxixatzen.eus','orio':'https://karkara.eus','aia':'https://karkara.eus',
        // Donostialdea rural — noaua + udala Hernani
        'usurbil':'https://noaua.eus/usurbil/','hernani':'https://hernani.eus/eu/albisteak','lasarte':'https://noaua.eus/','urnieta':'https://noaua.eus/','astigarraga':'https://noaua.eus/',
        // Oarsoaldea — udala Errenteria
        'errenteria':'https://www.errenteria.eus/eu/albisteak'
      },
      // Por comarca. SIN hitza.eus: Goierri/Bidasoa/Donostia/lea-artibai sin clave => cae a Brave
      agenda: {db:'https://barrena.eus/agenda/',dg:'https://goiena.eus/',tl:'https://ataria.eus/',ur:'https://zarautzguka.eus/agenda/',oa:'https://www.errenteria.eus/eu/albisteak'},
      noticias: {db:'https://barrena.eus/',eibar:'https://etakitto.eus/albisteak',dg:'https://goiena.eus/',tl:'https://ataria.eus/',ur:'https://zarautzguka.eus/zarautz/',oa:'https://www.errenteria.eus/eu/albisteak'}
    };
    const agendaUrls = ITURRIAK.agenda;
    const noticiaUrls = ITURRIAK.noticias;
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
    const isNO = ['noticia','albiste','albizteak','berriak','azken','albisteak'].some(w => msg2.includes(w));
    const isUD = ['baimena','tramite','izapidea','dirulaguntza','errolda','eskaera','zerbitzuak','laguntza','ayuda','subvención','gestión','sala'].some(w => msg2.includes(w));
    const udalUrls = {
  'abaltzisketa':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=001&hizkuntza=EU'},
  'aduna':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=002&hizkuntza=EU'},
  'aizarnazabal':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=003&hizkuntza=EU'},
  'albiztur':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=004&hizkuntza=EU'},
  'alegia':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=005&hizkuntza=EU'},
  'alkiza':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=006&hizkuntza=EU'},
  'altzaga':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=007&hizkuntza=EU'},
  'amezketa':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=008&hizkuntza=EU'},
  'andoain':{web:'https://www.andoain.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=009&hizkuntza=EU'},
  'anoeta':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=010&hizkuntza=EU'},
  'antzuola':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=011&hizkuntza=EU'},
  'aramaio':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=012&hizkuntza=EU'},
  'aretxabaleta':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=013&hizkuntza=EU'},
  'asteasu':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=014&hizkuntza=EU'},
  'ataun':{web:'https://www.ataun.eus/eu/azala',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=015&hizkuntza=EU'},
  'aia':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=016&hizkuntza=EU'},
  'azkoitia':{web:'https://www.azkoitia.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=017&hizkuntza=EU'},
  'azpeitia':{web:'https://www.azpeitia.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=018&hizkuntza=EU'},
  'beasain':{web:'https://www.beasain.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=019&hizkuntza=EU'},
  'beizama':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=020&hizkuntza=EU'},
  'belauntza':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=021&hizkuntza=EU'},
  'berastegi':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=022&hizkuntza=EU'},
  'berrobio':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=023&hizkuntza=EU'},
  'bidania-goiatz':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=024&hizkuntza=EU'},
  'zegama':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=025&hizkuntza=EU'},
  'zerain':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=026&hizkuntza=EU'},
  'zestoa':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=027&hizkuntza=EU'},
  'zizurkil':{web:'https://www.zizurkil.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=028&hizkuntza=EU'},
  'deba':{web:'https://www.deba.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=029&hizkuntza=EU'},
  'eibar':{web:'https://www.eibar.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=030&hizkuntza=EU'},
  'elduain':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=031&hizkuntza=EU'},
  'elgoibar':{web:'https://elgoibar.eus/zerbitzuak/',agenda:'https://elgoibar.eus/agenda/',albisteak:'https://elgoibar.eus/albisteak/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=032&hizkuntza=EU'},
  'elgeta':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=033&hizkuntza=EU'},
  'eskoriatza':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=034&hizkuntza=EU'},
  'ezkio-itsaso':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=035&hizkuntza=EU'},
  'hondarribia':{web:'https://www.hondarribia.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=036&hizkuntza=EU'},
  'gaintza':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=037&hizkuntza=EU'},
  'gabiria':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=038&hizkuntza=EU'},
  'getaria':{web:'https://www.getaria.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=039&hizkuntza=EU'},
  'hernani':{web:'https://www.hernani.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=040&hizkuntza=EU'},
  'hernialde':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=041&hizkuntza=EU'},
  'ibarra':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=042&hizkuntza=EU'},
  'idiazabal':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=043&hizkuntza=EU'},
  'ikaztegieta':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=044&hizkuntza=EU'},
  'irun':{web:'https://www.irun.org/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=045&hizkuntza=EU'},
  'irura':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=046&hizkuntza=EU'},
  'itsasondo':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=047&hizkuntza=EU'},
  'larraul':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=048&hizkuntza=EU'},
  'lazkao':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=049&hizkuntza=EU'},
  'leaburu':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=050&hizkuntza=EU'},
  'legazpi':{web:'https://www.legazpi.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=051&hizkuntza=EU'},
  'legorreta':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=052&hizkuntza=EU'},
  'lezo':{web:'https://www.lezo.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=053&hizkuntza=EU'},
  'lizartza':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=054&hizkuntza=EU'},
  'arrasate':{web:'https://www.arrasate-mondragon.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=055&hizkuntza=EU'},
  'mondragon':{web:'https://www.arrasate-mondragon.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=055&hizkuntza=EU'},
  'mutriku':{web:'https://www.mutriku.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=056&hizkuntza=EU'},
  'mutiloa':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=057&hizkuntza=EU'},
  'olaberria':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=058&hizkuntza=EU'},
  'orexa':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=059&hizkuntza=EU'},
  'orio':{web:'https://www.orio.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=060&hizkuntza=EU'},
  'ormaiztegi':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=061&hizkuntza=EU'},
  'oiartzun':{web:'https://www.oiartzun.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=062&hizkuntza=EU'},
  'oñati':{web:'https://www.onati.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=063&hizkuntza=EU'},
  'pasaia':{web:'https://www.pasaia.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=064&hizkuntza=EU'},
  'soraluze':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=065&hizkuntza=EU'},
  'errezil':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=066&hizkuntza=EU'},
  'errenteria':{web:'https://www.errenteria.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=067&hizkuntza=EU'},
  'leintz-gatzaga':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=068&hizkuntza=EU'},
  'donostia':{web:'https://www.donostia.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=069&hizkuntza=EU'},
  'segura':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=070&hizkuntza=EU'},
  'tolosa':{web:'https://www.tolosa.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=071&hizkuntza=EU'},
  'urnieta':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=072&hizkuntza=EU'},
  'usurbil':{web:'https://www.usurbil.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=073&hizkuntza=EU'},
  'bergara':{web:'https://www.bergara.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=074&hizkuntza=EU'},
  'villabona':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=075&hizkuntza=EU'},
  'ordizia':{web:'https://www.ordizia.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=076&hizkuntza=EU'},
  'urretxu':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=077&hizkuntza=EU'},
  'zaldibia':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=078&hizkuntza=EU'},
  'zarautz':{web:'https://www.zarautz.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=079&hizkuntza=EU'},
  'zumarraga':{web:'https://www.zumarraga.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=080&hizkuntza=EU'},
  'zumaia':{web:'https://www.zumaia.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=081&hizkuntza=EU'},
  'mendaro':{web:'https://mendaro.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=082&hizkuntza=EU'},
  'lasarte-oria':{web:'https://www.lasarte-oria.eus/eu/',egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=083&hizkuntza=EU'},
  'astigarraga':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=084&hizkuntza=EU'},
  'baliarrain':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=085&hizkuntza=EU'},
  'orendain':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=086&hizkuntza=EU'},
  'altzaga':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=087&hizkuntza=EU'},
  'gazteluko':{egoitza:'https://udal.egoitza.gipuzkoa.eus/WAS/AYTO/USCServicioCiudadanoVer15WEB/home.do?ayto=088&hizkuntza=EU'}
};
    let ctx = '';
    let fetchUrl = null;
    let fetchUrls = null;
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
      const mkAO = Object.keys(udalUrls).find(k => msg2.includes(k)) || (Object.keys(muniCoords).find(k => msg2.includes(k)) || 'gipuzkoa');
      const udalAgenda = udalUrls[mkAO] ? (udalUrls[mkAO].agenda || udalUrls[mkAO].web) : null;
      const comarcaAgenda = agendaUrls[comarca] || ("https://www.kulturklik.euskadi.eus/webkklik00-shagenda/eu/aa58aPublicoWar/agenda/sacarAgendaDia?locale=eu&municipio="+(mkAO.charAt(0).toUpperCase()+mkAO.slice(1)));
      fetchUrls = [udalAgenda, comarcaAgenda].filter((v,i,a) => v && a.indexOf(v)===i);
      const prentsaAO = ITURRIAK.municipios;
      const mkAOprensa = Object.keys(prentsaAO).find(k => msg2.includes(k));
      if (mkAOprensa) fetchUrls = [prentsaAO[mkAOprensa]];
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
    } else if (isUD) {
      const uMk = Object.keys(udalUrls).find(k => msg2.includes(k));
      if (uMk) { searchQuery = message + ' 2026 site:' + (udalUrls[uMk].web || '').replace('https://','').replace('http://','').split('/')[0]; } else { searchQuery = message + ' 2026 site:elgoibar.eus OR site:eibar.eus OR site:gipuzkoa.eus'; }
    } else if (isAO) {
      searchQuery = message + ' site:barrena.eus OR site:goierri.hitza.eus OR site:ataria.eus OR site:oarsoaldea.hitza.eus OR site:bidasoa.hitza.eus OR site:zarautzguka.eus OR site:irutxulo.hitza.eus OR site:goiena.eus OR site:lea-artibaietamutriku.hitza.eus';
    } else {
      searchQuery = message + ' Gipuzkoa 2026 site:barrena.eus OR site:goierri.hitza.eus OR site:ataria.eus OR site:etakitto.eus OR site:oarsoaldea.hitza.eus OR site:bidasoa.hitza.eus OR site:naiz.info OR site:berria.eus';
      const prentsaSekzioak = ITURRIAK.municipios;
      const mkAOelse = Object.keys(prentsaSekzioak).find(k => msg2.includes(k));
      const prentsaUrl = mkAOelse ? prentsaSekzioak[mkAOelse] : null;
        if (prentsaUrl) { fetchUrls = [prentsaUrl]; }
        else { fetchUrls = null; searchQuery = message + ' Gipuzkoa 2026 site:naiz.info OR site:berria.eus OR site:goierri.hitza.eus OR site:bidasoa.hitza.eus OR site:irutxulo.hitza.eus'; }
    }
    if (fetchUrls && fetchUrls.length) {
      ctx = '';
      for (const url of fetchUrls) {
        try {
          const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const html = await r.text();
          let testua = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (url.includes('kulturklik')) {
            const herriIzenak = ['Elgoibar','Eibar','Deba','Soraluze','Mendaro','Mutriku','Ermua','Tolosa','Ibarra','Villabona','Andoain','Zizurkil','Legorreta','Zarautz','Zumaia','Azpeitia','Azkoitia','Orio','Aia','Usurbil','Hernani','Lasarte','Urnieta','Astigarraga','Errenteria','Pasaia','Oiartzun','Lezo','Irun','Hondarribia','Beasain','Ordizia','Lazkao','Zumarraga','Urretxu','Legazpi','Ataun','Segura','Zaldibia','Donostia','Arrasate','Bergara','Elgeta','Antzuola','Aretxabaleta','Eskoriatza'];
            const kera = herriIzenak.filter(h => msg2.includes(h.toLowerCase()));
            if (kera.length) {
              let zatiak = '';
              for (const h of kera) {
                let i = 0;
                while ((i = testua.indexOf('[' + h, i)) !== -1 && zatiak.length < 5000) {
                  zatiak += '... ' + testua.substring(Math.max(0, i - 220), i + 120) + '\n';
                  i += 1;
                }
              }
              testua = zatiak || 'Ez dago gaurko ekitaldirik kulturklik-en herri horretarako.';
            } else { testua = testua.substring(0, 3000); }
          }
          ctx += 'Fuente: ' + url + '\n' + testua.substring(0, 6000) + '\n\n';
        } catch(e) { /* fuente fallida, seguimos con las demas */ }
      }
    } else if (fetchUrl) {
      try {
        const r = await fetch(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await r.text();
        ctx = 'Fuente: ' + fetchUrl + '\n' + html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 8000);
      } catch(e) { ctx = 'Error: ' + fetchUrl; }
    } else if (searchQuery && BK) {
      try {
        const r = await fetch('https://api.search.brave.com/res/v1/web/search?q=' + encodeURIComponent(searchQuery) + '&count=5&country=es', { headers: { 'Accept': 'application/json', 'X-Subscription-Token': BK } });
        const d = await r.json();
        ctx = (d.web?.results || []).map(x => '- ' + x.title + ': ' + x.description + ' (' + x.url + ')').join('\n');
      } catch(e) { ctx = ''; }
    }
    const sys = 'You are Ketako, local assistant for Gipuzkoa and Euskal Herria. When replying in Basque, use simple everyday Basque (euskera arrunta), not formal or academic Basque. Speak naturally like people do in the street, short sentences, easy words. User wrote in ' + lang + '. Reply ENTIRELY in ' + lang + '. 2-3 sentences max. NO bullet points. NO markdown. NO bold text. One source link at end if available, but ONLY from the actual source URLs provided in the context. NEVER invent or guess URLs. If no real URL is available, omit the link entirely. Year is 2026. Never say Espana, always say Euskal Herria. Never cite Diario Vasco or El Correo. If source data has exact numbers, use them  If no source data is provided or found, say honestly that you have no information, never fill in from memory or general knowledge. If search results mention places, events or information about a DIFFERENT location than what the user asked about, do not mention those results — they are irrelevant. Only use information that is directly about the specific place or topic asked. When source data contains URLs in parentheses like (https://...), use EXACTLY that URL as the source link — never modify or reconstruct it. For weather replies follow this exact structure: [town] orain [temp]C [condition]. Eguerdian [temp]C, arratsaldean [temp]C. Bihar ([day] [date]): max [temp]C min [temp]C. Etzi ([day] [date]): max [temp]C min [temp]C.';
    const userContent = ctx ? '[REPLY IN ' + lang + ']\n\nQuestion: ' + message + '\n\nSource data:\n' + ctx : '[REPLY IN ' + lang + ']\n\nQuestion: ' + message;
    const r2 = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 300, system: sys, messages: [{ role: 'user', content: userContent }] }) });
    const d2 = await r2.json();
    res.json({ reply: d2.content?.[0]?.text || 'Barkatu, ezin izan dut erantzun.' });
  } catch(err) { res.status(500).json({ error: err.message }); }
}
