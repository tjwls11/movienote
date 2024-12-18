import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { config } from '@/auth'

export async function GET() {
  try {
    const session = await getServerSession(config)

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    })
  } catch (error) {
    console.error('Profile API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
