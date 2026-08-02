// api/tts.js
// Endpoint intermediario para Elhuyar TTS Neuronala.
// Recibe { text, lang, voice? } del navegador; anade credenciales; devuelve audio/mp3.
// El frontend decide cuando llamar aqui (politica Ketako: Elhuyar solo para euskera).
// Fecha: 2026-08-01

const DEFAULT_VOICES = {
  eu: 'female_high',   // voz por defecto Ketako euskera (elegida 2026-08-01)
  es: 'female',
  fr: 'fr_female_high',
  en: 'en_female_high',
  ca: 'ca_female_high',
  gl: 'gl_female_high'
};

const MAX_CHARS = 2000; // cap defensivo - Elhuyar podria poner limite si usamos mucho

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { text, lang = 'eu', voice } = body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text required' });
  }

  if (!DEFAULT_VOICES[lang]) {
    return res.status(400).json({ error: 'unsupported lang: ' + lang });
  }

  const speaker = voice || DEFAULT_VOICES[lang];

  const apiId = process.env.ELHUYAR_TTS_ID;
  const apiKey = process.env.ELHUYAR_TTS_KEY;
  if (!apiId || !apiKey) {
    console.error('[tts] Missing Elhuyar credentials');
    return res.status(500).json({ error: 'server misconfigured' });
  }

  try {
    const elhuyarResponse = await fetch('https://ttsneuronala.elhuyar.eus/api/standard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.substring(0, MAX_CHARS),
        speaker,
        language: lang,
        extension: 'mp3',
        api_id: apiId,
        api_key: apiKey
      })
    });

    if (!elhuyarResponse.ok) {
      const errText = await elhuyarResponse.text();
      console.error('[tts] Elhuyar returned ' + elhuyarResponse.status + ':', errText.substring(0, 200));
      return res.status(502).json({ error: 'tts provider failed', status: elhuyarResponse.status });
    }

    const contentType = elhuyarResponse.headers.get('content-type') || '';
    if (!contentType.startsWith('audio/')) {
      const errText = await elhuyarResponse.text();
      console.error('[tts] Elhuyar did not return audio:', contentType, errText.substring(0, 200));
      return res.status(502).json({ error: 'tts provider returned non-audio' });
    }

    const audioBuffer = Buffer.from(await elhuyarResponse.arrayBuffer());

    res.setHeader('Content-Type', 'audio/mp3');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (err) {
    console.error('[tts] Fetch error:', err.message);
    return res.status(500).json({ error: 'tts fetch failed' });
  }
}
