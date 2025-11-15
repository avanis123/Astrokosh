import React from 'react';
import PdfUploader from './components/PdfUploader';

function App() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🌌 AstroKosh
          </h1>
          <p className="text-xl text-gray-300">
            AI Knowledge System for Space Science
          </p>
        </div>

        {/* PDF Uploader */}
        <PdfUploader />
      </div>
    </div>
  );
}

export default App;