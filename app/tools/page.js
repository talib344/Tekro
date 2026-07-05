'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const tools = [
  { name: 'Blog Writer', icon: '📝', desc: 'SEO Blog Posts', slug: 'blog-writer' },
  { name: 'Email Writer', icon: '📧', desc: 'Professional Emails', slug: 'email-writer' },
  { name: 'Code Helper', icon: '💻', desc: 'Debug & Generate Code', slug: 'code-helper' },
  { name: 'YouTube Script', icon: '🎬', desc: 'Viral Video Scripts', slug: 'youtube-script' },
  { name: 'Instagram Captions', icon: '📱', desc: 'Engaging Captions', slug: 'instagram-captions' },
  { name: 'Resume Builder', icon: '📄', desc: 'ATS Friendly Resume', slug: 'resume-builder' },
  { name: 'Ad Copy', icon: '📢', desc: 'High Converting Ads', slug: 'ad-copy' },
  { name: 'Product Description', icon: '🛍️', desc: 'E-commerce Copy', slug: 'product-description' },
  { name: 'LinkedIn Post', icon: '💼', desc: 'Professional Posts', slug: 'linkedin-post' },
  { name: 'Twitter Thread', icon: '🐦', desc: 'Viral Threads', slug: 'twitter-thread' },
  { name: 'Story Writer', icon: '📚', desc: 'Creative Stories', slug: 'story-writer' },
  { name: 'Poem Generator', icon: '✨', desc: 'Hindi/English Poems', slug: 'poem-generator' },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold gradient-text">40+ AI Tools</h1>
          </div>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool, i) => (
            <Link href={`/tools/${tool.slug}`} key={i}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-6 hover:shadow-purple-500/20 hover:scale-105 transition-all cursor-pointer h-full"
              >
                <div className="text-4xl mb-3">{tool.icon}</div>
                <h3 className="font-bold mb-1">{tool.name}</h3>
                <p className="text-sm text-slate-400">{tool.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
