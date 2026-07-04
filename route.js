import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // Vercel mein yahi naam hai
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Sasta aur fast model
      messages: [{ role: 'user', content: message }],
    });

    return NextResponse.json({ 
      reply: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { error: 'Server se baat nahi ho rahi' }, 
      { status: 500 }
    );
  }
}
