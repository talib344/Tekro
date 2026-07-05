'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Mic, Upload, Settings, Sparkles, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    
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
      
      if (!res.ok) throw new Error('API Failed')
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      toast.error('Something went wrong. Check API keys.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const tools = [
    { name: 'Blog Writer', icon: '✍️', prompt: 'Write a detailed SEO blog on: ' },
    { name: 'Resume Builder', icon: '📄', prompt: 'Create a professional resume for: ' },
    { name: 'Code Explainer', icon: '💻', prompt: 'Explain this code: ' },
    { name: 'PDF Summarizer', icon: '📑', prompt: 'Summarize this PDF: ' },
    { name: 'Translator', icon: '🌍', prompt: 'Translate to Urdu: ' },
    { name: 'Email Writer', icon: '📧', prompt: 'Write a professional email about: ' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      
      {/* Header - Sticky Top */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold gradient-text">Tekro AI 2030</h1>
          <button 
            onClick={() => setShowTools(!showTools)}
            className="btn-glow px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Menu size={18} />
            <span className="hidden sm:inline">Tools</span>
          </button>
        </div>
      </header>

      {/* Tools Grid - Responsive */}
      {showTools && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {tools.map((tool, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setInput(tool.prompt)
                  setShowTools(false)
                }}
                className="glass-card rounded-xl p-4 text-left hover:border-pink-500/50 transition-all"
              >
                <div className="text-2xl mb-2">{tool.icon}</div>
                <div className="text-sm font-medium">{tool.name}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 py-4 w-full">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <Sparkles className="mx-auto mb-4 text-pink-500" size={48} />
            <h2 className="text-2xl font-bold gradient-text mb-2">How can I help you?</h2>
            <p className="text-slate-400">Ask anything, upload files, or use tools</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 ${msg.role === 'user'? 'ml-auto max-w-[85%] sm:max-w-[70%]' : 'mr-auto max-w-[85%] sm:max-w-[70%]'}`}
          >
            <div className={`glass-card rounded-2xl p-4 ${msg.role === 'user'? 'bg-gradient-to-r from-pink-600/20 to-blue-600/20' : ''}`}>
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                {msg.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        ))}
        
        {loading && (
          <div className="glass-card rounded-2xl p-4 mr-auto max-w-[70%]">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Sticky Bottom */}
      <div className="sticky bottom-0 glass-card border-t border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex gap-2">
          <button className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50">
            <Upload size={20} />
          </button>
          <button className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50">
            <Mic size={20} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' &&!e.shiftKey && sendMessage()}
            placeholder="Ask anything, upload file, or use voice..."
            className="flex-1 bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-pink-500/50"
            disabled={loading}
          />
          <button 
            onClick={sendMessage}
            disabled={loading ||!input.trim()}
            className="btn-glow px-6 py-3 rounded-xl disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
