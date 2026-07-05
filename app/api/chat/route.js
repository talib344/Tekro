import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import OpenAI from 'openai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  try {
    const { messages } = await req.json()

    // Pehle Groq try karo - fast hai
    try {
      const stream = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Best Groq model
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048
      })

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            controller.enqueue(encoder.encode(text))
          }
          controller.close()
        }
      })

      return new Response(readable, {
        headers: { 'Content-Type': 'text/plain' }
      })

    } catch (groqError) {
      console.log('Groq failed, switching to OpenAI:', groqError.message)

      // Agar Groq fail ho to OpenAI use karo
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Sasta aur fast
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048
      })

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            controller.enqueue(encoder.encode(text))
          }
          controller.close()
        }
      })

      return new Response(readable, {
        headers: { 'Content-Type': 'text/plain' }
      })
    }

  } catch (error) {
    console.error('Both APIs failed:', error)
    return NextResponse.json({ error: 'Both Groq and OpenAI failed' }, { status: 500 })
  }
}
