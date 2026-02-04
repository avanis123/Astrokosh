import React from 'react';

const PageViewer = ({ page, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#222831]/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#30475E] to-[#222831] rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#F05454]/30 shadow-2xl shadow-[#F05454]/20">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#30475E]/50 bg-gradient-to-r from-[#30475E]/30 to-transparent">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-[#F05454] rounded-full animate-pulse"></div>
              <h3 className="text-2xl font-black text-[#DDDDDD] uppercase tracking-tight">
                {page.pdf_name}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#DDDDDD]/60">
                Page <span className="text-[#F05454] font-bold">{page.page_num}</span>
              </span>
              <span className="text-[#DDDDDD]/40">•</span>
              <span className="text-[#DDDDDD]/60">
                <span className="text-[#F05454] font-bold">{page.match_count}</span> match{page.match_count !== 1 ? 'es' : ''} found
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-[#222831] border border-[#30475E]/50 hover:border-[#F05454] hover:bg-[#F05454]/10 text-[#DDDDDD] hover:text-[#F05454] transition-all duration-300 flex items-center justify-center group"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto p-6 bg-[#222831]/50">
          <div className="max-w-full mx-auto">
            <img
              src={`http://localhost:8000${page.image_path}`}
              alt={`Page ${page.page_num}`}
              className="mx-auto max-w-full h-auto rounded-lg shadow-2xl border border-[#30475E]/50"
            />
          </div>
        </div>

        {/* Footer with Context */}
        {page.context && (
          <div className="p-6 border-t border-[#30475E]/50 bg-gradient-to-r from-[#30475E]/20 to-transparent">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <svg className="w-5 h-5 text-[#F05454]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#F05454] uppercase tracking-wider mb-1">Context</p>
                <p className="text-sm text-[#DDDDDD]/70 leading-relaxed">{page.context}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageViewer;