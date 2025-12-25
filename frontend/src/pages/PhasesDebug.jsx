import React from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function PhasesDebug() {
  const { mission } = useParams()
  const { data: missionData, loading: missionLoading } = useFetch(
    apiEndpoints.missionSummary(mission)
  )
  const { data: phasesData, loading: phasesLoading, error: phasesError } = useFetch(
    apiEndpoints.phases(mission)
  )

  if (missionLoading || phasesLoading) return <Loader />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">Phases Debug</h1>

        {phasesError && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            Error: {phasesError}
          </div>
        )}

        <div className="bg-slate-800 border border-purple-500 rounded p-6 mb-6">
          <h2 className="text-lg font-bold text-cyan-300 mb-4">Direct Phases API Response:</h2>
          <pre className="bg-slate-900 p-4 rounded text-cyan-300 text-xs overflow-x-auto">
            {JSON.stringify(phasesData, null, 2)}
          </pre>
        </div>

        <div className="bg-slate-800 border border-purple-500 rounded p-6 mb-6">
          <h2 className="text-lg font-bold text-cyan-300 mb-4">Full Mission Data Entities:</h2>
          <pre className="bg-slate-900 p-4 rounded text-cyan-300 text-xs overflow-x-auto max-h-96">
            {JSON.stringify(missionData?.entities, null, 2)}
          </pre>
        </div>

        <div className="bg-slate-800 border border-purple-500 rounded p-6">
          <h2 className="text-lg font-bold text-cyan-300 mb-4">All Keys in Mission Data:</h2>
          <div className="space-y-2">
            {missionData && Object.keys(missionData).map((key) => (
              <div key={key} className="text-cyan-300 text-sm">
                <span className="font-mono">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhasesDebug