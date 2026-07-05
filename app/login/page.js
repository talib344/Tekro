'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    })
    if (res?.ok) router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold gradient-text text-center mb-6">Tekro AI 2030</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-pink-500/50"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-pink-500/50"
            required
          />
          <button type="submit" className="w-full px-6 py-3 rounded-xl btn-glow flex items-center justify-center gap-2">
            <LogIn size={20} /> Login / Register
          </button>
          <p className="text-xs text-center text-slate-400">
            Koi bhi email + password daal de, account ban jayega
          </p>
        </form>
      </div>
    </div>
  )
}
