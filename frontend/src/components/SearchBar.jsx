import React, { useState } from 'react'

function SearchBar({ onSearch, placeholder = "Search missions...", isLoading = false }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative mb-8">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] rounded-2xl opacity-20 group-hover:opacity-40 blur transition-opacity duration-500"></div>
        
        <div className="relative flex gap-3 bg-gradient-to-br from-[#30475E] to-[#222831] rounded-xl p-2 border border-[#30475E] group-hover:border-[#F05454] transition-all duration-300">
          {/* Search Icon */}
          <div className="flex items-center pl-4">
            <svg 
              className="w-6 h-6 text-[#DDDDDD]/60 group-hover:text-[#F05454] transition-colors duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent text-[#DDDDDD] placeholder-[#DDDDDD]/40 px-2 py-3 focus:outline-none text-lg font-medium disabled:opacity-50"
          />

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="relative group/btn bg-gradient-to-br from-[#F05454] to-[#F05454]/80 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wide hover:shadow-xl hover:shadow-[#F05454]/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SCANNING
                </>
              ) : (
                <>
                  SEARCH
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Search hint */}
      {query.trim() && (
        <div className="absolute left-0 right-0 mt-2 px-4">
          <p className="text-[#DDDDDD]/60 text-sm">
            Press Enter or click SEARCH to initiate query
          </p>
        </div>
      )}
    </form>
  )
}

export default SearchBar