import React from 'react'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import MissionCard from '../components/MissionCard'
import { apiEndpoints } from '../utils/api'

function Missions() {
  const { data: allMissions, loading, error } = useFetch(apiEndpoints.allMissions())

  // Deduplicate missions by name (keep first occurrence)
  const missions = React.useMemo(() => {
    if (!allMissions) return []
    const seen = new Set()
    return allMissions.filter(m => {
      if (seen.has(m.mission)) return false
      seen.add(m.mission)
      return true
    })
  }, [allMissions])

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-gray-400 text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          All Missions
        </h1>
        <p className="text-gray-200 mb-8">Total: {missions.length} mission(s)</p>

        {!missions || missions.length === 0 ? (
          <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-300 px-4 py-3 rounded">
            No missions uploaded yet. <a href="/upload" className="underline hover:text-yellow-200">Upload a PDF</a> to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission, idx) => (
              <MissionCard key={idx} mission={mission} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Missions