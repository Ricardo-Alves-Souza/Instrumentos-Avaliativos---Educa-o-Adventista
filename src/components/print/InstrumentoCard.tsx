import React from 'react';
import { Calendar, Scale, BookOpen } from 'lucide-react';
import { InstrumentoAvaliativo } from '../../types';
import { InfoGrid } from './InfoGrid';
import { DevelopmentSection } from './DevelopmentSection';
import { CriteriaSection } from './CriteriaSection';
import { SkillsSection } from './SkillsSection';

interface InstrumentoCardProps {
  instrumento: InstrumentoAvaliativo;
  includeSkills: boolean;
}

export const InstrumentoCard: React.FC<InstrumentoCardProps> = ({
  instrumento,
  includeSkills,
}) => {
  // Format sequential number with leading zero e.g. "01", "02"
  const formattedNumber = String(instrumento.numero).padStart(2, '0');

  // Format weight with 2 decimal places e.g. "6,00"
  const formattedPeso = instrumento.peso.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <article className="break-inside-avoid bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      {/* Header of the Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-3.5">
          {/* Blue Circle with Sequential Number */}
          <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
            {formattedNumber}
          </div>

          {/* Instrument Title */}
          <h3 className="text-base font-bold text-[#111827] tracking-tight uppercase">
            {instrumento.codigoIdentificador} – {instrumento.tipoNome}
          </h3>
        </div>

        {/* Metadata Badges (Light blue background, consistent badges) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Badge */}
          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Calendar className="w-3 h-3 text-[#3B82F6]" />
            <span>Data: {instrumento.data}</span>
          </span>

          {/* Peso Badge */}
          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Scale className="w-3 h-3 text-[#3B82F6]" />
            <span>Peso: {formattedPeso}</span>
          </span>

          {/* Disciplina Badge */}
          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <BookOpen className="w-3 h-3 text-[#3B82F6]" />
            <span>{instrumento.disciplinaNome}</span>
          </span>
        </div>
      </div>

      {/* Info Grid: Conteúdo & Fonte de Estudo (side-by-side, equal height) */}
      <InfoGrid
        conteudo={instrumento.conteudo}
        fonteEstudo={instrumento.fonteEstudo}
      />

      {/* Development Section (100% width, editorial spacing, bug-free) */}
      <DevelopmentSection desenvolvimento={instrumento.desenvolvimento} />

      {/* Criteria Section (100% width, leader dots, right-aligned) */}
      <CriteriaSection criterios={instrumento.criterios} />

      {/* Optional Skills Section for Teachers / Coordinators */}
      {includeSkills && (
        <SkillsSection habilidades={instrumento.habilidades} />
      )}
    </article>
  );
};
