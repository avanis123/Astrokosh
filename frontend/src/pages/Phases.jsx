import React from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function Phases() {
  const { mission } = useParams()
  const { data: phases, loading, error } = useFetch(apiEndpoints.phases(mission))

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Mission Phases
        </h1>
        <p className="text-gray-400 mb-8">{mission}</p>

        {!phases || phases.length === 0 ? (
          <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-300 px-4 py-3 rounded">
            No phases found
          </div>
        ) : (
          <div className="space-y-4">
            {phases.map((phase, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-r rounded-lg shadow-md p-6 border-l-4 transition hover:shadow-lg ${
                  idx % 3 === 0
                    ? 'from-blue-900 to-blue-800 border-blue-400 hover:shadow-blue-500/50'
                    : idx % 3 === 1
                    ? 'from-purple-900 to-purple-800 border-purple-400 hover:shadow-purple-500/50'
                    : 'from-cyan-900 to-cyan-800 border-cyan-400 hover:shadow-cyan-500/50'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-white capitalize">
                      {phase}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Phases
