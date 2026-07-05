import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY
})

export async function POST(req) {
  const { messages } = await req.json()

  const stream = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are Tekro AI 2030, a helpful premium AI assistant. Reply in Hinglish mix. Be concise but smart.'
      },
    ...messages
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
