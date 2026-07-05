import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  try {
    const { messages, model = 'groq' } = await req.json()
    
    // GROQ
    if (model === 'groq') {
      const completion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.1-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      })
      return Response.json({ 
        message: completion.choices[0]?.message?.content,
        model: 'groq'
      })
    }
    
    // GEMINI - FREE TIER
    if (model === 'gemini') {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const lastMsg = messages[messages.length - 1].content
      const result = await geminiModel.generateContent(lastMsg)
      return Response.json({ 
        message: result.response.text(),
        model: 'gemini'
      })
    }
    
    // OPENAI FALLBACK
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 2048,
    })
    return Response.json({ 
      message: completion.choices[0]?.message?.content,
      model: 'openai'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      error: 'Something went wrong',
      details: error.message 
    }, { status: 500 })
  }
}
