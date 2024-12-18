// src/app/movie/[id]/page.tsx
import React from 'react'
import Image from 'next/image'

interface MovieDetail {
  id: number
  title: string
  overview: string
  release_date: string
  vote_average: number
  poster_path: string
}

export default async function MoviePage({
  params,
}: {
  params: { id: string }
}) {
  const apiKey = process.env.NEXT_PUBLIC_MOVIE_API_KEY

  // params를 비동기적으로 가져오기
  const { id } = await params

  // TMDB API 호출
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ko-KR`,
    { next: { revalidate: 60 } } // 캐시 재검증 (60초)
  )

  if (!response.ok) {
    console.error('Failed to fetch movie:', response.statusText)
    return (
      <div className="text-center mt-20 text-gray-600">
        영화를 불러올 수 없습니다. 다시 시도해주세요.
      </div>
    )
  }

  const movie: MovieDetail = await response.json()

  // TMDB API 호출 (OTT 정보 추가)
  const providersResponse = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apiKey}&language=ko-KR`
  )

  if (!providersResponse.ok) {
    console.error('Failed to fetch providers:', providersResponse.statusText)
    return (
      <div className="text-center mt-20 text-gray-600">
        OTT 정보를 불러올 수 없습니다. 다시 시도해주세요.
      </div>
    )
  }

  const providersData = await providersResponse.json()
  const ottProviders = providersData.results?.KR?.flatrate || [] // 한국의 OTT 서비스 목록

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start">
        {/* 영화 포스터 */}
        <div className="md:w-1/3 mb-6 md:mb-0">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            width={500}
            height={300}
            layout="responsive"
          />
        </div>
        {/* 영화 정보 */}
        <div className="md:w-2/3 md:pl-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {movie.title}
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            개봉일: {movie.release_date}
          </p>
          <p className="text-lg text-gray-600 mb-4">
            평점: {movie.vote_average.toFixed(1)}
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800 mb-2">
            줄거리
          </h2>
          <p className="mt-2 text-gray-700 mb-4">{movie.overview}</p>
          {/* OTT 서비스 정보 */}
          {ottProviders.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                상영 OTT 서비스
              </h2>
              <ul className="mt-2 flex flex-wrap">
                {ottProviders
                  .reduce(
                    (
                      acc: { provider_name: string; logo_path: string }[],
                      provider: { provider_name: string; logo_path: string }
                    ) => {
                      const existing = acc.find(
                        (item) => item.provider_name === provider.provider_name
                      )
                      if (!existing) {
                        acc.push(provider)
                      }
                      return acc
                    },
                    []
                  )
                  .map(
                    (provider: {
                      provider_name: string
                      logo_path: string
                    }) => (
                      <li
                        key={provider.provider_name}
                        className="mr-4 mb-2 text-center"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="h-10 mb-1"
                        />
                        <span className="text-sm text-gray-700">
                          {provider.provider_name}
                        </span>
                      </li>
                    )
                  )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 리뷰 섹션 추가 */}
      <div className="mt-12"></div>
    </div>
  )
}
