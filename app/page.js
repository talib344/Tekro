'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Upload, Mic, MicOff, Download, Volume2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentModel, setCurrentModel] = useState('nano')
  const [language, setLanguage] = useState('English')
  const [isListening, setIsListening] = useState(false)
  const [voiceGender, setVoiceGender] = useState('female')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const models = {
    nano: { name: 'Nano 🍌', desc: 'Ultra Fast' },
    groq: { name: 'Groq ⚡', desc: 'Fast' },
    gemini: { name: 'Gemini 💎', desc: 'Smart' },
    openai: { name: 'GPT-4o 🧠', desc: 'Creative' }
  }

  const languages = ['English', 'Urdu', 'Hindi', 'Arabic', 'Spanish', 'French', 'German', 'Chinese']

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return toast.error('Voice not supported')
    const recognition = new webkitSpeechRecognition()
    recognition.lang = language === 'Urdu'? 'ur-PK' : language === 'Hindi'? 'hi-IN' : 'en-US'
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (e) => setInput(e.results[0][0].transcript)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = speechSynthesis.getVoices()
    utterance.voice = voices.find(v => voiceGender === 'male'? v.name.includes('Male') : v.name.includes('Female')) || voices[0]
    utterance.lang = language === 'Urdu'? 'ur-PK' : language === 'Hindi'? 'hi-IN' : 'en-US'
    speechSynthesis.speak(utterance)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024) return toast.error('Max 10MB allowed')
    
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = () => setFilePreview(reader.result)
    reader.readAsDataURL(file)
    toast.success('File selected. Now write your prompt and send.')
  }

  const removeFile = () => {
    setUploadedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendMessage = async () => {
    if (!input.trim() &&!uploadedFile) return
    
    const userMsg = { 
      role: 'user', 
      content: input || 'Analyze this file',
      image: filePreview 
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: input }], 
          model: currentModel,
          language: language,
          image: filePreview,
          fileType: uploadedFile?.type
        })
      })
      const data = await res.json()
      const aiMsg = { role: 'assistant', content: data.message, model: data.model, image: data.image }
      setMessages(prev => [...prev, aiMsg])
      speak(data.message)
      removeFile()
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
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Bot className="text-pink-500" size={28} />
              <h1 className="text-xl md:text-2xl font-bold gradient-text">Tekro AI 2030</h1>
            </div>
            <div className="flex gap-1 md:gap-2">
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-800/50 rounded-lg px-2 py-2 text-xs outline-none">
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
              <select value={voiceGender} onChange={(e) => setVoiceGender(e.target.value)}
                className="bg-slate-800/50 rounded-lg px-2 py-2 text-xs outline-none">
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <select value={currentModel} onChange={(e) => setCurrentModel(e.target.value)}
                className="bg-slate-800/50 rounded-lg px-2 py-2 text-xs outline-none">
                {Object.entries(models).map(([key, val]) => <option key={key} value={key}>{val.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto px-4 py-4 w-full">
        {messages.length === 0 && (
          <div className="text-center mt-10">
            <h2 className="text-2xl font-bold gradient-text mb-2">Tekro AI 2030</h2>
            <p className="text-slate-400 mb-6">Enhanced AI with Photo/Video Editing, Voice, Multi-Language</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`mb-4 ${msg.role === 'user'? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'}`}>
            <div className={`glass-card rounded-2xl p-4 ${msg.role === 'user'? 'bg-gradient-to-r from-pink-600/20 to-blue-600/20' : ''}`}>
              {msg.image && <img src={msg.image} alt="uploaded" className="rounded-lg mb-2 max-h-60 w-full object-cover" />}
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{msg.content}</ReactMarkdown>
              {msg.role === 'assistant' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => speak(msg.content)} className="text-xs bg-slate-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-600">
                    <Volume2 size={12} /> Speak
                  </button>
                  {msg.image && (
                    <a href={msg.image} download="tekro-ai-generated.png" className="text-xs bg-slate-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-600">
                      <Download size={12} /> Download
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {filePreview && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} 
            className="max-w-4xl mx-auto px-4 w-full">
            <div className="glass-card rounded-xl p-3 mb-2 flex items-center gap-3">
              <img src={filePreview} alt="preview" className="h-16 w-16 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="text-sm text-slate-300">{uploadedFile?.name}</p>
                <p className="text-xs text-slate-500">Write your prompt below and send</p>
              </div>
              <button onClick={removeFile} className="p-2 hover:bg-slate-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky bottom-0 glass-card border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-2">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800/50 p-3 rounded-xl hover:bg-slate-700">
              <Upload size={20} />
            </button>
            <button onClick={startListening} className={`p-3 rounded-xl ${isListening? 'bg-red-500 animate-pulse' : 'bg-slate-800/50 hover:bg-slate-700'}`}>
              {isListening? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' &&!e.shiftKey && sendMessage()}
              placeholder={filePreview? 'Describe what to do with this file...' : `Ask in ${language}...`}
              className="flex-1 bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-pink-500/50"
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading ||(!input.trim() &&!uploadedFile)} 
              className="btn-glow px-6 py-3 rounded-xl disabled:opacity-50">
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-600">
            © 2026 Tekro AI 2030. Enhanced Technology. All Rights Reserved. Designed by T Company
          </p>
        </div>
      </div>
    </div>
  )
}
