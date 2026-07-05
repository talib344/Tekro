'use client'
import { useState } from 'react'
import { Send, ArrowLeft, Upload, FileText, Image as ImageIcon, Copy } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

const toolConfig = {
  'blog': { name: 'Blog Writer', needsUpload: false, prompt: 'Write a detailed SEO optimized blog on: {input}. Include headings, intro, conclusion. Format in markdown.' },
  'email': { name: 'Email Writer', needsUpload: false, prompt: 'Write a professional email about: {input}. Keep tone formal and concise.' },
  'article': { name: 'Article Writer', needsUpload: false, prompt: 'Write a detailed article on: {input} with proper research points.' },
  'story': { name: 'Story Writer', needsUpload: false, prompt: 'Write a creative short story about: {input}. Make it engaging.' },
  'youtube': { name: 'YouTube Script', needsUpload: false, prompt: 'Write a YouTube video script for: {input}. Include hook, main content, CTA.' },
  'linkedin': { name: 'LinkedIn Post', needsUpload: false, prompt: 'Write a professional LinkedIn post about: {input}. Add hashtags.' },
  'python': { name: 'Python Coder', needsUpload: false, prompt: 'Write Python code for: {input}. Add comments and explanation.' },
  'react': { name: 'React Coder', needsUpload: false, prompt: 'Write React/Next.js code for: {input}. Use functional components.' },
  'debug': { name: 'Code Debugger', needsUpload: false, prompt: 'Debug this code and fix errors: {input}. Explain the fix.' },
  'explain': { name: 'Code Explainer', needsUpload: false, prompt: 'Explain this code in simple terms: {input}' },
  'sql': { name: 'SQL Generator', needsUpload: false, prompt: 'Write SQL query for: {input}. Explain the query.' },
  'regex': { name: 'Regex Builder', needsUpload: false, prompt: 'Create regex pattern for: {input}. Explain how it works.' },
  'pdf': { name: 'PDF Summarizer', needsUpload: true, accept: '.pdf', prompt: 'Summarize this PDF content in detail with key points: {input}' },
  'pdf-qa': { name: 'PDF Q&A', needsUpload: true, accept: '.pdf', prompt: 'Based on this PDF content, answer: {question}. Context: {input}' },
  'caption': { name: 'Image Caption', needsUpload: true, accept: 'image/*', prompt: 'Describe this image in detail for caption and alt text.' },
  'ocr': { name: 'OCR Reader', needsUpload: true, accept: 'image/*', prompt: 'Extract all text from this image accurately.' },
  'translate': { name: 'Translator', needsUpload: false, prompt: 'Translate to English: {input}' },
  'grammar': { name: 'Grammar Fixer', needsUpload: false, prompt: 'Fix grammar mistakes in: {input}' },
  'rewrite': { name: 'Rewriter', needsUpload: false, prompt: 'Rewrite this text professionally: {input}' },
  'summary': { name: 'Summarizer', needsUpload: false, prompt: 'Summarize this text: {input}' },
  'math': { name: 'Math Solver', needsUpload: false, prompt: 'Solve this math problem step by step: {input}' },
  'json': { name: 'JSON Formatter', needsUpload: false, prompt: 'Format and validate this JSON: {input}' }
}

export default function ToolPage() {
  const params = useParams()
  const slug = params.slug
  const config = toolConfig

  const [input, setInput] = useState('')
  const [question, setQuestion] = useState('')
  const [file, setFile] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setInput(`File uploaded: ${selectedFile.name}`)
  }

  const generate = async () => {
    if (!config) return
    if (config.needsUpload &&!file) return alert('Upload file first')
    if (!config.needsUpload &&!input.trim()) return

    setLoading(true)
    setResult('')

    let finalPrompt = config.prompt.replace('{input}', input)
    if (slug === 'pdf-qa') {
      finalPrompt = config.prompt.replace('{input}', input).replace('{question}', question)
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: finalPrompt }]
      })
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      setResult(prev => prev + chunk)
    }
    setLoading(false)
  }

  const copyText = () => {
    navigator.clipboard.writeText(result)
    alert('Copied!')
  }

  if (!config) {
    return <div className="min-h-screen bg-slate-950 p-4 text-white">Tool not found</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10" />
      <div className="relative max-w-4xl mx-auto">
        <header className="glass rounded-2xl p-6 mb-6 neon-glow">
          <Link href="/tools" className="text-slate-400 text-sm mb-2 flex items-center gap-2 hover:text-neon-blue">
            <ArrowLeft size={16} /> Back to Tools
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            {config.name}
          </h1>
        </header>

        <div className="glass rounded-2xl p-6 neon-glow mb-4">
          {config.needsUpload? (
            <div className="mb-4">
              <label className="block mb-2 text-sm text-slate-400">Upload {slug === 'pdf' || slug === 'pdf-qa'? 'PDF' : 'Image'}</label>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-neon-blue transition-colors">
                <input
                  type="file"
                  accept={config.accept}
                  onChange={handleFile}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {slug === 'pdf' || slug === 'pdf-qa'? <FileText className="mx-auto mb-2" size={32} /> : <ImageIcon className="mx-auto mb-2" size={32} />}
                  <p>{file? file.name : 'Click to upload or drag file'}</p>
                </label>
              </div>
              {slug === 'pdf-qa' && (
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask question about PDF..."
                  className="w-full bg-slate-800/50 rounded-xl p-4 mt-4 outline-none"
                />
              )}
            </div>
          ) : (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter your input for ${config.name}...`}
              className="w-full bg-slate-800/50 rounded-xl p-4 mb-4 outline-none min-h-32"
            />
          )}

          <button
            onClick={generate}
            disabled={loading || (config.needsUpload &&!file)}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:neon-glow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading? 'Generating...' : 'Generate'} <Send size={18} />
          </button>
        </div>

        {result && (
          <div className="glass rounded-2xl p-6 neon-glow">
            <div className="flex gap-2 mb-4">
              <button onClick={copyText} className="px-4 py-2 glass rounded-lg hover:neon-glow flex items-center gap-2">
                <Copy size={16} /> Copy
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
