import { connectMongoDB } from '@/libs/mongodb'
import Memo from '@/models/memo'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    await connectMongoDB()

    // 더 자세한 요청 데이터 로깅
    const requestData = await request.json()
    console.log('받은 데이터 (전체):', JSON.stringify(requestData, null, 2))

    const { title, content, author } = requestData

    // 각 필드의 타입 확인
    console.log('필드 타입:', {
      title: typeof title,
      content: typeof content,
      author: typeof author,
    })

    if (!title || !content || !author) {
      console.log('필수 필드 누락:', { title, content, author })
      return NextResponse.json(
        { message: '제목, 내용, 작성자는 필수 항목입니다.' },
        { status: 400 }
      )
    }

    console.log('Memo 생성 시도...')
    const newMemo = await Memo.create({
      title,
      content,
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log('Memo 생성 성공:', newMemo)

    return NextResponse.json(
      { message: 'Memo created successfully', memo: newMemo },
      { status: 201 }
    )
  } catch (_error) {
    return new Response('Error occurred', { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB()

    // URL에서 사용자 정보 가져오기
    const { searchParams } = new URL(request.url)
    const author = searchParams.get('author')

    // author가 있는 경우 해당 사용자의 메모만 조회
    const memos = author
      ? await Memo.find({ author }).sort({ createdAt: -1 })
      : await Memo.find().sort({ createdAt: -1 })

    return NextResponse.json({ memos })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch memos' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongoDB()

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      // id가 없으면 전체 삭제
      await Memo.deleteMany({})
      return NextResponse.json({ message: 'All memos deleted' })
    }

    // id가 있으면 해당 메모만 삭제
    const deletedMemo = await Memo.findByIdAndDelete(id)
    if (!deletedMemo) {
      return NextResponse.json({ message: 'Memo not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Memo deleted' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete memos' },
      { status: 500 }
    )
  }
}
