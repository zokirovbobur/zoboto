import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [projects, users, departments] = await Promise.all([
      db.project.findMany({ select: { status: true, riskLevel: true, demoReady: true, endDate: true } }),
      db.user.count(),
      db.department.count(),
    ])

    const now = new Date()

    const summary = {
      total: projects.length,
      completed: projects.filter(p => p.status === 'COMPLETED').length,
      inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
      planned: projects.filter(p => p.status === 'PLANNED').length,
      paused: projects.filter(p => p.status === 'PAUSED').length,
      overdue: projects.filter(
        p =>
          p.endDate &&
          p.endDate < now &&
          p.status !== 'COMPLETED' &&
          p.status !== 'PAUSED',
      ).length,
      demoReady: projects.filter(p => p.demoReady).length,
      highRisk: projects.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length,
      totalEmployees: users,
      departments,
    }

    return NextResponse.json({ data: summary })
  } catch (err) {
    console.error('[dashboard/summary]', err)
    return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 })
  }
}
