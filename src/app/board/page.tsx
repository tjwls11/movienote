'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface Post {
  _id: string
  title: string
  content: string
  author: string
  date: string
  categoryName: string
}

export default function Board() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/posts')
        const data = await response.json()

        if (Array.isArray(data)) {
          setPosts(data)
        } else if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts)
        } else {
          console.error('Unexpected data format:', data)
          setPosts([])
        }
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError('게시글을 불러오는데 실패했습니다.')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // 기본 레이아웃 컴포넌트
  const MainLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar categoryId={null} />
      <div className="flex-1 pl-4 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#2d5a27aa]">전체글</h1>
            {session && (
              <Link
                href="/board/add"
                className="bg-[#2d5a27aa] text-white px-6 py-3 rounded-lg 
                        hover:bg-[#2d5a27] transition-colors duration-200 
                        shadow-md"
              >
                글쓰기
              </Link>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  )

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center text-red-500 py-4">{error}</div>
      </MainLayout>
    )
  }

  if (!Array.isArray(posts)) {
    return (
      <MainLayout>
        <div className="text-center py-4">데이터 형식이 올바르지 않습니다.</div>
      </MainLayout>
    )
  }

  if (posts.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-4 bg-white border rounded-lg shadow-sm p-8">
          게시글이 없습니다.
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {posts.map((post) => (
          <Link href={`/board/post/${post._id}`} key={post._id}>
            <div className="border-b p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  {post.title}
                </h2>
                <span className="text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-gray-500">작성자: {post.author}</span>
                <span className="text-gray-500">
                  {' '}
                  | 카테고리: {post.categoryName}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </MainLayout>
  )
}
