'use client'

import Link from 'next/link'

const BASE = '/prototypes/trastbank-pmo-fs'

const STATUS_META = {
  COMPLETED:  { label: 'Completed',   color: '#138A5E', bg: '#E4F3EB', dot: '#1AA568' },
  IN_PROGRESS:{ label: 'In Progress', color: '#2563EB', bg: '#E7EEFD', dot: '#3B82F6' },
  PLANNED:    { label: 'Planned',     color: '#6D5CD6', bg: '#ECEAFB', dot: '#7C6CE0' },
  PAUSED:     { label: 'Paused',      color: '#C2410C', bg: '#FBEADD', dot: '#E0792F' },
} as const

const RISK_META = {
  LOW:      { label: 'Low',      color: '#138A5E' },
  MEDIUM:   { label: 'Medium',   color: '#D97706' },
  HIGH:     { label: 'High',     color: '#C2410C' },
  CRITICAL: { label: 'Critical', color: '#7F1D1D' },
}

type Summary = {
  total: number; completed: number; inProgress: number; planned: number; paused: number
  overdue: number; demoReady: number; highRisk: number; totalEmployees: number; departments: number
  byProduct: Array<{ name: string; COMPLETED: number; IN_PROGRESS: number; PLANNED: number; PAUSED: number }>
}

type RecentProject = {
  id: string; name: string; product: string; status: string; riskLevel: string; demoReady: boolean
  endDate: Date | null
  manager: { shortName: string; avatarColor: string } | null
}

