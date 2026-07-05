import Groq from 'groq-sdk'
import OpenAI from 'openai'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req) {
  try {
    const { messages } = await req.json()
    
    // PEHLE GROQ TRY KAR - FAST + FREE
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.1-70b-versatile', // Ya 'llama-3.1-8b-instant' for faster
        temperature: 0.7,
        max_tokens: 2048,
      })

      return Response.json({ 
        message: chatCompletion.choices[0]?.message?.content || 'No response',
        model: 'groq'
      })
      
    } catch (groqError) {
      console.log('Groq failed, trying OpenAI:', groqError.message)
      
      // GROQ FAIL HO TO OPENAI USE KAR
      const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4o-mini', // Sasta + fast
        temperature: 0.7,
        max_tokens: 2048,
      })

      return Response.json({ 
        message: completion.choices[0]?.message?.content || 'No response',
        model: 'openai'
      })
    }
    
  } catch (error) {
    console.error('Both APIs failed:', error)
    return Response.json({ 
      error: 'AI service error. Check API keys in Vercel.',
      details: error.message 
    }, { status: 500 })
  }
}
