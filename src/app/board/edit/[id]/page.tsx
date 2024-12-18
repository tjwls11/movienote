'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function EditPost() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [post, setPost] = useState({
    title: '',
    content: '',
    author: '',
  })
  const [, setIsLoading] = useState(false)

  useEffect(() => {
    const loadPost = async () => {
      if (!params.id) return

      try {
        const response = await fetch(`/api/posts/${params.id}`)
        if (!response.ok) throw new Error('게시글을 가져오는 데 실패했습니다.')
        const existingPost = await response.json()

        // 작성자 검증 부분 수정
        if (existingPost.author !== session?.user?.name) {
          alert('수정 권한이 없습니다.')
          router.push(`/board/post/${params.id}`)
          return
        }

        setPost({
          title: existingPost.title,
          content: existingPost.content,
          author: existingPost.author,
        })
      } catch (error) {
        console.error('Error loading post:', error)
        router.push('/board')
      }
    }
    loadPost()
  }, [params.id, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          author: session?.user?.name, // 현재 로그인한 사용자의 이름 전송
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || '게시글 수정에 실패했습니다')
      }

      router.push(`/board/post/${params.id}`)
    } catch (error) {
      console.error('Error updating post:', error)
      alert(
        error instanceof Error ? error.message : '게시글 수정에 실패했습니다'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">게시글 수정</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              제목
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-gray-700 font-medium mb-2"
            >
              내용
            </label>
            <textarea
              id="content"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              required
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
