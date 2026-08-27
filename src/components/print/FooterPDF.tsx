import React from 'react';

interface FooterPDFProps {
  pageNumber?: number;
  totalPages?: number;
}

export const FooterPDF: React.FC<FooterPDFProps> = ({ pageNumber, totalPages }) => {
  return (
    <footer className="mt-6 pt-3 border-t border-slate-200">
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-normal tracking-wide">
        <p className="flex-1 text-center">
          Colégio Adventista de Santo Amaro · Documento institucional
        </p>
        {totalPages && totalPages > 1 && pageNumber && (
          <span className="text-[10px] text-slate-400 tabular-nums shrink-0 ml-2 font-mono">
            {pageNumber}/{totalPages}
          </span>
        )}
      </div>
    </footer>
  );
};

