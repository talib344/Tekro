import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const REMOVE_BG_API = 'https://api.remove.bg/v1.0/removebg'

// FREE IMAGE GEN - Pollinations.AI
async function generateImageFree(prompt) {
  const encodedPrompt = encodeURIComponent(prompt)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`
  return imageUrl
}

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY missing - console.groq.com se free le lo')
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing - makersuite.google.com se free le lo')

    const { messages, model = 'nano', language = 'English', image, fileType, editMode } = await req.json()
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    
    const SYSTEM_PROMPT = `You are Tekro AI 2030 by T Company. World Best Free AI. Reply ONLY in ${language}. Founder: T Company.`

    // 1. BACKGROUND REMOVE - REMOVE.BG FREE 50/MONTH
    if (editMode === 'remove-bg' && image) {
      if (!process.env.REMOVEBG_API_KEY) {
        return Response.json({ 
          message: 'REMOVEBG_API_KEY add karo: remove.bg/dashboard#api-key - Free 50/month',
          model: 'error'
        })
      }
      
      const base64Data = image.split(',')[1]
      const response = await fetch(REMOVE_BG_API, {
        method: 'POST',
        headers: {
          'X-Api-Key': process.env.REMOVEBG_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_file_b64: base64Data, size: 'auto' })
      })
      
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const base64 = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
        return Response.json({ 
          message: 'Background remove ho gaya ✅ Free API se',
          model: 'remove-bg-free',
          image: base64
        })
      } else {
        const error = await response.text()
        return Response.json({ message: `Remove.bg Error: ${error}`, model: 'error' })
      }
    }

    // 2. TATTOO ADD - GEMINI + POLLINATIONS FREE
    if (image && (lastUserMsg.includes('tattoo') || lastUserMsg.includes('add'))) {
      try {
        // Step 1: Gemini se photo samjho
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const base64Data = image.split(',')[1]
        const mimeType = image.split(';')[0].split(':')[1]
        
        const visionResult = await geminiModel.generateContent([
          { text: 'Describe this hand/wrist: skin tone, position, lighting, veins. Short detail for AI.' },
          { inlineData: { data: base64Data, mimeType: mimeType } }
        ])
        const imageDesc = visionResult.response.text()

        // Step 2: Pollinations se tattoo wali image banao - FREE
        const tattooText = messages[messages.length - 1].content.replace(/add tattoo|tattoo/gi, '').trim() || 'AKM'
        const prompt = `photorealistic hand, ${imageDesc}, professional black ink tattoo saying "${tattooText}" on wrist, natural skin texture, realistic lighting, 8k, detailed`
        const imageUrl = await generateImageFree(prompt)
        
        return Response.json({ 
          message: `Tattoo "${tattooText}" added using Gemini + Pollinations AI ✅ 100% FREE`,
          model: 'gemini-free-combo',
          image: imageUrl
        })
      } catch (e) {
        return Response.json({ message: `Tattoo Error: ${e.message}`, model: 'error' })
      }
    }

    // 3. IMAGE GENERATE - POLLINATIONS FREE
    if (lastUserMsg.includes('photo') || lastUserMsg.includes('image') || lastUserMsg.includes('generate') || 
        lastUserMsg.includes('create') || lastUserMsg.includes('banao')) {
      const prompt = messages[messages.length - 1].content
      const imageUrl = await generateImageFree(prompt + ', 8k, photorealistic, detailed')
      return Response.json({ 
        message: `Image ban gayi ✅ Pollinations AI Free: "${prompt}"`,
        model: 'pollinations-free',
        image: imageUrl
      })
    }

    // 4. PHOTO ANALYZE - GEMINI VISION FREE
    if (image &&!editMode) {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const base64Data = image.split(',')[1]
      const mimeType = image.split(';')[0].split(':')[1]
      
      const result = await geminiModel.generateContent([
        { text: `You are expert editor. Reply in ${language}. User said: "${messages[messages.length - 1]?.content}". Give 3 edit suggestions.` },
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ])
      
      return Response.json({ 
        message: result.response.text(),
        model: 'gemini-vision-free'
      })
    }

    // 5. NORMAL CHAT - GROQ FREE
    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    const completion = await groq.chat.completions.create({
      messages: messagesWithSystem,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2048,
    })
    return Response.json({ message: completion.choices[0]?.message?.content, model: 'groq-nano-free' })
    
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      message: `Error: ${error.message}. Sirf Groq aur Gemini key chahiye. Dono free hain.`,
      error: error.message 
    }, { status: 500 })
  }
}import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const REMOVE_BG_API = 'https://api.remove.bg/v1.0/removebg'

// FREE IMAGE GEN - Pollinations.AI
async function generateImageFree(prompt) {
  const encodedPrompt = encodeURIComponent(prompt)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`
  return imageUrl
}

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY missing - console.groq.com se free le lo')
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing - makersuite.google.com se free le lo')

    const { messages, model = 'nano', language = 'English', image, fileType, editMode } = await req.json()
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    
    const SYSTEM_PROMPT = `You are Tekro AI 2030 by T Company. World Best Free AI. Reply ONLY in ${language}. Founder: T Company.`

    // 1. BACKGROUND REMOVE - REMOVE.BG FREE 50/MONTH
    if (editMode === 'remove-bg' && image) {
      if (!process.env.REMOVEBG_API_KEY) {
        return Response.json({ 
          message: 'REMOVEBG_API_KEY add karo: remove.bg/dashboard#api-key - Free 50/month',
          model: 'error'
        })
      }
      
      const base64Data = image.split(',')[1]
      const response = await fetch(REMOVE_BG_API, {
        method: 'POST',
        headers: {
          'X-Api-Key': process.env.REMOVEBG_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_file_b64: base64Data, size: 'auto' })
      })
      
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const base64 = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
        return Response.json({ 
          message: 'Background remove ho gaya ✅ Free API se',
          model: 'remove-bg-free',
          image: base64
        })
      } else {
        const error = await response.text()
        return Response.json({ message: `Remove.bg Error: ${error}`, model: 'error' })
      }
    }

    // 2. TATTOO ADD - GEMINI + POLLINATIONS FREE
    if (image && (lastUserMsg.includes('tattoo') || lastUserMsg.includes('add'))) {
      try {
        // Step 1: Gemini se photo samjho
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const base64Data = image.split(',')[1]
        const mimeType = image.split(';')[0].split(':')[1]
        
        const visionResult = await geminiModel.generateContent([
          { text: 'Describe this hand/wrist: skin tone, position, lighting, veins. Short detail for AI.' },
          { inlineData: { data: base64Data, mimeType: mimeType } }
        ])
        const imageDesc = visionResult.response.text()

        // Step 2: Pollinations se tattoo wali image banao - FREE
        const tattooText = messages[messages.length - 1].content.replace(/add tattoo|tattoo/gi, '').trim() || 'AKM'
        const prompt = `photorealistic hand, ${imageDesc}, professional black ink tattoo saying "${tattooText}" on wrist, natural skin texture, realistic lighting, 8k, detailed`
        const imageUrl = await generateImageFree(prompt)
        
        return Response.json({ 
          message: `Tattoo "${tattooText}" added using Gemini + Pollinations AI ✅ 100% FREE`,
          model: 'gemini-free-combo',
          image: imageUrl
        })
      } catch (e) {
        return Response.json({ message: `Tattoo Error: ${e.message}`, model: 'error' })
      }
    }

    // 3. IMAGE GENERATE - POLLINATIONS FREE
    if (lastUserMsg.includes('photo') || lastUserMsg.includes('image') || lastUserMsg.includes('generate') || 
        lastUserMsg.includes('create') || lastUserMsg.includes('banao')) {
      const prompt = messages[messages.length - 1].content
      const imageUrl = await generateImageFree(prompt + ', 8k, photorealistic, detailed')
      return Response.json({ 
        message: `Image ban gayi ✅ Pollinations AI Free: "${prompt}"`,
        model: 'pollinations-free',
        image: imageUrl
      })
    }

    // 4. PHOTO ANALYZE - GEMINI VISION FREE
    if (image &&!editMode) {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const base64Data = image.split(',')[1]
      const mimeType = image.split(';')[0].split(':')[1]
      
      const result = await geminiModel.generateContent([
        { text: `You are expert editor. Reply in ${language}. User said: "${messages[messages.length - 1]?.content}". Give 3 edit suggestions.` },
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ])
      
      return Response.json({ 
        message: result.response.text(),
        model: 'gemini-vision-free'
      })
    }

    // 5. NORMAL CHAT - GROQ FREE
    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    const completion = await groq.chat.completions.create({
      messages: messagesWithSystem,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2048,
    })
    return Response.json({ message: completion.choices[0]?.message?.content, model: 'groq-nano-free' })
    
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      message: `Error: ${error.message}. Sirf Groq aur Gemini key chahiye. Dono free hain.`,
      error: error.message 
    }, { status: 500 })
  }
}
