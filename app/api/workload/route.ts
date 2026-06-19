import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
        workloadRecords: {
          include: {
            project: { select: { id: true, name: true, status: true, product: true } },
          },
        },
        _count: { select: { managedProjects: true, teamMemberships: true } },
      },
      orderBy: { name: 'asc' },
    })

    const enriched = users.map(u => {
      const total = u.workloadRecords.length
      const totalAlloc = u.workloadRecords.reduce((s, r) => s + r.allocation, 0)
      const avgAlloc = total ? Math.round(totalAlloc / total) : 0
      const loadLevel =
        avgAlloc >= 90 ? 'critical' : avgAlloc >= 70 ? 'high' : avgAlloc >= 40 ? 'normal' : 'low'
      return { ...u, avgAlloc, loadLevel, totalProjects: total }
    })

    return NextResponse.json({ data: enriched })
  } catch (err) {
    console.error('[GET /api/workload]', err)
    return NextResponse.json({ error: 'Failed to load workload' }, { status: 500 })
  }
}
