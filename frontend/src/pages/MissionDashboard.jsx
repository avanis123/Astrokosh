import React, { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function MissionDashboard() {
  const { mission } = useParams()
  const { data: missionData, loading, error } = useFetch(
    apiEndpoints.missionSummary(mission)
  )
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = []
    const particleCount = 50

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5
      })
    }

    function animate() {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(240, 84, 84, 0.3)'
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="min-h-screen bg-[#222831] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#F05454]/20 to-[#F05454]/10 border-l-4 border-[#F05454] rounded-xl p-6 max-w-lg backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F05454]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-[#DDDDDD] font-bold text-lg mb-1">ERROR</h3>
              <p className="text-[#DDDDDD]/70">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!missionData) {
    return (
      <div className="min-h-screen bg-[#222831] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#F05454]/20 to-[#F05454]/10 border-l-4 border-[#F05454] rounded-xl p-6 max-w-lg backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F05454]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-[#DDDDDD] font-bold text-lg mb-1">NOT FOUND</h3>
              <p className="text-[#DDDDDD]/70">Mission not found</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tableCount = missionData.tables?.length || 0
  const pageCount = missionData.pages_count || 0
  const instrumentCount = missionData.instruments?.length || 0

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#F05454] rounded-full opacity-5 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-[#30475E] rounded-full opacity-10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Mission Header - Hero Style */}
        <div className="mb-12">
          <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-3xl p-12 border border-[#F05454]/30 shadow-2xl shadow-[#F05454]/20 overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F05454] rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#30475E] rounded-full opacity-20 blur-3xl"></div>
            
            {/* Animated border */}
            <div className="absolute inset-0 border-2 border-[#F05454]/20 rounded-3xl animate-pulse"></div>

            <div className="relative">
              {/* Mission badge */}
              <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 rounded-full bg-[#F05454]/20 border border-[#F05454]/50 backdrop-blur-sm">
                <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
                <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Mission Active</span>
                <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>

              {/* Mission name with glitch effect */}
              <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DDDDDD] via-[#F05454] to-[#DDDDDD] animate-gradient bg-[length:200%_auto]">
                  {mission}
                </span>
              </h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  }
                  label="File Name"
                  value={missionData.file_name}
                  color="F05454"
                />
                <StatCard
                  icon={
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                    </svg>
                  }
                  label="Pages"
                  value={pageCount}
                  color="30475E"
                />
                <StatCard
                  icon={
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  }
                  label="Instruments"
                  value={instrumentCount}
                  color="F05454"
                />
                <StatCard
                  icon={
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5z" clipRule="evenodd" />
                    </svg>
                  }
                  label="Tables"
                  value={tableCount}
                  color="30475E"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        {missionData.metadata && Object.keys(missionData.metadata).length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                <svg className="w-6 h-6 text-[#DDDDDD]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-[#DDDDDD] uppercase tracking-tight">Document Intel</h2>
            </div>

            <div className="bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 rounded-2xl p-8 border border-[#30475E]/50 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(missionData.metadata).map(([key, value]) => (
                  <div key={key} className="bg-[#222831]/50 rounded-xl p-4 border border-[#30475E]/30 hover:border-[#F05454]/50 transition-all group">
                    <p className="text-[#DDDDDD]/50 uppercase text-xs tracking-wider mb-2 font-bold">{key}</p>
                    <p className="text-[#DDDDDD] font-semibold group-hover:text-[#F05454] transition-colors">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Access Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50">
              <svg className="w-6 h-6 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-[#DDDDDD] uppercase tracking-tight">Quick Access</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAccessCard
            to={`/instruments/${mission}`}
            icon="🔧"
            title={`${instrumentCount} INSTRUMENTS`}
            description="View all mission instruments"
            color="F05454"
          />
          
          <QuickAccessCard
            to={`/phases/${mission}`}
            icon="📅"
            title="MISSION PHASES"
            description="Timeline & mission phases"
            color="30475E"
          />
          
          <QuickAccessCard
            to={`/tables/${mission}`}
            icon="📊"
            title={`${tableCount} DATA TABLES`}
            description="Scientific data tables"
            color="F05454"
          />
          
          <QuickAccessCard
            to={`/entities/${mission}`}
            icon="🏷️"
            title="ENTITIES"
            description="People, dates, locations"
            color="30475E"
          />
          
          <QuickAccessCard
            to={`/pages/${mission}`}
            icon="📄"
            title={`${pageCount} PAGES`}
            description="View raw document text"
            color="F05454"
          />
          
          <QuickAccessCard
            to={`/search?mission=${mission}`}
            icon="🔍"
            title="SEARCH"
            description="Search within mission data"
            color="30475E"
          />
        </div>
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

// Stat Card Component
function StatCard({ icon, label, value, color }) {
  return (
    <div className="group relative bg-gradient-to-br from-[#222831]/80 to-[#30475E]/50 rounded-2xl p-6 border border-[#30475E]/50 hover:border-[#F05454]/50 transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br from-[#${color}]/0 to-[#${color}]/10 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className="relative">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#${color}]/20 text-[#${color}] mb-3 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="text-[#DDDDDD]/50 text-xs uppercase tracking-wider font-bold mb-2">{label}</p>
        <p className="text-[#DDDDDD] font-bold text-lg truncate group-hover:text-[#F05454] transition-colors">
          {typeof value === 'number' ? value : value}
        </p>
      </div>

      <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-[#${color}] rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity`}></div>
    </div>
  )
}

// Quick Access Card Component
function QuickAccessCard({ to, icon, title, description, color }) {
  return (
    <Link
      to={to}
      className="group relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#F05454]/30 overflow-hidden"
    >
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#${color}]/0 to-[#${color}]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Content */}
      <div className="relative">
        <div className="text-5xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
          {icon}
        </div>

        <h3 className="text-xl font-black text-[#DDDDDD] mb-3 uppercase tracking-tight">{title}</h3>
        <p className="text-[#DDDDDD]/60 text-sm leading-relaxed mb-6">{description}</p>

        <div className="flex items-center text-[#F05454] font-bold text-sm group-hover:translate-x-2 transition-transform uppercase tracking-wide">
          ACCESS
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      {/* Corner glow effect */}
      <div className={`absolute -bottom-12 -right-12 w-32 h-32 bg-[#${color}] rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity`}></div>
      
      {/* Animated border */}
      <div className="absolute inset-0 border-2 border-[#F05454]/0 rounded-2xl group-hover:border-[#F05454]/30 transition-all"></div>
    </Link>
  )
}

export default MissionDashboard