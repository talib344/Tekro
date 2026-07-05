'use client'
import { useState, useEffect, useRef } from 'react'
import { FaImage, FaMagic, FaDownload, FaMicrophone, FaVolumeUp, FaCog, FaHistory, FaRocket, FaGem, FaBolt, FaTrash, FaCopy, FaShare, FaStop } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [image, setImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [style, setStyle] = useState('photorealistic')
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('generate')
  const [stats, setStats] = useState({ generated: 0, upscaled: 0, time: 0, tokens: 0 })
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)

  useEffect(() => {
    if (typeof window!== 'undefined') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
          toast.success('🎤 Listening... Speak now')
        }

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setPrompt(prev => prev + ' ' + transcript)
          toast.success('✅ Voice captured: ' + transcript.substring(0, 50))
          setIsListening(false)
        }

        recognition.onerror = (event) => {
          toast.error('Voice Error: ' + event.error)
          setIsListening(false)
        }

        recognition.onend = () => setIsListening(false)
        recognitionRef.current = recognition
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis
      }
    }
  }, [])

  useEffect(() => {
    const savedHistory = localStorage.getItem('tekro-history')
    const savedStats = localStorage.getItem('tekro-stats')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedStats) setStats(JSON.parse(savedStats))
  }, [])

  useEffect(() => {
    localStorage.setItem('tekro-history', JSON.stringify(history))
    localStorage.setItem('tekro-stats', JSON.stringify(stats))
  }, [history, stats])

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice not supported. Use Chrome/Edge')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const speakText = (text) => {
    if (!synthRef.current) {
      toast.error('TTS not supported')
      return
    }

    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      toast.error('Speech failed')
      setIsSpeaking(false)
    }
    synthRef.current.speak(utterance)
    toast.success('🔊 Speaking...')
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      toast.success('🔇 Stopped')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024) {
      toast.error('❌ Image too large. Max 10MB allowed')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('❌ Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result)
      setImagePreview(reader.result)
      toast.success('✅ Image uploaded: ' + file.name + ' (' + (file.size/1024).toFixed(1) + 'KB)')
    }
    reader.onerror = () => toast.error('Failed to read image')
    reader.readAsDataURL(file)
  }

  // FIXED: Drag & Drop Handler - Ye line theek ki hai
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      const event = { target: { files: dataTransfer.files } }
      handleImageUpload(event)
    }
  }

  const handleSubmit = async (mode = null) => {
    if (!prompt &&!uploadedImage) {
      toast.error('⚠️ Enter prompt or upload image first')
      return
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          language: 'English',
          image: uploadedImage,
          editMode: mode,
          voiceEnabled: voiceEnabled,
          style: style
        })
      })

      const data = await res.json()
      const processingTime = Date.now() - startTime

      if (data.error) {
        toast.error('❌ ' + data.message)
        setResult(data.message)
      } else {
        setResult(data.message)
        if (data.image) setImage(data.image)
        if (data.analysis) setAnalysisData(data.analysis)

        if (voiceEnabled && data.message) {
          speakText(data.message.substring(0, 500))
        }

        setStats(prev => ({
          generated: prev.generated + (data.image? 1 : 0),
          upscaled: prev.upscaled + (data.model?.includes('8k')? 1 : 0),
          time: prev.time + processingTime,
          tokens: prev.tokens + (data.tokens || 0)
        }))

        const historyItem = {
          id: Date.now(),
          prompt: prompt.substring(0, 100),
          fullPrompt: prompt,
          result: data.message.substring(0, 200),
          fullResult: data.message,
          image: data.image,
          thumbnail: data.thumbnail || data.image,
          model: data.model,
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          processingTime: processingTime
        }
        setHistory(prev => [historyItem,...prev.slice(0, 19)])

        toast.success(`✅ ${data.model} - ${processingTime}ms`)
      }
    } catch (e) {
      toast.error('❌ Network Error: ' + e.message)
      setResult('❌ Enterprise Server Error:\n\n' + e.message + '\n\nSolutions:\n1. Check API keys in Vercel\n2. Verify internet connection\n3. Try again in 30 seconds')
    }

    setLoading(false)
  }

  const downloadImage = async () => {
    if (!image) return
    try {
      const response = await fetch(image)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tekro-ai-8k-${Date.now()}.png`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('✅ Downloaded 8K Image')
    } catch (e) {
      toast.error('Download failed')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('📋 Copied to clipboard')
  }

  const shareResult = async () => {
    if (navigator.share && image) {
      try {
        await navigator.share({
          title: 'Tekro AI 2030 Enterprise',
          text: prompt,
          url: image
        })
        toast.success('Shared successfully')
      } catch (e) {
        copyToClipboard(image)
      }
    } else {
      copyToClipboard(result)
    }
  }

  const clearAll = () => {
    setPrompt('')
    setResult('')
    setImage(null)
    setUploadedImage(null)
    setImagePreview(null)
    setAnalysisData(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (synthRef.current) synthRef.current.cancel()
    toast.success('🗑️ Cleared all')
  }

  const loadFromHistory = (item) => {
    setPrompt(item.fullPrompt)
    setResult(item.fullResult)
    setImage(item.image)
    setShowHistory(false)
    toast.success('📜 Loaded from history')
  }

  const styleOptions = [
    { value: 'photorealistic', label: '📸 Photorealistic', desc: 'Ultra realistic photos' },
    { value: 'cinematic', label: '🎬 Cinematic', desc: 'Movie-style dramatic' },
    { value: 'anime', label: '🎨 Anime', desc: 'Studio Ghibli style' },
    { value: 'art', label: '🖼️ Digital Art', desc: 'Artstation masterpiece' }
  ]

  return (
    <main className="min-h-screen bg-[#030712] text-white" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <Toaster position="top-center" />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-strong sticky top-0 z-50 border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <FaRocket className="text-xl" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Tekro AI 2030</h1>
              <p className="text-xs text-gray-400">ENTERPRISE EDITION</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="badge badge-pro">
              <FaGem /> COMPANY OWNER
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary p-3">
              <FaCog />
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="btn-secondary p-3 relative">
              <FaHistory />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FaImage, label: 'Generated', value: stats.generated, color: 'text-blue-400' },
            { icon: FaBolt, label: 'Upscaled 8K', value: stats.upscaled, color: 'text-purple-400' },
            { icon: FaRocket, label: 'Avg Time', value: stats.generated > 0? Math.round(stats.time / stats.generated) + 'ms' : '0ms', color: 'text-green-400' },
            { icon: FaGem, label: 'Tokens', value: stats.tokens.toLocaleString(), color: 'text-amber-400' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-premium p-4"
            >
              <stat.icon className={`text-2xl ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'generate', label: 'Generate 8K', icon: FaMagic },
              { id: 'edit', label: 'AI Edit', icon: FaImage },
              { id: 'analyze', label: 'Analyze', icon: FaBolt },
              { id: 'voice', label: 'Voice AI', icon: FaMicrophone }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <tab.icon /> {tab.label}
              </button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaMagic className="text-blue-400" />
                AI Command Center
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={startVoiceInput}
                  className={`btn-secondary p-2 ${isListening? 'voice-pulse bg-red-500' : ''}`}
                  data-tooltip="Voice Input"
                >
                  <FaMicrophone />
                </button>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`btn-secondary p-2 ${voiceEnabled? 'bg-green-600' : ''}`}
                  data-tooltip="Voice Output"
                >
                  <FaVolumeUp />
                </button>
                {isSpeaking && (
                  <button onClick={stopSpeaking} className="btn-secondary p-2 bg-red-600" data-tooltip="Stop Speaking">
                    <FaStop />
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision... e.g., 'Add AKM tattoo on wrist, 8K, photorealistic, studio lighting'"
              className="input-premium min-h-[120px] resize-none mb-4"
              disabled={loading}
            />

            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Art Style</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {styleOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStyle(opt.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      style === opt.value
                     ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-400">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Upload Image (Optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-all"
              >
                {imagePreview? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 p-2 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ) : (
                  <div>
                    <FaImage className="text-4xl text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">Click or drag image here</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSubmit()}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading? (
                  <>Generating<span className="loading-dots"></span></>
                ) : (
                  <><FaRocket /> Generate 8K</>
                )}
              </button>

              <button
                onClick={() => handleSubmit('remove-bg')}
                disabled={loading ||!uploadedImage}
                className="btn-secondary flex items-center gap-2"
              >
                <FaImage /> Remove BG 4K
              </button>

              <button
                onClick={clearAll}
                className="btn-secondary"
                data-tooltip="Clear All"
              >
                <FaTrash />
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-premium"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FaBolt className="text-amber-400" />
                    AI Response
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(result)} className="btn-secondary p-2" data-tooltip="Copy">
                      <FaCopy />
                    </button>
                    <button onClick={shareResult} className="btn-secondary p-2" data-tooltip="Share">
                      <FaShare />
                    </button>
                    {voiceEnabled && (
                      <button onClick={() => speakText(result)} className="btn-secondary p-2" data-tooltip="Speak">
                        <FaVolumeUp />
                      </button>
                    )}
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">{result}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">

          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card-premium"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FaGem className="text-purple-400" />
                    8K Result
                  </h3>
                  <div className="badge badge-pro">
                    ENTERPRISE
                  </div>
                </div>

                <div className="img-container mb-4">
                  <img src={image} alt="Generated" className="w-full rounded-xl" />
                  <div className="img-overlay">
                    <button onClick={downloadImage} className="btn-primary">
                      <FaDownload /> Download 8K
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={downloadImage} className="btn-primary flex items-center justify-center gap-2">
                    <FaDownload /> Download
                  </button>
                  <button onClick={() => copyToClipboard(image)} className="btn-secondary flex items-center justify-center gap-2">
                    <FaCopy /> Copy URL
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="card-premium">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaBolt className="text-amber-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                'Add AKM tattoo on wrist, photorealistic, 8K',
                'Create cyberpunk city, neon lights, 8K cinematic',
                'Remove background, make transparent PNG',
                'Upscale to 8K, enhance details'
              ].map((quick, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(quick)}
                  className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all text-sm"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>

          <div className="card-premium">
            <h3 className="text-lg font-bold mb-4">✨ Enterprise Features</h3>
            <div className="space-y-3 text-sm">
              {[
                'Gemini 1.5 Pro Vision Analysis',
                'Llama 3.1 70B Chat Engine',
                'Flux Pro 8K Image Generation',
                'Real-ESRGAN 8x Upscaling',
                'Voice Input/Output System',
                'Remove.bg HD Integration',
                'Unlimited Generations',
                'No Watermarks Ever',
                'Priority Processing',
                'Company Owner Mode'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="card-premium max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaCog /> Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Voice Output</span>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${voiceEnabled? 'bg-blue-500' : 'bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${voiceEnabled? 'ml-6' : 'ml-1'}`} />
                  </button>
                </div>
                <button onClick={() => setShowSettings(false)} className="btn-primary w-full">
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="card-premium max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaHistory /> Generation History
                </h2>
                <button onClick={() => { setHistory([]); toast.success('History cleared') }} className="btn-secondary">
                  <FaTrash /> Clear All
                </button>
              </div>

              {history.length === 0? (
                <p className="text-center text-gray-400 py-12">No history yet. Start generating!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map(item => (
                    <div key={item.id} className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-all" onClick={() => loadFromHistory(item)}>
                      {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />}
                      <p className="font-semibold text-sm mb-1">{item.prompt}</p>
                      <p className="text-xs text-gray-400">{item.time} • {item.model}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-12 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Tekro AI 2030 Enterprise • Powered by Gemini 1.5 Pro + Llama 70B</p>
          <p className="mt-2">Company Owner Mode: All Features Unlocked • $0 Cost • Unlimited</p>
        </div>
      </footer>
    </main>
  )
}
