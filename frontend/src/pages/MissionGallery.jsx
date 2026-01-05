import React, { useEffect, useRef, useState } from "react"
import { apiEndpoints } from "../utils/api"


function Loader() {
  return (
    <div className="min-h-screen bg-[#222831] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#F05454] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#DDDDDD]/60">Loading...</p>
      </div>
    </div>
  )
}

function MissionGallery({ initialMission = null }) {
  const canvasRef = useRef(null)
  const [missions, setMissions] = useState([])
  const [selectedMission, setSelectedMission] = useState(initialMission)
  const [images, setImages] = useState([])
  const [loadingMissions, setLoadingMissions] = useState(true)
  const [loadingImages, setLoadingImages] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    setLoadingMissions(true)

    fetch(apiEndpoints.allMissions())
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch missions")
        return res.json()
      })
      .then(data => {
        const seen = new Set()

        const missionList = (data || [])
          .filter(m => {
            if (seen.has(m.mission)) return false
            seen.add(m.mission)
            return true
          })
          .map(m => ({
            id: m.mission,
            name: m.mission
          }))

        setMissions(missionList)

        if (missionList.length > 0) {
          setSelectedMission(missionList[0].id)
        }

        setLoadingMissions(false)
      })


      .catch(() => {
        setMissions([])
        setLoadingMissions(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedMission) return

    setLoadingImages(true)

    fetch(apiEndpoints.missionImages(selectedMission))
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch images")
        return res.json()
      })
      .then(data => {
        setImages(data.images || [])
        setLoadingImages(false)
      })
      .catch(() => {
        setImages([])
        setLoadingImages(false)
      })
  }, [selectedMission])


  // Animated background
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.5 + 0.3
    }))

    function animate() {
      ctx.fillStyle = "rgba(34,40,49,0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach(s => {
        s.x += s.vx
        s.y += s.vy
        if (s.x < 0 || s.x > canvas.width) s.vx *= -1
        if (s.y < 0 || s.y > canvas.height) s.vy *= -1

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240,84,84,${s.a})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  if (loadingMissions) return <Loader />

  return (
    <div className="min-h-screen bg-[#222831] relative overflow-hidden pt-24 pb-16">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30"
      />

      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-[#F05454] rounded-full opacity-10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#30475E] rounded-full opacity-15 blur-[100px] animate-pulse" />

      <div className="relative z-10 container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#F05454]/20 to-[#30475E]/20 border border-[#F05454]/30 backdrop-blur-sm">
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">
              Mission Visual Archive
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-[#DDDDDD]">MISSION</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
              GALLERY
            </span>
          </h1>

          <p className="text-[#DDDDDD]/60 mb-8 max-w-2xl">
            Visual artifacts automatically extracted from mission documentation.
          </p>

          {/* Mission Selector */}
          <div className="max-w-md">
            <label className="block text-[#DDDDDD]/80 mb-3 font-medium">
              Select Mission
            </label>
            <div className="relative">
              <select
                value={selectedMission || ''}
                onChange={(e) => setSelectedMission(e.target.value)}
                className="w-full bg-gradient-to-br from-[#30475E]/80 to-[#222831]/80 border-2 border-[#30475E]/50 text-[#DDDDDD] rounded-xl px-6 py-4 appearance-none cursor-pointer hover:border-[#F05454]/50 focus:border-[#F05454] focus:outline-none transition-all backdrop-blur-sm text-lg font-medium"
              >
                {missions.length === 0 ? (
                  <option value="">No missions available</option>
                ) : (
                  missions.map((mission) => (
                    <option key={mission.id} value={mission.id}>
                      {mission.name || mission.id}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-6 h-6 text-[#F05454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingImages && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-[#F05454] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#DDDDDD]/60">Loading images...</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loadingImages && images.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#30475E]/50 mb-6">
              <svg className="w-10 h-10 text-[#DDDDDD]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[#DDDDDD]/60 text-xl">No images found for this mission.</p>
          </div>
        )}

        {!loadingImages && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images
              .filter(img => img.caption)   // 🔥 KEY CHANGE
              .map((img, idx) => (
                <div
                  key={idx}
                  className="group cursor-pointer bg-gradient-to-br from-[#30475E]/60 to-[#222831]/60 border border-[#30475E]/50 rounded-xl overflow-hidden hover:border-[#F05454] hover:shadow-lg hover:shadow-[#F05454]/20 transition-all duration-300"
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`http://localhost:8000${img.image_path}`}
                      alt={` ${img.caption}`}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#222831]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-[#DDDDDD]/70 font-mono">
                      {img.caption}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-6xl w-full max-h-[90vh] bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl p-6 border-2 border-[#F05454] shadow-2xl shadow-[#F05454]/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-[#DDDDDD] font-medium"> {selectedImage.caption}</p>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 rounded-full bg-[#F05454]/20 hover:bg-[#F05454]/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-8rem)] rounded-lg">
              <img
                src={`http://localhost:8000${selectedImage.image_path}`}
                alt={` ${selectedImage.caption}`}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

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

export default MissionGallery