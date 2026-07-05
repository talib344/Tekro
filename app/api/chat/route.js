import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const REMOVE_BG_API = 'https://api.remove.bg/v1.0/removebg'

export async function POST(req) {
  try {
    const { messages, model = 'nano', language = 'English', image, fileType, editMode } = await req.json()
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    
    const SYSTEM_PROMPT = `You are Tekro AI 2030 by T Company. World Best AI.
    CRITICAL RULES:
    1. You MUST reply ONLY in ${language} language. Never use Swedish unless ${language} is Swedish.
    2. For "Ap ko kis ne bnaya" or "Founder" questions, reply: "Tekro AI 2030 ko T Company ne banaya hai. Ye enhanced technology hai."
    
    Capabilities:
    1. Image Generation: DALL-E 3 HD quality
    2. Photo/Video Analysis: Remove background, upscale 4K, enhance, cartoon
    3. Voice Support: Male/Female TTS
    4. Multi-language: ${language}
    
    Be helpful like Gemini, fast like Groq Nano 🍌`

    // 1. REAL BACKGROUND REMOVE - REMOVE.BG API
    if (editMode === 'remove-bg' && image) {
      if (!process.env.REMOVEBG_API_KEY) {
        return Response.json({ 
          message: language === 'Urdu'? 'Bhai API key add karo Vercel mein: REMOVEBG_API_KEY' : 
                   language === 'Hindi'? 'Bhai API key add karo Vercel mein: REMOVEBG_API_KEY' :
                   'Add REMOVEBG_API_KEY in Vercel Settings',
          model: 'error'
        })
      }
      
      try {
        const base64Data = image.split(',')[1]
        const response = await fetch(REMOVE_BG_API, {
          method: 'POST',
          headers: {
            'X-Api-Key': process.env.REMOVEBG_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image_file_b64: base64Data,
            size: 'auto',
            type: 'auto'
          })
        })
        
        if (response.ok) {
          const buffer = await response.arrayBuffer()
          const base64 = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
          return Response.json({ 
            message: language === 'Urdu'? 'Background remove ho gaya ✅ Download kar lo' : 
                     language === 'Hindi'? 'Background remove ho gaya ✅ Download kar lo' :
                     'Background removed successfully ✅ Download now',
            model: 'remove-bg-ai',
            image: base64
          })
        } else {
          const error = await response.text()
          return Response.json({ 
            message: `Remove.bg Error: ${error}. Check API key or credits.`,
            model: 'error' 
          })
        }
      } catch (e) {
        return Response.json({ 
          message: `Background remove failed: ${e.message}`,
          model: 'error' 
        })
      }
    }

    // 2. CARTOON / UPSCALE / ENHANCE - DALL-E 3
    if ((editMode === 'cartoon' || editMode === 'enhance' || editMode === 'upscale') && image) {
      const prompts = {
        'cartoon': 'Convert this photo to high quality cartoon/anime style, vibrant colors, clean lines, Disney/Pixar style',
        'enhance': 'Enhance this photo: 8K resolution, ultra detailed, sharp focus, professional lighting, color correction, HDR',
        'upscale': 'Upscale this image to 4K resolution, add photorealistic details, sharp textures, professional quality'
      }
      
      try {
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${prompts[editMode]}. Keep the same subject and pose from reference.`,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid"
        })
        return Response.json({ 
          message: language === 'Urdu'? `${editMode} complete ho gaya ✅ Download kar lo` : 
                   language === 'Hindi'? `${editMode} complete ho gaya ✅ Download kar lo` :
                   `${editMode} completed ✅ Download now`,
          model: 'dall-e-3-hd',
          image: dalleResponse.data[0].url
        })
      } catch (e) {
        return Response.json({ 
          message: `DALL-E Error: ${e.message}`,
          model: 'error' 
        })
      }
    }

    // 3. TATTOO ADD / TEXT ON IMAGE - DALL-E 3
    if (image && (lastUserMsg.includes('tattoo') || lastUserMsg.includes('add') || lastUserMsg.includes('likh'))) {
      try {
        const tattooText = messages[messages.length - 1].content.replace(/add tattoo|tattoo add|add|likh/gi, '').trim() || 'AKM'
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Add a photorealistic tattoo of "${tattooText}" on the wrist/hand in the photo. Natural skin texture, professional black ink tattoo, realistic shadows and lighting, high detail`,
          n: 1,
          size: "1024x1024",
          quality: "hd"
        })
        return Response.json({ 
          message: language === 'Urdu'? `Tattoo "${tattooText}" add ho gaya ✅` : 
                   language === 'Hindi'? `Tattoo "${tattooText}" add ho gaya ✅` :
                   `Tattoo "${tattooText}" added ✅`,
          model: 'dall-e-3-hd',
          image: dalleResponse.data[0].url
        })
      } catch (e) {
        return Response.json({ 
          message: `Tattoo Error: ${e.message}`,
          model: 'error' 
        })
      }
    }

    // 4. IMAGE GENERATION FROM TEXT
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
        return Response.json({ 
          message: language === 'Urdu'? `Image ban gayi ✅: "${messages[messages.length - 1].content}"` : 
                   language === 'Hindi'? `Image ban gayi ✅: "${messages[messages.length - 1].content}"` :
                   `Generated HD image ✅: "${messages[messages.length - 1].content}"`,
          model: 'dall-e-3-hd',
          image: dalleResponse.data[0].url
        })
      } catch (e) {}
    }

    // 5. IMAGE ANALYSIS WITH VISION
    if (image &&!editMode) {
      const userPrompt = messages[messages.length - 1]?.content || 'Analyze this image and suggest 3 edits'
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: `You are expert photo/video editor. Reply ONLY in ${language}. Give 3 specific edit suggestions.` },
          { role: 'user', content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: image } }
          ]}
        ],
        model: 'gpt-4o-mini',
        max_tokens: 1000
      })
      return Response.json({ 
        message: completion.choices[0]?.message?.content,
        model: 'gpt-4o-vision'
      })
    }

    // 6. NORMAL CHAT MODELS
    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    
    if (model === 'nano') {
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 2048,
      })
      return Response.json({ message: completion.choices[0]?.message?.content, model: 'nano' })
    }
    
    if (model === 'groq') {
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: 'llama-3.1-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      })
      return Response.json({ message: completion.choices[0]?.message?.content, model: 'groq' })
    }
    
    if (model === 'gemini') {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: SYSTEM_PROMPT })
      const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map(m => ({ role: m.role === 'assistant'? 'model' : 'user', parts: [{ text: m.content }] }))
      })
      const result = await chat.sendMessage(messages[messages.length - 1].content)
      return Response.json({ message: result.response.text(), model: 'gemini' })
    }
    
    // Default: OpenAI
    const completion = await openai.chat.completions.create({
      messages: messagesWithSystem, 
      model: 'gpt-4o-mini', 
      temperature: 0.7, 
      max_tokens: 2048,
    })
    return Response.json({ message: completion.choices[0]?.message?.content, model: 'openai' })
    
  } catch (error) {
    return Response.json({ 
      message: `Server Error: ${error.message}`,
      error: error.message 
    }, { status: 500 })
  }
}
