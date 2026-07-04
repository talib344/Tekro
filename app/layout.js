import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Tekro-AI 2030',
  description: '2x Faster | 10x Better | 100+ Languages | By Talib Ali 🇵🇰',
  keywords: 'AI, ChatGPT Alternative, Groq, Llama 3, Pakistan AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
