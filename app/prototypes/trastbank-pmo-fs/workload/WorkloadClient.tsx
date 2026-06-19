'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { User, Department, Project, WorkloadRecord } from '@prisma/client'

const BASE = '/prototypes/trastbank-pmo-fs'

type UserFull = User & {
  department: Department | null
  managedProjects: Pick<Project, 'id' | 'name' | 'status' | 'product'>[]
  teamMemberships: Array<{ project: Pick<Project, 'id' | 'name' | 'status' | 'product'> }>
  workloadRecords: Array<WorkloadRecord & { project: Pick<Project, 'id' | 'name' | 'status' | 'product'> }>
}

function Avatar({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
  return <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>{initials}</span>
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', TOP_MANAGER: 'Top Manager', PMO: 'PMO',
  PROJECT_MANAGER: 'Project Manager', TEAM_MEMBER: 'Team Member', VIEWER: 'Viewer',
}

export function WorkloadClient({ users }: { users: UserFull[] }) {
  const [search, setSearch] = useState('')
  const [stackFilter, setStackFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')

  const stacks = useMemo(() => [...new Set(users.map(u => u.stack).filter(Boolean))].sort() as string[], [users])
  const depts = useMemo(() => {
    const m: Record<string, string> = {}
    users.forEach(u => { if (u.department) m[u.department.id] = u.department.name })
    return Object.entries(m)
  }, [users])

  const filtered = useMemo(() => {
    return users
      .map(u => {
        const activeProjects = [...new Set([
          ...u.managedProjects.map(p => p.id),
          ...u.teamMemberships.map(m => m.project.id),
        ])]

        const avgAlloc = u.workloadRecords.length
          ? Math.round(u.workloadRecords.reduce((s, r) => s + r.allocation, 0) / u.workloadRecords.length)
          : 0

        const loadLevel: string =
          activeProjects.length >= 10 ? 'critical' :
          activeProjects.length >= 6  ? 'high' :
          activeProjects.length >= 3  ? 'normal' : 'low'

        return { ...u, activeProjects: activeProjects.length, avgAlloc, loadLevel }
      })
      .filter(u => {
        if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.shortName.toLowerCase().includes(search.toLowerCase())) return false
        if (stackFilter !== 'all' && u.stack !== stackFilter) return false
        if (deptFilter !== 'all' && u.departmentId !== deptFilter) return false
        return true
      })
      .sort((a, b) => b.activeProjects - a.activeProjects)
  }, [users, search, stackFilter, deptFilter])

  const loadColors: Record<string, string> = {
    critical: '#C0392B', high: '#E0792F', normal: '#138A5E', low: '#2563EB',
  }
  const loadLabels: Record<string, string> = {
    critical: 'Overloaded', high: 'High', normal: 'Normal', low: 'Low',
  }

  return (
    <div className="fade-in">
      <div className="pagehead">
        <div>
          <div className="crumbs">
            <Link href={BASE} className="crumb">Dashboard</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-cur">Workload</span>
          </div>
          <h1 className="page-title">Team Workload</h1>
        </div>
        <div className="pagehead-right">
          <span className="tag">{filtered.length} employees</span>
        </div>
      </div>

      <div className="filterbar">
        <div className="search-box" style={{ width: 220 }}>
          <svg className="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…" />
        </div>
        {stacks.length > 0 && (
          <select className="f-sel" value={stackFilter} onChange={e => setStackFilter(e.target.value)}>
            <option value="all">Stack: All</option>
            {stacks.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {depts.length > 0 && (
          <select className="f-sel" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="all">Department: All</option>
            {depts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        )}
        <button className="btn btn-ghost" onClick={() => { setSearch(''); setStackFilter('all'); setDeptFilter('all') }}>↺ Reset</button>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Stack</th>
                <th>Department</th>
                <th style={{ textAlign: 'center' }}>Active Projects</th>
                <th style={{ minWidth: 160 }}>Workload</th>
                <th>Load Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <span className="row">
                      <Avatar name={u.shortName} color={u.avatarColor} size={30} />
                      <span>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.shortName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.grade ?? ''}</div>
                      </span>
                    </span>
                  </td>
                  <td className="t-muted" style={{ fontSize: 12 }}>{ROLE_LABELS[u.role] ?? u.role}</td>
                  <td className="t-muted" style={{ fontSize: 12 }}>{u.stack ?? '—'}</td>
                  <td className="t-muted" style={{ fontSize: 12 }}>{u.department?.name ?? '—'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }}>{u.activeProjects}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="load-bar" style={{ flex: 1 }}>
                        <div
                          className="load-fill"
                          style={{
                            width: Math.min(100, (u.activeProjects / 12) * 100) + '%',
                            background: loadColors[u.loadLevel],
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', width: 30, textAlign: 'right' }}>{u.activeProjects}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        color: loadColors[u.loadLevel],
                        background: loadColors[u.loadLevel] + '18',
                        borderRadius: 6,
                      }}
                    >
                      {loadLabels[u.loadLevel]}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} className="empty">
                  {users.length === 0 ? 'No employees yet — add users in Admin.' : 'No employees match the filter.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
