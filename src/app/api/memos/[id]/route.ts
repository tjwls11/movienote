import { NextRequest } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import Memo from '@/models/memo'

// GET 요청 처리
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB()
    const id = params.id
    const memo = await Memo.findById(id)

    if (!memo) {
      return Response.json({ error: 'Memo not found' }, { status: 404 })
    }

    return Response.json({ memo })
  } catch (error) {
    return Response.json({ error: 'Error fetching memo' }, { status: 500 })
  }
}

// PUT 요청 처리
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB()
    const id = params.id
    const data = await request.json()

    const memo = await Memo.findByIdAndUpdate(id, data, { new: true })

    if (!memo) {
      return Response.json({ error: 'Memo not found' }, { status: 404 })
    }

    return Response.json({ message: 'Updated successfully', memo })
  } catch (error) {
    return Response.json({ error: 'Error updating memo' }, { status: 500 })
  }
}

// DELETE 요청 처리
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB()
    const id = params.id

    const memo = await Memo.findByIdAndDelete(id)

    if (!memo) {
      return Response.json({ error: 'Memo not found' }, { status: 404 })
    }

    return Response.json({ message: 'Deleted successfully' })
  } catch (error) {
    return Response.json({ error: 'Error deleting memo' }, { status: 500 })
  }
}
