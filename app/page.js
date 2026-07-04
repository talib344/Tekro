
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('AI Chat 2x')
  const [loading, setLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [chatHistory, setChatHistory] = useState([])
  const [copySuccess, setCopySuccess] = useState('')
  const messagesEndRef = useRef(null)

  const FREE_LIMIT = 5

  const modes = [
    { name: 'AI Chat 2x', icon: '🤖', color: 'from-cyan-500 to-blue-500', premium: false, desc: '2x faster responses' },
    { name: 'Code Gen', icon: '💻', color: 'from-purple-500 to-pink-500', premium: false, desc: 'Generate code instantly' },
    { name: 'Debug Code', icon: '🐛', color: 'from-green-500 to-emerald-500', premium: true, desc: 'Fix bugs with AI' },
    { name: 'Web Search', icon: '🌐', color: 'from-orange-500 to-red-500', premium: true, desc: 'Real-time web data' },
    { name: 'PDF Analyze', icon: '📄', color: 'from-yellow-500 to-amber-500', premium: true, desc: 'Extract PDF insights' },
    { name: 'Image AI', icon: '🎨', color: 'from-indigo-500 to-violet-500', premium: true, desc: 'Generate & analyze images' }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      features: ['50 Messages/day', 'Code Gen + AI Chat', 'Email Support', 'No Ads', 'Export Chats'],
      color: 'from-blue-600 to-cyan-600'
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      features: ['Unlimited Messages', 'All 6 AI Modes', 'Priority Support', 'API Access', 'Custom Themes', 'Chat History', 'Voice Input'],
      color: 'from-purple-600 to-pink-600',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      features: ['Everything in Pro', 'Dedicated Server', '24/7 Support', 'White Label', 'Team Seats', 'Custom Models', 'SLA Guarantee'],
      color: 'from-orange-600 to-red-600'
    }
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const savedPremium = localStorage.getItem('tekro_premium')
    const savedUsage = localStorage.getItem('tekro_usage')
    const savedTheme = localStorage.getItem('tekro_theme')
    if (savedPremium === 'true') setIsPremium(true)
    if (savedUsage) setUsageCount(parseInt(savedUsage))
    if (savedTheme) setTheme(savedTheme)
  }, [])

  const handleModeSelect = (selectedMode) => {
    const modeData = modes.find(m => m.name === selectedMode)
    if (modeData.premium &&!isPremium) {
      setShowUpgrade(true)
      return
    }
    setMode(selectedMode)
    setSidebarOpen(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    if (!isPremium && usageCount >= FREE_LIMIT) {
      setShowUpgrade(true)
      return
    }

    const userMsg = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
      mode: mode
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    if (!isPremium) {
      const newCount = usageCount + 1
      setUsageCount(newCount)
      localStorage.setItem('tekro_usage', newCount.toString())
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, mode, isPremium })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString(),
        mode: mode
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error! Check API key in Vercel Environment Variables.',
        timestamp: new Date().toLocaleTimeString(),
        mode: mode
      }])
    }
    setLoading(false)
  }

  const handleUpgrade = (plan) => {
    alert(`Redirecting to Stripe payment for ${plan.name} - ${plan.price}${plan.period}\n\nAfter payment, you'll get unlimited access!`)
    setIsPremium(true)
    localStorage.setItem('tekro_premium', 'true')
    setShowUpgrade(false)
  }

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([])
      setUsageCount(0)
      localStorage.setItem('tekro_usage', '0')
    }
  }

  const exportChat = () => {
    const chatText = messages.map(m => `[${m.timestamp}] ${m.role} (${m.mode}):\n${m.content}\n`).join('\n')
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tekro-chat-${Date.now()}.txt`
    a.click()
    setCopySuccess('Downloaded!')
    setTimeout(() => setCopySuccess(''), 2000)
  }

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text)
    setCopySuccess('Copied!')
    setTimeout(() => setCopySuccess(''), 2000)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark'? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('tekro_theme', newTheme)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Tekro-AI 2030
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">2x Faster | 10x Better | By Talib Ali 🇵🇰</p>
            </div>
            {isPremium && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-xs font-bold animate-pulse">
                ✨ PRO
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {copySuccess && (
              <span className="text-xs text-green-400 animate-fadeIn">{copySuccess}</span>
            )}
            {!isPremium && (
              <div className="hidden md:block px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-slate-400">
                  <span className="font-bold text-cyan-400">{FREE_LIMIT - usageCount}</span> / {FREE_LIMIT} Free
                </p>
              </div>
            )}
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
            >
              {isPremium? 'Manage Plan' : 'Upgrade Pro'}
            </button>
          </div>
        </div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`${sidebarOpen? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 space-y-4 sticky top-24">
              <div className="text-center pb-4 border-b border-white/10">
                <div className="text-4xl mb-2">🚀</div>
                <p className="text-sm font-semibold text-slate-300">Tekro-AI 2030</p>
                <p className="text-xs text-slate-500 mt-1">Next-Gen AI Assistant</p>
              </div>

              <div className="space-y-2">
                <button onClick={clearChat} className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 hover:scale-105">
                  <span>🗑️</span> Clear Chat
                </button>
                <button onClick={exportChat} className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 hover:scale-105">
                  <span>📥</span> Export Chat
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-slate-500 mb-3 font-semibold">SELECT AI MODE</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {modes.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => handleModeSelect(m.name)}
                      className={`w-full p-3 rounded-xl border transition-all duration-300 text-left hover:scale-105 ${
                        mode === m.name
                     ? `bg-gradient-to-br ${m.color} border-transparent shadow-lg`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{m.icon}</span>
                          <span className="text-sm font-semibold">{m.name}</span>
                        </div>
                        {m.premium &&!isPremium && <span className="text-xs">🔒</span>}
                      </div>
                      <p className="text-xs opacity-70">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {!isPremium && (
                <div className="pt-4 border-t border-white/10">
                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-sm font-bold mb-2 flex items-center gap-2">
                      <span>⚡</span> Upgrade to Pro
                    </p>
                    <p className="text-xs text-slate-400 mb-3">Unlock all modes + Unlimited messages + Priority support</p>
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                    >
                      View Plans - $9/mo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="h-[calc(100vh-280px)] md:h-[600px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-slate-500 mt-20">
                    <div className="text-6xl mb-4 animate-bounce">🤖</div>
                    <p className="text-lg font-semibold mb-2">{mode} Mode Active</p>
                    <p className="text-sm mb-4">Ask anything to get started...</p>
                    {!isPremium && (
                      <div className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                        <p className="text-xs text-amber-400">
                          Free Plan: <span className="font-bold">{FREE_LIMIT - usageCount}</span> messages left today
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user'? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`max-w-[85%] md:max-w-[75%] group`}>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'user'
                     ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white'
                        : 'bg-white/10 border border-white/20'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs opacity-70 font-medium">
                            {msg.role === 'user'? 'You' : 'Tekro-AI'} • {msg.mode}
                          </span>
                          <button
                            onClick={() => copyMessage(msg.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:text-cyan-400"
                          >
                            📋
                          </button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <p className="text-xs opacity-50 mt-2">{msg.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs text-slate-400">Tekro is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-black/20 border-t border-white/10">
                <div className="flex gap-2 mb-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' &&!e.shiftKey && sendMessage()}
                    placeholder={isPremium? `Message Tekro-AI (${mode})...` : `Message Tekro-AI... (${FREE_LIMIT - usageCount} left)`}
                    disabled={!isPremium && usageCount >= FREE_LIMIT}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading ||!input.trim() || (!isPremium && usageCount >= FREE_LIMIT)}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-105"
                  >
                    {loading? '...' : 'Send'}
                  </button>
                </div>
                {!isPremium && usageCount >= FREE_LIMIT && (
                  <p className="text-xs text-amber-500 text-center">
                    Daily limit reached. <button onClick={() => setShowUpgrade(true)} className="underline font-semibold hover:text-amber-400">Upgrade to Pro</button> for unlimited access
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-6xl w-full max-h- overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Upgrade to Tekro Pro
                  </h2>
                  <p className="text-slate-400">Unlock unlimited power with premium features</p>
                </div>
                <button onClick={() => setShowUpgrade(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {pricingPlans.map((plan) => (
                  <div key={plan.name} className={`relative bg-white/5 border rounded-2xl p-6 transition-all hover:scale-105 ${plan.popular? 'border-purple-500 shadow-lg shadow-purple-500/50' : 'border-white/10'}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-black">{plan.price}</span>
                        <span className="text-slate-400">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(plan)}
                      className={`w-full py-3 bg-gradient-to-r ${plan.color} rounded-xl font-semibold hover:shadow-lg transition-all`}
                    >
                      Choose {plan.name}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="font-bold mb-4 text-center">Why Upgrade?</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🚀</div>
                    <p className="font-semibold mb-1">Unlimited Usage</p>
                    <p className="text-xs text-slate-400">No daily limits. Chat as much as you want</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <p className="font-semibold mb-1">All AI Modes</p>
                    <p className="text-xs text-slate-400">Access Web Search, PDF, Image AI & more</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">💎</div>
                    <p className="font-semibold mb-1">Priority Support</p>
                    <p className="text-xs text-slate-400">Get help within 1 hour, 24/7</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 mt-6">
                <p>🔒 Secure payment via Stripe • Cancel anytime • 7-day money back guarantee</p>
                <p className="mt-2">Questions? Email: support@tekro-ai.com</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
     .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
                          <p className="text-xs text-slate-400">All 6 AI Modes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1">⚡</div>
                    <p className="font-semibold text-sm">Priority</p>
                    <p className="text-xs text-slate-400">Fast Response</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1">💾</div>
                    <p className="font-semibold text-sm">Export</p>
                    <p className="text-xs text-slate-400">Save Chats</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 mt-6">
                <p>🔒 Pro features coming soon</p>
                <p className="mt-2">Questions? Email: support@tekro-ai.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
    
