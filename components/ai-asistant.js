'use client'
import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AIAssistant({ onToolSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const detectIntent = (text) => {
    const t = text.toLowerCase()
    if (t.includes('resume') || t.includes('cv')) return 'Resume Builder'
    if (t.includes('blog') || t.includes('article')) return 'Blog Writer'
    if (t.includes('code') || t.includes('explain')) return 'Code Explainer'
    if (t.includes('pdf') || t.includes('summarize')) return 'PDF Summarizer'
    if (t.includes('translate')) return 'Translator'
    if (t.includes('email')) return 'Email Writer'
    return 'Chat'
  }

  const handleSubmit = () => {
    const tool = detectIntent(query)
    onToolSelect(tool, query)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 btn-glow p-4 rounded-full shadow-2xl"
      >
        <Sparkles size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 z-50 glass-card rounded-2xl p-4 w-80 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold gradient-text">AI Assistant</h3>
              <button onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Create resume, write blog, explain code..."
              className="w-full bg-slate-800/50 rounded-xl px-3 py-2 text-sm outline-none mb-2"
              autoFocus
            />
            <button onClick={handleSubmit} className="w-full btn-glow py-2 rounded-xl text-sm">
              Execute
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
