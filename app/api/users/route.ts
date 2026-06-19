import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  shortName: z.string().min(1).max(60),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'TOP_MANAGER', 'PMO', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'VIEWER']).optional(),
  stack: z.string().optional(),
  grade: z.string().optional(),
  departmentId: z.string().optional(),
  avatarColor: z.string().optional(),
})

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { managedProjects: true, teamMemberships: true } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: users })
  } catch (err) {
    console.error('[GET /api/users]', err)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const user = await db.user.create({ data: parsed.data })
    return NextResponse.json({ data: user }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/users]', err)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
