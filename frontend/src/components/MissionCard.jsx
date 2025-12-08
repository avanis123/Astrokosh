import React from 'react'
import { Link } from 'react-router-dom'

function MissionCard({ mission }) {
  if (!mission) return null

  return (
    <div className="bg-gray-400 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{mission.mission}</h3>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">File:</span> {mission.file_name}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Pages:</span> {mission.pages_count || 'N/A'}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        <span className="font-medium">Tables:</span> {mission.tables?.length || 0}
      </p>
      <div className="flex gap-3">
        <Link
          to={`/dashboard/${mission.mission}`}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition"
        >
          View Mission
        </Link>
        <Link
          to={`/instruments/${mission.mission}`}
          className="flex-1 bg-gray-300 text-gray-900 py-2 px-4 rounded text-center hover:bg-gray-300 transition"
        >
          Instruments
        </Link>
      </div>
    </div>
  )
}

export default MissionCard