'use client'
import { useState } from 'react'
import { useChatStore } from '@/store/chat-store'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EmailWriter() {
  const [to, setTo] = useState('')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Professional')
  const { addMessage } = useChatStore()
  const router = useRouter()

  const generateEmail = () => {
    if (!topic) return
    
    const prompt = `Write a ${tone} email ${to ? `to ${to}` : ''} about: ${topic}. 
    
Include:
1. Clear subject line
2. Proper greeting
3. Main body with key points
4. Professional closing
5. Signature placeholder

Keep it concise and impactful.`

    addMessage({ 
      role: 'user', 
      content: prompt
    })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <header className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/tools" className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold gradient-text">📧 Email Writer</h1>
          </div>
        </header>
        
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Email To (Optional)</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g. HR Manager, Client, Boss"
              className="w-full bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-purple-500/50"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Email Topic *</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Job application, Meeting request, Follow up"
              className="w-full bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-purple-500/50"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-purple-500/50"
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Formal</option>
              <option>Persuasive</option>
              <option>Apologetic</option>
            </select>
          </div>

          <button 
            onClick={generateEmail} 
            disabled={!topic}
            className="w-full px-6 py-3 rounded-xl btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={20} /> Generate Email
          </button>
        </div>
      </div>
    </div>
  )
}
