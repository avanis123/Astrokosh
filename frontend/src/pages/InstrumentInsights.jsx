import React from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function InstrumentInsights() {
  const { mission, name } = useParams()
  const { data: instrumentData, loading, error } = useFetch(
    apiEndpoints.instrumentDetails(mission, decodeURIComponent(name))
  )

  if (loading) return <Loader />

  if (error || !instrumentData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error || 'Instrument not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {decodeURIComponent(name)} - {mission}
      </h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-gray-600">Pages Mentioned</p>
          <p className="text-2xl font-bold text-blue-600">
            {instrumentData.pages_mentioned?.length || 0}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-sm text-gray-600">Measurements</p>
          <p className="text-2xl font-bold text-green-600">
            {instrumentData.measurements?.length || 0}
          </p>
        </div>
      </div>

      {instrumentData.pages_mentioned && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pages Mentioned</h2>
          <div className="space-y-2">
            {instrumentData.pages_mentioned.map((page, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800">Page {page}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {instrumentData.measurements && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Extracted Measurements</h2>
          <div className="space-y-2">
            {instrumentData.measurements.map((meas, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded border-l-4 border-blue-600">
                <p className="text-gray-800">{meas}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default InstrumentInsights