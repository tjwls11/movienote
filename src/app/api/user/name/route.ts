import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/libs/mongodb'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: '이름이 필요합니다.' }, { status: 400 })
    }

    const db = await connectToDatabase()
    const result = await db.collection('users').findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        ...result,
        id: result._id.toString(),
      },
    })
  } catch (error) {
    console.error('이름 변경 에러:', error)
    return NextResponse.json(
      { error: '이름 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}
