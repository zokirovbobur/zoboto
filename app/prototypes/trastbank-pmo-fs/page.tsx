import { db } from '@/lib/db'
import { DashboardClient } from './DashboardClient'
import type { ProjectStatus } from '@prisma/client'

async function getSummary() {
  const [projects, totalEmployees, departments] = await Promise.all([
    db.project.findMany({
      select: { status: true, riskLevel: true, demoReady: true, endDate: true, product: true },
    }),
    db.user.count(),
    db.department.count(),
  ])

  const now = new Date()
  const byStatus: Record<string, number> = {}
  const byProduct: Record<string, Record<string, number>> = {}

  for (const p of projects) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1
    if (!byProduct[p.product]) byProduct[p.product] = { COMPLETED: 0, IN_PROGRESS: 0, PLANNED: 0, PAUSED: 0 }
    byProduct[p.product][p.status] = (byProduct[p.product][p.status] ?? 0) + 1
  }

  const overdue = projects.filter(
    p =>
      p.endDate &&
      p.endDate < now &&
      p.status !== 'COMPLETED' &&
      p.status !== 'PAUSED',
  ).length

  return {
    total: projects.length,
    completed: byStatus['COMPLETED'] ?? 0,
    inProgress: byStatus['IN_PROGRESS'] ?? 0,
    planned: byStatus['PLANNED'] ?? 0,
    paused: byStatus['PAUSED'] ?? 0,
    overdue,
    demoReady: projects.filter(p => p.demoReady).length,
    highRisk: projects.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length,
    totalEmployees,
    departments,
    byProduct: Object.entries(byProduct)
      .map(([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => {
        const sa = (a.COMPLETED + a.IN_PROGRESS + a.PLANNED + a.PAUSED)
        const sb = (b.COMPLETED + b.IN_PROGRESS + b.PLANNED + b.PAUSED)
        return sb - sa
      }),
  }
}

async function getRecentProjects() {
  return db.project.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    include: {
      manager: { select: { shortName: true, avatarColor: true } },
      department: { select: { name: true } },
    },
  })
}

export default async function DashboardPage() {
  const [summary, recent] = await Promise.all([getSummary(), getRecentProjects()])
  return <DashboardClient summary={summary} recentProjects={recent} />
}
