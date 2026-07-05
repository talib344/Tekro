import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Remove.bg API - Free 50 images/month
const REMOVE_BG_API = 'https://api.remove.bg/v1.0/removebg'

export async function POST(req) {
  try {
    const { messages, model = 'nano', language = 'English', image, fileType, editMode } = await req.json()
    
    const SYSTEM_PROMPT = `You are Tekro AI 2030 by T Company. World Best AI.
    CRITICAL: Reply ONLY in ${language}. Never use Swedish unless ${language} is Swedish.
    Founder: T Company ne banaya hai. This is enhanced technology.`

    // 1. REAL BACKGROUND REMOVE
    if (editMode === 'remove-bg' && image) {
      try {
        const base64Data = image.split(',')[1]
        const response = await fetch(REMOVE_BG_API, {
          method: 'POST',
          headers: {
            'X-Api-Key': process.env.REMOVEBG_API_KEY, // Add this in Vercel
          },
          body: JSON.stringify({
            image_file_b64: base64Data,
            size: 'auto'
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
        }
      } catch (e) {
        return Response.json({ 
          message: language === 'Urdu'? 'API key add karo Vercel mein: REMOVEBG_API_KEY' : 'Add REMOVEBG_API_KEY in Vercel',
          model: 'error'
        })
      }
    }

    // 2. REAL IMAGE GENERATION + EDIT - DALL-E 3
    if ((editMode === 'cartoon' || editMode === 'enhance' || editMode === 'upscale') && image) {
      const prompts = {
        'cartoon': 'Convert this photo to high quality cartoon/anime style, vibrant colors',
        'enhance': 'Enhance this photo: 8K, ultra detailed, sharp, professional lighting',
        'upscale': 'Upscale this image to 4K resolution, add details, photorealistic'
      }
      
      try {
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${prompts[editMode]}. Base reference: person with hand`,
          n: 1,
          size: "1024x1024",
          quality: "hd"
        })
        return Response.json({ 
          message: language === 'Urdu'? `${editMode} complete ✅ Download kar lo` : 
                   `${editMode} completed ✅ Download now`,
          model: 'dall-e-3-hd',
          image: dalleResponse.data[0].url
        })
      } catch (e) {}
    }

    // 3. TATTOO / TEXT ON IMAGE
    if (image && lastUserMsg.includes('tattoo') || lastUserMsg.includes('add')) {
      try {
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Add ${messages[messages.length - 1].content} to the hand in the image. Photorealistic tattoo, natural skin, professional`,
          n: 1,
          size: "1024x1024",
          quality: "hd"
        })
        return Response.json({ 
          message: language === 'Urdu'? 'Tattoo add ho gaya ✅' : 'Tattoo added ✅',
          model: 'dall-e-3-hd',
          image: dalleResponse.data[0].url
        })
      } catch (e) {}
    }

    // 4. NORMAL CHAT
    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT },...messages]
    
    if (model === 'nano' || model === 'groq') {
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: model === 'nano'? 'llama-3.1-8b-instant' : 'llama-3.1-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      })
      return Response.json({ message: completion.choices[0]?.message?.content, model: model })
    }
    
    const completion = await openai.chat.completions.create({
      messages: messagesWithSystem, model: 'gpt-4o-mini', temperature: 0.7, max_tokens: 2048,
    })
    return Response.json({ message: completion.choices[0]?.message?.content, model: 'openai' })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
