import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ProjectDetailClient } from './ProjectDetailClient'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await db.project.findUnique({
    where: { id },
    include: {
      manager: true,
      department: true,
      teamMembers: { include: { user: true } },
      tasks: {
        include: { assignees: { include: { user: { select: { id: true, shortName: true, avatarColor: true } } } } },
        orderBy: { createdAt: 'desc' },
      },
      updates: {
        include: { author: { select: { id: true, shortName: true, avatarColor: true } } },
        orderBy: { createdAt: 'desc' },
      },
      workloadItems: { include: { user: { select: { id: true, shortName: true, avatarColor: true, role: true } } } },
    },
  })

  if (!project) notFound()

  return <ProjectDetailClient project={project as never} />
}
