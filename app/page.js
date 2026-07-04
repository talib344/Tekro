'use client'
import { useState } from 'react'

export default function Home() {
  const [chat, setChat] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const newChat = [...chat, { q: input, a: '' }]
    setChat(newChat)
    setInput('')
    setLoading(true)
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    })
    const data = await res.json()
    newChat[newChat.length - 1].a = data.reply || 'Error: No reply'
    setChat(newChat)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      {/* PURANA LOGO STYLE WAPAS */}
      <div className="text-center my-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Tekro AI
        </h1>
        <p className="text-sm text-gray-400 mt-1">2030</p>
      </div>

      <div className="w-full max-w-2xl flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto mb-4 border border-gray-800">
        {chat.map((c, i) => (
          <div key={i} className="mb-4">
            <p className="text-gray-300"><b>You:</b> {c.q}</p>
            <p className="text-blue-400"><b>AI:</b> {c.a || (loading && i === chat.length - 1 ? '...' : '')}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl flex gap-2">
        <input
          className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 rounded-lg font-semibold disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}
