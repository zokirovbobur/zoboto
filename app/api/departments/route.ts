import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  color: z.string().optional(),
})

export async function GET() {
  try {
    const departments = await db.department.findMany({
      include: {
        _count: { select: { users: true, projects: true } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: departments })
  } catch (err) {
    console.error('[GET /api/departments]', err)
    return NextResponse.json({ error: 'Failed to load departments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const dept = await db.department.create({ data: parsed.data })
    return NextResponse.json({ data: dept }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/departments]', err)
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
  }
}
