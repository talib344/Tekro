'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Mic, Upload, Sparkles, Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentModel, setCurrentModel] = useState('groq')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const models = {
    groq: { name: 'Groq ⚡', desc: 'Fastest' },
    gemini: { name: 'Gemini 💎', desc: 'Smart' },
    openai: { name: 'GPT-4o 🧠', desc: 'Creative' },
    nano: { name: 'Nano 🍌', desc: 'Ultra Fast' }
  }

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
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          model: currentModel 
        })
      })
      
      if (!res.ok) throw new Error('API Failed')
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        model: data.model 
      }])
    } catch (err) {
      toast.error('Something went wrong. Check API keys.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    'Write a professional resume for software engineer',
    'Create SEO blog on AI in 2030',
    'Explain quantum computing in simple words',
    'Write a formal email to HR'
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="text-pink-500" size={28} />
            <h1 className="text-xl md:text-2xl font-bold gradient-text">Tekro AI 2030</h1>
          </div>
          <select 
            value={currentModel} 
            onChange={(e) => setCurrentModel(e.target.value)}
            className="bg-slate-800/50 rounded-lg px-3 py-2 text-sm outline-none"
          >
            {Object.entries(models).map(([key, val]) => (
              <option key={key} value={key}>{val.name} - {val.desc}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto px-4 py-4 w-full">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <Sparkles className="mx-auto mb-4 text-pink-500" size={48} />
            <h2 className="text-2xl font-bold gradient-text mb-2">Tekro AI Assistant</h2>
            <p className="text-slate-400 mb-6">Resume, Blog, Code, Email - Sab kuch ek jagah</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {quickPrompts.map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="glass-card px-4 py-3 rounded-xl text-sm text-left hover:border-pink-500/50 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 ${msg.role === 'user'? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'}`}
          >
            <div className={`glass-card rounded-2xl p-4 ${msg.role === 'user'? 'bg-gradient-to-r from-pink-600/20 to-blue-600/20' : ''}`}>
              {msg.model && (
                <div className="text-xs text-slate-500 mb-2 uppercase">
                  {models[msg.model]?.name || msg.model}
                </div>
              )}
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                {msg.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        ))}
        
        {loading && (
          <div className="glass-card rounded-2xl p-4 mr-auto max-w-[70%]">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <span className="text-sm text-slate-400 ml-2">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 glass-card border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' &&!e.shiftKey && sendMessage()}
            placeholder="Ask for resume, blog, code, email... anything!"
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
