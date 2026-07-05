import { NextResponse } from 'next/server'

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')

  // PDF ke liye text extract karna hoga - abhi base64 bhej dete
  // Image ke liye Groq vision direct le lega

  return NextResponse.json({
    base64,
    type: file.type,
    name: file.name
  })
}
