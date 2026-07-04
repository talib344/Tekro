export default async function handler(req, res) {
  // CORS headers - Vercel ke liye zaroori hai
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS request handle karo
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sirf POST allow hai
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, mode, language } = req.body;

    // Message check karo
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // OpenAI API call
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are Tekro AI. Mode: ${mode || 'normal'}. Reply in ${language || 'English'}.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    // OpenAI ka response check karo
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI Error:', errorData);
      return res.status(500).json({ error: 'OpenAI API failed: ' + errorData.error?.message });
    }

    const data = await openaiResponse.json();
    const reply = data.choices[0].message.content;

    // Frontend ko reply bhejo
    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Server crashed: ' + error.message });
  }
}
