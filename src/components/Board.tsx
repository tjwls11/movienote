'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Post {
  id: string
  title: string
  content: string
  // 필요한 다른 필드들
}

export default function Board() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/posts')
        const data = await response.json()

        // 데이터가 배열이 아닌 경우 빈 배열로 설정
        if (!Array.isArray(data)) {
          console.warn('Received non-array data:', data)
          setPosts([])
          return
        }

        // 각 포스트 객체가 필요한 필드를 가지고 있는지 확인
        const validPosts = data.filter((post: any) => {
          return (
            post && typeof post === 'object' && 'id' in post && 'title' in post
          )
        })

        setPosts(validPosts)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError('Failed to load posts')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>
  }

  if (!posts.length) {
    return <div className="text-center py-4">No posts available</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-4">
        {Array.isArray(posts) &&
          posts.map((post) => (
            <div key={post.id} className="p-4 border rounded shadow">
              <h2 className="text-xl font-bold">{post.title}</h2>
              {post.content && <p className="mt-2">{post.content}</p>}
            </div>
          ))}
      </div>
    </div>
  )
}
