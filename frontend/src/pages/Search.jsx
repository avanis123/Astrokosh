import React, { useState } from 'react'
import SearchBar from '../components/SearchBar'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function Search() {
  const [mode, setMode] = useState('global')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const performSearch = async (query) => {
    try {
      setLoading(true)
      setError(null)
      let endpoint = ''

      if (mode === 'global') {
        endpoint = apiEndpoints.searchGlobal(query)
      } else if (mode === 'mission') {
        endpoint = apiEndpoints.searchMission(query)
      } else if (mode === 'instrument') {
        endpoint = apiEndpoints.searchInstrument(query)
      }

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error(`Search failed: ${response.statusText}`)

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const performPageSearch = async (mission, query) => {
    try {
      setLoading(true)
      setError(null)
      const endpoint = apiEndpoints.searchPages(mission, query)

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error(`Search failed: ${response.statusText}`)

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePageSearch = (query) => {
    const parts = query.split(' in ')
    if (parts.length === 2) {
      performPageSearch(parts[1], parts[0])
    } else {
      setError('For page search, use format: "query in MISSION-NAME"')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Search
        </h1>
        <p className="text-gray-400 mb-8">Find missions, instruments, and data across your documents</p>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md p-6 mb-6 border border-purple-500">
          <div className="mb-6">
            <label className="block text-sm font-medium text-cyan-400 mb-3">
              Search Mode
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'global', label: 'Global' },
                { value: 'mission', label: 'Mission' },
                { value: 'instrument', label: 'Instrument' },
                { value: 'pages', label: 'Pages' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setMode(opt.value)
                    setResults(null)
                    setError(null)
                  }}
                  className={`py-2 px-4 rounded transition font-semibold ${
                    mode === opt.value
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'pages' && (
            <div className="mb-4 text-sm text-yellow-300 bg-slate-700/50 p-3 rounded border border-yellow-600">
              Format: "search_term in MISSION-NAME"
            </div>
          )}

          <SearchBar
            onSearch={mode === 'pages' ? handlePageSearch : performSearch}
            placeholder={`Search by ${mode}...`}
            isLoading={loading}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && <Loader />}

        {results && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md p-6 border border-purple-500">
            {mode === 'pages' && results.matches ? (
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-4">
                  Results for "{results.query}" in {results.mission}
                </h2>
                {results.matches.length === 0 ? (
                  <p className="text-gray-400">No matches found</p>
                ) : (
                  <div className="space-y-4">
                    {results.matches.map((match, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-700/30 p-3 rounded"
                      >
                        <p className="font-medium text-cyan-300">
                          Page {match.page_number}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">{match.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : Array.isArray(results) ? (
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-4">
                  Found {results.length} result(s)
                </h2>
                <div className="space-y-3">
                  {results.map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-purple-600 rounded p-3 hover:bg-slate-700/50 transition bg-slate-700/20"
                    >
                      <p className="font-medium text-cyan-300">
                        {item.mission || item.name || 'Result'}
                      </p>
                      {item.file_name && (
                        <p className="text-sm text-gray-400">{item.file_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                {Object.entries(results).map(([key, value]) => (
                  <p key={key} className="text-sm mb-2">
                    <span className="font-medium text-cyan-300">{key}:</span> {String(value)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search