'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaHistory, FaHeart, FaCamera } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import ChangeName from '@/components/ChangeName'
import Modal from '@/components/Modal'
import Loading from '@/components/Loading'

interface UserData {
  image: string
  name: string
  email: string
  createdAt?: string
}

interface Movie {
  id: number
  title: string
  poster_path: string
}

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentImage, setCurrentImage] = useState('/default-avatar.png')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]) // 최근 본 영화 상태 추가
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]) // 찜한 영화 상태 추가
  const [isModalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/profile')
          const data = await response.json()

          if (data.success) {
            setUserData(data.user)
            setCurrentImage(data.user.image)
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserInfo()
  }, [session])

  // 최근 본 영화 데이터 가져오기
  useEffect(() => {
    const fetchRecentMovies = async () => {
      try {
        const userName = session?.user?.name // 사용자 이름 가져오기
        if (!userName) {
          console.error('사용자 이름이 없습니다.') // 사용자 이름이 없을 경우 에러 로그
          return // 사용자 이름이 없으면 함수 종료
        }
        const response = await fetch(
          `/api/user/recent-movie?user=${encodeURIComponent(userName)}` // 쿼리 파라미터로 사용자 이름 전달
        )
        const data = await response.json()
        const recentMovieIds = data.movies || []

        // 최근 영화 ID로 영화 정보 가져오기
        const recentMoviePromises = recentMovieIds.map(async (id: number) => {
          const movieResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_MOVIE_API_KEY}&language=ko-KR`
          )
          return movieResponse.json()
        })

        const recentMoviesData = await Promise.all(recentMoviePromises)
        setRecentMovies(recentMoviesData)
      } catch (error) {
        console.error('최근 영화 불러오기 실패:', error)
      }
    }

    if (session?.user) {
      // 세션이 있을 때만 최근 영화 목록 불러오기
      fetchRecentMovies() // 최근 영화 목록 불러오기 호출
    }
  }, [session])

  // 찜한 영화 데이터 가져오기
  useEffect(() => {
    const fetchFavoriteMovies = async () => {
      try {
        const userName = session?.user?.name
        if (!userName) {
          console.error('사용자 이름이 없습니다.')
          return
        }
        const response = await fetch(
          `/api/user/favorites?user=${encodeURIComponent(userName)}`
        )
        const data = await response.json()
        const favoriteMovieIds = data.movies || []

        // 찜한 영화 ID로 영화 정보 가져��기
        const favoriteMoviePromises = favoriteMovieIds.map(
          async (id: number) => {
            const movieResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_MOVIE_API_KEY}&language=ko-KR`
            )
            return movieResponse.json()
          }
        )

        const favoriteMoviesData = await Promise.all(favoriteMoviePromises)
        setFavoriteMovies(favoriteMoviesData)
      } catch (error) {
        console.error('찜한 영화 불러오기 실패:', error)
      }
    }

    if (session?.user) {
      fetchFavoriteMovies()
    }
  }, [session])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append('image', file)

      try {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')

        const data = await response.json()

        if (data.success) {
          setCurrentImage(data.user.image)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('이미지 업로드에 실패했습니다.')
      }
    }
  }

  const handleMovieClick = (title: string) => {
    const moviePoster = recentMovies.find(
      (movie) => movie.title === title
    )?.poster_path
    if (moviePoster) {
      console.log(`포스터 경로: https://image.tmdb.org/t/p/w500${moviePoster}`)
    } else {
      console.log('영화를 찾을 수 없습니다.')
    }
  }

  const handleNameChange = async (newName: string) => {
    try {
      const response = await fetch('/api/user/name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })

      if (!response.ok) {
        throw new Error('이름 변경에 실패했습니다.')
      }

      const data = await response.json()

      if (data.success) {
        // 사용자 데이터 업데이트
        setUserData((prev) => {
          if (!prev) return null
          return {
            ...prev,
            name: newName,
          }
        })

        // 세션 데이터 새로고침을 위해 페이지 리로드
        router.refresh()

        alert('이름이 성공적으로 변경되었습니다.')
      } else {
        throw new Error(data.error || '이름 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error changing name:', error)
      alert(
        error instanceof Error
          ? error.message
          : '이름 변경 중 오류가 발생했습니다.'
      )
    } finally {
      setModalOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <Loading pageName="MyPage" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 사이드바: 프로필 섹션 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Image
                  src={currentImage}
                  alt="Profile"
                  width={120}
                  height={120}
                  priority
                  className="rounded-full mb-4 ring-2 ring-[#2d5a27]"
                />
                <button
                  onClick={handleImageClick}
                  className="absolute bottom-4 right-0 bg-[#2d5a27] p-2 rounded-full text-white hover:bg-[#234620] transition-colors"
                  title="프로필 이미지 변경"
                >
                  <FaCamera />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {userData?.name || session?.user?.name}
              </h2>
              <p className="text-gray-600">
                {userData?.email || session?.user?.email}
              </p>

              <div className="w-full space-y-3 mt-2">
                <div className="text-sm text-gray-600">
                  가입일:
                  {userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* 계정 관리 섹션 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">계정 관리</h3>
            <div className="space-y-3">
              <button
                className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg transition-colors"
                onClick={() => setModalOpen(true)}
              >
                이름 변경
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">내 활동</h3>
            <div className="space-y-3">
              <Link href="/memo">
                <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg transition-colors">
                  나의 영화 기록장
                </button>
              </Link>
              <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg transition-colors">
                나의 커뮤니티 기록
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg transition-colors">
                내 리뷰
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽 메인 컨텐츠 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 활동 내역 섹션들 */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                <FaHistory className="text-[#2d5a27]" /> 최근에 본 영화
              </h3>
              {/* 최근 본 영화 리스트 */}
              {recentMovies.length > 0 ? (
                <div className="flex overflow-x-auto gap-4">
                  {recentMovies.map((movie, index) => (
                    <div
                      key={`${movie.id}-${index}`}
                      className="flex-shrink-0 w-1/5 text-center" // 텍스트 중앙 정렬
                      onClick={() => handleMovieClick(movie.title)}
                    >
                      <Image
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : '/default-movie.png'
                        }
                        alt={movie.title ? movie.title : '영화 포스터'}
                        width={100}
                        height={150}
                        className="w-32 h-48 object-cover"
                      />
                      <h4 className="mt-2 text-sm font-semibold">
                        {movie.title}
                      </h4>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  최근에 본 영화가 없습니다.
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                <FaHeart className="text-[#2d5a27]" /> 찜한 영화
              </h3>
              {/* 찜한 영화 리스트 */}
              {favoriteMovies.length > 0 ? (
                <div className="flex overflow-x-auto gap-4">
                  {favoriteMovies.map((movie, index) => (
                    <div
                      key={`${movie.id}-${index}`}
                      className="flex-shrink-0 w-1/5 text-center"
                    >
                      <Image
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : '/default-movie.png'
                        }
                        alt={movie.title ? movie.title : '영화 포스터'}
                        width={100}
                        height={150}
                        className="w-32 h-48 object-cover"
                      />
                      <h4 className="mt-2 text-sm font-semibold">
                        {movie.title}
                      </h4>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  찜한 영화가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <ChangeName
          currentName={userData?.name || ''}
          onNameChange={handleNameChange}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
