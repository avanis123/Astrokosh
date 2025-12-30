// ============================================
// Home.jsx - Main Landing Page
// ============================================
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = []
    const starCount = 200

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random()
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

        star.alpha += (Math.random() - 0.5) * 0.02
        star.alpha = Math.max(0.2, Math.min(1, star.alpha))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(221, 221, 221, ${star.alpha})`
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

  return (
    <div className="relative min-h-screen bg-[#222831] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#F05454] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#30475E] rounded-full opacity-20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F05454] blur-xl opacity-50 animate-pulse"></div>
              <svg className="relative w-24 h-24 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="text-[#DDDDDD]">SPACE</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
              MISSION
            </span>
            <br />
            <span className="text-[#DDDDDD]">INTEL</span>
          </h1>

          <p className="text-[#DDDDDD] text-xl md:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed">
            Advanced AI-powered extraction and analysis of space mission reports
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <Link
            to="/upload"
            className="group relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#F05454]/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F05454] to-[#F05454]/50 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#DDDDDD] mb-3">UPLOAD</h3>
              <p className="text-[#DDDDDD]/70 text-sm leading-relaxed mb-4">
                Deploy mission documents for deep neural extraction
              </p>

              <div className="flex items-center text-[#F05454] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                INITIATE
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#F05454] rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity"></div>
          </Link>

          <Link
            to="/missions"
            className="group relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#F05454]/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#30475E] to-[#30475E]/50 flex items-center justify-center shadow-lg shadow-[#30475E]/50">
                  <svg className="w-8 h-8 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#DDDDDD] mb-3">MISSIONS</h3>
              <p className="text-[#DDDDDD]/70 text-sm leading-relaxed mb-4">
                Access comprehensive mission intelligence database
              </p>

              <div className="flex items-center text-[#F05454] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                EXPLORE
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#30475E] rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity"></div>
          </Link>

          <Link
            to="/search"
            className="group relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#F05454]/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F05454] to-[#F05454]/50 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#DDDDDD] mb-3">SEARCH</h3>
              <p className="text-[#DDDDDD]/70 text-sm leading-relaxed mb-4">
                Quantum search across all mission parameters
              </p>

              <div className="flex items-center text-[#F05454] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                SEARCH
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#F05454] rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity"></div>
          </Link>

          <Link
            to="/qa"
            className="group relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-8 border border-[#30475E] hover:border-[#F05454] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#F05454]/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F05454]/0 to-[#F05454]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#30475E] to-[#30475E]/50 flex items-center justify-center shadow-lg shadow-[#30475E]/50">
                  <svg className="w-8 h-8 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#DDDDDD] mb-3">Q&A AI</h3>
              <p className="text-[#DDDDDD]/70 text-sm leading-relaxed mb-4">
                Neural interface for intelligent mission queries
              </p>

              <div className="flex items-center text-[#F05454] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                CONNECT
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#30475E] rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity"></div>
          </Link>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#F05454] to-[#F05454]/50 mb-6 shadow-lg shadow-[#F05454]/50 group-hover:scale-110 transition-transform">
              <span className="text-3xl font-black text-white">AI</span>
            </div>
            <h3 className="text-4xl font-black text-[#DDDDDD] mb-2">100%</h3>
            <p className="text-[#DDDDDD]/60 uppercase tracking-wider text-sm">Automated</p>
          </div>

          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#30475E] to-[#30475E]/50 mb-6 shadow-lg shadow-[#30475E]/50 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-4xl font-black text-[#DDDDDD] mb-2">REAL</h3>
            <p className="text-[#DDDDDD]/60 uppercase tracking-wider text-sm">Time Processing</p>
          </div>

          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#F05454] to-[#F05454]/50 mb-6 shadow-lg shadow-[#F05454]/50 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-4xl font-black text-[#DDDDDD] mb-2">SECURE</h3>
            <p className="text-[#DDDDDD]/60 uppercase tracking-wider text-sm">Encrypted Data</p>
          </div>
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

export default Home
