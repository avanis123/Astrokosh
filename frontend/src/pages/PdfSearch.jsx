import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SearchResultCard from '../components/SearchResultCard';
import PageViewer from '../components/PageViewer';

const PdfSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMission, setSelectedMission] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [missions, setMissions] = useState([]);
  const canvasRef = useRef(null);

  // Load available missions on component mount
  useEffect(() => {
    axios.get('http://localhost:8000/api/missions/list')
      .then(res => {
        console.log('Loaded missions:', res.data);
        setMissions(res.data);
      })
      .catch(err => console.error('Failed to load missions:', err));
  }, []);

  // Animated background (matching Missions page)
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
        if (star.y < 0 || star.y > canvas.height) star.vy *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 84, 84, ${star.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const params = { query: searchQuery };
      if (selectedMission) {
        params.mission = selectedMission;
      }

      console.log('Searching with params:', params);

      const response = await axios.get('http://localhost:8000/api/search/highlight', {
        params
      });

      console.log('Search results:', response.data);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

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
            <span className="text-[#DDDDDD] text-sm font-mono uppercase tracking-wider">Document Search</span>
            <div className="w-2 h-2 bg-[#F05454] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-[#DDDDDD]">PDF</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
              SEARCH
            </span>
          </h1>

          <p className="text-[#DDDDDD]/60 text-lg max-w-2xl">
            Search across all mission documents with visual highlights
          </p>
        </div>

        {/* Search Controls */}
        <div className="bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 border border-[#F05454]/30 rounded-2xl p-6 backdrop-blur-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F05454]/20 to-[#30475E]/20 rounded-xl blur-sm group-focus-within:blur-md transition-all duration-300"></div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter search term (e.g., 'orbit insertion', 'instrument')"
                className="relative w-full px-6 py-4 bg-[#222831] border border-[#30475E]/50 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent text-[#DDDDDD] placeholder-[#DDDDDD]/40 font-medium transition-all duration-300"
              />
            </div>

            {/* Mission Filter */}
            <select
              value={selectedMission}
              onChange={(e) => setSelectedMission(e.target.value)}
              className="px-6 py-4 bg-[#222831] border border-[#30475E]/50 rounded-xl focus:ring-2 focus:ring-[#F05454] text-[#DDDDDD] font-medium min-w-[200px] cursor-pointer transition-all duration-300"
            >
              <option value="">All Missions</option>
              {missions.map(mission => (
                <option key={mission.value} value={mission.value}>
                  {mission.display_name}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-8 py-4 bg-gradient-to-r from-[#F05454] to-[#F05454]/80 text-white rounded-xl hover:shadow-2xl hover:shadow-[#F05454]/50 disabled:from-[#30475E]/50 disabled:to-[#30475E]/30 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 font-bold uppercase tracking-wide group relative overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-[#DDDDDD] uppercase tracking-tight">
                Search Results for <span className="text-[#F05454]">"{results.query}"</span>
              </h2>
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#30475E]/50 to-[#222831]/50 px-6 py-3 rounded-xl border border-[#30475E]/50">
                <svg className="w-5 h-5 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span className="text-[#F05454] font-black text-2xl">{results.total_results}</span>
                <span className="text-[#DDDDDD]/50 uppercase text-sm">Page{results.total_results !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {results.total_results === 0 ? (
              <div className="relative">
                <div className="bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 border border-[#F05454]/30 rounded-2xl p-12 backdrop-blur-sm text-center">
                  <div className="inline-block mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#F05454] blur-2xl opacity-30 animate-pulse"></div>
                      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#30475E] to-[#222831] flex items-center justify-center border border-[#30475E]/50">
                        <svg className="w-12 h-12 text-[#DDDDDD]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-[#DDDDDD] font-black text-3xl mb-4 uppercase tracking-tight">
                    No Results Found
                  </h3>
                  <p className="text-[#DDDDDD]/60 text-lg max-w-md mx-auto">
                    Try different search terms or check your spelling
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(results.missions).map(([mission, pages]) => (
                  <div key={mission} className="bg-gradient-to-br from-[#30475E]/50 to-[#222831]/50 border border-[#F05454]/30 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#F05454] rounded-full animate-pulse"></div>
                        <h3 className="text-2xl font-black text-[#F05454] uppercase tracking-tight">
                          {mission}
                        </h3>
                      </div>
                      <span className="text-[#DDDDDD]/50 text-sm font-bold">
                        ({pages.length} page{pages.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pages.map((page, idx) => (
                        <SearchResultCard
                          key={idx}
                          page={page}
                          searchTerm={results.query}
                          onClick={() => setSelectedPage(page)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Page Viewer Modal */}
        {selectedPage && (
          <PageViewer
            page={selectedPage}
            onClose={() => setSelectedPage(null)}
          />
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
  );
};

export default PdfSearch;