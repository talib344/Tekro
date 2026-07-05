import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  try {
    const { messages, model = 'nano', language = 'English', image, fileType, editMode } = await req.json()
    
    const SYSTEM_PROMPT = `You are Tekro AI 2030, Enhanced AI Assistant by T Company.
    CRITICAL RULES:
    1. You MUST reply ONLY in ${language} language. Never use Swedish unless ${language} is Swedish.
    2. For "Ap ko kis ne bnaya" or "Founder" questions, reply: "Tekro AI 2030 ko T Company ne banaya hai. Ye enhanced technology hai."
    
    Capabilities:
    1. Image Generation: DALL-E 3 HD quality
    2. Photo/Video Analysis: Remove background, upscale 4K, enhance, cartoon
    3. Voice Support: Male/Female TTS
    4. Multi-language: ${language}
    
    Be helpful like Gemini, fast like Groq Nano 🍌`

    // 1. ENHANCED PHOTO/VIDEO EDITING
    if (image) {
      let editPrompt = messages[messages.length - 1]?.content || 'Analyze this file'
      
      // Edit mode specific prompts
      const editPrompts = {
        'remove-bg': 'Remove the background from this image and make it transparent. Explain steps.',
        'upscale': 'Upscale this image to 4K quality. Suggest AI tools.',
        'enhance': 'Auto enhance this photo: fix lighting, colors, sharpness.',
        'cartoon': 'Convert this to cartoon/anime style. Describe how.'
      }
      if (editMode) editPrompt = editPrompts[editMode] || editPrompt

      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: `You are expert photo/video editor. Reply ONLY in ${language}. Give 3 specific steps.` },
          { role: 'user', content: [
            { type: 'text', text: editPrompt },
            { type: 'image_url', image_url: { url: image } }
          ]}
        ],
        model: 'gpt-4o-mini',
        max_tokens: 1000
      })
      return Response.json({ 
        message: completion.choices[0]?.message?.content,
        model: 'gpt-4o-vision-enhanced'
      })
    }

    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    
    // 2. IMAGE GENERATION - DALL-E 3 HD
    if (lastUserMsg.includes('photo') || lastUserMsg.includes('image') || lastUserMsg.includes('generate') || 
        lastUserMsg.includes('create') || lastUserMsg.includes('banao') || lastUserMsg.includes('tasveer')) {
      try {
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: messages[messages.length - 1].content,
          n: 1,
          size: "1024x1024",
          quality: "hd"
        })
        const msg = language === 'Urdu'? `Image ban gayi ✅: "${messages[messages.length - 1].content}"` : 
                    language === 'Hindi'? `Image ban gayi ✅: "${messages[messages.length - 1].content}"` :
                    `Generated HD image ✅: "${messages[messages.length - 1].content}"`
        return Response.json({ 
          message: msg,
          model: 'dall-e-3-hd',
          image: dalleResponse.data[0].url
        })
      } catch (e) {}
    }
    
    // 3. CHAT MODELS WITH LANGUAGE LOCK
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
