import { db } from '@/lib/db'
import { ProjectsClient } from './ProjectsClient'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const [projects, departments, users] = await Promise.all([
    db.project.findMany({
      include: {
        manager: { select: { id: true, shortName: true, avatarColor: true } },
        department: { select: { id: true, name: true } },
        _count: { select: { tasks: true, teamMembers: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    db.department.findMany({ orderBy: { name: 'asc' } }),
    db.user.findMany({
      where: { role: { in: ['PROJECT_MANAGER', 'PMO', 'ADMIN'] } },
      orderBy: { name: 'asc' },
    }),
  ])

  const products = [...new Set(projects.map(p => p.product))].sort()

  return (
    <ProjectsClient
      projects={projects as never}
      departments={departments}
      managers={users}
      products={products}
    />
  )
}