function Avatar({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_META[status as keyof typeof STATUS_META]
  if (!s) return <span className="badge">{status}</span>
  return (
    <span className="badge" style={{ color: s.color, background: s.bg }}>
      <span className="badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

function fmtDate(d: Date | null) {
  if (!d) return '—'
  const dt = new Date(d)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

export function DashboardClient({ summary, recentProjects }: { summary: Summary; recentProjects: RecentProject[] }) {
  const kpis1 = [
    { label: 'Total Projects', value: summary.total, accent: '#2563EB', href: `${BASE}/projects` },
    { label: 'Completed', value: summary.completed, accent: '#138A5E', href: `${BASE}/projects?status=COMPLETED` },
    { label: 'In Progress', value: summary.inProgress, accent: '#2563EB', href: `${BASE}/projects?status=IN_PROGRESS` },
    { label: 'Planned', value: summary.planned, accent: '#6D5CD6', href: `${BASE}/projects?status=PLANNED` },
    { label: 'Paused', value: summary.paused, accent: '#C2410C', href: `${BASE}/projects?status=PAUSED` },
  ]
  const kpis2 = [
    { label: 'Overdue', value: summary.overdue, accent: '#C0392B', href: `${BASE}/reports` },
    { label: 'Demo Ready', value: summary.demoReady, accent: '#0E9C8E', href: `${BASE}/projects?demo=true` },
    { label: 'High Risk', value: summary.highRisk, accent: '#B45309', href: `${BASE}/reports` },
    { label: 'Employees', value: summary.totalEmployees, accent: '#2563EB', href: `${BASE}/workload` },
    { label: 'Departments', value: summary.departments, accent: '#6D5CD6', href: `${BASE}/admin` },
  ]

  return (
    <div className="fade-in">
      <div className="pagehead">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Trastbank PMO — project portfolio overview</p>
        </div>
        <div className="pagehead-right">
          <Link href={`${BASE}/projects`} className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Project
          </Link>
        </div>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        {kpis1.map(k => (
          <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
            <div className="kpi kpi-click" style={{ '--kpi-accent': k.accent } as React.CSSProperties}>
              <div className="kpi-val" style={{ color: k.accent }}>{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginTop: 0 }}>
        {kpis2.map(k => (
          <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
            <div className="kpi kpi-click" style={{ '--kpi-accent': k.accent } as React.CSSProperties}>
              <div className="kpi-val" style={{ color: k.accent }}>{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', marginTop: 18, gap: 14 }}>
        {/* By Product */}
        <div className="card">
          <div className="card-h">
            <h3>Projects by Product</h3>
            <span className="hint">{summary.byProduct.length} products</span>
          </div>
          <div className="card-pad" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--muted)' }}>Product</th>
                  {(['COMPLETED', 'IN_PROGRESS', 'PLANNED', 'PAUSED'] as const).map(s => (
                    <th key={s} style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, fontSize: 11, color: STATUS_META[s].color }}>{STATUS_META[s].label}</th>
                  ))}
                  <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, fontSize: 11, color: 'var(--muted)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.byProduct.slice(0, 10).map(row => {
                  const total = row.COMPLETED + row.IN_PROGRESS + row.PLANNED + row.PAUSED
                  return (
                    <tr key={row.name} style={{ borderBottom: '1px solid var(--line-2)' }}>
                      <td style={{ padding: '7px 8px', fontWeight: 500 }}>{row.name}</td>
                      {(['COMPLETED', 'IN_PROGRESS', 'PLANNED', 'PAUSED'] as const).map(s => (
                        <td key={s} style={{ padding: '7px 8px', textAlign: 'center', color: row[s] ? STATUS_META[s].color : 'var(--muted-2)', fontWeight: row[s] ? 600 : 400 }}>
                          {row[s] || '—'}
                        </td>
                      ))}
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 700 }}>{total}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card">
          <div className="card-h">
            <h3>Status Breakdown</h3>
            <span className="hint">Total — {summary.total}</span>
          </div>
          <div className="card-pad">
            {(['COMPLETED', 'IN_PROGRESS', 'PLANNED', 'PAUSED'] as const).map(s => {
              const count = summary[s === 'IN_PROGRESS' ? 'inProgress' : s.toLowerCase() as 'completed' | 'planned' | 'paused']
              const pct = summary.total ? Math.round((count / summary.total) * 100) : 0
              const meta = STATUS_META[s]
              return (
                <div key={s} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                    <span style={{ fontWeight: 500, color: meta.color }}>{meta.label}</span>
                    <span style={{ fontWeight: 700 }}>{count} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: pct + '%', background: meta.color }} />
                  </div>
                </div>
              )
            })}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--line-2)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#C0392B' }}>{summary.overdue}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Overdue</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#0E9C8E' }}>{summary.demoReady}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Demo Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-h">
          <h3>Recently Updated Projects</h3>
          <Link href={`${BASE}/projects`} className="btn btn-ghost" style={{ fontSize: 12 }}>
            View All →
          </Link>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Project</th>
                <th>Product</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Manager</th>
                <th>Deadline</th>
                <th className="no-sort">Demo</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map(p => {
                const isOverdue = p.endDate && new Date(p.endDate) < new Date() && p.status !== 'COMPLETED' && p.status !== 'PAUSED'
                return (
                  <tr key={p.id} onClick={() => (location.href = `${BASE}/projects/${p.id}`)}>
                    <td className="cell-proj">
                      {p.name}
                      {isOverdue && <small style={{ color: '#C0392B', marginLeft: 6 }}>● overdue</small>}
                    </td>
                    <td><span className="tag">{p.product}</span></td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: RISK_META[p.riskLevel as keyof typeof RISK_META]?.color ?? 'var(--muted)' }}>
                        {RISK_META[p.riskLevel as keyof typeof RISK_META]?.label ?? p.riskLevel}
                      </span>
                    </td>
                    <td>
                      {p.manager ? (
                        <span className="row">
                          <Avatar name={p.manager.shortName} color={p.manager.avatarColor} size={24} />
                          {p.manager.shortName}
                        </span>
                      ) : <span className="t-muted">—</span>}
                    </td>
                    <td className="t-muted" style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.endDate)}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 600, color: p.demoReady ? '#138A5E' : 'var(--muted-2)' }}>
                        {p.demoReady ? '✓ Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!recentProjects.length && (
                <tr><td colSpan={7} className="empty">No projects yet — <Link href={`${BASE}/projects`} style={{ color: 'var(--accent)' }}>add one</Link></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
