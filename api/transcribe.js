export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { audio, mimeType } = req.body;
    console.log('mimeType recibido:', mimeType);
    console.log('audio length:', audio ? audio.length : 0);
    if (!audio) return res.status(400).json({ error: 'No audio' });
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) return res.status(500).json({ error: 'No OpenAI key' });
    const audioBuffer = Buffer.from(audio, 'base64');
    const ext = mimeType && mimeType.includes('webm') ? 'webm' : mimeType && mimeType.includes('mp4') ? 'mp4' : 'wav';
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
    formData.append('file', blob, 'audio.' + ext);
    formData.append('model', 'whisper-1');
    formData.append('prompt', 'Euskarazko galdera Gipuzkoan: eguraldia, Zarautz, Zumaia, Getaria, Orio, Zestoa, Azpeitia, Azkoitia, Elgoibar, Eibar, Deba, Mutriku, Mendaro, Arrasate, Bergara, Oñati, Aretxabaleta, Beasain, Ordizia, Tolosa, Hernani, Lasarte, Errenteria, Irun, Hondarribia, Donostia, Debagoiena, Goierri, asteburuan zer dago, trena, farmazia, jaiak.');
    
    
    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENAI_KEY },
      body: formData
    });
    const data = await r.json();
    if (data.text) {
      let txt = data.text;
      const fixes = [['algoibar','elgoibar'],['sumajana','zumaia'],['sumaia','zumaia'],['el waiver','elgoibar'],['waiver','elgoibar'],['el goibar','elgoibar'],['el guaibor','elgoibar'],['el guaybar','elgoibar'],['ibar','eibar'],['ei bar','eibar'],['sarauz','zarautz'],['sarauts','zarautz'],['tolossa','tolosa'],['san sebastian','donostia'],['guipuzcoa','gipuzkoa'],['guipuzkoa','gipuzkoa']];
      fixes.forEach(([bad,good]) => { txt = txt.replace(new RegExp(bad,'gi'), good); });
      data.text = txt;
      res.json({ text: data.text });
    } else {
      console.log('OPENAI ERROR:', JSON.stringify(data)); res.status(500).json({ error: 'Transcription failed', details: data });
    }
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
