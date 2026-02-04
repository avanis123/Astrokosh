import React from 'react';

const SearchResultCard = ({ page, searchTerm, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-[#222831] to-[#30475E]/30 border border-[#30475E]/50 rounded-xl overflow-hidden hover:border-[#F05454]/50 hover:shadow-2xl hover:shadow-[#F05454]/20 transition-all duration-300 cursor-pointer"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F05454]/0 via-[#F05454]/5 to-[#F05454]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Page Image Preview */}
      <div className="relative bg-[#30475E]/20 aspect-[8.5/11] overflow-hidden">
        <img
          src={`http://localhost:8000${page.image_path}`}
          alt={`Page ${page.page_num}`}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Match Count Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-[#F05454] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {page.match_count} match{page.match_count !== 1 ? 'es' : ''}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#222831] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="text-[#F05454] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Full Page
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 relative z-10">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#F05454] rounded-full"></div>
            <span className="font-black text-[#DDDDDD] uppercase text-sm tracking-wide">
              Page {page.page_num}
            </span>
          </div>
          <span className="text-xs text-[#DDDDDD]/40 font-mono truncate max-w-[120px]">
            {page.pdf_name}
          </span>
        </div>

        {/* Context Preview */}
        {page.context && (
          <p className="text-sm text-[#DDDDDD]/60 line-clamp-2 leading-relaxed">
            {page.context}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchResultCard;