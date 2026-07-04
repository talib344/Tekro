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
      newChat[newChat.length - 1].a = 'Server se baat nahi ho rahi. Thodi der baad try karo.'
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
    <div className="min-h-screen bg-[#0F172A] text-white flex justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B] rounded-2xl p-5 my-4 shadow-2xl border border-[#334155]">
        
        {/* LOGO */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-[#38BDF8]">
            Tekro-AI 2030
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            2x Faster | 10x Better | 100+ Languages | By Talib Ali 🇵🇰
          </p>
        </div>

        {/* BUTTONS GRID */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {buttons.map((btn) => (
            <button
              key={btn.name}
              onClick={() => setActiveMode(btn.name)}
              className={`p-3 rounded-lg text-sm font-medium transition ${
                activeMode === btn.name 
                 ? 'bg-[#38BDF8] text-black' 
                  : 'bg-[#334155] hover:bg-[#475569] text-white'
              }`}
            >
              {btn.icon} {btn.name}
            </button>
          ))}
        </div>

        {/* CHAT BOX */}
        <div className="bg-[#0F172A] rounded-xl p-3 h-80 overflow-y-auto mb-3 border border-[#334155]">
          {chat.length === 0 && (
            <p className="text-gray-500 text-center text-sm mt-32">
              {activeMode} mode active. Ask anything...
            </p>
          )}
          {chat.map((c, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-end mb-1">
                <div className="bg-[#38BDF8] text-black px-4 py-2 rounded-2xl rounded-br-none max-w-[80%]">
                  {c.q}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-[#334155] px-4 py-2 rounded-2xl rounded-bl-none max-w-[80%]">
                  {c.a || (loading && i === chat.length - 1? '...' : '')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="flex gap-2">
          <input
            className="flex-1 p-3 rounded-lg bg-[#0F172A] border border-[#334155] text-white placeholder-gray-500 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            disabled={loading}
          />
          <button 
            onClick={() => sendMessage()} 
            disabled={loading}
            className="bg-[#38BDF8] hover:bg-[#0EA5E9] text-black px-5 rounded-lg font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
