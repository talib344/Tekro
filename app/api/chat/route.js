import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  try {
    const { messages, model = 'nano', language = 'English', image, fileType } = await req.json()
    
    const SYSTEM_PROMPT = `You are Tekro AI 2030, Enhanced AI Assistant by T Company.
    CRITICAL: You MUST reply in ${language} language only. 
    
    Capabilities:
    1. Image Generation: DALL-E 3 quality
    2. Photo/Video Analysis: Expert editing tips
    3. Voice Support: TTS ready
    4. Multi-language: ${language}
    
    Rules:
    - Always reply in ${language}
    - For image requests, describe + generate
    - For uploads, analyze and give 3 edit suggestions
    - Be helpful like Gemini, fast like Groq Nano 🍌`

    // 1. IMAGE/VIDEO UPLOAD + PROMPT
    if (image) {
      const userPrompt = messages[messages.length - 1]?.content || 'Analyze and suggest edits'
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: `You are expert editor. Reply in ${language}.` },
          { role: 'user', content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: image } }
          ]}
        ],
        model: 'gpt-4o-mini',
        max_tokens: 800
      })
      return Response.json({ 
        message: completion.choices[0]?.message?.content,
        model: 'gpt-4o-vision'
      })
    }

    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    
    // 2. IMAGE GENERATION
    if (lastUserMsg.includes('photo') || lastUserMsg.includes('image') || lastUserMsg.includes('generate') || lastUserMsg.includes('create') || lastUserMsg.includes('banao')) {
      try {
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: messages[messages.length - 1].content,
          n: 1,
          size: "1024x1024",
          quality: "hd"
        })
        return Response.json({ 
          message: language === 'Urdu'? `Image ban gayi: "${messages[messages.length - 1].content}"` : 
                   language === 'Hindi'? `Image ban gayi: "${messages[messages.length - 1].content}"` :
                   `Generated image for: "${messages[messages.length - 1].content}"`,
          model: 'dall-e-3',
          image: dalleResponse.data[0].url
        })
      } catch (e) {}
    }
    
    // 3. CHAT MODELS
    if (model === 'nano' || model === 'groq') {
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: model === 'nano'? 'llama-3.1-8b-instant' : 'llama-3.1-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      })
      return Response.json({ message: completion.choices[0]?.message?.content, model: model })
    }
    
    if (model === 'gemini') {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: SYSTEM_PROMPT })
      const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map(m => ({ role: m.role === 'assistant'? 'model' : 'user', parts: [{ text: m.content }] }))
      })
      const result = await chat.sendMessage(messages[messages.length - 1].content)
      return Response.json({ message: result.response.text(), model: 'gemini' })
    }
    
    const completion = await openai.chat.completions.create({
      messages: messagesWithSystem, model: 'gpt-4o-mini', temperature: 0.7, max_tokens: 2048,
    })
    return Response.json({ message: completion.choices[0]?.message?.content, model: 'openai' })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
