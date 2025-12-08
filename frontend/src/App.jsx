// ============================================================================
// FILE: src/App.jsx (UPDATED WITH DARK BG)
// ============================================================================
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ApiProvider } from './context/ApiContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Mission from './pages/Mission'
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

function App() {
  return (
    <ApiProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/debug/phases/:mission" element={<PhasesDebug />} />
              <Route path="/" element={<Home />} />
              <Route path="/missions" element={<Mission />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/mission/:name" element={<Mission />} />
              <Route path="/dashboard/:mission" element={<MissionDashboard />} />
              <Route path="/instruments/:mission" element={<Instruments />} />
              <Route path="/phases/:mission" element={<Phases />} />
              <Route path="/tables/:mission" element={<Tables />} />
              <Route path="/entities/:mission" element={<EntitiesOverview />} />
              <Route path="/pages/:mission" element={<PageViewer />} />
              <Route path="/instrument/:mission/:name" element={<InstrumentInsights />} />
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