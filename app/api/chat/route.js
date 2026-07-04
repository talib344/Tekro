import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { message, mode } = await req.json()

    let systemPrompt = 'You are Tekro-AI, a helpful assistant.'
    if (mode === 'Code Gen') systemPrompt = 'You are a coding expert. Generate clean code with explanation.'
    if (mode === 'Debug Code') systemPrompt = 'You are a debugging expert. Find bugs and fix them.'
    if (mode === 'Web Search') systemPrompt = 'Act like you have web search. Give current info.'
    if (mode === 'PDF Analyze') systemPrompt = 'You are a document analysis expert.'
    if (mode === 'Image AI') systemPrompt = 'Describe images in detail or generate prompts.'

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
    })

    if (!res.ok) throw new Error('Groq API Error')

    const data = await res.json()
    const reply = data.choices[0].message.content
    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Groq Error:', error)
    return NextResponse.json({ reply: 'Server error. Check API key.' }, { status: 500 })
  }
}
