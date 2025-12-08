// ============================================================================
// 1. UPDATE: src/components/Navbar.jsx
// ============================================================================
import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg border-b-2 border-purple-500">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-pink-400 transition">
          🛰️ AstroKosh
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="text-gray-300 hover:text-cyan-400 transition font-medium">
            Home
          </Link>
          <Link to="/upload" className="text-gray-300 hover:text-purple-400 transition font-medium">
            Upload
          </Link>
          <Link to="/search" className="text-gray-300 hover:text-yellow-400 transition font-medium">
            Search
          </Link>
          <Link to="/qa" className="text-gray-300 hover:text-pink-400 transition font-medium">
            Q&A
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar