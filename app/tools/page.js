'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const tools = [
  { name: 'Blog Writer', icon: '📝', desc: 'SEO Blog Posts' },
  { name: 'Email Writer', icon: '📧', desc: 'Professional Emails' },
  { name: 'Code Helper', icon: '💻', desc: 'Debug & Generate Code' },
  { name: 'YouTube Script', icon: '🎬', desc: 'Viral Video Scripts' },
  { name: 'Instagram Captions', icon: '📱', desc: 'Engaging Captions' },
  { name: 'Resume Builder', icon: '📄', desc: 'ATS Friendly Resume' },
  // Add 34 more tools here
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-xl bg-slate-800/50"><ArrowLeft size={20} /></Link>
            <h1 className="text-2xl font-bold gradient-text">40+ AI Tools</h1>
          </div>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6 hover:shadow-purple-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="font-bold mb-1">{tool.name}</h3>
              <p className="text-sm text-slate-400">{tool.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
