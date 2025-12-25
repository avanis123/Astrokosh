import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            AI Based Extraction from Space Mission Reports
          </h1>
          <p className="text-xl text-gray-300">
            Powered by Advanced NLP & Machine Learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Card - Deep Blue */}
          <Link
            to="/upload"
            className="group bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-8 hover:shadow-2xl hover:shadow-blue-500/50 transition transform hover:scale-105 border border-blue-700 hover:border-blue-400"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">📤</div>
            <h2 className="text-2xl font-bold text-cyan-300 mb-2">Upload PDF</h2>
            <p className="text-blue-200">Upload a mission document for processing</p>
          </Link>

          {/* View Missions Card - Cosmic Purple */}
          <Link
            to="/missions"
            className="group bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-8 hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 border border-purple-700 hover:border-purple-400"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">🔭</div>
            <h2 className="text-2xl font-bold text-purple-300 mb-2">View Missions</h2>
            <p className="text-purple-200">Browse uploaded mission data</p>
          </Link>

          {/* Search Card - Star Gold */}
          <Link
            to="/search"
            className="group bg-gradient-to-br from-amber-900 to-orange-900 rounded-lg p-8 hover:shadow-2xl hover:shadow-amber-500/50 transition transform hover:scale-105 border border-amber-700 hover:border-amber-400"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">🔎</div>
            <h2 className="text-2xl font-bold text-yellow-300 mb-2">Search</h2>
            <p className="text-amber-200">Search across missions and instruments</p>
          </Link>

          {/* Q&A Card - Nebula Pink */}
          <Link
            to="/qa"
            className="group bg-gradient-to-br from-pink-900 to-rose-900 rounded-lg p-8 hover:shadow-2xl hover:shadow-pink-500/50 transition transform hover:scale-105 border border-pink-700 hover:border-pink-400"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">💬</div>
            <h2 className="text-2xl font-bold text-pink-300 mb-2">Q&A Assistant</h2>
            <p className="text-pink-200">Ask questions about mission data</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
