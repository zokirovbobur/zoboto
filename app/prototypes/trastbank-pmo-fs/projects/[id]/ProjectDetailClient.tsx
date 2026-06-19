'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Project, User, Department, Task, ProjectUpdate, WorkloadRecord } from '@prisma/client'

const BASE = '/prototypes/trastbank-pmo-fs'

const STATUS_META = {
  COMPLETED:  { label: 'Completed',   color: '#138A5E', bg: '#E4F3EB', dot: '#1AA568' },
  IN_PROGRESS:{ label: 'In Progress', color: '#2563EB', bg: '#E7EEFD', dot: '#3B82F6' },
  PLANNED:    { label: 'Planned',     color: '#6D5CD6', bg: '#ECEAFB', dot: '#7C6CE0' },
  PAUSED:     { label: 'Paused',      color: '#C2410C', bg: '#FBEADD', dot: '#E0792F' },
}

const TASK_STATUS_META = {
  BACKLOG:     { label: 'Backlog',     color: '#64748B', bg: '#F1F5F9' },
  IN_PROGRESS: { label: 'In Progress', color: '#2563EB', bg: '#E7EEFD' },
  REVIEW:      { label: 'Review',      color: '#D97706', bg: '#FEF3C7' },
  DONE:        { label: 'Done',        color: '#138A5E', bg: '#E4F3EB' },
  BLOCKED:     { label: 'Blocked',     color: '#C0392B', bg: '#FEE2E2' },
}

const RISK_META = {
  LOW:      { label: 'Low',      color: '#138A5E', bg: '#E4F3EB' },
  MEDIUM:   { label: 'Medium',   color: '#D97706', bg: '#FEF3C7' },
  HIGH:     { label: 'High',     color: '#C2410C', bg: '#FBEADD' },
  CRITICAL: { label: 'Critical', color: '#7F1D1D', bg: '#FEE2E2' },
}

type TaskWithAssignees = Task & {
  assignees: Array<{ user: { id: string; shortName: string; avatarColor: string } }>
}

type UpdateWithAuthor = ProjectUpdate & {
  author: { id: string; shortName: string; avatarColor: string } | null
}

type ProjectFull = Project & {
  manager: User | null
  department: Department | null
  teamMembers: Array<{ user: User }>
  tasks: TaskWithAssignees[]
  updates: UpdateWithAuthor[]
  workloadItems: Array<WorkloadRecord & { user: { id: string; shortName: string; avatarColor: string; role: string } }>
}

