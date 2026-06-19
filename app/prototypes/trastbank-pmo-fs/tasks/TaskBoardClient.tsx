'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Task } from '@prisma/client'

const BASE = '/prototypes/trastbank-pmo-fs'

const COLS = [
  { key: 'BACKLOG',     label: 'Backlog',      color: '#64748B' },
  { key: 'IN_PROGRESS', label: 'In Progress',  color: '#2563EB' },
  { key: 'REVIEW',      label: 'In Review',    color: '#D97706' },
  { key: 'DONE',        label: 'Done',         color: '#138A5E' },
  { key: 'BLOCKED',     label: 'Blocked',      color: '#C0392B' },
]

const PRIORITY_META = {
  LOW:      { label: 'Low',      color: '#64748B' },
  MEDIUM:   { label: 'Medium',   color: '#D97706' },
  HIGH:     { label: 'High',     color: '#C2410C' },
  CRITICAL: { label: 'Critical', color: '#7F1D1D' },
}

type TaskWithRelations = Task & {
  project: { id: string; name: string; product: string }
  assignees: Array<{ user: { id: string; shortName: string; avatarColor: string } }>
}

function Avatar({ name, color, size = 22 }: { name: string; color: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
  return <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>{initials}</span>
}

export function TaskBoardClient({ tasks }: { tasks: TaskWithRelations[] }) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.project.name.toLowerCase().includes(search.toLowerCase()),
      )
    : tasks

  const byStatus: Record<string, TaskWithRelations[]> = {}
  for (const col of COLS) byStatus[col.key] = []
  for (const t of filtered) {
    if (byStatus[t.status]) byStatus[t.status].push(t)
  }

  return (
    <div className="fade-in">
      <div className="pagehead">
        <div>
          <div className="crumbs">
            <Link href={BASE} className="crumb">Dashboard</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-cur">Task Board</span>
          </div>
          <h1 className="page-title">Task Board</h1>
        </div>
        <div className="pagehead-right">
          <div className="search-box" style={{ width: 220 }}>
            <svg className="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'start' }}>
        {COLS.map(col => {
          const colTasks = byStatus[col.key]
          return (
            <div key={col.key} className="kcol">
              <div className="kcol-h">
                <span className="kc-dot" style={{ background: col.color }} />
                <b>{col.label}</b>
                <span className="kc-n">{colTasks.length}</span>
              </div>

              {colTasks.map(t => (
                <Link key={t.id} href={`${BASE}/projects/${t.project.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div
                    className="kcard"
                    style={{ '--kc': col.color } as React.CSSProperties}
                  >
                    <div className="kcard-t">{t.title}</div>
                    <div className="kcard-meta">
                      <span className="tag" style={{ fontSize: 10 }}>{t.project.product}</span>
                      <span style={{ fontSize: 10.5, color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.project.name}
                      </span>
                    </div>
                    <div className="kcard-foot">
                      <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_META[t.priority]?.color ?? 'var(--muted)' }}>
                        {PRIORITY_META[t.priority]?.label ?? t.priority}
                      </span>
                      {t.assignees.length > 0 && (
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                          {t.assignees.slice(0, 3).map(a => (
                            <Avatar key={a.user.id} name={a.user.shortName} color={a.user.avatarColor} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {!colTasks.length && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted-2)', fontSize: 12 }}>—</div>
              )}
            </div>
          )
        })}
      </div>

      {tasks.length === 0 && (
        <div className="state-box" style={{ marginTop: 40 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="4" width="4" height="16"/><rect x="10" y="4" width="4" height="16"/><rect x="16" y="4" width="4" height="16"/></svg>
          <p>No tasks yet — add tasks from the project detail page</p>
        </div>
      )}
    </div>
  )
}
