'use client'
import { useState } from 'react'

export default function Home() {
  const [msg, setMsg] = useState('')
  const [chat, setChat] = useState([])

  const send = async () => {
    if (!msg) return
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    })
    const data = await res.json()
    setChat([...chat, {q: msg, a: data.reply}])
    setMsg('')
  }

  return (
    <div style={{padding: 20, fontFamily: 'sans-serif'}}>
      <h1>Tekro AI</h1>
      <div style={{marginBottom: 20}}>
        {chat.map((c,i) => (
          <div key={i} style={{margin: '10px 0'}}>
            <b>You:</b> {c.q}<br/>
            <b>AI:</b> {c.a}
          </div>
        ))}
      </div>
      <input 
        value={msg} 
        onChange={e=>setMsg(e.target.value)}
        onKeyDown={e=> e.key==='Enter' && send()}
        placeholder="Type message..."
        style={{padding: 10, width: 300, marginRight: 10}}
      />
      <button onClick={send} style={{padding: 10}}>Send</button>
    </div>
  )
}
