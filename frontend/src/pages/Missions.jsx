import React, { useEffect, useRef } from 'react'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import MissionCard from '../components/MissionCard'
import { apiEndpoints } from '../utils/api'

function Missions() {
  const { data: allMissions, loading, error } = useFetch(apiEndpoints.allMissions())
  const canvasRef = useRef(null)

  // Deduplicate missions by name (keep first occurrence)
  const missions = React.useMemo(() => {
    if (!allMissions) return []
    const seen = new Set()
    return allMissions.filter(m => {
      if (seen.has(m.mission)) return false
      seen.add(m.mission)
      return true
    })
  }, [allMissions])

  // Animated background
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = []
    const starCount = 150

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.3
      })
    }

    function animate() {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        star.x += star.vx
        star.y += star.vy

        if (star.x < 0 || star.x > canvas.width) star.vx *= -1
        if (star.y < 0 || star.y > canvas.height) star.vy *= -1

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240, 84, 84, ${star.alpha})`
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />
        
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#F05454] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
        
        <div className="relative z-10 container mx-auto px-6 flex items-center justify-center min-h-[60vh]">
          <div className="bg-gradient-to-br from-[#F05454]/20 to-[#F05454]/10 border-l-4 border-[#F05454] rounded-xl p-8 max-w-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#F05454]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-[#DDDDDD] font-black text-2xl mb-2 uppercase tracking-tight">SYSTEM ERROR</h3>
                <p className="text-[#DDDDDD]/70 text-lg">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-[#F05454] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#30475E] rounded-full opacity-15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 container mx-auto px-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#F05454]/20 to-[#30475E]/20 border border-[#F05454]/30 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Mission Database</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-[#DDDDDD]">ALL</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
              MISSIONS
            </span>
          </h1>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#30475E]/50 to-[#222831]/50 px-6 py-3 rounded-xl border border-[#30475E]/50">
              <svg className="w-5 h-5 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="text-[#DDDDDD]/50 uppercase text-sm tracking-wider font-bold">Total:</span>
              <span className="text-[#F05454] font-black text-2xl">{missions.length}</span>
              <span className="text-[#DDDDDD]/50 uppercase text-sm">Mission{missions.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F05454]/10 border border-[#F05454]/30">
              <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
              <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wide">Active</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {!missions || missions.length === 0 ? (
          <div className="relative">
            <div className="bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 border border-[#F05454]/30 rounded-2xl p-12 backdrop-blur-sm text-center">
              <div className="inline-block mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F05454] blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#30475E] to-[#222831] flex items-center justify-center border border-[#30475E]/50">
                    <svg className="w-12 h-12 text-[#DDDDDD]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <h3 className="text-[#DDDDDD] font-black text-3xl mb-4 uppercase tracking-tight">
                No Missions Detected
              </h3>
              <p className="text-[#DDDDDD]/60 text-lg mb-8 max-w-md mx-auto">
                The mission database is empty. Deploy your first mission document to begin.
              </p>

              <a 
                href="/upload" 
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F05454] to-[#F05454]/80 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-[#F05454]/50 transition-all duration-300 font-bold text-lg uppercase tracking-wide group relative overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
                <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="relative z-10">Deploy Mission</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission, idx) => (
              <MissionCard key={idx} mission={mission} index={idx} />
            ))}
          </div>
        )}
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

export default Missions