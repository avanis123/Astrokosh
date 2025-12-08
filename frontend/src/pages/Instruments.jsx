import React from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function Instruments() {
  const { mission } = useParams()
  const { data: instruments, loading, error } = useFetch(apiEndpoints.instruments(mission))

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
          Instruments
        </h1>
        <p className="text-gray-400 mb-8">{mission}</p>

        {!instruments || instruments.length === 0 ? (
          <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-300 px-4 py-3 rounded">
            No instruments found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instruments.map((instrument, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md p-6 hover:shadow-lg hover:shadow-cyan-500/50 transition border border-cyan-600 hover:border-cyan-400"
              >
                <h3 className="text-lg font-semibold text-cyan-400 glow">{instrument}</h3>
                <p className="text-gray-400 text-sm mt-2">Mission Instrument</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Instruments