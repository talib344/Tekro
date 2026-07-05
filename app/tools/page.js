'use client'
import { motion } from 'framer-motion'
import { PenTool, Code, FileText, Image, Languages, Calculator, Mail, BookOpen, FileCode, Bug, Sparkles, Newspaper } from 'lucide-react'
import Link from 'next/link'

const tools = [
  { name: 'Blog Writer', icon: PenTool, desc: 'SEO blogs with keywords', category: 'Writing', path: '/tools/blog' },
  { name: 'Email Writer', icon: Mail, desc: 'Professional emails', category: 'Writing', path: '/tools/email' },
  { name: 'Article Writer', icon: Newspaper, desc: 'Long form articles', category: 'Writing', path: '/tools/article' },
  { name: 'Story Writer', icon: BookOpen, desc: 'Creative stories', category: 'Writing', path: '/tools/story' },
  { name: 'YouTube Script', icon: FileText, desc: 'Viral video scripts', category: 'Writing', path: '/tools/youtube' },
  { name: 'LinkedIn Post', icon: FileText, desc: 'Professional posts', category: 'Writing', path: '/tools/linkedin' },
  { name: 'Python Coder', icon: Code, desc: 'Python code generator', category: 'Coding', path: '/tools/python' },
  { name: 'React Coder', icon: Code, desc: 'React/Next.js code', category: 'Coding', path: '/tools/react' },
  { name: 'Code Debugger', icon: Bug, desc: 'Fix bugs instantly', category: 'Coding', path: '/tools/debug' },
  { name: 'Code Explainer', icon: FileCode, desc: 'Explain any code', category: 'Coding', path: '/tools/explain' },
  { name: 'SQL Generator', icon: FileCode, desc: 'Database queries', category: 'Coding', path: '/tools/sql' },
  { name: 'Regex Builder', icon: FileCode, desc: 'Complex regex', category: 'Coding', path: '/tools/regex' },
  { name: 'PDF Summarizer', icon: FileText, desc: 'Extract key points', category: 'PDF', path: '/tools/pdf' },
  { name: 'PDF Q&A', icon: FileText, desc: 'Ask questions from PDF', category: 'PDF', path: '/tools/pdf-qa' },
  { name: 'Image Caption', icon: Image, desc: 'AI image description', category: 'Image', path: '/tools/caption' },
  { name: 'OCR Reader', icon: Image, desc: 'Extract text from image', category: 'Image', path: '/tools/ocr' },
  { name: 'Translator', icon: Languages, desc: '100+ languages', category: 'Utility', path: '/tools/translate' },
  { name: 'Grammar Fixer', icon: Sparkles, desc: 'Fix grammar mistakes', category: 'Utility', path: '/tools/grammar' },
  { name: 'Rewriter', icon: Sparkles, desc: 'Rewrite any text', category: 'Utility', path: '/tools/rewrite' },
  { name: 'Summarizer', icon: Sparkles, desc: 'Summarize text', category: 'Utility', path: '/tools/summary' },
  { name: 'Math Solver', icon: Calculator, desc: 'Step by step solve', category: 'Utility', path: '/tools/math' },
  { name: 'JSON Formatter', icon: FileCode, desc: 'Format JSON data', category: 'Utility', path: '/tools/json' },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10 animate-gradient" style={{backgroundSize: '200% 200%'}} />

      <div className="relative max-w-7xl mx-auto">
        <header className="glass rounded-2xl p-6 mb-6 neon-glow">
          <Link href="/" className="text-slate-400 text-sm mb-2 block hover:text-neon-blue">← Back to Chat</Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            AI Tools
          </h1>
          <p className="text-slate-400 mt-2">22+ Premium AI tools powered by Groq</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-2xl p-6 hover:neon-glow transition-all cursor-pointer group"
            >
              <tool.icon className="text-neon-blue mb-3 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-lg font-semibold mb-1">{tool.name}</h3>
              <p className="text-sm text-slate-400 mb-3">{tool.desc}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-neon-blue/20 text-neon-blue">
                {tool.category}
              </span>
              <Link href={tool.path} className="block mt-4 text-sm text-neon-blue hover:underline">
                Open Tool →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
