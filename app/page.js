'use client'
import { useState } from 'react'
import { FaImage, FaMagic, FaDownload } from 'react-icons/fa'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [image, setImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => setUploadedImage(reader.result)
    if (file) reader.readAsDataURL(file)
  }

  const handleSubmit = async (mode = null) => {
    setLoading(true)
    setEditMode(mode)
    try {
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
      toast.success('ENTERPRISE: 8K Generation Complete!')
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <Toaster position="top-center" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Tekro AI 2030 ENTERPRISE
        </h1>
        <p className="text-gray-400 mb-6">Company Owner Mode: Gemini 1.5 Pro + Llama 70B + 8K Upscale ✅ All FREE</p>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-4">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Add tattoo AKM | Create 8K lion | Remove background | Analyze photo"
            className="w-full h-24 bg-gray-900 rounded p-3 text-white resize-none"
          />
          
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-3 text-sm" />
          {uploadedImage && <img src={uploadedImage} alt="Upload" className="mt-2 h-24 rounded" />}
          
          <div className="flex gap-2 mt-4 flex-wrap">
            <button onClick={() => handleSubmit()} disabled={loading} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2">
              <FaMagic /> {loading? 'Generating...' : 'Generate 8K'}
            </button>
            <button onClick={() => handleSubmit('remove-bg')} disabled={loading ||!uploadedImage} className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 flex items-center gap-2">
              <FaImage /> Remove BG 4K
            </button>
          </div>
        </div>

        {result && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gray-800 rounded-lg p-6 mb-4">
            <p className="whitespace-pre-wrap">{result}</p>
          </motion.div>
        )}
        
        {image && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 rounded-lg p-6">
            <img src={image} alt="Generated" className="w-full rounded" />
            <a href={image} download="tekro-8k.png" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700">
              <FaDownload /> Download 8K
            </a>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
