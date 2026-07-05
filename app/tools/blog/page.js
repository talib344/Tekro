'use client'
import { useState } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BlogTool() {
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const generateBlog = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setResult('')
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Write a detailed SEO optimized blog on: ${topic}. Include headings, intro, conclusion. Format in markdown.`
        }]
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

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10" />
      <div className="relative max-w-4xl mx-auto">
        <header className="glass rounded-2xl p-6 mb-6 neon-glow">
          <Link href="/tools" className="text-slate-400 text-sm mb-2 flex items-center gap-2 hover:text-neon-blue">
            <ArrowLeft size={16} /> Back to Tools
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Blog Writer
          </h1>
        </header>

        <div className="glass rounded-2xl p-6 neon-glow mb-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter blog topic..."
            className="w-full bg-slate-800/50 rounded-xl p-4 mb-4 outline-none"
          />
          <button
            onClick={generateBlog}
            disabled={loading}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:neon-glow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading? 'Generating...' : 'Generate Blog'} <Send size={18} />
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
