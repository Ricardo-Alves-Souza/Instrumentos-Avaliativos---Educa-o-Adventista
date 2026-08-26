import React from 'react';
import { BookOpen, Library } from 'lucide-react';

interface InfoGridProps {
  conteudo: string;
  fonteEstudo: string;
}

export const InfoGrid: React.FC<InfoGridProps> = ({ conteudo, fonteEstudo }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6 items-stretch">
      {/* Conteúdo Box */}
      <div className="flex flex-col h-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-lg p-4">
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
          Conteúdo
        </p>
        <p className="text-xs leading-relaxed text-[#374151] whitespace-pre-line flex-1">
          {conteudo || '—'}
        </p>
      </div>

      {/* Fonte de Estudo Box */}
      <div className="flex flex-col h-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-lg p-4">
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
          Fonte de Estudo
        </p>
        <p className="text-xs leading-relaxed text-[#374151] whitespace-pre-line flex-1">
          {fonteEstudo || '—'}
        </p>
      </div>
    </div>
  );
};
