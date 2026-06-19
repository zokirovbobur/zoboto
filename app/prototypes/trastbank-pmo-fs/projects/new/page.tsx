import Link from 'next/link'

const BASE = '/prototypes/trastbank-pmo-fs'

export default function NewProjectPage() {
  return (
    <div className="fade-in">
      <div className="pagehead">
        <div>
          <div className="crumbs">
            <Link href={BASE} className="crumb">Dashboard</Link>
            <span className="crumb-sep">/</span>
            <Link href={`${BASE}/projects`} className="crumb">Projects</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-cur">New Project</span>
          </div>
          <h1 className="page-title">New Project</h1>
        </div>
      </div>
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
        <p style={{ fontSize: 15 }}>New project form coming soon.</p>
        <Link href={`${BASE}/projects`} className="btn" style={{ marginTop: 16, display: 'inline-flex' }}>
          ← Back to Projects
        </Link>
      </div>
    </div>
  )
}
