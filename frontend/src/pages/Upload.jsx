import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadedMission, setUploadedMission] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()
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

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError(null)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError(null)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText)
          setUploadedMission(result)
          setFile(null)
          setProgress(0)
        } else {
          setError('Upload failed')
        }
        setLoading(false)
      })

      xhr.addEventListener('error', () => {
        setError('Upload failed')
        setLoading(false)
      })

      xhr.open('POST', apiEndpoints.upload())
      xhr.send(formData)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-[#F05454] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#30475E] rounded-full opacity-15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#F05454]/20 to-[#30475E]/20 border border-[#F05454]/30 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Neural Upload System</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-[#DDDDDD]">DEPLOY</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
              MISSION FILES
            </span>
          </h1>
          
          <p className="text-[#DDDDDD]/70 text-lg max-w-2xl mx-auto">
            Upload space mission reports for AI-powered extraction and deep analysis
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-gradient-to-r from-[#F05454]/20 to-[#F05454]/10 border-l-4 border-[#F05454] rounded-xl p-6 backdrop-blur-sm animate-slideIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F05454]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-[#DDDDDD] font-bold text-lg mb-1">ERROR DETECTED</h3>
                <p className="text-[#DDDDDD]/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!uploadedMission ? (
          <form onSubmit={handleUpload}>
            <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-3xl p-12 border border-[#30475E] shadow-2xl shadow-[#F05454]/10 overflow-hidden">
              {/* Animated background effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F05454] rounded-full opacity-10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#30475E] rounded-full opacity-20 blur-3xl"></div>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-500 ${
                  dragActive
                    ? 'border-[#F05454] bg-[#F05454]/10 scale-[1.02] shadow-2xl shadow-[#F05454]/30'
                    : 'border-[#30475E]/50 bg-[#222831]/50 hover:border-[#F05454]/50 hover:bg-[#222831]/70'
                }`}
              >
                {/* Center Icon */}
                <div className="mb-8">
                  <div className="relative inline-block">
                    {/* Animated rings */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-[#F05454] animate-ping opacity-20"></div>
                    <div className="absolute inset-0 rounded-2xl border border-[#30475E] animate-pulse"></div>
                    
                    <div className={`relative w-28 h-28 rounded-2xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-2xl shadow-[#F05454]/50 transition-all duration-500 ${
                      dragActive ? 'scale-110 rotate-12' : 'hover:scale-105'
                    }`}>
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-2xl font-black text-[#DDDDDD] uppercase tracking-tight">
                    {dragActive ? 'Release to Deploy' : 'Drop Mission Files'}
                  </p>
                  <p className="text-[#DDDDDD]/50 text-sm uppercase tracking-wider">or</p>
                  
                  <label className="inline-block cursor-pointer group">
                    <span className="relative inline-flex items-center gap-3 bg-gradient-to-r from-[#F05454] to-[#F05454]/80 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-[#F05454]/50 transition-all duration-300 font-bold text-lg uppercase tracking-wide overflow-hidden hover:scale-105">
                      {/* Shine effect */}
                      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      
                      <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="relative z-10">Browse Files</span>
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>

                  <p className="text-[#DDDDDD]/30 text-xs uppercase tracking-widest mt-6 font-mono">
                    PDF • Max 50MB • Encrypted Transfer
                  </p>
                </div>
              </div>

              {/* Selected File Info */}
              {file && (
                <div className="mt-8 bg-gradient-to-br from-[#222831]/80 to-[#30475E]/50 rounded-2xl p-6 border border-[#F05454]/30 backdrop-blur-sm animate-slideIn">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#DDDDDD] font-bold text-lg mb-1 truncate">{file.name}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#DDDDDD]/50 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span className="px-2 py-1 bg-[#F05454]/20 text-[#F05454] rounded text-xs font-bold uppercase">Ready</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#30475E]/50 hover:bg-[#F05454]/20 text-[#DDDDDD]/50 hover:text-[#F05454] transition-all flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {progress > 0 && progress < 100 && (
                <div className="mt-8 space-y-3 animate-slideIn">
                  <div className="flex justify-between items-center">
                    <span className="text-[#DDDDDD] font-bold uppercase tracking-wide">Uploading...</span>
                    <span className="text-[#F05454] font-black text-2xl">{Math.round(progress)}%</span>
                  </div>
                  <div className="relative w-full bg-[#30475E]/50 rounded-full h-4 overflow-hidden border border-[#30475E]">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F05454] to-[#F05454]/70 rounded-full transition-all duration-300 shadow-lg shadow-[#F05454]/50"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <p className="text-[#DDDDDD]/50 text-xs uppercase tracking-wider font-mono">Neural processing active</p>
                </div>
              )}

              {/* Upload Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className="relative w-full mt-8 group overflow-hidden disabled:cursor-not-allowed"
              >
                <div className={`relative bg-gradient-to-r from-[#F05454] to-[#F05454]/80 text-white py-5 rounded-2xl font-black text-xl uppercase tracking-wide transition-all duration-500 border-2 border-[#F05454] ${
                  loading || !file 
                    ? 'opacity-40' 
                    : 'hover:shadow-2xl hover:shadow-[#F05454]/50 hover:scale-[1.02]'
                }`}>
                  {/* Shine effect */}
                  {!loading && file && (
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  )}
                  
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Neural Network
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Deploy Mission Data
                      </>
                    )}
                  </div>
                </div>

                {/* Glowing border on hover */}
                {!loading && file && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#F05454] opacity-0 group-hover:opacity-50 group-hover:animate-pulse"></div>
                )}
              </button>
            </div>
          </form>
        ) : (
          // Success State
          <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-3xl p-12 border border-[#F05454]/50 shadow-2xl shadow-[#F05454]/30 overflow-hidden animate-slideIn">
            {/* Success background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F05454] rounded-full opacity-10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#30475E] rounded-full opacity-20 blur-3xl animate-pulse"></div>

            <div className="relative text-center mb-10">
              {/* Success Icon */}
              <div className="inline-block mb-6 relative">
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-4 border-[#4CAF50] animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[#4CAF50]/50 animate-pulse"></div>
                
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#45a049] flex items-center justify-center shadow-2xl shadow-[#4CAF50]/50 animate-scaleIn">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-5xl font-black text-[#DDDDDD] mb-3 uppercase tracking-tight">
                UPLOAD COMPLETE
              </h2>
              <p className="text-[#DDDDDD]/60 text-lg uppercase tracking-wider">Mission data successfully processed</p>
            </div>

            {/* Mission Details */}
            <div className="relative bg-gradient-to-br from-[#222831]/80 to-[#30475E]/50 rounded-2xl p-8 border border-[#F05454]/30 backdrop-blur-sm mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-[#30475E]/50">
                  <span className="text-[#DDDDDD]/50 uppercase text-sm tracking-wider font-bold">Mission ID</span>
                  <span className="text-[#DDDDDD] font-black text-xl">{uploadedMission.mission}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-[#30475E]/50">
                  <span className="text-[#DDDDDD]/50 uppercase text-sm tracking-wider font-bold">File Name</span>
                  <span className="text-[#DDDDDD] font-semibold truncate max-w-xs">{uploadedMission.file_name}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="text-[#DDDDDD]/50 uppercase text-sm tracking-wider font-bold">Data Points</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F05454] font-black text-3xl">{uploadedMission.observations_inserted}</span>
                    <span className="text-[#DDDDDD]/50 text-sm uppercase">Extracted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(`/dashboard/${uploadedMission.mission}`)}
                className="relative flex-1 group overflow-hidden"
              >
                <div className="relative bg-gradient-to-r from-[#F05454] to-[#F05454]/80 text-white py-4 px-8 rounded-xl font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-2xl hover:shadow-[#F05454]/50 hover:scale-105 border-2 border-[#F05454]">
                  {/* Shine effect */}
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Access Dashboard
                  </span>
                </div>
                <div className="absolute inset-0 rounded-xl border-2 border-[#F05454] opacity-0 group-hover:opacity-50 group-hover:animate-pulse"></div>
              </button>

              <button
                onClick={() => {
                  setUploadedMission(null)
                  setFile(null)
                }}
                className="relative flex-1 group overflow-hidden"
              >
                <div className="relative bg-gradient-to-r from-[#30475E] to-[#30475E]/80 text-[#DDDDDD] py-4 px-8 rounded-xl font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-[#30475E]/50 hover:scale-105 border-2 border-[#30475E]">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Deploy Another
                  </span>
                </div>
              </button>
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
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0) rotate(-180deg);
          }
          to {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        .animate-gradient {
          animation: gradient 5s ease infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

export default Upload