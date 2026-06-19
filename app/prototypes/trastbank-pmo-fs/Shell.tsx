'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const BASE = '/prototypes/trastbank-pmo-fs'

const NAV = [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: BASE, icon: 'M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z', fill: true },
      { id: 'projects', label: 'Projects', href: `${BASE}/projects`, icon: 'M4 5h16M4 12h16M4 19h16' },
      { id: 'tasks', label: 'Task Board', href: `${BASE}/tasks`, icon: 'M4 4h4v16H4zM10 4h4v16h-4zM16 4h4v16h-4z' },
      { id: 'workload', label: 'Workload', href: `${BASE}/workload`, icon: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M18 8v6M21 11h-6' },
    ],
  },
  {
    group: 'Reports',
    items: [
      { id: 'reports', label: 'Reports', href: `${BASE}/reports`, icon: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6' },
    ],
  },
  {
    group: 'Admin',
    items: [
      { id: 'admin', label: 'Settings', href: `${BASE}/admin`, icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
    ],
  },
]

function NavIcon({ path, fill = false }: { path: string; fill?: boolean }) {
  return (
    <svg
      className="ic"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  )
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sideOpen, setSideOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('pmo_fs_theme')
    if (saved === 'dark') { setDark(true); document.documentElement.setAttribute('data-theme', 'dark') }
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    const val = next ? 'dark' : 'light'
    localStorage.setItem('pmo_fs_theme', val)
    document.documentElement.setAttribute('data-theme', val)
  }

  const activeId = () => {
    if (pathname === BASE || pathname === BASE + '/') return 'dashboard'
    for (const g of NAV) {
      for (const item of g.items) {
        if (item.id !== 'dashboard' && pathname.startsWith(item.href)) return item.id
      }
    }
    return 'dashboard'
  }

  const active = activeId()

  return (
    <div className="pmo-app">
      <div className={'sidebar-ov' + (sideOpen ? ' on' : '')} onClick={() => setSideOpen(false)} />

      <aside className={'sidebar' + (sideOpen ? ' on' : '')}>
        <div className="brand">
          <div className="brand-mark"><span>T</span></div>
          <div className="brand-txt">
            <b>Trastbank</b>
            <small>PMO Dashboard</small>
          </div>
        </div>

        <nav className="nav">
          {NAV.map(g => (
            <div className="nav-group" key={g.group}>
              <div className="nav-group-t">{g.group}</div>
              {g.items.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={'nav-item' + (active === item.id ? ' active' : '')}
                  onClick={() => setSideOpen(false)}
                >
                  <NavIcon path={item.icon} fill={item.fill} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          Full-stack PMO v1.0
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="mob-btn" onClick={() => setSideOpen(o => !o)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="search-box">
            <svg className="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
            />
          </div>

          <div className="topbar-spacer" />

          <a
            href="/prototypes/trastbank-pmo"
            className="btn btn-ghost"
            style={{ fontSize: 12, gap: 5, color: 'var(--muted)' }}
            title="Open original prototype"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            Prototype
          </a>

          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {dark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </header>

        <main className="content fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
