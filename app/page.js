'use client'
import { useState } from 'react'
import { Send, Sparkles, Menu } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    setLoading(true)
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages })
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let aiResponse = ''
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      aiResponse += decoder.decode(value)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1].content = aiResponse
        return updated
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
      <div className="relative max-w-4xl mx-auto">
        <header className="backdrop-blur-xl bg-slate-900/50 rounded-2xl p-4 mb-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Chat
            </h1>
            <Link href="/tools" className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 flex items-center gap-2">
              <Menu size={18} /> Tools
            </Link>
          </div>
        </header>

        <div className="backdrop-blur-xl bg-slate-900/50 rounded-2xl p-6 mb-4 h-96 overflow-y-auto border border-slate-800">
          {messages.length === 0? (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Sparkles className="mx-auto mb-4" size={48} />
                <p>Start chatting or try AI Tools</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`mb-4 ${msg.role === 'user'? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-2xl max-w-[80%] ${msg.role === 'user'? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-800/50 border border-slate-700'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="backdrop-blur-xl bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 bg-slate-800/50 rounded-xl px-4 py-3 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
