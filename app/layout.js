import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Tekro AI 2030 Enterprise - Gemini 1.5 Pro',
  description: 'Company Owner: Advanced AI with 8K, Voice, Real-time. All Free.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Toaster position="top-center" toastOptions={{
          style: { background: '#111827', color: '#f9fafb', border: '1px solid #374151' }
        }} />
        {children}
      </body>
    </html>
  )
}
