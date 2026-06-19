import { db } from '@/lib/db'
import { AdminClient } from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [users, departments, statuses] = await Promise.all([
    db.user.findMany({
      include: { department: { select: { name: true } } },
      orderBy: { name: 'asc' },
    }),
    db.department.findMany({
      include: { _count: { select: { users: true, projects: true } } },
      orderBy: { name: 'asc' },
    }),
    // project status breakdown for reference
    db.project.groupBy({ by: ['status'], _count: { id: true } }),
  ])

  return <AdminClient users={users as never} departments={departments as never} projectStatusCounts={statuses} />
}
