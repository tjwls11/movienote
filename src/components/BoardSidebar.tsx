import React from 'react'

interface BoardSidebarProps {
  currentCategory: string
  setCurrentCategory: (category: string) => void
}

export default function BoardSidebar({
  currentCategory,
  setCurrentCategory,
}: BoardSidebarProps) {
  const categories = ['전체글', '영화토론', '영화수다', '후기/리뷰', '스포']

  return (
    <div className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">카테고리</h2>
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setCurrentCategory(category)}
            className={`p-2 text-left rounded ${
              currentCategory === category
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
