import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('/')
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setActiveLink(location.pathname)
  }, [location])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-[#222831]/95 backdrop-blur-xl shadow-2xl shadow-[#F05454]/10 border-b border-[#F05454]/20'
          : 'bg-[#222831]/80 backdrop-blur-lg border-b border-[#30475E]/30'
        }`}
    >
      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F05454] to-transparent opacity-50"></div>

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group relative"
          >
            {/* Glowing background effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#F05454]/20 to-[#30475E]/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              {/* Animated rings around logo */}
              <div className="absolute inset-0 rounded-xl border-2 border-[#F05454] animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-xl border border-[#30475E] animate-pulse"></div>

              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#30475E] flex items-center justify-center shadow-lg shadow-[#F05454]/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg className="w-7 h-7 text-[#DDDDDD]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <span className="text-2xl font-black text-[#DDDDDD] group-hover:text-[#F05454] transition-colors duration-300 tracking-tight">
                ASTROKOSH
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#F05454] to-[#30475E] group-hover:w-full transition-all duration-500"></div>
            </div>


          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <NavLink to="/" active={activeLink === '/'}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              HOME
            </NavLink>

            <NavLink to="/upload" active={activeLink === '/upload'}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              UPLOAD
            </NavLink>

            <NavLink to="/pdf-search" active={activeLink === '/pdf-search'}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              PDF SEARCH
            </NavLink>

            <NavLink to="/gallery" active={activeLink === '/gallery'}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              GALLERY
            </NavLink>

            <Link
              to="/qa"
              className="relative group ml-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F05454] to-[#F05454]/80 hover:from-[#F05454]/90 hover:to-[#F05454] text-white font-bold text-sm tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#F05454]/50"
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>

              <div className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Q&A AI
              </div>

              {/* Glowing border */}
              <div className="absolute inset-0 rounded-xl border-2 border-[#F05454] opacity-0 group-hover:opacity-50 group-hover:animate-pulse"></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#30475E] to-transparent"></div>
    </nav>
  )
}

// NavLink Component
function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`relative group px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 flex items-center gap-2 ${active
          ? 'text-[#F05454] bg-[#30475E]/30'
          : 'text-[#DDDDDD]/70 hover:text-[#DDDDDD] hover:bg-[#30475E]/20'
        }`}
    >
      {/* Hover background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F05454]/0 via-[#F05454]/10 to-[#F05454]/0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>

      {/* Active indicator */}
      {active && (
        <>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#F05454] to-transparent"></div>
          <div className="absolute inset-0 border border-[#F05454]/30 rounded-lg animate-pulse"></div>
        </>
      )}

      <div className="relative z-10 flex items-center gap-2">
        {children}
      </div>

      {/* Hover underline animation */}
      {!active && (
        <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#F05454] group-hover:w-full transition-all duration-500"></div>
      )}
    </Link>
  )
}

export default Navbar