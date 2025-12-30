import React from 'react'
import { Link } from 'react-router-dom'

function ObservationCard({ obs }) {
  if (!obs) return null

  return (
    <div className="group relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#F05454]/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#F05454]/50 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-[#DDDDDD]">{obs.mission}</h2>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-[#222831]/50 rounded-xl p-4 border border-[#30475E]/50">
            <p className="text-sm text-[#DDDDDD]/60 uppercase tracking-wider mb-2">File Name</p>
            <p className="font-semibold text-[#DDDDDD] break-words">{obs.file_name}</p>
          </div>
          <div className="bg-[#222831]/50 rounded-xl p-4 border border-[#30475E]/50">
            <p className="text-sm text-[#DDDDDD]/60 uppercase tracking-wider mb-2">Pages</p>
            <p className="font-semibold text-[#DDDDDD]">{obs.pages_count || 'N/A'}</p>
          </div>
        </div>

        {obs.instruments && obs.instruments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#DDDDDD] mb-4 uppercase tracking-wide">Instruments</h3>
            <div className="flex flex-wrap gap-2">
              {obs.instruments.map((inst, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-br from-[#30475E] to-[#30475E]/70 text-[#DDDDDD] px-4 py-2 rounded-lg text-sm font-medium border border-[#30475E] hover:border-[#F05454] hover:shadow-lg hover:shadow-[#F05454]/30 transition-all duration-300"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            to={`/phases/${obs.mission}`}
            className="flex-1 group/btn relative bg-gradient-to-br from-[#F05454] to-[#F05454]/80 text-white py-3 px-6 rounded-xl font-bold text-center hover:shadow-xl hover:shadow-[#F05454]/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              PHASES
              <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
          </Link>
          
          <Link
            to={`/tables/${obs.mission}`}
            className="flex-1 group/btn relative bg-gradient-to-br from-[#30475E] to-[#30475E]/80 text-[#DDDDDD] py-3 px-6 rounded-xl font-bold text-center border border-[#30475E] hover:border-[#F05454] hover:shadow-xl hover:shadow-[#30475E]/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              TABLES
              <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-[#F05454] opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
          </Link>
        </div>
      </div>

      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#F05454] rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity"></div>
    </div>
  )
}

export default ObservationCard