function Avatar({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
  return <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>{initials}</span>
}

function fmtDate(d: Date | string | null) {
  if (!d) return '—'
  const dt = new Date(d)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

function fmtDateTime(d: Date | string) {
  const dt = new Date(d)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}, ${dt.getHours().toString().padStart(2,'0')}:${dt.getMinutes().toString().padStart(2,'0')}`
}

export function ProjectDetailClient({ project }: { project: ProjectFull }) {
  const [tab, setTab] = useState<'tasks' | 'updates' | 'team'>('tasks')
  const s = STATUS_META[project.status as keyof typeof STATUS_META]
  const r = RISK_META[project.riskLevel as keyof typeof RISK_META]
  const isOverdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== 'COMPLETED' && project.status !== 'PAUSED'

  const tasksByStatus = {
    BACKLOG: project.tasks.filter(t => t.status === 'BACKLOG'),
    IN_PROGRESS: project.tasks.filter(t => t.status === 'IN_PROGRESS'),
    REVIEW: project.tasks.filter(t => t.status === 'REVIEW'),
    DONE: project.tasks.filter(t => t.status === 'DONE'),
    BLOCKED: project.tasks.filter(t => t.status === 'BLOCKED'),
  }

  return (
    <div className="fade-in">
      <div className="pagehead">
        <div>
          <div className="crumbs">
            <Link href={BASE} className="crumb">Dashboard</Link>
            <span className="crumb-sep">/</span>
            <Link href={`${BASE}/projects`} className="crumb">Projects</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-cur">{project.name}</span>
          </div>
          <h1 className="page-title" style={{ maxWidth: 700 }}>{project.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {s && <span className="badge" style={{ color: s.color, background: s.bg }}><span className="badge-dot" style={{ background: s.dot }} />{s.label}</span>}
            {r && <span className="badge" style={{ color: r.color, background: r.bg }}>Risk: {r.label}</span>}
            <span className="tag">{project.product}</span>
            {project.demoReady && <span className="pill pill-green">Demo Ready</span>}
            {isOverdue && <span className="pill pill-red">Overdue</span>}
          </div>
        </div>
        <div className="pagehead-right">
          <Link href={`${BASE}/projects`} className="btn btn-ghost">← Back</Link>
        </div>
      </div>

      <div className="detail-grid">
        {/* Main column */}
        <div>
          {/* Progress */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Progress</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{project.progress}%</span>
              </div>
              <div className="progress" style={{ height: 10, borderRadius: 6 }}>
                <div className="progress-fill" style={{ width: project.progress + '%', background: s?.color ?? '#2563EB' }} />
              </div>
            </div>
          </div>

          {/* Goal & Basis */}
          {(project.goal || project.basis) && (
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-h"><h3>Project Description</h3></div>
              <div className="card-pad">
                {project.goal && <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Goal</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{project.goal}</div>
                </div>}
                {project.basis && <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Basis</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{project.basis}</div>
                </div>}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="card">
            <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', padding: '0 18px' }}>
              {(['tasks', 'updates', 'team'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    color: tab === t ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1,
                  }}
                >
                  {t === 'tasks' ? `Tasks (${project.tasks.length})` : t === 'updates' ? `Updates (${project.updates.length})` : `Team (${project.teamMembers.length})`}
                </button>
              ))}
            </div>

            <div className="card-pad">
              {tab === 'tasks' && (
                <div>
                  {project.tasks.length === 0 ? (
                    <div className="state-box" style={{ padding: 32 }}>
                      <p>No tasks yet</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {(['BLOCKED', 'IN_PROGRESS', 'REVIEW', 'BACKLOG', 'DONE'] as const).map(st => {
                        const tasks = tasksByStatus[st]
                        if (!tasks.length) return null
                        const meta = TASK_STATUS_META[st]
                        return (
                          <div key={st} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{tasks.length}</span>
                            </div>
                            {tasks.map(task => (
                              <div key={task.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                                background: 'var(--line-2)', fontSize: 13,
                              }}>
                                <span style={{ flex: 1, fontWeight: 500 }}>{task.title}</span>
                                <span className="badge" style={{ fontSize: 10.5, color: meta.color, background: meta.bg }}>{meta.label}</span>
                                {task.assignees.length > 0 && (
                                  <div style={{ display: 'flex', gap: 2 }}>
                                    {task.assignees.map(a => (
                                      <Avatar key={a.user.id} name={a.user.shortName} color={a.user.avatarColor} size={22} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === 'updates' && (
                <div className="update-feed">
                  {project.updates.length === 0 ? (
                    <div className="state-box" style={{ padding: 32 }}><p>No updates yet</p></div>
                  ) : project.updates.map(u => (
                    <div key={u.id} className="update-item">
                      <div className="update-meta">
                        {u.author && <Avatar name={u.author.shortName} color={u.author.avatarColor} size={22} />}
                        <span className="update-author">{u.author?.shortName ?? 'Unknown'}</span>
                        <span className="update-time">{fmtDateTime(u.createdAt)}</span>
                      </div>
                      <div className="update-text">{u.content}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'team' && (
                <div className="team-grid">
                  {project.teamMembers.length === 0 ? (
                    <div className="state-box" style={{ padding: 32 }}><p>No team members assigned</p></div>
                  ) : project.teamMembers.map(({ user: u }) => (
                    <div key={u.id} className="team-card">
                      <Avatar name={u.shortName} color={u.avatarColor} size={32} />
                      <div>
                        <div className="team-name">{u.shortName}</div>
                        <div className="team-role">{u.role.replace(/_/g, ' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side column */}
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-h"><h3>Project Info</h3></div>
            <div className="card-pad" style={{ padding: '8px 18px' }}>
              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-key">Manager</span>
                  <span className="meta-val">
                    {project.manager ? (
                      <span className="row">
                        <Avatar name={project.manager.shortName} color={project.manager.avatarColor} size={22} />
                        {project.manager.shortName}
                      </span>
                    ) : '—'}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Department</span>
                  <span className="meta-val">{project.department?.name ?? '—'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Customer</span>
                  <span className="meta-val">{project.customer ?? '—'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Supplier</span>
                  <span className="meta-val">{project.supplier ?? '—'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Start Date</span>
                  <span className="meta-val">{fmtDate(project.startDate)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Deadline</span>
                  <span className="meta-val" style={{ color: isOverdue ? '#C0392B' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                    {fmtDate(project.endDate)}
                    {isOverdue && ' ● overdue'}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Budget</span>
                  <span className="meta-val">{project.budget ?? '—'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Origin</span>
                  <span className="meta-val">{project.origin ?? '—'}</span>
                </div>
                {project.jiraEpicKey && (
                  <div className="meta-row">
                    <span className="meta-key">Jira Epic</span>
                    <span className="meta-val">
                      <a
                        href={`https://test-tb.atlassian.net/browse/${project.jiraEpicKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 12 }}
                      >
                        {project.jiraEpicKey} ↗
                      </a>
                    </span>
                  </div>
                )}
                <div className="meta-row">
                  <span className="meta-key">External ID</span>
                  <span className="meta-val" style={{ color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5 }}>{project.externalId ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workload */}
          {project.workloadItems.length > 0 && (
            <div className="card">
              <div className="card-h"><h3>Team Allocation</h3></div>
              <div className="card-pad" style={{ padding: '8px 18px' }}>
                {project.workloadItems.map(w => (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Avatar name={w.user.shortName} color={w.user.avatarColor} size={26} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3 }}>{w.user.shortName}</div>
                      <div className="load-bar">
                        <div
                          className="load-fill"
                          style={{
                            width: w.allocation + '%',
                            background: w.allocation >= 90 ? '#C0392B' : w.allocation >= 70 ? '#E0792F' : '#138A5E',
                          }}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'right' }}>{w.allocation}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
