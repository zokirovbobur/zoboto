import { db } from '@/lib/db'
import { WorkloadClient } from './WorkloadClient'

export const dynamic = 'force-dynamic'

export default async function WorkloadPage() {
  const users = await db.user.findMany({
    include: {
      department: { select: { id: true, name: true, code: true } },
      managedProjects: {
        select: { id: true, name: true, status: true, product: true },
        where: { status: { in: ['IN_PROGRESS', 'PLANNED'] } },
      },
      teamMemberships: {
        include: { project: { select: { id: true, name: true, status: true, product: true } } },
        where: { project: { status: { in: ['IN_PROGRESS', 'PLANNED'] } } },
      },
      workloadRecords: {
        include: { project: { select: { id: true, name: true, status: true, product: true } } },
      },
    },
    orderBy: { name: 'asc' },
  })

  return <WorkloadClient users={users as never} />
}
