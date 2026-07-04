'use client'
import { useState, useRef } from 'react'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const categories = ['All', 'AI Chat', 'Image', 'Video', 'Audio']

  const tools = [
    {
      id: 1,
      name: 'AI Chat 2030',
      category: 'AI Chat',
      desc: 'Groq Llama 3.1 70B. Voice input/output. Ultra fast',
      icon: '💬',
      rating: 5.0,
      users: 'Live',
      action: 'openChat'
    },
    {
      id: 2,
      name: 'Image Generator',
      category: 'Image',
      desc: 'AI image generation. Text to image HD quality',
      icon: '🎨',
      rating: 4.9,
      users: 'Live',
      action: 'openImage'
    },
    {
      id: 3,
      name: 'Voice AI Studio',
      category: 'Audio',
      desc: 'Voice to text. Text to real voice. 50+ languages',
      icon: '🎙️',
      rating: 4.9,
      users: 'Live',
      action: 'startVoice'
    },
    {
      id: 4,
      name: 'Video Editor AI',
      category: 'Video',
      desc: 'AI video editing. Auto-captions, cut, 4K export',
      icon: '🎬',
      rating: 4.8,
      users: 'Live',
      action: 'openVideo'
    }
  ]

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sendToGroq = async (message) => {
    setIsLoading(true)
    const newMessages = [...chatMessages, { role: 'user', content: message }]
    setChatMessages(newMessages)
    setUserInput('')

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are Tekro AI 2030. Give short, helpful answers.'
          },
        ...newMessages
        ],
        model: 'llama-3.1-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      })

      const aiResponse = chatCompletion.choices[0]?.message?.content || 'Error occurred'
      setChatMessages([...newMessages, { role: 'assistant', content: aiResponse }])
      speakText(aiResponse)
    } catch (error) {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Groq API Error. Add API key in Vercel.' }])
    }
    setIsLoading(false)
  }

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice not supported')
      return
    }
    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setUserInput(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleToolClick = (action) => {
    if (action === 'openChat') setChatOpen(true)
    if (action === 'startVoice') startVoiceInput()
    if (action === 'openImage') alert('Image Generator: Coming soon')
    if (action === 'openVideo') alert('Video Editor: Coming soon')
      }  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-cyan-500/10 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  T
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Tekro AI 2030
                  </h1>
                  <p className="text-xs text-slate-400">Powered by Groq</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search AI tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-slate-800/50 border border-cyan-500/20 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition"
                />
                <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setChatOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition"
            >
              AI Chat
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <aside className={`${sidebarOpen? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 h-[calc(100vh-65px)] w-72 bg-slate-900/50 backdrop-blur-xl border-r border-cyan-500/20 p-4 overflow-y-auto transition-transform z-40`}>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Categories</h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat)
                      setSidebarOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition ${
                      activeCategory === cat
                       ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Groq Powered</h3>
              <div className="bg-slate-800/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-cyan-400">Llama 3.1</p>
                <p className="text-xs text-slate-400">70B Model Active</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Tekro AI 2030 + Groq
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Fastest AI inference. Voice input/output. Chat working now
            </p>
            <button
              onClick={() => setChatOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition"
            >
              Start AI Chat Now
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {activeCategory === 'All'? 'All Tools' : activeCategory}
                <span className="text-slate-400 text-lg ml-2">({filteredTools.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {filteredTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.action)}
                  className="group text-left bg-slate-800/30 backdrop-blur border border-cyan-500/10 rounded-2xl p-6 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/10 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{tool.icon}</div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-sm font-semibold">{tool.rating}</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition">
                    {tool.name}
                  </h4>
                  <p className="text-slate-400 text-sm mb-4">
                    {tool.desc}
                  </p>
                  <span className="text-xs px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                    {tool.users}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {chatOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col">
            <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-cyan-400">AI Chat - Groq Llama 3.1</h3>
              <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <p className="text-slate-400 text-center">Start chatting. Try voice input!</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user'? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user'? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-slate-800/50'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && <p className="text-cyan-400 text-sm">AI is thinking...</p>}
            </div>

            <div className="p-4 border-t border-cyan-500/20">
              <div className="flex gap-2">
                <button
                  onClick={startVoiceInput}
                  className={`p-3 rounded-xl ${isListening? 'bg-red-500 animate-pulse' : 'bg-slate-800'} hover:bg-slate-700 transition`}
                >
                  🎙️
                </button>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && userInput && sendToGroq(userInput)}
                  placeholder="Type or use voice..."
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={() => userInput && sendToGroq(userInput)}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" />
      )}
    </div>
  )
        }


  
