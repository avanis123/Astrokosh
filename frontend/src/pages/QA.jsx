import React, { useState, useRef, useEffect } from 'react'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

const getSessionId = () => {
  let sessionId = localStorage.getItem("qa_session_id")
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem("qa_session_id", sessionId)
  }
  return sessionId
}

const sessionId = getSessionId()


function QA() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
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
        alpha: Math.random() * 0.4 + 0.2
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAsk = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiEndpoints.askQuestion(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  question: userMessage,
  session_id: sessionId
}),

      })

      if (!response.ok) throw new Error(`Request failed`)

      const data = await response.json()
      const answer = data.answer || 'No answer available'

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(err.message)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-20">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#30475E] rounded-full opacity-10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-[#F05454] rounded-full opacity-5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 h-[calc(100vh-5rem)] flex">
        {/* Left Side */}
        <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col justify-center px-6 lg:px-12 py-12 lg:border-r lg:border-[#30475E]/30">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-gradient-to-r from-[#F05454]/20 to-[#30475E]/20 border border-[#F05454]/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse"></div>
              <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Neural Q&A Interface</span>
              <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="flex items-start gap-6 mb-8">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-2xl border-2 border-[#F05454] animate-ping opacity-20"></div>
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>

              <div>
                <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
                    Q&A
                  </span>
                  <br />
                  <span className="text-[#DDDDDD]">ASSISTANT</span>
                </h1>
                
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-br from-[#30475E]/30 to-[#222831]/50 rounded-xl p-5 border border-[#30475E]/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-[#F05454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-[#DDDDDD] font-bold uppercase text-sm tracking-wider">AI-Powered</h3>
                </div>
                <p className="text-[#DDDDDD]/60 text-sm">Advanced neural language processing for mission insights</p>
              </div>

              <div className="bg-gradient-to-br from-[#30475E]/30 to-[#222831]/50 rounded-xl p-5 border border-[#30475E]/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-[#F05454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-[#DDDDDD] font-bold uppercase text-sm tracking-wider">Real-Time</h3>
                </div>
                <p className="text-[#DDDDDD]/60 text-sm">Instant answers from comprehensive mission database</p>
              </div>

              <div className="bg-gradient-to-br from-[#30475E]/30 to-[#222831]/50 rounded-xl p-5 border border-[#30475E]/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-[#F05454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-[#DDDDDD] font-bold uppercase text-sm tracking-wider">Contextual</h3>
                </div>
                <p className="text-[#DDDDDD]/60 text-sm">Understanding complex mission-specific queries</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#30475E]/50 border border-[#30475E]/50">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
                <span className="text-[#DDDDDD] text-sm font-mono">System Online</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F05454]/20 border border-[#F05454]/30">
                <svg className="w-4 h-4 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-[#DDDDDD] text-sm font-mono">{messages.length} msg{messages.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 flex-col p-6">
          {error && (
            <div className="mb-4 bg-gradient-to-r from-[#F05454]/20 to-[#F05454]/10 border-l-4 border-[#F05454] rounded-xl p-4 backdrop-blur-sm animate-slideIn">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-[#DDDDDD] font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex-1 relative bg-gradient-to-br from-[#30475E]/30 to-[#222831]/50 rounded-2xl border border-[#30475E]/50 shadow-2xl overflow-hidden backdrop-blur-sm mb-4">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#30475E] to-[#30475E]/80 px-6 py-4 border-b border-[#30475E]/50 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F05454] to-[#F05454]/70 flex items-center justify-center shadow-lg shadow-[#F05454]/50">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[#DDDDDD] font-black text-sm uppercase tracking-tight">AI Assistant</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
                      <span className="text-[#DDDDDD]/70 text-xs font-mono">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full overflow-y-auto custom-scrollbar px-6 pt-20 pb-6">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="inline-block mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#F05454] blur-2xl opacity-30 animate-pulse"></div>
                        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#30475E] to-[#222831] flex items-center justify-center border border-[#30475E]/50">
                          <svg className="w-12 h-12 text-[#DDDDDD]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[#DDDDDD] font-black text-2xl mb-3 uppercase tracking-tight">Ready to Assist</h3>
                    <p className="text-[#DDDDDD]/60 mb-6">Start by asking a question about the mission</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#30475E]/50 rounded-lg border border-[#30475E]/50">
                      <svg className="w-4 h-4 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#DDDDDD]/70 text-sm font-mono">Example: "What is VELC?"</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/30 mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}

                      <div
                        className={`group relative max-w-lg px-6 py-5 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-[#F05454] to-[#F05454]/80 text-white shadow-lg shadow-[#F05454]/30'
                            : 'bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 text-[#DDDDDD] border border-[#30475E]/30'
                        }`}
                      >
                        {msg.role === 'user' && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#222831] border-2 border-[#F05454] flex items-center justify-center">
                            <svg className="w-3 h-3 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        
                        <div className={`mt-2 text-xs font-mono ${msg.role === 'user' ? 'text-white/70' : 'text-[#DDDDDD]/50'}`}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#30475E] to-[#30475E]/70 flex items-center justify-center shadow-lg shadow-[#30475E]/30 ml-3">
                          <svg className="w-5 h-5 text-[#DDDDDD]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start animate-slideIn">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/30 mr-3">
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 px-6 py-5 rounded-2xl border border-[#30475E]/30">
                        <div className="flex gap-2">
                          <div className="w-2.5 h-2.5 bg-[#F05454] rounded-full animate-bounce"></div>
                          <div className="w-2.5 h-2.5 bg-[#F05454] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2.5 h-2.5 bg-[#F05454] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleAsk} className="relative">
            <div className="relative bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 rounded-2xl border border-[#30475E]/50 p-2 backdrop-blur-sm shadow-xl">
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the mission..."
                    disabled={loading}
                    className="w-full px-6 py-4 bg-[#222831] border border-[#30475E]/30 rounded-xl text-[#DDDDDD] placeholder-[#DDDDDD]/40 focus:outline-none focus:border-[#F05454] transition-all disabled:opacity-50 font-medium"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#DDDDDD]/30 text-xs font-mono">
                    {input.length}/500
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#F05454] to-[#F05454]/80 text-white rounded-xl hover:shadow-xl hover:shadow-[#F05454]/50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed font-bold uppercase tracking-wide overflow-hidden hover:scale-105 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="hidden sm:inline">Processing</span>
                      </>
                    ) : (
                      <>
                        <span>Send</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </form>
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
          background: rgba(34, 40, 49, 0.5);
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

export default QA