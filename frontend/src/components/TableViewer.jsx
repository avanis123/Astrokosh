import React from 'react'

function TableViewer({ table, title }) {
  if (!table) {
    return (
      <div className="bg-gradient-to-br from-[#30475E] to-[#222831] rounded-xl p-8 border border-[#30475E] text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-[#DDDDDD]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-[#DDDDDD]/60 text-lg">No table data available</p>
      </div>
    )
  }

  // Normalize table to array of objects
  let tableData = Array.isArray(table) ? table : [table]
  
  // Flatten nested objects
  tableData = tableData.map(row => {
    if (!row || typeof row !== 'object') return {}
    
    const flatRow = {}
    for (const [key, value] of Object.entries(row)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [subKey, subValue] of Object.entries(value)) {
          flatRow[`${key}.${subKey}`] = String(subValue)
        }
      } else if (Array.isArray(value)) {
        flatRow[key] = value.join(', ')
      } else {
        flatRow[key] = String(value || '-')
      }
    }
    return flatRow
  })

  // Filter out empty rows
  tableData = tableData.filter(row => Object.keys(row).length > 0)

  if (tableData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#30475E] to-[#222831] rounded-xl p-8 border border-[#30475E] text-center">
        <p className="text-[#DDDDDD]/60 text-lg">No valid table data</p>
      </div>
    )
  }

  const headers = Object.keys(tableData[0] || {})

  if (headers.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#30475E] to-[#222831] rounded-xl p-8 border border-[#30475E] text-center">
        <p className="text-[#DDDDDD]/60 text-lg">No columns available</p>
      </div>
    )
  }

  // CSV Export function
  const exportToCSV = () => {
    if (tableData.length === 0) return

    const csvHeaders = headers.join(',')
    const csvRows = tableData
      .map(row =>
        headers
          .map(header => {
            let value = String(row[header] || '')
            if (value.includes(',') || value.includes('"')) {
              value = `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(',')
      )
      .join('\n')

    const csvContent = `${csvHeaders}\n${csvRows}`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent))
    element.setAttribute('download', `${title || 'table'}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          {title && (
            <h3 className="text-2xl font-black text-[#DDDDDD] uppercase tracking-wide mb-2">
              {title}
            </h3>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F05454] animate-pulse"></div>
              <span className="text-[#DDDDDD]/60 font-medium">
                {tableData.length} ROWS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#30475E] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="text-[#DDDDDD]/60 font-medium">
                {headers.length} COLUMNS
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={exportToCSV}
          className="group relative bg-gradient-to-br from-[#F05454] to-[#F05454]/80 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wide hover:shadow-xl hover:shadow-[#F05454]/50 transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>
      </div>
      
      <div className="relative overflow-hidden rounded-xl border border-[#30475E] shadow-2xl shadow-[#222831]/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-[#30475E] via-[#30475E] to-[#222831] sticky top-0 z-10">
              <tr>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="border-b-2 border-[#F05454]/30 px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-[#DDDDDD] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#F05454] rounded-full"></div>
                      {String(header).substring(0, 50)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gradient-to-br from-[#222831] to-[#30475E]/30">
              {tableData.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className={`
                    border-b border-[#30475E]/30 
                    hover:bg-[#30475E]/40 
                    transition-colors duration-200
                    ${rowIdx % 2 === 0 ? 'bg-[#222831]/50' : 'bg-[#222831]/30'}
                  `}
                >
                  {headers.map((header, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-6 py-4 text-sm text-[#DDDDDD]/80 font-medium max-w-xs overflow-hidden text-ellipsis"
                      title={String(row[header])}
                    >
                      {String(row[header]).substring(0, 50)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#222831] to-transparent pointer-events-none"></div>
      </div>
    </div>
  )
}

export default TableViewer