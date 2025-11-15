import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

export default function PdfUploader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadData, setUploadData] = useState(null); // Store upload response data
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
    } else {
      setStatus('error');
      setMessage('Please select a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('error');
      setMessage('Please select a PDF first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setStatus('uploading');
    setMessage('Processing PDF and extracting data...');

    try {
      const res = await fetch('http://localhost:8000/upload_pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setUploadData(data); // Store the response data
        setMessage(`Successfully processed ${data.filename || file.name}`);
        
        // DON'T clear file immediately - let user see the results
        // Removed the setTimeout that was resetting everything
      } else {
        setStatus('error');
        setMessage(data.detail || 'Upload failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Server connection failed. Make sure backend is running on port 8000.');
      console.error('Upload error:', error);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus('idle');
    setMessage('');
    setUploadData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setMessage('');
    setUploadData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Upload Mission PDF
        </h2>
        <p className="text-gray-400">
          Upload ISRO mission handbooks or reports for data extraction
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-300
          ${isDragging 
            ? 'border-cosmic-purple bg-cosmic-purple/10 scale-105' 
            : 'border-gray-600 bg-white/5'
          }
          ${file ? 'border-green-500' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Upload Icon/Content */}
        <div className="flex flex-col items-center justify-center space-y-4">
          {!file ? (
            <>
              <div className={`
                p-4 rounded-full transition-all duration-300
                ${isDragging ? 'bg-cosmic-purple/20 scale-110' : 'bg-white/10'}
              `}>
                <Upload 
                  size={48} 
                  className={`
                    transition-colors duration-300
                    ${isDragging ? 'text-cosmic-purple' : 'text-gray-400'}
                  `}
                />
              </div>

              <div className="text-center">
                <p className="text-lg text-white mb-2">
                  Drag and drop your PDF here
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  or click to browse
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-cosmic-purple text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors duration-200"
                >
                  Select PDF
                </label>
              </div>

              <p className="text-xs text-gray-500">
                Supported: Chandrayaan, Aditya-L1, Mangalyaan PDFs
              </p>
            </>
          ) : (
            // File Selected
            <div className="w-full">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded">
                    <File size={24} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                {status === 'idle' && (
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <XCircle size={20} className="text-red-400" />
                  </button>
                )}
              </div>

              {/* Upload Button */}
              {status === 'idle' && (
                <button
                  onClick={handleUpload}
                  className="w-full mt-4 px-6 py-3 bg-cosmic-purple text-white rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 font-semibold"
                >
                  Extract Data from PDF
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {status !== 'idle' && (
        <div className={`
          mt-6 p-4 rounded-lg border animate-fade-in
          ${status === 'uploading' ? 'bg-blue-500/10 border-blue-500/30' : ''}
          ${status === 'success' ? 'bg-green-500/10 border-green-500/30' : ''}
          ${status === 'error' ? 'bg-red-500/10 border-red-500/30' : ''}
        `}>
          <div className="flex items-start space-x-3">
            {status === 'uploading' && (
              <Loader className="text-blue-400 animate-spin flex-shrink-0 mt-1" size={20} />
            )}
            {status === 'success' && (
              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
            )}
            {status === 'error' && (
              <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
            )}
            
            <div className="flex-1">
              <p className={`
                font-medium
                ${status === 'uploading' ? 'text-blue-300' : ''}
                ${status === 'success' ? 'text-green-300' : ''}
                ${status === 'error' ? 'text-red-300' : ''}
              `}>
                {status === 'uploading' && 'Processing...'}
                {status === 'success' && 'Success!'}
                {status === 'error' && 'Error'}
              </p>
              <p className="text-sm text-gray-300 mt-1">{message}</p>
              
              {/* Display Upload Data */}
              {status === 'success' && uploadData && (
                <div className="mt-3 p-3 bg-white/5 rounded border border-green-500/20">
                  {uploadData.mission && (
                    <p className="text-sm text-green-400 font-mono mb-1">
                      📘 Mission: {uploadData.mission}
                    </p>
                  )}
                  {uploadData.chunks !== undefined && (
                    <p className="text-sm text-green-400 font-mono mb-1">
                      📄 Chunks Created: {uploadData.chunks}
                    </p>
                  )}
                  {uploadData.text_length !== undefined && (
                    <p className="text-sm text-green-400 font-mono mb-1">
                      🔠 Characters Extracted: {uploadData.text_length.toLocaleString()}
                    </p>
                  )}
                  {uploadData.extracted_observations !== undefined && (
                    <p className="text-sm text-green-400 font-mono mb-1">
                      📊 Observations: {uploadData.extracted_observations}
                    </p>
                  )}
                  {uploadData.filename && (
                    <p className="text-sm text-green-400 font-mono">
                      📁 File: {uploadData.filename}
                    </p>
                  )}
                </div>
              )}

              {/* Upload Another Button */}
              {status === 'success' && (
                <button
                  onClick={handleReset}
                  className="mt-4 w-full px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Upload Another PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}