import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function PageViewer() {
  const { mission } = useParams()
  const { data: missionData, loading: missionLoading } = useFetch(
    apiEndpoints.missionSummary(mission)
  )
  const [currentPage, setCurrentPage] = useState(1)

  const pageCount = missionData?.pages_count || 0
  const pages = missionData?.pages || []

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)))
  }

  if (missionLoading) return <Loader />

  if (!missionData || pageCount === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No pages available
      </div>
    )
  }

  const pageContent = pages[currentPage - 1] || ''

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-300 mb-6">Page Viewer - {mission}</h1>

      {/* Controls */}
      <div className="bg-gray-700 rounded-lg shadow-md p-4 mb-6 flex gap-4 items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex-1 flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={pageCount}
            value={currentPage}
            onChange={(e) => handlePageChange(parseInt(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded text-center"
          />
          <span className="text-gray-200">of {pageCount}</span>
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
          className="bg-gray-400 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* Page Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="bg-gray-300 p-6 rounded border border-gray-200 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed max-h-96 overflow-y-auto">
          {pageContent || 'No content available for this page'}
        </div>
      </div>
    </div>
  )
}

export default PageViewer