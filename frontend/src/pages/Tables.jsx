import React from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import TableViewer from '../components/TableViewer'
import { apiEndpoints } from '../utils/api'

function Tables() {
  const { mission } = useParams()
  const { data: tables, loading, error } = useFetch(apiEndpoints.tables(mission))

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="min-h-screen bg-[#222831] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#F05454]/20 to-[#F05454]/10 border-2 border-[#F05454] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <svg className="w-8 h-8 text-[#F05454] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-black text-[#F05454] text-lg uppercase tracking-wide mb-2">System Error</p>
                <p className="text-[#DDDDDD]/90">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  let validTables = []
  
  if (Array.isArray(tables)) {
    validTables = tables.filter(table => {
      if (!table) return false
      
      if (typeof table === 'object' && !Array.isArray(table)) {
        return Object.keys(table).length > 0
      }
      
      if (Array.isArray(table)) {
        return table.length > 0 && table.some(row => row && typeof row === 'object')
      }
      
      return false
    })
  }

  return (
    <div className="min-h-screen bg-[#222831] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F05454] blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#30475E] to-[#30475E]/50 flex items-center justify-center shadow-lg shadow-[#30475E]/50">
                <svg className="w-8 h-8 text-[#DDDDDD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] animate-gradient bg-[length:200%_auto]">
                  DATA TABLES
                </span>
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-2 h-2 rounded-full bg-[#F05454] animate-pulse"></div>
                <p className="text-[#DDDDDD]/70 text-xl font-medium uppercase tracking-wide">
                  {mission}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* No Tables Found */}
        {!validTables || validTables.length === 0 ? (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#F05454] via-[#30475E] to-[#F05454] rounded-2xl opacity-20 blur"></div>
            <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-xl p-12 border border-[#F05454]/50 text-center">
              <svg className="w-20 h-20 mx-auto mb-6 text-[#DDDDDD]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-[#DDDDDD] text-xl font-bold uppercase tracking-wide">
                No Valid Tables Found
              </p>
              <p className="text-[#DDDDDD]/60 mt-2">
                This mission contains no extractable table data
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Stats Bar */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#F05454] to-[#30475E] rounded-xl opacity-30 blur"></div>
                <div className="relative bg-gradient-to-br from-[#30475E] to-[#222831] rounded-lg px-6 py-3 border border-[#30475E]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#F05454] animate-pulse"></div>
                      <span className="text-[#DDDDDD] font-black uppercase tracking-wide text-sm">
                        Total Tables:
                      </span>
                    </div>
                    <span className="text-[#F05454] font-black text-2xl">
                      {validTables.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="space-y-8">
              {validTables.map((table, idx) => {
                let tableData = table
                
                if (typeof table === 'object' && !Array.isArray(table)) {
                  tableData = [table]
                }
                
                return (
                  <div key={idx} className="relative">
                    {/* Table number badge */}
                    <div className="absolute -top-4 -left-4 z-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#F05454] blur-lg opacity-50"></div>
                        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#F05454] to-[#F05454]/80 flex items-center justify-center shadow-xl shadow-[#F05454]/50 border-2 border-[#222831]">
                          <span className="text-white font-black text-lg">{idx + 1}</span>
                        </div>
                      </div>
                    </div>
                    
                    <TableViewer
                      table={tableData}
                      title={`Table ${idx + 1}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
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
  )
}

export default Tables