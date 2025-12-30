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
    <div className="min-h-screen bg-[#222831] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F05454] blur-xl opacity-50 animate-pulse"></div>
              <svg className="relative w-20 h-20 text-[#F05454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
              QUANTUM SEARCH
            </span>
          </h1>
          <p className="text-[#DDDDDD]/70 text-lg max-w-2xl mx-auto">
            Advanced multi-dimensional search across mission intelligence databases
          </p>
        </div>

        {/* Search Mode Selection */}
        <div className="relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] rounded-2xl opacity-20 blur"></div>
          <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-xl p-6 border border-[#30475E]">
            <label className="block text-sm font-black uppercase tracking-wider text-[#DDDDDD] mb-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F05454] animate-pulse"></div>
                Search Mode
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'global', label: 'Global', icon: '🌐' },
                { value: 'mission', label: 'Mission', icon: '🚀' },
                { value: 'instrument', label: 'Instrument', icon: '🛰️' },
                { value: 'pages', label: 'Pages', icon: '📄' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setMode(opt.value)
                    setResults(null)
                    setError(null)
                  }}
                  className={`
                    relative py-3 px-4 rounded-xl transition-all duration-300 font-bold uppercase text-sm
                    ${mode === opt.value
                      ? 'bg-gradient-to-br from-[#F05454] to-[#F05454]/80 text-white shadow-xl shadow-[#F05454]/50 scale-105'
                      : 'bg-[#222831] text-[#DDDDDD]/60 border border-[#30475E] hover:border-[#F05454] hover:text-[#DDDDDD]'
                    }
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">{opt.icon}</span>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Format hint for pages mode */}
        {mode === 'pages' && (
          <div className="mb-6 bg-gradient-to-br from-[#F05454]/20 to-[#F05454]/10 border border-[#F05454]/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[#F05454] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-[#F05454] text-sm uppercase tracking-wide">Format Required</p>
                <p className="text-[#DDDDDD]/80 text-sm mt-1">
                  Use format: <code className="bg-[#222831] px-2 py-1 rounded font-mono">"search_term in MISSION-NAME"</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <SearchBar
          onSearch={mode === 'pages' ? handlePageSearch : performSearch}
          placeholder={`Search by ${mode}...`}
          isLoading={loading}
        />

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-gradient-to-br from-[#F05454]/20 to-[#F05454]/10 border-2 border-[#F05454] rounded-xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[#F05454] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-[#F05454] text-sm uppercase tracking-wide mb-1">Error</p>
                <p className="text-[#DDDDDD]/90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <Loader />}

        {/* Results Display */}
        {results && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] rounded-2xl opacity-20 blur"></div>
            <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-xl p-6 border border-[#30475E]">
              {/* Pages mode results */}
              {mode === 'pages' && results.matches ? (
                <div>
                  <div className="mb-6 pb-4 border-b border-[#30475E]">
                    <h2 className="text-2xl font-black text-[#DDDDDD] uppercase mb-2">
                      Search Results
                    </h2>
                    <p className="text-[#DDDDDD]/60">
                      Query: <span className="text-[#F05454] font-bold">"{results.query}"</span> in{' '}
                      <span className="text-[#F05454] font-bold">{results.mission}</span>
                    </p>
                  </div>
                  
                  {results.matches.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto mb-4 text-[#DDDDDD]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[#DDDDDD]/60 text-lg">No matches found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {results.matches.map((match, idx) => (
                        <div
                          key={idx}
                          className="group relative bg-[#222831]/50 border-l-4 border-[#F05454] rounded-lg p-4 hover:bg-[#222831]/80 transition-all duration-300"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F05454] to-[#F05454]/50 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{match.page_number}</span>
                            </div>
                            <p className="font-black text-[#DDDDDD] uppercase text-sm tracking-wide">
                              Page {match.page_number}
                            </p>
                          </div>
                          <p className="text-[#DDDDDD]/80 text-sm leading-relaxed pl-10">{match.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : Array.isArray(results) ? (
                <div>
                  <div className="mb-6 pb-4 border-b border-[#30475E]">
                    <h2 className="text-2xl font-black text-[#DDDDDD] uppercase">
                      Found {results.length} Result{results.length !== 1 ? 's' : ''}
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    {results.map((item, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-[#222831]/50 border border-[#30475E] rounded-xl p-5 hover:border-[#F05454] hover:shadow-lg hover:shadow-[#F05454]/30 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#30475E] to-[#30475E]/50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-[#DDDDDD] text-lg mb-1">
                              {item.mission || item.name || 'Result'}
                            </p>
                            {item.file_name && (
                              <p className="text-sm text-[#DDDDDD]/60">{item.file_name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-black text-[#DDDDDD] uppercase mb-6 pb-4 border-b border-[#30475E]">
                    Result Details
                  </h2>
                  <div className="space-y-3">
                    {Object.entries(results).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-3 text-sm">
                        <span className="font-black text-[#F05454] uppercase tracking-wide min-w-[120px]">
                          {key}:
                        </span>
                        <span className="text-[#DDDDDD]/80">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 5s ease infinite;
        }
      `}</style>
    </div>
  )
}

export default Search