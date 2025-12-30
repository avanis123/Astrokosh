import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function Instruments() {
  const { mission } = useParams()
  const { data: instruments, loading, error } = useFetch(apiEndpoints.instruments(mission))
  const canvasRef = useRef(null)

  // Animated background
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 120

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
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
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#F05454]/20 to-[#30475E]/20 border border-[#F05454]/30 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Hardware Systems</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
              INSTRUMENTS
            </span>
          </h1>
          
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-[#DDDDDD]/60 text-lg">
              <span className="text-[#F05454] font-bold">{mission}</span> • Hardware Catalog
            </p>
            
            {instruments && instruments.length > 0 && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#30475E]/50 to-[#222831]/50 px-6 py-3 rounded-xl border border-[#30475E]/50">
                <svg className="w-5 h-5 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span className="text-[#DDDDDD]/50 uppercase text-sm tracking-wider font-bold">Total:</span>
                <span className="text-[#F05454] font-black text-2xl">{instruments.length}</span>
                <span className="text-[#DDDDDD]/50 uppercase text-sm">Device{instruments.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {!instruments || instruments.length === 0 ? (
          <div className="relative">
            <div className="bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 border border-[#F05454]/30 rounded-2xl p-12 backdrop-blur-sm text-center">
              <div className="inline-block mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F05454] blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#30475E] to-[#222831] flex items-center justify-center border border-[#30475E]/50">
                    <svg className="w-12 h-12 text-[#DDDDDD]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <h3 className="text-[#DDDDDD] font-black text-3xl mb-4 uppercase tracking-tight">
                No Instruments Detected
              </h3>
              <p className="text-[#DDDDDD]/60 text-lg mb-8 max-w-md mx-auto">
                No hardware systems found in mission database
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instruments.map((instrument, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#F05454]/30 overflow-hidden animate-slideIn"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Corner glow effect */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#F05454] rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity"></div>

                {/* Content */}
                <div className="relative">
                  {/* Instrument Icon */}
                  <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Instrument Name */}
                  <h3 className="text-xl font-black text-[#DDDDDD] mb-3 uppercase tracking-tight group-hover:text-[#F05454] transition-colors leading-tight break-words">
                    {instrument}
                  </h3>

                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#222831]/50 rounded-lg border border-[#30475E]/50 group-hover:border-[#F05454]/50 transition-colors">
                    <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
                    <span className="text-[#DDDDDD]/70 text-xs font-mono uppercase tracking-wider">Mission Hardware</span>
                  </div>

                  {/* Bottom indicator */}
                  <div className="mt-6 flex items-center text-[#F05454] font-bold text-sm group-hover:translate-x-2 transition-transform uppercase tracking-wide">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Active
                  </div>
                </div>

                {/* Animated border on hover */}
                <div className="absolute inset-0 border-2 border-[#F05454]/0 rounded-2xl group-hover:border-[#F05454]/30 transition-all pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info Section */}
        {instruments && instruments.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 rounded-2xl p-6 border border-[#30475E]/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#F05454]/70 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#DDDDDD]/50 uppercase text-xs tracking-wider font-bold mb-1">Systems</p>
                  <p className="text-[#DDDDDD] font-black text-2xl">{instruments.length}</p>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 rounded-2xl p-6 border border-[#30475E]/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#30475E] to-[#30475E]/70 flex items-center justify-center shadow-lg shadow-[#30475E]/50">
                  <svg className="w-6 h-6 text-[#DDDDDD]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#DDDDDD]/50 uppercase text-xs tracking-wider font-bold mb-1">Status</p>
                  <p className="text-[#F05454] font-black text-xl uppercase tracking-tight">Operational</p>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 rounded-2xl p-6 border border-[#30475E]/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#F05454]/70 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#DDDDDD]/50 uppercase text-xs tracking-wider font-bold mb-1">Mission</p>
                  <p className="text-[#DDDDDD] font-bold text-sm truncate">{mission}</p>
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
      `}</style>
    </div>
  )
}

export default Instruments