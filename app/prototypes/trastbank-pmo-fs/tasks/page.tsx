import { db } from '@/lib/db'
import { TaskBoardClient } from './TaskBoardClient'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    include: {
      project: { select: { id: true, name: true, product: true } },
      assignees: {
        include: { user: { select: { id: true, shortName: true, avatarColor: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <TaskBoardClient tasks={tasks as never} />
}
