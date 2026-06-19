'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Project, Department } from '@prisma/client'

const BASE = '/prototypes/trastbank-pmo-fs'

type ProjectRow = Project & {
  manager: { id: string; shortName: string; avatarColor: string } | null
  department: { id: string; name: string } | null
}

const STATUS_META = {
  COMPLETED:  { label: 'Completed',   color: '#138A5E', bg: '#E4F3EB' },
  IN_PROGRESS:{ label: 'In Progress', color: '#2563EB', bg: '#E7EEFD' },
  PLANNED:    { label: 'Planned',     color: '#6D5CD6', bg: '#ECEAFB' },
  PAUSED:     { label: 'Paused',      color: '#C2410C', bg: '#FBEADD' },
}
const RISK_META = {
  LOW:      { label: 'Low',      color: '#138A5E' },
  MEDIUM:   { label: 'Medium',   color: '#D97706' },
  HIGH:     { label: 'High',     color: '#C2410C' },
  CRITICAL: { label: 'Critical', color: '#7F1D1D' },
}

function fmtDate(d: Date | null | string) {
  if (!d) return '—'
  const dt = new Date(d)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

export function ReportsClient({
  projects, departments, managers, products,
}: {
  projects: ProjectRow[]
  departments: Department[]
  managers: { id: string; shortName: string }[]
  products: string[]
}) {
  const [status, setStatus] = useState('all')
  const [product, setProduct] = useState('all')
  const [managerId, setManagerId] = useState('all')
  const [deptId, setDeptId] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const now = new Date()

  const rows = useMemo(() => {
    return projects.filter(p => {
      if (status !== 'all' && p.status !== status) return false
      if (product !== 'all' && p.product !== product) return false
      if (managerId !== 'all' && p.managerId !== managerId) return false
      if (deptId !== 'all' && p.departmentId !== deptId) return false
      if (riskFilter !== 'all' && p.riskLevel !== riskFilter) return false
      if (dateFrom && p.endDate && new Date(p.endDate) < new Date(dateFrom)) return false
      if (dateTo && p.endDate && new Date(p.endDate) > new Date(dateTo)) return false
      return true
    })
  }, [projects, status, product, managerId, deptId, riskFilter, dateFrom, dateTo])

  const summary = useMemo(() => ({
    total: rows.length,
    completed: rows.filter(r => r.status === 'COMPLETED').length,
    inProgress: rows.filter(r => r.status === 'IN_PROGRESS').length,
    overdue: rows.filter(r => r.endDate && new Date(r.endDate) < now && r.status !== 'COMPLETED' && r.status !== 'PAUSED').length,
    highRisk: rows.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length,
  }), [rows])

  const handleExport = () => {
    const header = 'Project,Product,Status,Priority,Risk,Manager,Department,Start,Deadline,Progress,Demo,Customer'
    const csvRows = rows.map(p =>
      [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.product}"`,
        `"${STATUS_META[p.status as keyof typeof STATUS_META]?.label ?? p.status}"`,
        p.priority,
        p.riskLevel,
        `"${p.manager?.shortName ?? ''}"`,
        `"${p.department?.name ?? ''}"`,
        fmtDate(p.startDate),
        fmtDate(p.endDate),
        p.progress + '%',
        p.demoReady ? 'Yes' : 'No',
        `"${p.customer ?? ''}"`,
      ].join(',')
    )
    const csv = [header, ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'pmo-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fade-in">
      <div className="pagehead">
        <div>
          <div className="crumbs">
            <Link href={BASE} className="crumb">Dashboard</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-cur">Reports</span>
          </div>
          <h1 className="page-title">Reports</h1>
        </div>
        <div className="pagehead-right">
          <button className="btn" onClick={handleExport}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 16 }}>
        {[
          { label: 'Filtered Total', value: summary.total, accent: '#2563EB' },
          { label: 'Completed', value: summary.completed, accent: '#138A5E' },
          { label: 'In Progress', value: summary.inProgress, accent: '#2563EB' },
          { label: 'Overdue', value: summary.overdue, accent: '#C0392B' },
          { label: 'High Risk', value: summary.highRisk, accent: '#B45309' },
        ].map(k => (
          <div key={k.label} className="kpi" style={{ '--kpi-accent': k.accent } as React.CSSProperties}>
            <div className="kpi-val" style={{ color: k.accent }}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filterbar" style={{ marginBottom: 14 }}>
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
        <select className="f-sel" value={deptId} onChange={e => setDeptId(e.target.value)}>
          <option value="all">Department: All</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="f-sel" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
          <option value="all">Risk: All</option>
          {Object.entries(RISK_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input type="date" className="f-sel" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Deadline from" />
        <input type="date" className="f-sel" value={dateTo} onChange={e => setDateTo(e.target.value)} title="Deadline to" />
        <button className="btn btn-ghost" onClick={() => { setStatus('all'); setProduct('all'); setManagerId('all'); setDeptId('all'); setRiskFilter('all'); setDateFrom(''); setDateTo('') }}>↺ Reset</button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="tbl-wrap">
          <table className="report-tbl">
            <thead>
              <tr>
                <th>Project</th>
                <th>Product</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Manager</th>
                <th>Department</th>
                <th>Deadline</th>
                <th>Progress</th>
                <th>Demo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => {
                const sm = STATUS_META[p.status as keyof typeof STATUS_META]
                const rm = RISK_META[p.riskLevel as keyof typeof RISK_META]
                const isOverdue = p.endDate && new Date(p.endDate) < now && p.status !== 'COMPLETED' && p.status !== 'PAUSED'
                return (
                  <tr key={p.id} onClick={() => (location.href = `${BASE}/projects/${p.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 500 }}>
                      {p.name}
                      {isOverdue && <small style={{ color: '#C0392B', marginLeft: 6 }}>● overdue</small>}
                    </td>
                    <td><span className="tag">{p.product}</span></td>
                    <td>
                      {sm && <span className="badge" style={{ color: sm.color, background: sm.bg }}>{sm.label}</span>}
                    </td>
                    <td>
                      {rm && <span style={{ fontSize: 12, fontWeight: 600, color: rm.color }}>{rm.label}</span>}
                    </td>
                    <td className="t-muted" style={{ fontSize: 12 }}>{p.manager?.shortName ?? '—'}</td>
                    <td className="t-muted" style={{ fontSize: 12 }}>{p.department?.name ?? '—'}</td>
                    <td className="t-muted" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDate(p.endDate)}</td>
                    <td style={{ minWidth: 80 }}>
                      <div className="progress"><div className="progress-fill" style={{ width: p.progress + '%', background: sm?.color ?? '#2563EB' }} /></div>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{p.progress}%</span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 12, color: p.demoReady ? '#138A5E' : 'var(--muted-2)', fontWeight: p.demoReady ? 600 : 400 }}>
                      {p.demoReady ? '✓' : '—'}
                    </td>
                  </tr>
                )
              })}
              {!rows.length && <tr><td colSpan={9} className="empty">No data matches the current filters</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
