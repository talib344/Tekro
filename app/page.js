'use client'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'
import { Send, Mic, MicOff, Copy, Moon, Sun, Volume2, StopCircle } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dark, setDark] = useState(true)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiMsg = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, aiMsg])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        aiMsg.content += chunk
        setMessages(prev => [...prev.slice(0, -1), {...aiMsg }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + err.message }])
    }
    setLoading(false)
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported')
      return
    }
    const recognition = new webkitSpeechRecognition()
    recognition.lang = 'hi-IN'
    recognition.continuous = false
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const speak = (text) => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'hi-IN'
    utterance.rate = 1
    utterance.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={`min-h-screen ${dark? 'bg-slate-950' : 'bg-slate-50'} transition-colors`}>
      <div className="fixed inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10 animate-gradient" style={{backgroundSize: '200% 200%'}} />

      <div className="relative max-w-5xl mx-auto p-4">
        <header className="glass rounded-2xl p-4 mb-4 flex justify-between items-center neon-glow">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Tekro AI 2030
            </h1>
            <Link href="/tools" className="px-4 py-2 rounded-lg glass hover:neon-glow text-sm">
              Tools
            </Link>
          </div>
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg glass hover:neon-glow">
            {dark? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="glass rounded-2xl p-4 h- overflow-y-auto mb-4 neon-glow">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400">
              <p>Start chatting with Tekro AI...</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 flex ${msg.role === 'user'? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
              ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                  : 'glass'
              }`}>
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children,...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return!inline && match? (
                        <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-slate-800 px-1 rounded" {...props}>{children}</code>
                      )
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>

                {msg.role === 'assistant' && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => copyText(msg.content)} className="p-1 hover:bg-slate-800 rounded">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => speak(msg.content)} className="p-1 hover:bg-slate-800 rounded">
                      {speaking? <StopCircle size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="glass rounded-2xl p-4 neon-glow">
          <div className="flex gap-2">
            <button
              onClick={listening? stopListening : startListening}
              className={`p-3 rounded-xl ${listening? 'bg-red-500' : 'glass'} hover:neon-glow`}
            >
              {listening? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything in Hindi, Urdu, or English..."
              className="flex-1 bg-transparent outline-none"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="p-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:neon-glow disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
