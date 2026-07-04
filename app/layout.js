import './globals.css'

export const metadata = {
  title: 'Tekro-AI 2030',
  description: 'By Talib Ali',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
