'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Project, User, Department } from '@prisma/client'

const BASE = '/prototypes/trastbank-pmo-fs'

type ProjectRow = Project & {
  manager: { id: string; shortName: string; avatarColor: string } | null
  department: { id: string; name: string } | null
  _count: { tasks: number; teamMembers: number }
}

const STATUS_META = {
  COMPLETED:  { label: 'Completed',   color: '#138A5E', bg: '#E4F3EB', dot: '#1AA568' },
  IN_PROGRESS:{ label: 'In Progress', color: '#2563EB', bg: '#E7EEFD', dot: '#3B82F6' },
  PLANNED:    { label: 'Planned',     color: '#6D5CD6', bg: '#ECEAFB', dot: '#7C6CE0' },
  PAUSED:     { label: 'Paused',      color: '#C2410C', bg: '#FBEADD', dot: '#E0792F' },
}

const PRIORITY_META = {
  LOW:      { label: 'Low',      color: '#64748B' },
  MEDIUM:   { label: 'Medium',   color: '#D97706' },
  HIGH:     { label: 'High',     color: '#C2410C' },
  CRITICAL: { label: 'Critical', color: '#7F1D1D' },
}

const RISK_META = {
  LOW:      { label: 'Low',      color: '#138A5E' },
  MEDIUM:   { label: 'Medium',   color: '#D97706' },
  HIGH:     { label: 'High',     color: '#C2410C' },
  CRITICAL: { label: 'Critical', color: '#7F1D1D' },
}

function Avatar({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
  return <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>{initials}</span>
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_META[status as keyof typeof STATUS_META]
  if (!s) return <span className="badge">{status}</span>
  return <span className="badge" style={{ color: s.color, background: s.bg }}><span className="badge-dot" style={{ background: s.dot }} />{s.label}</span>
}

function fmtDate(d: Date | null | string) {
  if (!d) return '—'
  const dt = new Date(d)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

type SortKey = 'name' | 'product' | 'status' | 'priority' | 'endDate' | 'manager'

export function ProjectsClient({
  projects, departments, managers, products,
}: {
  projects: ProjectRow[]
  departments: Department[]
  managers: User[]
  products: string[]
}) {
  const [status, setStatus] = useState('all')
  const [product, setProduct] = useState('all')
  const [managerId, setManagerId] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: 'name', dir: 1 })

  const now = new Date()

  const rows = useMemo(() => {
    let r = projects.filter(p => {
      if (status !== 'all' && p.status !== status) return false
      if (product !== 'all' && p.product !== product) return false
      if (managerId !== 'all' && p.managerId !== managerId) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.product.toLowerCase().includes(q) &&
          !(p.customer ?? '').toLowerCase().includes(q) &&
          !(p.manager?.shortName ?? '').toLowerCase().includes(q)
        ) return false
      }
      return true
    })

    return [...r].sort((a, b) => {
      let av: string | number = '', bv: string | number = ''
      if (sort.k === 'endDate') { av = a.endDate ? new Date(a.endDate).getTime() : 0; bv = b.endDate ? new Date(b.endDate).getTime() : 0 }
      else if (sort.k === 'status') { const o = ['COMPLETED','IN_PROGRESS','PLANNED','PAUSED']; av = o.indexOf(a.status); bv = o.indexOf(b.status) }
      else if (sort.k === 'manager') { av = (a.manager?.shortName ?? '').toLowerCase(); bv = (b.manager?.shortName ?? '').toLowerCase() }
      else { av = (a[sort.k] as string ?? '').toLowerCase(); bv = (b[sort.k] as string ?? '').toLowerCase() }
      return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir
    })
  }, [projects, status, product, managerId, search, sort])

  const SortTh = ({ k, label }: { k: SortKey; label: string }) => (
    <th onClick={() => setSort(s => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : 1 }))}>
      {label}{sort.k === k && <span className="arr">{sort.dir > 0 ? ' ▲' : ' ▼'}</span>}
    </th>
  )

  return (
    <div className="fade-in">
      <div className="pagehead">
        <div>
          <div className="crumbs">
            <Link href={BASE} className="crumb">Dashboard</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-cur">Projects</span>
          </div>
          <h1 className="page-title">Project Portfolio</h1>
        </div>
        <div className="pagehead-right">
          <span className="tag">{rows.length} / {projects.length}</span>
          <Link href={`${BASE}/projects/new`} className="btn btn-primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New Project
          </Link>
        </div>
      </div>

      <div className="filterbar">
        <div className="search-box" style={{ width: 220 }}>
          <svg className="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" />
        </div>
        <select className="f-sel" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">Status: All</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="f-sel" value={product} onChange={e => setProduct(e.target.value)}>
          <option value="all">Product: All</option>
          {products.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="f-sel" value={managerId} onChange={e => setManagerId(e.target.value)}>
          <option value="all">Manager: All</option>
          {managers.map(m => <option key={m.id} value={m.id}>{m.shortName}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={() => { setStatus('all'); setProduct('all'); setManagerId('all'); setSearch('') }}>
          ↺ Reset
        </button>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <SortTh k="name" label="Project" />
                <SortTh k="product" label="Product" />
                <SortTh k="status" label="Status" />
                <SortTh k="priority" label="Priority" />
                <SortTh k="manager" label="Manager" />
                <th className="no-sort">Progress</th>
                <SortTh k="endDate" label="Deadline" />
                <th className="no-sort">Risk</th>
                <th className="no-sort">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => {
                const isOverdue = p.endDate && new Date(p.endDate) < now && p.status !== 'COMPLETED' && p.status !== 'PAUSED'
                return (
                  <tr key={p.id} onClick={() => (location.href = `${BASE}/projects/${p.id}`)}>
                    <td className="cell-proj">
                      {p.name}
                      {isOverdue && <small style={{ color: '#C0392B', marginLeft: 6 }}>● overdue</small>}
                      {p.demoReady && <small style={{ color: '#138A5E', marginLeft: 6 }}>● demo</small>}
                    </td>
                    <td><span className="tag">{p.product}</span></td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, color: PRIORITY_META[p.priority]?.color }}>
                        {PRIORITY_META[p.priority]?.label ?? p.priority}
                      </span>
                    </td>
                    <td>
                      {p.manager ? (
                        <span className="row">
                          <Avatar name={p.manager.shortName} color={p.manager.avatarColor} size={22} />
                          <span style={{ fontSize: 12.5 }}>{p.manager.shortName}</span>
                        </span>
                      ) : <span className="t-muted">—</span>}
                    </td>
                    <td style={{ minWidth: 80 }}>
                      <div className="progress">
                        <div className="progress-fill" style={{ width: p.progress + '%', background: STATUS_META[p.status as keyof typeof STATUS_META]?.color ?? '#2563EB' }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, display: 'block' }}>{p.progress}%</span>
                    </td>
                    <td className="t-muted" style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.endDate)}</td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, color: RISK_META[p.riskLevel as keyof typeof RISK_META]?.color ?? 'var(--muted)' }}>
                        {RISK_META[p.riskLevel as keyof typeof RISK_META]?.label ?? p.riskLevel}
                      </span>
                    </td>
                    <td className="t-muted" style={{ textAlign: 'center' }}>{p._count.tasks}</td>
                  </tr>
                )
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={9} className="empty">
                    {projects.length === 0 ? 'No projects yet.' : 'No projects match the current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
