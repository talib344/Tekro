'use client'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('AI Chat 2x')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const modes = [
    { name: 'AI Chat 2x', icon: '🤖', color: 'from-cyan-500 to-blue-500' },
    { name: 'Code Gen', icon: '💻', color: 'from-purple-500 to-pink-500' },
    { name: 'Debug Code', icon: '🐛', color: 'from-green-500 to-emerald-500' },
    { name: 'Web Search', icon: '🌐', color: 'from-orange-500 to-red-500' },
    { name: 'PDF Analyze', icon: '📄', color: 'from-yellow-500 to-amber-500' },
    { name: 'Image AI', icon: '🎨', color: 'from-indigo-500 to-violet-500' }
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, mode })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error! Check API key in Vercel.' }])
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Tekro-AI 2030
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            2x Faster | 10x Better | 100+ Languages | By Talib Ali 🇵🇰
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {modes.map((m) => (
            <button
              key={m.name}
              onClick={() => setMode(m.name)}
              className={`p-3 rounded-2xl border transition-all duration-300 ${
                mode === m.name
                 ? `bg-gradient-to-br ${m.color} border-transparent shadow-lg shadow-cyan-500/50 scale-105`
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105'
              }`}
            >
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-xs font-semibold">{m.name}</div>
            </button>
          ))}
        </div>

        {/* Chat Box */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Messages */}
          <div className="h-[50vh] md:h-[55vh] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-20">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-lg">{mode} mode active</p>
                <p className="text-sm">Ask anything to get started...</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user'? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                   ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white'
                    : 'bg-white/10 border border-white/20'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-black/20 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
              />
              <button
                onClick={sendMessage}
                disabled={loading ||!input.trim()}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">Powered by Groq LLaMA 3.3 70B</p>
      </div>
    </main>
  )
                }
