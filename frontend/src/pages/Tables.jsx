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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded">
            Error: {error}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Tables
        </h1>
        <p className="text-gray-400 mb-8">{mission}</p>

        {!validTables || validTables.length === 0 ? (
          <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-300 px-4 py-3 rounded">
            No valid tables found for this mission
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400 mb-6">Total tables: {validTables.length}</p>
            {validTables.map((table, idx) => {
              let tableData = table
              
              if (typeof table === 'object' && !Array.isArray(table)) {
                tableData = [table]
              }
              
              return (
                <TableViewer
                  key={idx}
                  table={tableData}
                  title={`Table ${idx + 1}`}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tables