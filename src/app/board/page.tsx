'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Loading from '@/components/Loading'
import Sidebar from '@/components/Sidebar'

interface Post {
  _id: string
  title: string
  content: string
  author: string
  date: string
  categoryId: number
  categoryName: string
}

const CATEGORIES = ['영화토론', '영화수다', '후기/리뷰', '스포']

export default function Board() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (isLoading)
    return (
      <div>
        <Loading pageName="게시글" />
      </div>
    )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 카테고리 사이드바 */}
      <Sidebar categoryId={null} />

      {/* 메인 컨텐츠 */}
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

          {posts.length === 0 && (
            <div className="text-center p-4 text-gray-500">
              게시글이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
