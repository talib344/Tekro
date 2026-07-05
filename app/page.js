'use client'
import { useState } from 'react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [image, setImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => setUploadedImage(reader.result)
    if (file) reader.readAsDataURL(file)
  }

  const handleSubmit = async (mode = null) => {
    setLoading(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [{ role: 'user', content: prompt }],
        language: 'Urdu',
        image: uploadedImage,
        editMode: mode
      })
    })
    const data = await res.json()
    setResult(data.message)
    if(data.image) setImage(data.image)
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#111', color: '#fff', padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, marginBottom: 8, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Tekro AI 2030 ENTERPRISE
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: 24 }}>Company Owner Mode: Gemini 1.5 Pro + Llama 70B + 8K Upscale ✅ All FREE</p>
        
        <div style={{ background: '#1f2937', borderRadius: 8, padding: 24, marginBottom: 16 }}>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Add tattoo AKM | Create 8K lion | Remove background | Analyze photo"
            style={{ width: '100%', height: 100, background: '#111827', borderRadius: 4, padding: 12, color: '#fff', border: '1px solid #374151' }}
          />
          
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: 12, fontSize: 14 }} />
          {uploadedImage && <img src={uploadedImage} alt="Upload" style={{ marginTop: 8, height: 96, borderRadius: 4 }} />}
          
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button onClick={() => handleSubmit()} disabled={loading} style={{ padding: '8px 16px', background: '#2563eb', borderRadius: 4, border: 'none', color: '#fff' }}>
              {loading? 'Generating...' : 'Generate 8K'}
            </button>
            <button onClick={() => handleSubmit('remove-bg')} disabled={loading ||!uploadedImage} style={{ padding: '8px 16px', background: '#7c3aed', borderRadius: 4, border: 'none', color: '#fff' }}>
              Remove BG 4K
            </button>
          </div>
        </div>

        {result && (
          <div style={{ background: '#1f2937', borderRadius: 8, padding: 24, marginBottom: 16 }}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
          </div>
        )}
        
        {image && (
          <div style={{ background: '#1f2937', borderRadius: 8, padding: 24 }}>
            <img src={image} alt="Generated" style={{ width: '100%', borderRadius: 4 }} />
            <a href={image} download="tekro-8k.png" style={{ marginTop: 16, display: 'inline-block', padding: '8px 16px', background: '#16a34a', borderRadius: 4, color: '#fff', textDecoration: 'none' }}>
              Download 8K
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
