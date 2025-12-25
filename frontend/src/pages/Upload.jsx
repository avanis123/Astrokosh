import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadedMission, setUploadedMission] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError(null)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError(null)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText)
          setUploadedMission(result)
          setFile(null)
          setProgress(0)
        } else {
          setError('Upload failed')
        }
        setLoading(false)
      })

      xhr.addEventListener('error', () => {
        setError('Upload failed')
        setLoading(false)
      })

      xhr.open('POST', apiEndpoints.upload())
      xhr.send(formData)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
  <div className="max-w-2xl mx-auto px-4">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-400 mb-6">Upload PDF Document</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {!uploadedMission ? (
        <form onSubmit={handleUpload} className="bg-gray rounded-lg shadow-md p-8">
          <div
  onDragEnter={handleDrag}
  onDragLeave={handleDrag}
  onDragOver={handleDrag}
  onDrop={handleDrop}
  className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
    dragActive
      ? 'border-cyan-400 bg-cyan-950/30'
      : 'border-purple-500 bg-slate-900/50'
  }`}
>
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-700 font-medium mb-2">
              Drag and drop your PDF here
            </p>
            <p className="text-gray-500 text-sm mb-4">or</p>
            <label className="inline-block cursor-pointer">
             <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-6 rounded hover:from-cyan-500 hover:to-blue-500 transition shadow-lg hover:shadow-cyan-500/50">
  Browse Files
</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>

          {file && (
            <div className="mt-6 bg-gray-70 rounded p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Selected:</span> {file.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Size:</span>{' '}
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {progress > 0 && progress < 100 && (
            <div className="mt-6">
              <div className="w-full bg-slate-700 rounded-full h-2">
  <div
    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all shadow-lg shadow-cyan-500/50"
    style={{ width: `${progress}%` }}
  ></div>
</div>
              <p className="text-sm text-gray-600 mt-2 text-center">{Math.round(progress)}%</p>
            </div>
          )}

          <button
  type="submit"
  disabled={loading || !file}
  className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-3 rounded-lg hover:from-cyan-500 hover:to-purple-500 transition disabled:opacity-50 font-semibold shadow-lg hover:shadow-purple-500/50"
>
  {loading ? 'Uploading...' : 'Upload PDF'}
</button>
        </form>
      ) : (
        <div className="bg-gray rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-2xl font-bold text-gray-500 mb-2">Upload Successful!</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Mission:</span> {uploadedMission.mission}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">File:</span> {uploadedMission.file_name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Observations Inserted:</span>{' '}
              {uploadedMission.observations_inserted}
            </p>
          </div>

          <div className="flex gap-3">
            <button
  onClick={() => navigate(`/dashboard/${uploadedMission.mission}`)}
  className="flex-1 bg-gradient-to-r from-green-600 to-cyan-600 text-white py-2 px-4 rounded hover:from-green-500 hover:to-cyan-500 transition font-semibold shadow-lg hover:shadow-green-500/50"
>
  View Mission Dashboard
</button>
            <button
              onClick={() => {
                setUploadedMission(null)
                setFile(null)
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  )
}

export default Upload