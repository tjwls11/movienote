import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/libs/mongodb'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const db = await connectToDatabase()
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email }, { projection: { password: 0 } })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('프로필 조회 에러:', error)
    return NextResponse.json(
      { error: '사용자 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지가 필요합니다.' },
        { status: 400 }
      )
    }

    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${imageFile.type};base64,${buffer.toString(
      'base64'
    )}`

    const db = await connectToDatabase()
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const updateData: any = {
      image: base64Image,
      updatedAt: new Date(),
    }

    if (!user.originalSocialImage && session.user.image) {
      updateData.originalSocialImage = session.user.image
    }

    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { email: session.user.email },
        { $set: updateData },
        { returnDocument: 'after' }
      )

    if (!result) {
      return NextResponse.json({ error: '업데이트 실패' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...result,
        id: result._id.toString(),
        image: base64Image,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: '프로필 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const db = await connectToDatabase()
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email })

    if (!user?.originalSocialImage) {
      return NextResponse.json(
        { error: '복원할 소셜 이미지가 없습니다.' },
        { status: 400 }
      )
    }

    const result = await db.collection('users').findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          image: user.originalSocialImage,
        },
        $unset: { originalSocialImage: '' },
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json(
        { error: '프로필 복원에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        ...result,
        id: result._id.toString(),
        image: user.originalSocialImage,
      },
    })
  } catch (error) {
    console.error('Profile restore error:', error)
    return NextResponse.json(
      { error: '프로필 복원에 실패했습니다.' },
      { status: 500 }
    )
  }
}
