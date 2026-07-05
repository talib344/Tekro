'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Menu, Mic, Square, Copy, Download, Upload, StopCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useChatStore } from '@/store/chat-store'
import { motion } from 'framer-motion'

export default function Home() {
  const { messages, addMessage, updateLastMessage, clearMessages } = useChatStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [fileContent, setFileContent] = useState('')
  const recognitionRef = useRef(null)
  const fileRef = useRef(null)
  const controllerRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
        setInput(transcript)
      }
    }
  }, [])

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      recognitionRef.current?.start()
      setListening(true)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.type.includes('image')) {
      const Tesseract = (await import('tesseract.js')).default
      const { data: { text } } = await Tesseract.recognize(file, 'eng+hin+urd')
      setFileContent(`[Image Text]: ${text}`)
    } else if (file.type === 'application/pdf') {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
      const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(' ')
      }
      setFileContent(`[PDF]: ${text.substring(0, 3000)}`)
    } else {
      const text = await file.text()
      setFileContent(`[File]: ${text.substring(0, 3000)}`)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() &&!fileContent || loading) return
    setLoading(true)
    controllerRef.current = new AbortController()
    
    const fullInput = fileContent? `${fileContent}\n\nUser: ${input}` : input
    addMessage({ role: 'user', content: input || 'File uploaded' })
    setInput('')
    setFileContent('')

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, { role: 'user', content: fullInput }] }),
      signal: controllerRef.current.signal
    })

    addMessage({ role: 'assistant', content: '' })
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let aiResponse = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      aiResponse += decoder.decode(value)
      updateLastMessage(aiResponse)
    }
    setLoading(false)
  }

  const stopGenerating = () => {
    controllerRef.current?.abort()
    setLoading(false)
  }

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      <div className="relative max-w-5xl mx-auto p-4 pb-24">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">Tekro AI 2030</h1>
            <div className="flex gap-2">
              <Link href="/settings" className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50">Settings</Link>
              <Link href="/tools" className="px-4 py-2 rounded-xl btn-glow flex items-center gap-2">
                <Menu size={18} /> Tools
              </Link>
            </div>
          </div>
        </motion.header>

        <div className="glass-card rounded-2xl p-6 mb-4 h-[calc(100vh-280px)] overflow-y-auto">
          {messages.length === 0? (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Sparkles className="mx-auto mb-4 floating" size={48} />
                <p className="text-lg">Chat with Voice, Files, 40+ Tools</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 group ${msg.role === 'user'? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-block p-4 rounded-2xl max-w-[80%] ${msg.role === 'user'? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-800/50 border border-slate-700'}`}>
                  <ReactMarkdown className="prose prose-invert max-w-none">{msg.content}</ReactMarkdown>
                  {msg.role === 'assistant' && (
                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50"><Copy size={14} /></button>
                      <button onClick={() => speak(msg.content)} className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50">🔊</button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="fixed bottom-4 left-4 right-4 max-w-5xl mx-auto">
          <div className="glass-card rounded-2xl p-4">
            {fileContent && <div className="text-xs text-green-400 mb-2">File ready: {fileContent.substring(0,50)}...</div>}
            <div className="flex gap-2">
              <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.png,.jpg" />
              <button onClick={() => fileRef.current?.click()} className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50"><Upload size={20} /></button>
              <button onClick={toggleListening} className={`p-3 rounded-xl ${listening? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800/50'}`}>
                {listening? <Square size={20} /> : <Mic size={20} />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything, upload file, or use mic..."
                className="flex-1 bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-purple-500/50"
              />
              {loading? (
                <button onClick={stopGenerating} className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400"><StopCircle size={20} /></button>
              ) : (
                <button onClick={sendMessage} disabled={!input.trim() &&!fileContent} className="px-6 py-3 rounded-xl btn-glow disabled:opacity-50"><Send size={20} /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
