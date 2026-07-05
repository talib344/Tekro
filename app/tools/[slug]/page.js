'use client'
import { useState } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const toolPrompts = {
  'blog': 'Write a detailed SEO optimized blog on: {input}. Include headings, intro, conclusion. Format in markdown.',
  'email': 'Write a professional email about: {input}. Keep tone formal and concise.',
  'article': 'Write a detailed article on: {input} with proper research points.',
  'story': 'Write a creative short story about: {input}. Make it engaging.',
  'youtube': 'Write a YouTube video script for: {input}. Include hook, main content, CTA.',
  'linkedin': 'Write a professional LinkedIn post about: {input}. Add hashtags.',
  'python': 'Write Python code for: {input}. Add comments and explanation.',
  'react': 'Write React/Next.js code for: {input}. Use functional components.',
  'debug': 'Debug this code and fix errors: {input}. Explain the fix.',
  'explain': 'Explain this code in simple terms: {input}',
  'sql': 'Write SQL query for: {input}. Explain the query.',
  'regex': 'Create regex pattern for: {input}. Explain how it works.',
  'pdf': 'Summarize this text as if from PDF: {input}',
  'pdf-qa': 'Answer questions based on this text: {input}',
  'caption': 'Write image caption for: {input}',
  'ocr': 'Extract and format text from: {input}',
  'translate': 'Translate to English: {input}',
  'grammar': 'Fix grammar mistakes in: {input}',
  'rewrite': 'Rewrite this text professionally: {input}',
  'summary': 'Summarize this text: {input}',
  'math': 'Solve this math problem step by step: {input}',
  'json': 'Format and validate this JSON: {input}'
}

const toolNames = {
  'blog': 'Blog Writer', 'email': 'Email Writer', 'article': 'Article Writer',
  'story': 'Story Writer', 'youtube': 'YouTube Script', 'linkedin': 'LinkedIn Post',
  'python': 'Python Coder', 'react': 'React Coder', 'debug': 'Code Debugger',
  'explain': 'Code Explainer', 'sql': 'SQL Generator', 'regex': 'Regex Builder',
  'pdf': 'PDF Summarizer', 'pdf-qa': 'PDF Q&A', 'caption': 'Image Caption',
  'ocr': 'OCR Reader', 'translate': 'Translator', 'grammar': 'Grammar Fixer',
  'rewrite': 'Rewriter', 'summary': 'Summarizer', 'math': 'Math Solver', 'json': 'JSON Formatter'
}

export default function ToolPage() {
  const params = useParams()
  const slug = params.slug
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!input.trim() ||!toolPrompts[slug]) return
    setLoading(true)
    setResult('')

    const prompt = toolPrompts[slug].replace('{input}', input)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      setResult(prev => prev + chunk)
    }
    setLoading(false)
  }

  if (!toolNames[slug]) {
    return <div className="min-h-screen bg-slate-950 p-4 text-white">Tool not found</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10" />
      <div className="relative max-w-4xl mx-auto">
        <header className="glass rounded-2xl p-6 mb-6 neon-glow">
          <Link href="/tools" className="text-slate-400 text-sm mb-2 flex items-center gap-2 hover:text-neon-blue">
            <ArrowLeft size={16} /> Back to Tools
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            {toolNames[slug]}
          </h1>
        </header>

        <div className="glass rounded-2xl p-6 neon-glow mb-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter your input for ${toolNames[slug]}...`}
            className="w-full bg-slate-800/50 rounded-xl p-4 mb-4 outline-none min-h-32"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:neon-glow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading? 'Generating...' : 'Generate'} <Send size={18} />
          </button>
        </div>

        {result && (
          <div className="glass rounded-2xl p-6 neon-glow whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
