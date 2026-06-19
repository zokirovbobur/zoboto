import type { Metadata } from 'next'
import './pmo.css'
import { Shell } from './Shell'

export const metadata: Metadata = {
  title: 'Trastbank — Project Reporting Board (FS)',
  description: 'Full-stack PMO dashboard for Trastbank project portfolio management.',
}

export default function PmoLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>
}
