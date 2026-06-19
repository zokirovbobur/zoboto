import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  product: z.string().min(1),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'PLANNED', 'PAUSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  goal: z.string().optional(),
  basis: z.string().optional(),
  customer: z.string().optional(),
  supplier: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  demoReady: z.boolean().optional(),
  jiraEpicKey: z.string().optional(),
  origin: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')
    const product = searchParams.get('product')
    const managerId = searchParams.get('managerId')
    const search = searchParams.get('search')

    const projects = await db.project.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(product ? { product } : {}),
        ...(managerId ? { managerId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { product: { contains: search, mode: 'insensitive' } },
                { customer: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        manager: { select: { id: true, name: true, shortName: true, avatarColor: true } },
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { tasks: true, teamMembers: true, updates: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ data: projects })
  } catch (err) {
    console.error('[GET /api/projects]', err)
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { startDate, endDate, ...rest } = parsed.data
    const project = await db.project.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    })

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/projects]', err)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
