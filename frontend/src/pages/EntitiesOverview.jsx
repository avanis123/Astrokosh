import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function EntitiesOverview() {
  const { mission } = useParams()
  const { data: missionData, loading, error } = useFetch(
    apiEndpoints.missionSummary(mission)
  )
  const [activeTab, setActiveTab] = useState('measurements')

  if (loading) return <Loader />

  if (error || !missionData) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading entities
      </div>
    )
  }

  const entities = missionData.entities || {}

  const tabs = [
    { key: 'measurements', label: 'Measurements', icon: '📏' },
    { key: 'dates', label: 'Dates', icon: '📅' },
    { key: 'mission_phases', label: 'Phases', icon: '🚀' },
    { key: 'coordinates', label: 'Coordinates', icon: '📍' },
  ]

  const getTabData = () => {
    const data = entities[activeTab] || []
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      return [...new Set(data.flat().filter(Boolean))]
    }
    return data
  }

  const tabData = getTabData()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Extracted Entities - {mission}</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 transition ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {!tabData || tabData.length === 0 ? (
          <p className="text-gray-600">No entities found for this category</p>
        ) : (
          <div className="space-y-2">
            {tabData.slice(0, 50).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-800 font-medium">{String(item)}</span>
                <span className="text-xs text-gray-500">Entity #{idx + 1}</span>
              </div>
            ))}
            {tabData.length > 50 && (
              <p className="text-sm text-gray-600 text-center mt-4">
                ... and {tabData.length - 50} more
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EntitiesOverview
