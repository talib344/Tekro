const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { prompt, mode, lang } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Prompt missing' }) };
    }

    let systemMsg = `You are Tekro-AI 2026, a helpful assistant by Talib Ali from Pakistan. Reply in ${lang || 'the same language as user'}.`;

    if (mode === 'code') {
      systemMsg = `You are Tekro-AI 2026, expert coding assistant. Write clean, commented code. Reply in ${lang || 'English'}. If user asks to debug, explain the bug and fix it.`;
    } else if (mode === 'debug') {
      systemMsg = `You are Tekro-AI 2026, expert debugger. Find bugs, explain them simply, and give fixed code. Reply in ${lang || 'English'}.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
