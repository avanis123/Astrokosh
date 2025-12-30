import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function PageViewer() {
  const { mission } = useParams()
  const { data: missionData, loading: missionLoading } = useFetch(
    apiEndpoints.missionSummary(mission)
  )
  const [currentPage, setCurrentPage] = useState(1)
  const canvasRef = useRef(null)

  const pageCount = missionData?.pages_count || 0
  const pages = missionData?.pages || []

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

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)))
  }

  if (missionLoading) return <Loader />

  if (!missionData || pageCount === 0) {
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
              <h3 className="text-[#DDDDDD] font-bold text-lg mb-1">NO DATA</h3>
              <p className="text-[#DDDDDD]/70">No pages available</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const pageContent = pages[currentPage - 1] || ''
  const progressPercentage = (currentPage / pageCount) * 100

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-[#30475E] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#F05454] rounded-full opacity-5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#30475E]/20 to-[#F05454]/20 border border-[#30475E]/50 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Document Scanner</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-2 leading-tight">
            <span className="text-[#DDDDDD]">PAGE</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]"> VIEWER</span>
          </h1>
          <p className="text-[#DDDDDD]/60 text-lg">
            <span className="text-[#F05454] font-bold">{mission}</span> • Navigating mission document pages
          </p>
        </div>

        {/* Controls Panel */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-6 border border-[#30475E] shadow-2xl overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F05454] rounded-full opacity-5 blur-3xl"></div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#30475E]/50 to-[#222831]/50 text-[#DDDDDD] py-4 px-6 rounded-xl font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-[#30475E]/50 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 border border-[#30475E]/50 hover:border-[#F05454]/50"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {/* Page Counter */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[#DDDDDD]/50 font-bold uppercase text-sm tracking-wider">Page</span>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={currentPage}
                    onChange={(e) => handlePageChange(parseInt(e.target.value))}
                    className="w-20 px-4 py-3 bg-[#222831] border-2 border-[#30475E] rounded-xl text-center font-black text-2xl text-[#F05454] focus:outline-none focus:border-[#F05454] transition-all"
                  />
                  <span className="text-[#DDDDDD]/50 font-bold">
                    of <span className="text-[#DDDDDD] font-black text-xl">{pageCount}</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md">
                  <div className="relative w-full bg-[#222831] rounded-full h-2 overflow-hidden border border-[#30475E]">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F05454] to-[#30475E] rounded-full transition-all duration-500 shadow-lg shadow-[#F05454]/50"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[#DDDDDD]/30 text-xs font-mono uppercase">Start</span>
                    <span className="text-[#F05454] text-xs font-mono font-bold">{Math.round(progressPercentage)}%</span>
                    <span className="text-[#DDDDDD]/30 text-xs font-mono uppercase">End</span>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#F05454] to-[#F05454]/80 text-white py-4 px-6 rounded-xl font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-[#F05454]/50 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 border-2 border-[#F05454] overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
                <span className="relative z-10">Next</span>
                <svg className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Page Content Card */}
        <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl border border-[#30475E] shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="relative bg-gradient-to-r from-[#30475E] to-[#30475E]/80 px-8 py-6 border-b border-[#30475E]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[#DDDDDD] font-black text-xl uppercase tracking-tight">
                    Page {currentPage} Content
                  </h2>
                  <p className="text-[#DDDDDD]/50 text-sm font-mono">{pageContent.length.toLocaleString()} characters</p>
                </div>
              </div>

              {/* Page info badges */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-[#222831]/50 rounded-lg border border-[#30475E]/50">
                  <span className="text-[#F05454] font-black text-lg">{currentPage}</span>
                  <span className="text-[#DDDDDD]/50 text-sm">/{pageCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative p-8">
            {/* Background gradient */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#30475E] rounded-full opacity-10 blur-3xl"></div>
            
            <div className="relative bg-[#222831]/80 backdrop-blur-sm rounded-xl border border-[#30475E]/30 p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
              {pageContent ? (
                <pre className="text-[#DDDDDD]/90 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {pageContent}
                </pre>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 flex items-center justify-center border border-[#30475E]/30">
                      <svg className="w-10 h-10 text-[#DDDDDD]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#DDDDDD]/50 uppercase tracking-wider text-sm font-bold">No content available for this page</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="relative bg-gradient-to-r from-[#222831] to-[#30475E]/50 px-8 py-4 border-t border-[#30475E]/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
                  <span className="text-[#DDDDDD]/50 uppercase tracking-wider text-xs font-mono">Scanning Active</span>
                </div>
                <div className="text-[#DDDDDD]/50 font-mono">
                  Lines: <span className="text-[#DDDDDD] font-bold">{pageContent.split('\n').length}</span>
                </div>
                <div className="text-[#DDDDDD]/50 font-mono">
                  Words: <span className="text-[#DDDDDD] font-bold">{pageContent.split(/\s+/).filter(w => w.length > 0).length}</span>
                </div>
              </div>
              <div className="text-[#DDDDDD]/50 font-mono text-xs uppercase tracking-wider">
                Mission: <span className="text-[#F05454] font-bold">{mission}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="group relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 text-[#DDDDDD] py-3 px-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#30475E]/30 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 border border-[#30475E]/50 hover:border-[#F05454]/50"
          >
            <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            First
          </button>

          <button
            onClick={() => handlePageChange(Math.floor(pageCount / 3))}
            className="group relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 text-[#DDDDDD] py-3 px-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#30475E]/30 hover:scale-105 border border-[#30475E]/50 hover:border-[#F05454]/50"
          >
            <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            1/3
          </button>

          <button
            onClick={() => handlePageChange(Math.floor((pageCount * 2) / 3))}
            className="group relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 text-[#DDDDDD] py-3 px-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#30475E]/30 hover:scale-105 border border-[#30475E]/50 hover:border-[#F05454]/50"
          >
            <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            2/3
          </button>

          <button
            onClick={() => handlePageChange(pageCount)}
            disabled={currentPage === pageCount}
            className="group relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 text-[#DDDDDD] py-3 px-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#30475E]/30 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 border border-[#30475E]/50 hover:border-[#F05454]/50"
          >
            <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Last
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        .animate-gradient {
          animation: gradient 5s ease infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #222831;
          border-radius: 10px;
          border: 1px solid rgba(48, 71, 94, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #F05454, #30475E);
          border-radius: 10px;
          border: 2px solid #222831;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #F05454, #F05454);
        }
      `}</style>
    </div>
  )
}

export default PageViewer