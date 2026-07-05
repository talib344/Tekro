import Groq from 'groq-sdk'
import OpenAI from 'openai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  const { messages } = await req.json()
  
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const groqStream = await groq.chat.completions.create({
          messages,
          model: 'llama-3.1-70b-versatile',
          stream: true,
        })
        for await (const chunk of groqStream) {
          controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content || ''))
        }
      } catch (e) {
        const openaiStream = await openai.chat.completions.create({
          messages,
          model: 'gpt-4o-mini',
          stream: true,
        })
        for await (const chunk of openaiStream) {
          controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content || ''))
        }
      }
      controller.close()
    }
  })

  return new Response(stream, { headers: { 'Content-Type': 'text/plain' } })
}
