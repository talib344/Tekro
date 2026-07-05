'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot, Upload, Mic, MicOff, Download, Image, Video, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentModel, setCurrentModel] = useState('nano')
  const [isListening, setIsListening] = useState(false)
  const [voiceGender, setVoiceGender] = useState('female')
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const models = {
    nano: { name: 'Nano 🍌', desc: 'Ultra Fast' },
    groq: { name: 'Groq ⚡', desc: 'Fast' },
    gemini: { name: 'Gemini 💎', desc: 'Smart' },
    openai: { name: 'GPT-4o 🧠', desc: 'Creative' }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 1. VOICE INPUT - MIC
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice not supported in this browser')
      return
    }
    const recognition = new webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (e) => setInput(e.results[0][0].transcript)
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  // 2. VOICE OUTPUT - SPEAK
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = speechSynthesis.getVoices()
    utterance.voice = voices.find(v => 
      voiceGender === 'male'? v.name.includes('Male') : v.name.includes('Female')
    ) || voices[0]
    speechSynthesis.speak(utterance)
  }

  // 3. FILE UPLOAD - PHOTO/VIDEO
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: `Uploaded ${file.type.startsWith('image')? 'photo' : 'video'}`,
        image: file.type.startsWith('image')? base64 : null
      }])
      
      setLoading(true)
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [{ role: 'user', content: 'Analyze and edit this file. Suggest improvements.' }],
            model: currentModel,
            image: base64,
            fileType: file.type
          })
        })
        const data = await res.json()
        const aiMsg = { role: 'assistant', content: data.message, model: data.model }
        setMessages(prev => [...prev, aiMsg])
        speak(data.message) // Auto speak reply
      } catch (err) {
        toast.error('Upload failed')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
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
        body: JSON.stringify({ messages: [...messages, userMsg], model: currentModel })
      })
      const data = await res.json()
      const aiMsg = { role: 'assistant', content: data.message, model: data.model, image: data.image }
      setMessages(prev => [...prev, aiMsg])
      speak(data.message) // Auto speak
    } catch (err) {
      toast.error('API Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bot className="text-pink-500" size={28} />
            <h1 className="text-xl md:text-2xl font-bold gradient-text">Tekro AI 2030</h1>
          </div>
          <div className="flex gap-2">
            <select 
              value={voiceGender} 
              onChange={(e) => setVoiceGender(e.target.value)}
              className="bg-slate-800/50 rounded-lg px-2 py-2 text-xs outline-none"
            >
              <option value="female">Female Voice</option>
              <option value="male">Male Voice</option>
            </select>
            <select 
              value={currentModel} 
              onChange={(e) => setCurrentModel(e.target.value)}
              className="bg-slate-800/50 rounded-lg px-2 py-2 text-xs outline-none"
            >
              {Object.entries(models).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto px-4 py-4 w-full">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <Sparkles className="mx-auto mb-4 text-pink-500" size={48} />
            <h2 className="text-2xl font-bold gradient-text mb-2">Tekro AI Assistant</h2>
            <p className="text-slate-400 mb-6">Upload photo/video, use voice, auto edit with AI</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`mb-4 ${msg.role === 'user'? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'}`}>
            <div className={`glass-card rounded-2xl p-4 ${msg.role === 'user'? 'bg-gradient-to-r from-pink-600/20 to-blue-600/20' : ''}`}>
              {msg.image && <img src={msg.image} alt="uploaded" className="rounded-lg mb-2 max-h-60" />}
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{msg.content}</ReactMarkdown>
              {msg.role === 'assistant' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => speak(msg.content)} className="text-xs bg-slate-700 px-2 py-1 rounded flex items-center gap-1">
                    <Volume2 size={12} /> Speak
                  </button>
                  {msg.image && (
                    <a href={msg.image} download="tekro-ai-generated.png" className="text-xs bg-slate-700 px-2 py-1 rounded flex items-center gap-1">
                      <Download size={12} /> Download
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {loading && (
          <div className="glass-card rounded-2xl p-4 mr-auto max-w-[70%]">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 glass-card border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800/50 p-3 rounded-xl">
            <Upload size={20} />
          </button>
          <button onClick={startListening} className={`p-3 rounded-xl ${isListening? 'bg-red-500' : 'bg-slate-800/50'}`}>
            {isListening? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' &&!e.shiftKey && sendMessage()}
            placeholder="Type, speak, or upload photo/video..."
            className="flex-1 bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-pink-500/50"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading ||!input.trim()} className="btn-glow px-6 py-3 rounded-xl disabled:opacity-50">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
