import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function InstrumentInsights() {
  const { mission, name } = useParams()
  const { data: instrumentData, loading, error } = useFetch(
    apiEndpoints.instrumentDetails(mission, decodeURIComponent(name))
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
    const particleCount = 80

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
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

  if (error || !instrumentData) {
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
                <h3 className="text-[#DDDDDD] font-black text-2xl mb-2 uppercase tracking-tight">ERROR</h3>
                <p className="text-[#DDDDDD]/70 text-lg">{error || 'Instrument not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const pagesMentioned = instrumentData.pages_mentioned?.length || 0
  const measurementsCount = instrumentData.measurements?.length || 0

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-[#30475E] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#F05454] rounded-full opacity-5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#30475E]/20 to-[#F05454]/20 border border-[#30475E]/50 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Instrument Analysis</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[#F05454] animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-2xl border border-[#30475E] animate-pulse"></div>
              
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
                  {decodeURIComponent(name)}
                </span>
              </h1>
              <p className="text-[#DDDDDD]/60 text-lg">
                <span className="text-[#F05454] font-bold">{mission}</span> • Deep Hardware Analysis
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Pages Mentioned Card */}
          <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] shadow-xl overflow-hidden group hover:border-[#F05454] transition-all duration-500">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#30475E] rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#30475E] to-[#30475E]/70 flex items-center justify-center shadow-lg shadow-[#30475E]/50 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              <p className="text-[#DDDDDD]/50 uppercase text-sm tracking-wider font-bold mb-2">Pages Mentioned</p>
              <p className="text-5xl font-black text-[#DDDDDD] group-hover:text-[#30475E] transition-colors">
                {pagesMentioned}
              </p>
            </div>
          </div>

          {/* Measurements Card */}
          <div className="relative bg-gradient-to-br from-[#F05454]/20 to-[#222831] rounded-2xl p-8 border border-[#F05454]/50 shadow-xl overflow-hidden group hover:border-[#F05454] transition-all duration-500">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F05454] rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F05454] to-[#F05454]/70 flex items-center justify-center shadow-lg shadow-[#F05454]/50 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              <p className="text-[#DDDDDD]/50 uppercase text-sm tracking-wider font-bold mb-2">Measurements</p>
              <p className="text-5xl font-black text-[#DDDDDD] group-hover:text-[#F05454] transition-colors">
                {measurementsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Pages Mentioned Section */}
        {instrumentData.pages_mentioned && instrumentData.pages_mentioned.length > 0 && (
          <div className="mb-12">
            <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl border border-[#30475E] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#30475E] to-[#30475E]/80 px-8 py-6 border-b border-[#30475E]/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#30475E] to-[#30475E]/70 flex items-center justify-center shadow-lg shadow-[#30475E]/50">
                    <svg className="w-6 h-6 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[#DDDDDD] font-black text-2xl uppercase tracking-tight">Pages Mentioned</h2>
                    <p className="text-[#DDDDDD]/50 text-sm font-mono">{pagesMentioned} page{pagesMentioned !== 1 ? 's' : ''} detected</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {instrumentData.pages_mentioned.map((page, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-gradient-to-br from-[#222831] to-[#30475E]/30 rounded-xl p-6 border border-[#30475E]/30 hover:border-[#F05454]/50 transition-all duration-300 text-center hover:scale-110 animate-slideIn"
                      style={{ animationDelay: `${idx * 0.03}s` }}
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>
                      
                      <div className="relative">
                        <p className="text-[#DDDDDD]/50 uppercase text-xs tracking-wider font-bold mb-2">Page</p>
                        <p className="text-3xl font-black text-[#DDDDDD] group-hover:text-[#F05454] transition-colors">
                          {page}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Measurements Section */}
        {instrumentData.measurements && instrumentData.measurements.length > 0 && (
          <div>
            <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl border border-[#30475E] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#30475E] to-[#30475E]/80 px-8 py-6 border-b border-[#30475E]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#F05454]/70 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-[#DDDDDD] font-black text-2xl uppercase tracking-tight">Extracted Measurements</h2>
                      <p className="text-[#DDDDDD]/50 text-sm font-mono">{measurementsCount} measurement{measurementsCount !== 1 ? 's' : ''} found</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#222831]/50 border border-[#30475E]/50">
                    <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
                    <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wide">Active</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {instrumentData.measurements.map((meas, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-gradient-to-br from-[#222831]/80 to-[#30475E]/30 rounded-xl p-6 border-l-4 border-[#F05454] hover:border-[#F05454] hover:shadow-lg hover:shadow-[#F05454]/20 transition-all duration-300 animate-slideIn"
                      style={{ animationDelay: `${idx * 0.02}s` }}
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>
                      
                      <div className="relative flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#F05454]/20 flex items-center justify-center border border-[#F05454]/30 group-hover:border-[#F05454]/50 transition-colors">
                          <span className="text-[#F05454] font-black text-sm">#{idx + 1}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-[#DDDDDD] font-mono text-base leading-relaxed group-hover:text-[#F05454] transition-colors break-words">
                            {meas}
                          </p>
                        </div>

                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#30475E]/30 flex items-center justify-center border border-[#30475E]/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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

export default InstrumentInsights