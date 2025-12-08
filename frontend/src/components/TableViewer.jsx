import React from 'react'

function TableViewer({ table, title }) {
  if (!table) {
    return <div className="text-gray-600 py-4">No table data available</div>
  }

  // Normalize table to array of objects
  let tableData = Array.isArray(table) ? table : [table]
  
  // Flatten nested objects
  tableData = tableData.map(row => {
    if (!row || typeof row !== 'object') return {}
    
    const flatRow = {}
    for (const [key, value] of Object.entries(row)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // If value is an object, flatten it
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
    return <div className="text-gray-600 py-4">No valid table data</div>
  }

  const headers = Object.keys(tableData[0] || {})

  if (headers.length === 0) {
    return <div className="text-gray-600 py-4">No columns available</div>
  }

  // CSV Export function
  const exportToCSV = () => {
    if (tableData.length === 0) return

    // Create CSV content
    const csvHeaders = headers.join(',')
    const csvRows = tableData
      .map(row =>
        headers
          .map(header => {
            let value = String(row[header] || '')
            // Escape values with commas or quotes
            if (value.includes(',') || value.includes('"')) {
              value = `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(',')
      )
      .join('\n')

    const csvContent = `${csvHeaders}\n${csvRows}`

    // Download
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
      <div className="flex justify-between items-center mb-4">
  <div>
    {title && <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>}
    <p className="text-sm text-gray-400 mt-1">{tableData.length} rows × {headers.length} columns</p>
  </div>
  <button
    onClick={exportToCSV}
    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded text-sm hover:from-green-500 hover:to-emerald-500 transition flex items-center gap-2 shadow-lg hover:shadow-green-500/50 font-semibold"
  >
    📥 Export CSV
  </button>
</div>
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gradient-to-r from-purple-700 to-blue-700 text-white sticky top-0">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                >
                  {String(header).substring(0, 50)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {headers.map((header, colIdx) => (
                  <td
                    key={colIdx}
                    className="border border-gray-300 px-4 py-3 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis"
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
    </div>
  )
}

export default TableViewer