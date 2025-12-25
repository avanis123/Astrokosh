import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function MissionDashboard() {
  const { mission } = useParams()
  const { data: missionData, loading, error } = useFetch(
    apiEndpoints.missionSummary(mission)
  )

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    )
  }

  if (!missionData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Mission not found
        </div>
      </div>
    )
  }

  const tableCount = missionData.tables?.length || 0
  const pageCount = missionData.pages_count || 0
  const instrumentCount = missionData.instruments?.length || 0

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mission Overview */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg p-8 mb-8 border border-purple-500">
  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
    {mission}
  </h1>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded p-4 border border-blue-600">
      <p className="text-sm text-blue-300">File Name</p>
      <p className="font-medium text-cyan-300">{missionData.file_name}</p>
    </div>
    <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded p-4 border border-purple-600">
      <p className="text-sm text-purple-300">Pages</p>
      <p className="font-medium text-purple-200">{pageCount}</p>
    </div>
    <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 rounded p-4 border border-cyan-600">
      <p className="text-sm text-cyan-300">Instruments</p>
      <p className="font-medium text-cyan-200">{instrumentCount}</p>
    </div>
    <div className="bg-gradient-to-br from-amber-900 to-orange-800 rounded p-4 border border-amber-600">
      <p className="text-sm text-amber-300">Tables</p>
      <p className="font-medium text-yellow-200">{tableCount}</p>
    </div>
  </div>
</div>

      {/* Metadata (filtered) */}
      {missionData.metadata && Object.keys(missionData.metadata).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Document Info</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(missionData.metadata).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-gray-600 capitalize">{key}</p>
                <p className="font-medium text-gray-800 text-sm">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <h2 className="text-2xl font-bold text-gray-400 mb-6">Quick Access</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
  <Link
    to={`/instruments/${mission}`}
    className="group bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-600 hover:border-blue-400 rounded-lg p-6 hover:shadow-lg hover:shadow-blue-500/50 transition"
  >
    <div className="text-3xl mb-2 group-hover:scale-110 transition">🔧</div>
    <h3 className="font-semibold text-cyan-300">{instrumentCount} Instruments</h3>
    <p className="text-xs text-blue-300">View all instruments</p>
  </Link>

        <Link
    to={`/phases/${mission}`}
    className="group bg-gradient-to-br from-cyan-900 to-cyan-800 border border-cyan-600 hover:border-cyan-400 rounded-lg p-6 hover:shadow-lg hover:shadow-cyan-500/50 transition"
  >
    <div className="text-3xl mb-2 group-hover:scale-110 transition">📅</div>
    <h3 className="font-semibold text-cyan-300">Mission Phases</h3>
    <p className="text-xs text-cyan-300">Timeline & phases</p>
  </Link>

        <Link
    to={`/tables/${mission}`}
    className="group bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-600 hover:border-purple-400 rounded-lg p-6 hover:shadow-lg hover:shadow-purple-500/50 transition"
  >
    <div className="text-3xl mb-2 group-hover:scale-110 transition">📊</div>
    <h3 className="font-semibold text-purple-300">{tableCount} Tables</h3>
    <p className="text-xs text-purple-300">Scientific data tables</p>
  </Link>


         <Link
    to={`/entities/${mission}`}
    className="group bg-gradient-to-br from-amber-900 to-orange-800 border border-amber-600 hover:border-amber-400 rounded-lg p-6 hover:shadow-lg hover:shadow-amber-500/50 transition"
  >
    <div className="text-3xl mb-2 group-hover:scale-110 transition">🏷️</div>
    <h3 className="font-semibold text-yellow-300">Entities</h3>
    <p className="text-xs text-amber-300">People, dates, locations</p>
  </Link>

        <Link
    to={`/pages/${mission}`}
    className="group bg-gradient-to-br from-pink-900 to-rose-800 border border-pink-600 hover:border-pink-400 rounded-lg p-6 hover:shadow-lg hover:shadow-pink-500/50 transition"
  >
    <div className="text-3xl mb-2 group-hover:scale-110 transition">📄</div>
    <h3 className="font-semibold text-pink-300">{pageCount} Pages</h3>
    <p className="text-xs text-pink-300">View raw text</p>
  </Link>

          <Link
    to={`/search?mission=${mission}`}
    className="group bg-gradient-to-br from-orange-900 to-red-900 border border-orange-600 hover:border-orange-400 rounded-lg p-6 hover:shadow-lg hover:shadow-orange-500/50 transition"
  >
    <div className="text-3xl mb-2 group-hover:scale-110 transition">🔍</div>
    <h3 className="font-semibold text-orange-300">Search</h3>
    <p className="text-xs text-orange-300">Search within mission</p>
  </Link>
</div>
    </div>
  )
}

export default MissionDashboard
