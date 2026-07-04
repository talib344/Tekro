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
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { message, mode } = await req.json()

    let systemPrompt = 'You are Tekro AI 2030. Reply in Hinglish, friendly tone. Keep answers short.'
    
    if (mode === 'Code Gen') systemPrompt = 'You are Tekro AI 2030, expert coder. Reply only with code + short explanation in Hinglish.'
    if (mode === 'Debug Code') systemPrompt = 'You are Tekro AI 2030, debugging expert. Find bugs and fix code. Reply in Hinglish.'
    if (mode === 'Web Search') systemPrompt = 'You are Tekro AI 2030. Act like you searched web. Give updated info in Hinglish.'
    if (mode === 'PDF Analyze') systemPrompt = 'You are Tekro AI 2030. User will describe PDF. Summarize it in Hinglish.'
    if (mode === 'Image AI') systemPrompt = 'You are Tekro AI 2030. User will describe image. Explain it in Hinglish.'

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!res.ok) throw new Error(`Groq API: ${await res.text()}`)

    const data = await res.json()
    const reply = data.choices[0]?.message?.content || 'Tekro AI se reply nahi aaya bhai'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Groq Error:', error)
    return NextResponse.json({ reply: 'Server se baat nahi ho rahi. Thodi der baad try karo.' }, { status: 500 })
  }
}
