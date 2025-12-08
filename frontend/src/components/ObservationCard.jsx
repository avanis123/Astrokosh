import React from 'react'
import { Link } from 'react-router-dom'

function ObservationCard({ obs }) {
  if (!obs) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{obs.mission}</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">File Name</p>
          <p className="font-medium text-gray-800">{obs.file_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Pages</p>
          <p className="font-medium text-gray-800">{obs.pages_count || 'N/A'}</p>
        </div>
      </div>

      {obs.instruments && obs.instruments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Instruments</h3>
          <div className="flex flex-wrap gap-2">
            {obs.instruments.map((inst, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to={`/phases/${obs.mission}`}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Phases
        </Link>
        <Link
          to={`/tables/${obs.mission}`}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Tables
        </Link>
      </div>
    </div>
  )
}

export default ObservationCard