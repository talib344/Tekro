export const metadata = {
  title: 'Tekro AI',
  description: 'AI Chat App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
