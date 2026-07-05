'use client'
import { useState } from 'react'
import { useChatStore } from '@/store/chat-store'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BlogWriter() {
  const [topic, setTopic] = useState('')
  const { addMessage } = useChatStore()
  const router = useRouter()

  const generateBlog = () => {
    if (!topic) return
    addMessage({ 
      role: 'user', 
      content: `Write a detailed SEO blog post on: ${topic}. Use H2, H3 headings, bullet points, and make it 1000+ words.` 
    })
    router.push('/') // Main chat pe bhej de
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <header className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/tools" className="p-2 rounded-xl bg-slate-800/50"><ArrowLeft size={20} /></Link>
            <h1 className="text-2xl font-bold gradient-text">📝 Blog Writer</h1>
          </div>
        </header>
        <div className="glass-card rounded-2xl p-6">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Blog topic likho... e.g. AI in 2030"
            className="w-full bg-slate-800/50 rounded-xl px-4 py-3 outline-none mb-4"
          />
          <button onClick={generateBlog} className="w-full px-6 py-3 rounded-xl btn-glow flex items-center justify-center gap-2">
            <Send size={20} /> Generate Blog
          </button>
        </div>
      </div>
    </div>
  )
}
