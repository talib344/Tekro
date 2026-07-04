'use client'
import { useState } from 'react'

export default function Home() {
  const [chat, setChat] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeMode, setActiveMode] = useState('AI Chat 2x')

  const sendMessage = async (msg = input) => {
    if (!msg.trim()) return
    const newChat = [...chat, { q: msg, a: '' }]
    setChat(newChat)
    setInput('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, mode: activeMode })
      })
      const data = await res.json()
      newChat[newChat.length - 1].a = data.reply || 'Error: No reply'
      setChat(newChat)
    } catch (err) {
      newChat[newChat.length - 1].a = 'Server error. API key check karo.'
      setChat(newChat)
    }
    setLoading(false)
  }

  const buttons = [
    { name: 'AI Chat 2x', icon: '🤖' },
    { name: 'Code Gen', icon: '💻' },
    { name: 'Debug Code', icon: '🐛' },
    { name: 'Web Search', icon: '🔍' },
    { name: 'PDF Analyze', icon: '📄' },
    { name: 'Image AI', icon: '🖼️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white flex justify-center p-4">
      <div className="fixed top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="w-full max-w-md my-4 z-10">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <div className="text-center mb-5">
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
              Tekro-AI 2030
            </h1>
            <p className="text-xs text-gray-300 mt-2">
              2x Faster | 10x Better | 100+ Languages | By Talib Ali 🇵🇰
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {buttons.map((btn) => (
              <button
                key={btn.name}
                onClick={() => setActiveMode(btn.name)}
                className={`p-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  activeMode === btn.name 
                   ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/50 scale-105' 
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20'
                }`}
              >
                {btn.icon} {btn.name}
              </button>
            ))}
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 h-80 overflow-y-auto mb-4 border border-white/10">
            {chat.length === 0 && (
              <p className="text-gray-400 text-center text-sm mt-32">
                {activeMode} mode active. Ask anything...
              </p>
            )}
            {chat.map((c, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-end mb-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-2xl rounded-br-md max-w-[80%] shadow-lg">
                    {c.q}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl rounded-bl-md max-w-[80%] border border-white/10 whitespace-pre-wrap">
                    {c.a || (loading && i === chat.length - 1? '...' : '')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-400 transition"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              disabled={loading}
            />
            <button 
              onClick={() => sendMessage()} 
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
    }
