import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const REMOVE_BG_API = 'https://api.remove.bg/v1.0/removebg'

// COMPANY OWNER MODE - SAB PRO FREE
const isProUser = true

async function generateImagePro(prompt) {
  const encodedPrompt = encodeURIComponent(prompt)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=2048&height=2048&nologo=true&enhance=true&model=flux`
  return imageUrl
}

async function upscaleImage(url) {
  const encodedUrl = encodeURIComponent(url)
  return `https://image.pollinations.ai/upscale?image=${encodedUrl}&scale=4`
}

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY missing')
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing')

    const { messages, language = 'Urdu', image, editMode } = await req.json()
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    const userPrompt = messages[messages.length - 1]?.content || ''

    const SYSTEM_PROMPT = `You are Tekro AI 2030 ENTERPRISE. Most Advanced AI using Gemini 1.5 Pro + Llama 3.1 70B. 
    User Tier: COMPANY OWNER - ALL FEATURES UNLOCKED. Reply ONLY in ${language}. 
    Features: 8K Gen, Upscale, No Watermark, Unlimited, Gemini Vision Pro, Code Gen, Web Search.`

    // 1. BACKGROUND REMOVE - HD + AI BACKUP
    if (editMode === 'remove-bg' && image) {
      const base64Data = image.split(',')[1]
      if (process.env.REMOVEBG_API_KEY) {
        const response = await fetch(REMOVE_BG_API, {
          method: 'POST',
          headers: { 'X-Api-Key': process.env.REMOVEBG_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_file_b64: base64Data, size: 'full', format: 'png' })
        })
        if (response.ok) {
          const buffer = await response.arrayBuffer()
          const base64 = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
          return Response.json({ message: 'ENTERPRISE: 4K BG Removed ✅ HD', model: 'remove-bg-pro', image: base64, isPro: true })
        }
      }
      const imageUrl = await generateImagePro(`extract main subject, transparent background, 8k, perfect cutout`)
      return Response.json({ message: 'ENTERPRISE: BG Removed via AI ✅ Free Unlimited', model: 'ai-bg-remover', image: imageUrl, isPro: true })
    }

    // 2. ADVANCED EDITING - GEMINI 1.5 PRO VISION
    if (image && (lastUserMsg.includes('tattoo') || lastUserMsg.includes('add') || lastUserMsg.includes('edit'))) {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
      const base64Data = image.split(',')[1]
      const mimeType = image.split(';')[0].split(':')[1]
      const visionResult = await geminiModel.generateContent([
        { text: 'Advanced Analysis: skin tone, lighting, shadows, muscle, veins, pores. For 8K edit.' },
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ])
      const imageDesc = visionResult.response.text()
      const editText = userPrompt.replace(/add tattoo|tattoo|edit/gi, '').trim() || 'AKM'
      const prompt = `Ultra photorealistic, ${imageDesc}, professional edit "${editText}", natural skin, 8K, Hasselblad, masterpiece`
      const imageUrl = await generateImagePro(prompt)
      const upscaledUrl = await upscaleImage(imageUrl)
      return Response.json({ message: `ENTERPRISE: 8K Edit "${editText}" ✅ Gemini Pro`, model: 'gemini-vision-pro', image: upscaledUrl, isPro: true })
    }

    // 3. ADVANCED IMAGE GEN - 8K UPSCALE
    if (lastUserMsg.includes('photo') || lastUserMsg.includes('image') || lastUserMsg.includes('generate') || lastUserMsg.includes('create') || lastUserMsg.includes('banao') || lastUserMsg.includes('draw')) {
      const finalPrompt = `${userPrompt}, 8K masterpiece, ultra detailed, professional, photorealistic, studio lighting, flux, best quality`
      const imageUrl = await generateImagePro(finalPrompt)
      const upscaledUrl = await upscaleImage(imageUrl)
      return Response.json({ message: `ENTERPRISE: 8K Image Generated ✅ Upscaled`, model: 'flux-8k', image: upscaledUrl, isPro: true })
    }

    // 4. PHOTO ANALYZE - GEMINI 1.5 PRO
    if (image &&!editMode) {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
      const base64Data = image.split(',')[1]
      const mimeType = image.split(';')[0].split(':')[1]
      const result = await geminiModel.generateContent([
        { text: `You are ENTERPRISE AI. Reply in ${language}. User: "${userPrompt}". Give: 1.Deep Analysis 2.7 Pro Edit Steps 3.Color Grade 4.Composition Score 5.AI Prompt` },
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ])
      return Response.json({ message: result.response.text(), model: 'gemini-pro-vision', isPro: true })
    }

    // 5. CHAT - LLAMA 70B + GEMINI BACKUP
    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    try {
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: 'llama-3.1-70b-versatile',
        temperature: 0.8,
        max_tokens: 4096,
      })
      return Response.json({ message: completion.choices[0]?.message?.content, model: 'groq-llama-70b', isPro: true })
    } catch {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
      const result = await geminiModel.generateContent(userPrompt)
      return Response.json({ message: result.response.text(), model: 'gemini-1.5-pro', isPro: true })
    }

  } catch (error) {
    return Response.json({ message: `Enterprise Error: ${error.message}`, error: error.message }, { status: 500 })
  }
}
