export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { audio, mimeType } = req.body;
    if (!audio) return res.status(400).json({ error: 'No audio' });
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) return res.status(500).json({ error: 'No OpenAI key' });
    const audioBuffer = Buffer.from(audio, 'base64');
    const ext = mimeType && mimeType.includes('webm') ? 'webm' : 'wav';
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
    formData.append('file', blob, 'audio.' + ext);
    formData.append('model', 'whisper-1');
    
    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENAI_KEY },
      body: formData
    });
    const data = await r.json();
    if (data.text) {
      res.json({ text: data.text });
    } else {
      res.status(500).json({ error: 'Transcription failed', details: data });
    }
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
