import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function Phases() {
  const { mission } = useParams()
  const { data: phases, loading, error } = useFetch(apiEndpoints.phases(mission))
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
        radius: Math.random() * 2,
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
        ctx.fillStyle = `rgba(240, 84, 84, ${particle.alpha})`
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

      <div className="relative z-10 container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#F05454]/20 to-[#30475E]/20 border border-[#F05454]/30 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Timeline Analysis</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-[#DDDDDD]">MISSION</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
              PHASES
            </span>
          </h1>
          
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-[#DDDDDD]/60 text-lg">
              <span className="text-[#F05454] font-bold">{mission}</span> • Sequential Timeline
            </p>
            
            {phases && phases.length > 0 && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#30475E]/50 to-[#222831]/50 px-6 py-3 rounded-xl border border-[#30475E]/50">
                <svg className="w-5 h-5 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-[#DDDDDD]/50 uppercase text-sm tracking-wider font-bold">Phases:</span>
                <span className="text-[#F05454] font-black text-2xl">{phases.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {!phases || phases.length === 0 ? (
          <div className="relative">
            <div className="bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 border border-[#F05454]/30 rounded-2xl p-12 backdrop-blur-sm text-center">
              <div className="inline-block mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F05454] blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#30475E] to-[#222831] flex items-center justify-center border border-[#30475E]/50">
                    <svg className="w-12 h-12 text-[#DDDDDD]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <h3 className="text-[#DDDDDD] font-black text-3xl mb-4 uppercase tracking-tight">
                No Phases Detected
              </h3>
              <p className="text-[#DDDDDD]/60 text-lg mb-8 max-w-md mx-auto">
                No mission phases found in timeline database
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline connector line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#F05454] via-[#30475E] to-[#F05454] opacity-30"></div>

            <div className="space-y-6">
              {phases.map((phase, idx) => {
                const colors = [
                  { primary: 'F05454', secondary: '30475E' },
                  { primary: '30475E', secondary: 'F05454' },
                  { primary: 'F05454', secondary: '30475E' },
                ]
                const colorSet = colors[idx % 3]

                return (
                  <div
                    key={idx}
                    className="relative group animate-slideIn"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {/* Timeline node */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                      <div className="relative">
                        {/* Pulsing outer ring */}
                        <div className={`absolute inset-0 w-16 h-16 rounded-full bg-[#${colorSet.primary}] opacity-20 animate-ping`}></div>
                        
                        {/* Main node */}
                        <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-[#${colorSet.primary}] to-[#${colorSet.secondary}] flex items-center justify-center shadow-2xl shadow-[#${colorSet.primary}]/50 border-4 border-[#222831] group-hover:scale-125 transition-transform duration-500`}>
                          <span className="text-white font-black text-xl">{idx + 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Phase card */}
                    <div className="ml-24 relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#F05454]/30 overflow-hidden">
                      {/* Hover gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-[#${colorSet.primary}]/0 to-[#${colorSet.primary}]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      {/* Corner glow effect */}
                      <div className={`absolute -bottom-12 -right-12 w-32 h-32 bg-[#${colorSet.primary}] rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity`}></div>

                      {/* Content */}
                      <div className="relative flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          {/* Phase icon */}
                          <div className="mb-4">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-[#${colorSet.primary}]/20 rounded-lg border border-[#${colorSet.primary}]/30`}>
                              <svg className={`w-5 h-5 text-[#${colorSet.primary}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-[#DDDDDD]/70 text-xs font-mono uppercase tracking-wider">Phase {idx + 1}</span>
                            </div>
                          </div>

                          {/* Phase name */}
                          <h3 className="text-2xl md:text-3xl font-black text-[#DDDDDD] uppercase tracking-tight leading-tight break-words group-hover:text-[#F05454] transition-colors">
                            {phase}
                          </h3>
                        </div>

                        {/* Status indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-[#222831]/50 border border-[#30475E]/50 group-hover:border-[#F05454]/50 flex items-center justify-center transition-all">
                            <svg className={`w-6 h-6 text-[#DDDDDD]/30 group-hover:text-[#${colorSet.primary}] transition-colors`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Progress line to next phase */}
                      {idx < phases.length - 1 && (
                        <div className="absolute -bottom-6 left-8 w-1 h-6 bg-gradient-to-b from-[#30475E] to-transparent"></div>
                      )}

                      {/* Animated border on hover */}
                      <div className="absolute inset-0 border-2 border-[#F05454]/0 rounded-2xl group-hover:border-[#F05454]/30 transition-all pointer-events-none"></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Completion indicator */}
            <div className="mt-12 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F05454] blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-[#30475E]/50 to-[#222831]/50 rounded-2xl px-8 py-4 border border-[#F05454]/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#F05454] rounded-full animate-pulse"></div>
                    <span className="text-[#DDDDDD] font-bold uppercase tracking-wide">Timeline Complete</span>
                    <svg className="w-5 h-5 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
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
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-gradient {
          animation: gradient 5s ease infinite;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

export default Phases