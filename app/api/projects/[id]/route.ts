import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const UpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  product: z.string().optional(),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'PLANNED', 'PAUSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  progress: z.number().min(0).max(100).optional(),
  goal: z.string().optional(),
  basis: z.string().optional(),
  customer: z.string().optional(),
  supplier: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  budget: z.string().optional(),
  departmentId: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
  demoReady: z.boolean().optional(),
  jiraEpicKey: z.string().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: {
        manager: true,
        department: true,
        teamMembers: { include: { user: true } },
        tasks: { include: { assignees: { include: { user: true } } }, orderBy: { createdAt: 'desc' } },
        updates: { include: { author: true }, orderBy: { createdAt: 'desc' } },
        workloadItems: { include: { user: true } },
      },
    })

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: project })
  } catch (err) {
    console.error('[GET /api/projects/:id]', err)
    return NextResponse.json({ error: 'Failed to load project' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { startDate, endDate, ...rest } = parsed.data
    const project = await db.project.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
      },
    })

    return NextResponse.json({ data: project })
  } catch (err) {
    console.error('[PATCH /api/projects/:id]', err)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.project.delete({ where: { id } })
    return NextResponse.json({ data: { deleted: true } })
  } catch (err) {
    console.error('[DELETE /api/projects/:id]', err)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
