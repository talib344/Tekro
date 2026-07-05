import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `You are Tekro AI 2030, a smart assistant like Gemini. You can do ANYTHING:

1. Resume/CV Builder - Ask details and create professional resume
2. Blog/Article Writer - Write SEO optimized blogs
3. Code Explainer/Generator - Explain or write code in any language
4. Email Writer - Professional emails
5. PDF Summarizer - Summarize content
6. Translator - Translate to any language
7. Study Helper - Explain complex topics simply

RULES:
- Be helpful, fast, accurate
- For resume: Ask name, experience, skills if not provided
- For blog: Ask topic, tone, word count if not provided 
- Use markdown formatting
- Respond in same language as user
- Be like Gemini - smart and versatile`

export async function POST(req) {
  try {
    const { messages, model = 'groq' } = await req.json()
    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    
    // NANO BANANA 🍌 - ULTRA FAST GROQ MODEL
    if (model === 'nano') {
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: 'llama-3.1-8b-instant', // Nano = 8b instant
        temperature: 0.7,
        max_tokens: 2048,
      })
      return Response.json({ 
        message: completion.choices[0]?.message?.content,
        model: 'nano'
      })
    }
    
    // GROQ - FAST
    if (model === 'groq') {
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: 'llama-3.1-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      })
      return Response.json({ 
        message: completion.choices[0]?.message?.content,
        model: 'groq'
      })
    }
    
    // GEMINI
    if (model === 'gemini') {
      const geminiModel = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT
      })
      const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map(m => ({
          role: m.role === 'assistant'? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      })
      const lastMsg = messages[messages.length - 1].content
      const result = await chat.sendMessage(lastMsg)
      return Response.json({ 
        message: result.response.text(),
        model: 'gemini'
      })
    }
    
    // OPENAI
    const completion = await openai.chat.completions.create({
      messages: messagesWithSystem,
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
