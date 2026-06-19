import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const CreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  projectId: z.string().min(1),
  dueDate: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const tasks = await db.task.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(status ? { status: status as never } : {}),
      },
      include: {
        project: { select: { id: true, name: true, product: true } },
        assignees: { include: { user: { select: { id: true, name: true, shortName: true, avatarColor: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: tasks })
  } catch (err) {
    console.error('[GET /api/tasks]', err)
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { assigneeIds, dueDate, ...rest } = parsed.data
    const task = await db.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignees: assigneeIds?.length
          ? { create: assigneeIds.map(userId => ({ userId })) }
          : undefined,
      },
      include: { assignees: { include: { user: true } } },
    })

    return NextResponse.json({ data: task }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/tasks]', err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
