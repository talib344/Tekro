'use client'
import { useState } from 'react'

export default function Home() {
  const [msg, setMsg] = useState('')
  const [chat, setChat] = useState([])
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!msg.trim()) return
    
    const userMsg = msg
    setMsg('')
    setLoading(true)
    setChat(prev => [...prev, { q: userMsg, a: '...' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      
      const data = await res.json()
      
      setChat(prev => {
        const newChat = [...prev]
        newChat[newChat.length - 1].a = data.reply || 'Error: No reply'
        return newChat
      })
    } catch (err) {
      setChat(prev => {
        const newChat = [...prev]
        newChat[newChat.length - 1].a = 'Error: ' + err.message
        return newChat
      })
    }
    setLoading(false)
  }

  return (
    <main style={{
      padding: 20, 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <h1 style={{textAlign: 'center'}}>Tekro AI</h1>
      
      <div style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        height: 400,
        overflowY: 'auto',
        marginBottom: 16,
        background: '#fafafa'
      }}>
        {chat.length === 0 && <p style={{color: '#888'}}>Start chatting with Tekro AI...</p>}
        {chat.map((c, i) => (
          <div key={i} style={{marginBottom: 12}}>
            <div style={{marginBottom: 4}}>
              <b>You:</b> {c.q}
            </div>
            <div style={{color: '#2563eb'}}>
              <b>AI:</b> {c.a}
            </div>
          </div>
        ))}
      </div>

      <div style={{display: 'flex', gap: 8}}>
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && send()}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: 12,
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 16
          }}
        />
        <button 
          onClick={send} 
          disabled={loading || !msg.trim()}
          style={{
            padding: '12px 24px',
            background: loading ? '#ccc' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 16
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </main>
  )
}
