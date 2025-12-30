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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
  <div className="max-w-4xl mx-auto">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Missions</h1>

      {!missions || missions.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No missions uploaded yet. <a href="/upload" className="underline">Upload a PDF</a> to get started.
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
    </div>
  )
}

export default Missions