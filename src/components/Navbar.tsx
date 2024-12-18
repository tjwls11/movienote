'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'

interface UserData {
  name?: string
  email?: string
  image?: string
}

interface Session {
  user?: UserData
}

export default function Navbar() {
  const { data: session } = useSession()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    if (session?.user?.email) {
      // 세션이 있을 때만 한 번 프로필 정보를 가져옴
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user)
          }
        })
        .catch(console.error)
    }
  }, [session]) // session이 변경될 때만 실행

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <div className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto py-4 px-8 flex items-center justify-between">
        <div className="text-[#2d5a27aa] font-mono text-2xl font-bold hover:text-[#1a3517] transition-colors">
          <Link href="/">MOVIENOTE</Link>
        </div>

        <div className="flex items-center gap-6">
          {session ? (
            <>
              <div className="flex items-center gap-4">
                <Link href="/movie" className="text-green-800 font-bold">
                  MOVIE
                </Link>
                <Link href="/board" className="text-green-800 font-bold">
                  COMMUNITY
                </Link>
                <Link href="/memo" className="text-green-800 font-bold">
                  MYNOTE
                </Link>
                <Link href="/mypage">
                  <Image
                    className="rounded-full cursor-pointer ring-2 ring-[#2d5a27] hover:ring-[#1a3517] transition-colors"
                    src={user?.image || '/default-avatar.png'}
                    width={40}
                    height={40}
                    alt={session.user?.name || 'user'}
                    priority
                  />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-[#2d5a27aa] hover:bg-[#1a3517] text-white px-6 py-2 rounded-md text-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/movie" className="text-green-800 font-bold">
                MOVIE
              </Link>
              <Link href="/board" className="text-green-800 font-bold">
                COMMUNITY
              </Link>
              <Link
                href="/login"
                className="bg-[#2d5a27aa] hover:bg-[#1a3517] text-white px-6 py-2 rounded-md text-lg font-medium transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
