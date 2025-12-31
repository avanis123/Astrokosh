// ============================================================================
// FILE: src/App.jsx (CLEANED & CORRECT)
// ============================================================================

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ApiProvider } from './context/ApiContext'
import Navbar from './components/Navbar'

import Home from './pages/Home'
import Upload from './pages/Upload'
import Missions from './pages/Missions'
import MissionDashboard from './pages/MissionDashboard'
import Instruments from './pages/Instruments'
import Phases from './pages/Phases'
import PhasesDebug from './pages/PhasesDebug'
import Tables from './pages/Tables'
import Search from './pages/Search'
import QA from './pages/QA'
import EntitiesOverview from './pages/EntitiesOverview'
import PageViewer from './pages/PageViewer'
import InstrumentInsights from './pages/InstrumentInsights'
import MissionGallery from './pages/MissionGallery'

function App() {
  return (
    <ApiProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />

              {/* Upload */}
              <Route path="/upload" element={<Upload />} />

              {/* Mission Gallery */}
              <Route path="/gallery" element={<MissionGallery />} />

              {/* Missions */}
              <Route path="/missions" element={<Missions />} />

              {/* Mission Dashboard */}
              <Route path="/dashboard/:mission" element={<MissionDashboard />} />

              {/* Mission Sub-pages */}
              <Route path="/instruments/:mission" element={<Instruments />} />
              <Route path="/phases/:mission" element={<Phases />} />
              <Route path="/tables/:mission" element={<Tables />} />
              <Route path="/entities/:mission" element={<EntitiesOverview />} />
              <Route path="/pages/:mission" element={<PageViewer />} />
              <Route path="/instrument/:mission/:name" element={<InstrumentInsights />} />

              {/* Debug */}
              <Route path="/debug/phases/:mission" element={<PhasesDebug />} />

              {/* Search & QA */}
              <Route path="/search" element={<Search />} />
              <Route path="/qa" element={<QA />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ApiProvider>
  )
}

export default App
