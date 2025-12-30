import React from 'react'
import { Link } from 'react-router-dom'

function MissionCard({ mission, index }) {
  const delay = index * 0.1 // Stagger animation

  return (
    <Link
      to={`/dashboard/${mission.mission}`}
      className="group relative block animate-slideIn"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#F05454]/30 overflow-hidden h-full">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Corner glow effect */}
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#F05454] rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity"></div>

        {/* Content */}
        <div className="relative">
          {/* Mission Icon */}
          <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
          </div>

          {/* Mission Name */}
          <h3 className="text-2xl font-black text-[#DDDDDD] mb-3 uppercase tracking-tight group-hover:text-[#F05454] transition-colors">
            {mission.mission}
          </h3>

          {/* Mission Details */}
          <div className="space-y-3 mb-6">
            {mission.file_name && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#F05454] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <p className="text-[#DDDDDD]/70 text-sm leading-relaxed truncate flex-1">
                  {mission.file_name}
                </p>
              </div>
            )}

            {mission.pages_count !== undefined && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#30475E]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                </svg>
                <p className="text-[#DDDDDD]/70 text-sm">
                  <span className="text-[#DDDDDD] font-bold">{mission.pages_count}</span> pages
                </p>
              </div>
            )}

            {mission.instruments && mission.instruments.length > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#30475E]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <p className="text-[#DDDDDD]/70 text-sm">
                  <span className="text-[#DDDDDD] font-bold">{mission.instruments.length}</span> instruments
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center text-[#F05454] font-bold text-sm group-hover:translate-x-2 transition-transform uppercase tracking-wide">
            Access Mission
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>

        {/* Animated border on hover */}
        <div className="absolute inset-0 border-2 border-[#F05454]/0 rounded-2xl group-hover:border-[#F05454]/30 transition-all pointer-events-none"></div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </Link>
  )
}

export default MissionCard