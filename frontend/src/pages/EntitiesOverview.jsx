import React, { useState, useEffect, useRef } from 'react'
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
  const canvasRef = useRef(null)

  // Animated background
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 100

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5,
        alpha: Math.random() * 0.5 + 0.2
      })
    }

    function animate() {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(48, 71, 94, ${particle.alpha})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) return <Loader />

  if (error || !missionData) {
    return (
      <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />
        
        <div className="relative z-10 container mx-auto px-6 flex items-center justify-center min-h-[60vh]">
          <div className="bg-gradient-to-br from-[#F05454]/20 to-[#F05454]/10 border-l-4 border-[#F05454] rounded-xl p-8 max-w-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#F05454]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-[#DDDDDD] font-black text-2xl mb-2 uppercase tracking-tight">ERROR LOADING</h3>
                <p className="text-[#DDDDDD]/70 text-lg">Error loading entities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const entities = missionData.entities || {}

  const tabs = [
    { key: 'measurements', label: 'Measurements', icon: '📏', color: 'F05454' },
    { key: 'dates', label: 'Dates', icon: '📅', color: '30475E' },
    { key: 'mission_phases', label: 'Phases', icon: '🚀', color: 'F05454' },
    { key: 'coordinates', label: 'Coordinates', icon: '📍', color: '30475E' },
  ]

  const getTabData = () => {
    const data = entities[activeTab] || []
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      return [...new Set(data.flat().filter(Boolean))]
    }
    return data
  }

  const tabData = getTabData()
  const activeTabInfo = tabs.find(t => t.key === activeTab)

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-[#30475E] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#F05454] rounded-full opacity-5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#30475E]/20 to-[#F05454]/20 border border-[#30475E]/50 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Entity Extraction</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-2 leading-tight">
            <span className="text-[#DDDDDD]">EXTRACTED</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]"> ENTITIES</span>
          </h1>
          <p className="text-[#DDDDDD]/60 text-lg">
            <span className="text-[#F05454] font-bold">{mission}</span> • Neural entity recognition
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 rounded-2xl p-2 border border-[#30475E]/50 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`group relative px-6 py-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-300 overflow-hidden ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-[#F05454] to-[#F05454]/80 text-white shadow-xl shadow-[#F05454]/50 scale-105'
                      : 'bg-[#222831]/50 text-[#DDDDDD]/70 hover:text-[#DDDDDD] hover:bg-[#222831]/70 border border-[#30475E]/30'
                  }`}
                >
                  {/* Shine effect for active tab */}
                  {activeTab === tab.key && (
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  )}
                  
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-2xl">{tab.icon}</span>
                    <span className="hidden md:inline">{tab.label}</span>
                  </div>

                  {/* Active indicator */}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#30475E]/50 to-[#222831]/50 px-6 py-3 rounded-xl border border-[#30475E]/50">
              <span className="text-4xl">{activeTabInfo.icon}</span>
              <div>
                <p className="text-[#DDDDDD]/50 uppercase text-xs tracking-wider font-bold">Current Category</p>
                <p className="text-[#DDDDDD] font-black text-lg uppercase tracking-tight">{activeTabInfo.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-r from-[#F05454]/20 to-[#F05454]/10 px-6 py-3 rounded-xl border border-[#F05454]/30">
              <svg className="w-6 h-6 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-[#DDDDDD]/50 uppercase text-xs tracking-wider font-bold">Total Found</p>
                <p className="text-[#F05454] font-black text-2xl">{tabData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl border border-[#30475E] shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="relative bg-gradient-to-r from-[#30475E] to-[#30475E]/80 px-8 py-6 border-b border-[#30475E]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#${activeTabInfo.color}] to-[#${activeTabInfo.color}]/70 flex items-center justify-center shadow-lg shadow-[#${activeTabInfo.color}]/50`}>
                  <span className="text-2xl">{activeTabInfo.icon}</span>
                </div>
                <div>
                  <h2 className="text-[#DDDDDD] font-black text-xl uppercase tracking-tight">
                    {activeTabInfo.label} Data
                  </h2>
                  <p className="text-[#DDDDDD]/50 text-sm font-mono">
                    {tabData.length} {tabData.length === 1 ? 'entity' : 'entities'} extracted
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#222831]/50 border border-[#30475E]/50">
                <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
                <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wide">Active</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {!tabData || tabData.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 flex items-center justify-center border border-[#30475E]/30">
                    <svg className="w-10 h-10 text-[#DDDDDD]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-[#DDDDDD] font-black text-2xl mb-2 uppercase tracking-tight">
                  No Entities Found
                </h3>
                <p className="text-[#DDDDDD]/60 text-sm uppercase tracking-wider">
                  No entities detected for this category
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {tabData.slice(0, 50).map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-gradient-to-br from-[#222831]/80 to-[#30475E]/30 rounded-xl p-5 border border-[#30475E]/30 hover:border-[#F05454]/50 transition-all duration-300 hover:scale-[1.02] animate-slideIn"
                      style={{ animationDelay: `${idx * 0.02}s` }}
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>
                      
                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[#DDDDDD] font-bold text-base mb-1 break-words group-hover:text-[#F05454] transition-colors">
                            {String(item)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-[#30475E]/50 text-[#DDDDDD]/70 text-xs font-mono rounded uppercase tracking-wider">
                              #{idx + 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#30475E]/30 flex items-center justify-center border border-[#30475E]/50 group-hover:border-[#F05454]/50 transition-colors">
                          <svg className="w-5 h-5 text-[#DDDDDD]/50 group-hover:text-[#F05454] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {tabData.length > 50 && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#30475E]/50 to-[#222831]/50 px-6 py-3 rounded-xl border border-[#30475E]/50">
                      <svg className="w-5 h-5 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#DDDDDD]/70 font-mono text-sm">
                        +{tabData.length - 50} more entities available
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient {
          animation: gradient 5s ease infinite;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
          opacity: 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #222831;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #F05454, #30475E);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #F05454;
        }
      `}</style>
    </div>
  )
}

export default EntitiesOverview