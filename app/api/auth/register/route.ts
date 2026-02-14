import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    if (existing[0]) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    await db.insert(users).values({ email: email.toLowerCase(), passwordHash })

    return NextResponse.json({ ok: true }, { status: 201 })
}
