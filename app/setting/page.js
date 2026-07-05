'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, Trash2, Download } from 'lucide-react'
import { useChatStore } from '@/store/chat-store'

export default function Settings() {
  const [theme, setTheme] = useState('dark')
  const { clearMessages, messages } = useChatStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const exportChats = () => {
    const data = JSON.stringify(messages, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tekro-chats.json'
    a.click()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <header className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-xl bg-slate-800/50"><ArrowLeft size={20} /></Link>
            <h1 className="text-2xl font-bold gradient-text">Settings</h1>
          </div>
        </header>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">Appearance</h3>
            <button onClick={() => setTheme(theme === 'dark'? 'light' : 'dark')} className="w-full p-3 rounded-xl bg-slate-800/50 flex items-center justify-between">
              <span>Theme</span>
              {theme === 'dark'? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">Data</h3>
            <button onClick={exportChats} className="w-full p-3 rounded-xl bg-slate-800/50 flex items-center gap-2 mb-2">
              <Download size={20} /> Export Chats
            </button>
            <button onClick={clearMessages} className="w-full p-3 rounded-xl bg-red-500/20 text-red-400 flex items-center gap-2">
              <Trash2 size={20} /> Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
