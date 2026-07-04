'use client'
import { useState } from 'react'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    'All', 'AI Chat', 'Image', 'Video', 'Audio', 'Code', 'Writing', 'Business'
  ]
  const tools = [
    {
      id: 1,
      name: 'AI Chat 2030',
      category: 'AI Chat',
      desc: 'Voice input/output ke saath advanced GPT-4 chat. Real-time baat karo',
      icon: '💬',
      rating: 5.0,
      users: 'Live',
      link: '/chat',
      feature: 'chat'
    },
    {
      id: 2,
      name: 'Image Generator Pro',
      category: 'Image', 
      desc: 'Text se real images banao. SDXL + DALL-E 3. HD quality output',
      icon: '🎨',
      rating: 4.9,
      users: 'Live',
      link: '/image',
      feature: 'image'
    },
    {
      id: 3,
      name: 'Voice AI Studio',
      category: 'Audio',
      desc: 'Voice input se text, text se voice. 50+ languages, real voices',
      icon: '🎙️',
      rating: 4.9,
      users: 'Live', 
      link: '/voice',
      feature: 'voice'
    },
    {
      id: 4,
      name: 'Video Editor AI',
      category: 'Video',
      desc: 'AI video editing real. Auto-cut, captions, effects, export 4K',
      icon: '🎬',
      rating: 4.8,
      users: 'Live',
      link: '/video',
      feature: 'video'
    }
  ]
    }
  ]

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
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
                  <p className="text-xs text-slate-400">Next-Gen AI Tools</p>
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

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 h-[calc(100vh-65px)] w-72 bg-slate-900/50 backdrop-blur-xl border-r border-cyan-500/20 p-4 overflow-y-auto transition-transform z-40`}>
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
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Stats</h3>
              <div className="space-y-3">
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-cyan-400">50+</p>
                  <p className="text-xs text-slate-400">AI Tools</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-400">10M+</p>
                  <p className="text-xs text-slate-400">Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Search */}
          <div className="md:hidden mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-slate-800/50 border border-cyan-500/20 rounded-xl focus:outline-none focus:border-cyan-500/50"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Hero Section */}
          <div className="mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Welcome to Tekro AI 2030
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Discover the most powerful AI tools for creators, developers, and businesses
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition">
                Explore Tools
              </button>
              <button className="px-6 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl font-semibold hover:bg-slate-800 transition">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Tools Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {activeCategory === 'All' ? 'All Tools' : activeCategory}
                <span className="text-slate-400 text-lg ml-2">({filteredTools.length})</span>
              </h3>
            </div>

            {filteredTools.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg">No tools found. Try a different search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTools.map(tool => (
                  <div
                    key={tool.id}
                    className="group bg-slate-800/30 backdrop-blur border border-cyan-500/10 rounded-2xl p-6 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/10 transition-all cursor-pointer"
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
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {tool.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                        {tool.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {tool.users} users
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </div>
  )
}
