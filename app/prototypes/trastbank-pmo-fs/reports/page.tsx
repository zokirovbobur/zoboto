import { db } from '@/lib/db'
import { ReportsClient } from './ReportsClient'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [projects, departments, users] = await Promise.all([
    db.project.findMany({
      include: {
        manager: { select: { id: true, shortName: true, avatarColor: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    db.department.findMany({ orderBy: { name: 'asc' } }),
    db.user.findMany({
      where: { role: { in: ['PROJECT_MANAGER', 'PMO', 'ADMIN'] } },
      select: { id: true, shortName: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const products = [...new Set(projects.map(p => p.product))].sort()

  return <ReportsClient projects={projects as never} departments={departments} managers={users} products={products} />
}
