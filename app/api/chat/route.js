import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { message } = await req.json()
    
    // Dummy reply - baad mein asli AI laga dena
    const reply = `Tekro AI: Tumne bola "${message}". Main theek hun, tu suna!`
    
    return NextResponse.json({ reply })
  } catch (error) {
    return NextResponse.json({ reply: 'Error: Server mein problem hai' }, { status: 500 })
  }
}
