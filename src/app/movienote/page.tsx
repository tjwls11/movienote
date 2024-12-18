import React from 'react'
import Image from 'next/image'

export default function MovieNotePage() {
  return (
    <div className="container mx-auto px-4">
      {/* 페이지 설명 섹션 */}
      <section className="py-24">
        <h2 className="text-3xl font-bold text-center mb-16">페이지 설명</h2>
        <div className="max-w-4xl mx-auto space-y-10 px-6">
          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">영화 페이지</h3>
            <Image
              src="/movie-page.jpg" // 영화 페이지 이미지 경로
              alt="영화 페이지"
              width={600}
              height={300}
              className="rounded-lg mb-4"
            />
            <p className="text-gray-700 leading-relaxed">
              영화 페이지에서는 다양한 영화 정보를 검색하고 확인할 수 있습니다.
              사용자는 원하는 영화를 쉽게 찾고, 관련 정보를 확인할 수 있습니다.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">상세 페이지</h3>
            <Image
              src="/detail-page.jpg" // 상세 페이지 이미지 경로
              alt="상세 페이지"
              width={600}
              height={300}
              className="rounded-lg mb-4"
            />
            <p className="text-gray-700 leading-relaxed">
              상세 페이지에서는 선택한 영화에 대한 자세한 정보를 제공합니다.
              줄거리, 출연진, 평점 등을 확인할 수 있습니다.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">기록 페이지</h3>
            <Image
              src="/record-page.jpg" // 기록 페이지 이미지 경로
              alt="기록 페이지"
              width={600}
              height={300}
              className="rounded-lg mb-4"
            />
            <p className="text-gray-700 leading-relaxed">
              기록 페이지에서는 사용자가 작성한 영화 메모를 관리할 수 있습니다.
              메모를 추가하고, 수정하며, 삭제할 수 있는 기능을 제공합니다.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">커뮤니티 페���지</h3>
            <Image
              src="/community-page.jpg" // 커뮤니티 페이지 이미지 경로
              alt="커뮤니티 페이지"
              width={600}
              height={300}
              className="rounded-lg mb-4"
            />
            <p className="text-gray-700 leading-relaxed">
              커뮤니티 페이지에서는 다른 사용자와 소통하고 의견을 나눌 수
              있습니다. 영화에 대한 토론과 리뷰를 공유할 수 있는 공간입니다.
            </p>
          </div>
        </div>
      </section>

      {/* MONO 캐릭터 소개 섹션 */}
      <section className="py-24">
        <h2 className="text-3xl font-bold text-center mb-16">페이지 설명</h2>
        <div className="max-w-4xl mx-auto space-y-10 px-6">
          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">영화 페이지</h3>
            <Image
              src="/movie-page.jpg" // 영화 페이지 이미지 경로
              alt="영화 페이지"
              width={600}
              height={300}
              className="rounded-lg mb-4"
            />
            <p className="text-gray-700 leading-relaxed">
              영화 페이지에서는 다양�� 영화 정보를 검색하고 확인할 수 있습니다.
              사용자는 원하는 영화를 쉽게 찾고, 관련 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 팀 프로젝트 데모 섹션 */}
      <section className="py-24">
        <h2 className="text-3xl font-bold text-center mb-16">
          팀 프로젝트 데모
        </h2>
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <Image
            src="/demo-video.jpg" // 팀 프로젝트 데모를 보여주는 이미지 경로
            alt="팀 프로젝트 데모"
            width={600}
            height={300}
            className="rounded-lg mb-4"
          />
          <p className="text-gray-700 leading-relaxed">
            아래 링크를 통해 팀 프로젝트의 데모 영상을 확인하실 수 있습니다.
          </p>
          <a
            href="https://example.com/demo-video" // 데모 영상 링크를 여기에 추가하세요
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            팀 프로젝트 데모 영상 보기
          </a>
        </div>
      </section>
    </div>
  )
}
