import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { message } = await req.json()

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are Tekro AI. Reply in Hinglish, friendly tone. Keep answers short, helpful and to the point. Use casual Pakistani/Indian style.'
          },
          {
            role: 'user', 
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API: ${err}`)
    }

    const data = await res.json()
    const reply = data.choices[0]?.message?.content || 'Tekro AI se reply nahi aaya bhai'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Groq Error:', error)
    return NextResponse.json({ reply: 'Error: ' + error.message }, { status: 500 })
  }
}
