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
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 20, fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, marginBottom: 8, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: 800 }}>
          Tekro AI 2030 ENTERPRISE
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: 24 }}>Company Owner: Gemini 1.5 Pro + Llama 70B + 8K ✅ All FREE</p>
        
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 24, marginBottom: 16, border: '1px solid #2a2a2a' }}>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Add tattoo AKM | Create 8K lion | Remove background | Analyze photo"
            style={{ width: '100%', height: 100, background: '#0a0a0a', borderRadius: 8, padding: 12, color: '#fff', border: '1px solid #333', outline: 'none' }}
          />
          
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: 12, fontSize: 14 }} />
          {uploadedImage && <img src={uploadedImage} alt="Upload" style={{ marginTop: 12, height: 100, borderRadius: 8 }} />}
          
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button onClick={() => handleSubmit()} disabled={loading} style={{ padding: '10px 20px', background: '#2563eb', borderRadius: 8, border: 'none', color: '#fff', cursor: 'pointer' }}>
              {loading? 'Generating...' : 'Generate 8K'}
            </button>
            <button onClick={() => handleSubmit('remove-bg')} disabled={loading ||!uploadedImage} style={{ padding: '10px 20px', background: '#7c3aed', borderRadius: 8, border: 'none', color: '#fff', cursor: 'pointer' }}>
              Remove BG 4K
            </button>
          </div>
        </div>

        {result && (
          <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 24, marginBottom: 16, border: '1px solid #2a2a2a' }}>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{result}</p>
          </div>
        )}
        
        {image && (
          <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 24, border: '1px solid #2a2a2a' }}>
            <img src={image} alt="Generated" style={{ width: '100%', borderRadius: 8 }} />
            <a href={image} download="tekro-8k.png" style={{ marginTop: 16, display: 'inline-block', padding: '10px 20px', background: '#16a34a', borderRadius: 8, color: '#fff', textDecoration: 'none' }}>
              Download 8K
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
