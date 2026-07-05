import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `You are Tekro AI 2030. You can:

1. Generate Images: If user says "create photo" or "generate image", respond with detailed description and set generateImage: true
2. Edit Photos: Analyze uploaded photos and suggest edits like "make brighter", "remove background"
3. Edit Videos: Suggest edits like "cut 0:30", "add music"
4. All tasks: Resume, blog, code, translate

For image generation requests, describe the image in detail. For uploads, analyze and give editing tips.
Reply in user's language. Be like Gemini + Midjourney combined.`

export async function POST(req) {
  try {
    const { messages, model = 'nano', image, fileType } = await req.json()
    
    // 1. IMAGE/VIDEO UPLOAD ANALYSIS
    if (image) {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert photo/video editor. Analyze the uploaded file and suggest 3 specific edits.' },
          { role: 'user', content: [
            { type: 'text', text: 'Analyze this file and tell me how to improve it using AI tools.' },
            { type: 'image_url', image_url: { url: image } }
          ]}
        ],
        model: 'gpt-4o-mini',
        max_tokens: 500
      })
      return Response.json({ 
        message: completion.choices[0]?.message?.content,
        model: 'openai-vision'
      })
    }

    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    
    // 2. IMAGE GENERATION - DALL-E 3
    if (lastUserMsg.includes('photo') || lastUserMsg.includes('image') || lastUserMsg.includes('generate') || lastUserMsg.includes('create')) {
      try {
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: messages[messages.length - 1].content,
          n: 1,
          size: "1024x1024",
          quality: "standard"
        })
        return Response.json({ 
          message: `Generated image for: "${messages[messages.length - 1].content}"`,
          model: 'dall-e-3',
          image: dalleResponse.data[0].url
        })
      } catch (e) {
        // Fallback to text if DALL-E fails
      }
    }
    
    // 3. NORMAL CHAT - NANO/GROQ/GEMINI
    if (model === 'nano' || model === 'groq') {
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: model === 'nano'? 'llama-3.1-8b-instant' : 'llama-3.1-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      })
      return Response.json({ 
        message: completion.choices[0]?.message?.content,
        model: model
      })
    }
    
    if (model === 'gemini') {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: SYSTEM_PROMPT })
      const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map(m => ({
          role: m.role === 'assistant'? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      })
      const result = await chat.sendMessage(messages[messages.length - 1].content)
      return Response.json({ message: result.response.text(), model: 'gemini' })
    }
    
    const completion = await openai.chat.completions.create({
      messages: messagesWithSystem,
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 2048,
    })
    return Response.json({ message: completion.choices[0]?.message?.content, model: 'openai' })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
