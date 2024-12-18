'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import MemoList from '@/components/MemoList'
import { Memo } from '@/types/memo'

export default function MemoPage() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [userData, setUserData] = useState<any>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        console.log('Fetched user data:', data)
        console.log('User name:', data?.user?.name)
        setUserData(data)
      } catch (error) {
        console.error('사용자 데이터를 불러오는데 실패했습니다:', error)
      }
    }

    if (session?.user?.email) {
      fetchUserData()
    }
  }, [session])

  useEffect(() => {
    const fetchMemos = async () => {
      try {
        const response = await fetch(
          `/api/memos?author=${encodeURIComponent(session?.user?.name || '')}`
        )
        const data = await response.json()
        const memoArray = Array.isArray(data) ? data : data.memos || []
        setMemos(memoArray)
      } catch (error) {
        console.error('메모를 불러오는데 실패했습니다:', error)
        setMemos([])
      }
    }

    if (session?.user?.name) {
      fetchMemos()
    }
  }, [session])

  console.log('Rendering with userData:', userData)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {userData?.name ? (
              <>
                <span className="text-[#77ba4b]">{userData.name}</span>
                <span className="text-gray-700">님의 영화 기록장</span>
              </>
            ) : (
              '영화 기록장'
            )}
          </h1>
          <p className="text-gray-600 text-sm">
            소중한 영화 감상을 기록해보세요
          </p>
        </div>

        <div className="grid gap-6">
          <MemoList memos={memos} />
        </div>
      </div>
    </div>
  )
}
