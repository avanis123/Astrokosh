import React, { useState } from 'react'

function SearchBar({ onSearch, placeholder = "Search...", isLoading = false }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default SearchBar