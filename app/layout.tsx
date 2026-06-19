import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bobur Zokirov — CPO | Product Manager',
  description: 'Personal website and portfolio of Bobur Zokirov, Chief Product Officer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
