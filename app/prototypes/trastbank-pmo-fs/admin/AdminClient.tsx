'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { User, Department } from '@prisma/client'

const BASE = '/prototypes/trastbank-pmo-fs'

type UserWithDept = User & { department: { name: string } | null }
type DeptWithCount = Department & { _count: { users: number; projects: number } }

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', TOP_MANAGER: 'Top Manager', PMO: 'PMO',
  PROJECT_MANAGER: 'Project Manager', TEAM_MEMBER: 'Team Member', VIEWER: 'Viewer',
}
const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#7F1D1D', TOP_MANAGER: '#7C3AED', PMO: '#0E7490',
  PROJECT_MANAGER: '#1D4ED8', TEAM_MEMBER: '#065F46', VIEWER: '#64748B',
}

function Avatar({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
  return <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>{initials}</span>
}

type Tab = 'users' | 'departments' | 'statuses'

export function AdminClient({
  users, departments, projectStatusCounts,
}: {
  users: UserWithDept[]
  departments: DeptWithCount[]
  projectStatusCounts: Array<{ status: string; _count: { id: number } }>
}) {
  const [tab, setTab] = useState<Tab>('users')
  const [search, setSearch] = useState('')

  const filteredUsers = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const statusLabels: Record<string, string> = {
    COMPLETED: 'Completed', IN_PROGRESS: 'In Progress', PLANNED: 'Planned', PAUSED: 'Paused',
  }
  const statusColors: Record<string, string> = {
    COMPLETED: '#138A5E', IN_PROGRESS: '#2563EB', PLANNED: '#6D5CD6', PAUSED: '#C2410C',
  }

  return (
    <div className="fade-in">
      <div className="pagehead">
        <div>
          <div className="crumbs">
            <Link href={BASE} className="crumb">Dashboard</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-cur">Admin</span>
          </div>
          <h1 className="page-title">Settings & Admin</h1>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
        {(['users', 'departments', 'statuses'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600, textTransform: 'capitalize',
              color: tab === t ? 'var(--accent)' : 'var(--muted)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t === 'users' ? `Users (${users.length})` : t === 'departments' ? `Departments (${departments.length})` : 'Statuses'}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <>
          <div className="filterbar" style={{ marginBottom: 12 }}>
            <div className="search-box" style={{ width: 240 }}>
              <svg className="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" />
            </div>
            <span className="tag">{filteredUsers.length} users</span>
          </div>
          <div className="card">
            <div className="tbl-wrap">
              <table className="admin-tbl">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Stack</th>
                    <th>Grade</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <span className="row">
                          <Avatar name={u.shortName} color={u.avatarColor} size={28} />
                          <span>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.shortName}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.name !== u.shortName ? u.name : ''}</div>
                          </span>
                        </span>
                      </td>
                      <td className="t-muted" style={{ fontSize: 12 }}>{u.email}</td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5,
                          background: (ROLE_COLORS[u.role] ?? '#64748B') + '18',
                          color: ROLE_COLORS[u.role] ?? '#64748B',
                        }}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="t-muted" style={{ fontSize: 12 }}>{u.stack ?? '—'}</td>
                      <td className="t-muted" style={{ fontSize: 12 }}>{u.grade ?? '—'}</td>
                      <td className="t-muted" style={{ fontSize: 12 }}>{u.department?.name ?? '—'}</td>
                    </tr>
                  ))}
                  {!filteredUsers.length && <tr><td colSpan={6} className="empty">No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'departments' && (
        <div className="card">
          <div className="tbl-wrap">
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th style={{ textAlign: 'center' }}>Users</th>
                  <th style={{ textAlign: 'center' }}>Projects</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id}>
                    <td>
                      <span className="row">
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                        <span style={{ fontWeight: 500 }}>{d.name}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, fontWeight: 600, color: 'var(--accent)' }}>
                        {d.code}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{d._count.users}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{d._count.projects}</td>
                  </tr>
                ))}
                {!departments.length && <tr><td colSpan={4} className="empty">No departments yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'statuses' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {/* Project statuses */}
          <div className="card">
            <div className="card-h"><h3>Project Statuses</h3></div>
            <div className="card-pad">
              {(['COMPLETED', 'IN_PROGRESS', 'PLANNED', 'PAUSED'] as const).map(s => {
                const count = projectStatusCounts.find(x => x.status === s)?._count.id ?? 0
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors[s], display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{statusLabels[s]}</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: statusColors[s] }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task statuses */}
          <div className="card">
            <div className="card-h"><h3>Task Statuses (Reference)</h3></div>
            <div className="card-pad">
              {[
                { key: 'BACKLOG', label: 'Backlog', color: '#64748B' },
                { key: 'IN_PROGRESS', label: 'In Progress', color: '#2563EB' },
                { key: 'REVIEW', label: 'In Review', color: '#D97706' },
                { key: 'DONE', label: 'Done', color: '#138A5E' },
                { key: 'BLOCKED', label: 'Blocked', color: '#C0392B' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{s.label}</span>
                  <span className="badge" style={{ color: s.color, background: s.color + '18', fontSize: 10 }}>{s.key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Role reference */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-h"><h3>Roles</h3></div>
            <div className="card-pad">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <span key={k} style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
                    background: (ROLE_COLORS[k] ?? '#64748B') + '18',
                    color: ROLE_COLORS[k] ?? '#64748B',
                  }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
