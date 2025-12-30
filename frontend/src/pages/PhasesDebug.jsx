import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function PhasesDebug() {
  const { mission } = useParams()
  const { data: missionData, loading: missionLoading } = useFetch(
    apiEndpoints.missionSummary(mission)
  )
  const { data: phasesData, loading: phasesLoading, error: phasesError } = useFetch(
    apiEndpoints.phases(mission)
  )
  const canvasRef = useRef(null)

  // Animated background
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 60

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5,
        alpha: Math.random() * 0.3 + 0.2
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

  if (missionLoading || phasesLoading) return <Loader />

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#30475E] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-[#F05454] rounded-full opacity-5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#30475E]/20 to-[#F05454]/20 border border-[#30475E]/50 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Developer Console</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl border-2 border-[#30475E] animate-ping opacity-20"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#30475E] to-[#222831] flex items-center justify-center border border-[#30475E]/50 shadow-lg shadow-[#30475E]/50">
                <svg className="w-10 h-10 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-black mb-2 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30475E] via-[#F05454] to-[#30475E] animate-gradient bg-[length:200%_auto]">
                  PHASES DEBUG
                </span>
              </h1>
              <p className="text-[#DDDDDD]/60 text-lg">
                <span className="text-[#F05454] font-bold">{mission}</span> • System Diagnostics
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {phasesError && (
          <div className="mb-8 bg-gradient-to-r from-[#F05454]/20 to-[#F05454]/10 border-l-4 border-[#F05454] rounded-xl p-6 backdrop-blur-sm animate-slideIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F05454]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-[#DDDDDD] font-bold text-lg mb-1 uppercase tracking-tight">API ERROR</h3>
                <p className="text-[#DDDDDD]/70 font-mono text-sm">{phasesError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Direct Phases API Response */}
        <div className="mb-8 animate-slideIn" style={{ animationDelay: '0.1s' }}>
          <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl border border-[#30475E] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#30475E] to-[#30475E]/80 px-6 py-4 border-b border-[#30475E]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F05454] to-[#F05454]/70 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[#DDDDDD] font-black text-lg uppercase tracking-tight">Direct Phases API</h2>
                    <p className="text-[#DDDDDD]/50 text-xs font-mono">GET /phases/{mission}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#222831]/50 border border-[#30475E]/50">
                  <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
                  <span className="text-[#DDDDDD] text-xs font-mono uppercase tracking-wide">200 OK</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <pre className="bg-[#222831] rounded-xl p-6 text-[#4CAF50] text-sm font-mono overflow-x-auto border border-[#30475E]/30 custom-scrollbar leading-relaxed">
{JSON.stringify(phasesData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Full Mission Data Entities */}
        <div className="mb-8 animate-slideIn" style={{ animationDelay: '0.2s' }}>
          <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl border border-[#30475E] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#30475E] to-[#30475E]/80 px-6 py-4 border-b border-[#30475E]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#30475E] to-[#30475E]/70 flex items-center justify-center shadow-lg shadow-[#30475E]/50">
                    <svg className="w-5 h-5 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[#DDDDDD] font-black text-lg uppercase tracking-tight">Mission Entities</h2>
                    <p className="text-[#DDDDDD]/50 text-xs font-mono">missionData.entities</p>
                  </div>
                </div>

                <div className="text-[#DDDDDD]/50 text-xs font-mono">
                  {missionData?.entities ? Object.keys(missionData.entities).length : 0} keys
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <pre className="bg-[#222831] rounded-xl p-6 text-[#30475E] text-sm font-mono overflow-x-auto max-h-96 border border-[#30475E]/30 custom-scrollbar leading-relaxed">
{JSON.stringify(missionData?.entities, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* All Keys in Mission Data */}
        <div className="animate-slideIn" style={{ animationDelay: '0.3s' }}>
          <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl border border-[#30475E] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#30475E] to-[#30475E]/80 px-6 py-4 border-b border-[#30475E]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F05454] to-[#F05454]/70 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[#DDDDDD] font-black text-lg uppercase tracking-tight">Schema Keys</h2>
                    <p className="text-[#DDDDDD]/50 text-xs font-mono">Object.keys(missionData)</p>
                  </div>
                </div>

                <div className="text-[#DDDDDD]/50 text-xs font-mono">
                  {missionData ? Object.keys(missionData).length : 0} properties
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {missionData && Object.keys(missionData).map((key, idx) => (
                  <div
                    key={key}
                    className="group relative bg-gradient-to-br from-[#222831] to-[#30475E]/30 rounded-xl p-4 border border-[#30475E]/30 hover:border-[#F05454]/50 transition-all duration-300 hover:scale-105 animate-slideIn"
                    style={{ animationDelay: `${0.35 + idx * 0.02}s` }}
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>
                    
                    <div className="relative flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F05454]/20 flex items-center justify-center flex-shrink-0 border border-[#F05454]/30">
                        <svg className="w-4 h-4 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[#DDDDDD] font-mono text-sm font-semibold group-hover:text-[#F05454] transition-colors truncate">
                        {key}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            transform: translateY(20px);
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
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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

export default PhasesDebug