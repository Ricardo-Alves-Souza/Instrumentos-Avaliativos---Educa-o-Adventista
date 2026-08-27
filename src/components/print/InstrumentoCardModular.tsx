import React from 'react';
import { Calendar, Scale, BookOpen } from 'lucide-react';
import { InstrumentoAvaliativo } from '../../types';
import { InfoGrid } from './InfoGrid';
import { DevelopmentSection } from './DevelopmentSection';
import { CriteriaSection } from './CriteriaSection';
import { SkillsSection } from './SkillsSection';
import { ModuleKind } from './paginationUtils';

interface InstrumentoCardModularProps {
  instrumento: InstrumentoAvaliativo;
  modules: ModuleKind[];
  isContinuation: boolean;
  isCompleted: boolean;
  includeSkills: boolean;
  sequentialNumber?: number;
}

export const InstrumentoCardModular: React.FC<InstrumentoCardModularProps> = ({
  instrumento,
  modules,
  isContinuation,
  includeSkills,
  sequentialNumber,
}) => {
  // Use sequential number dynamically calculated for this discipline (Rules 2, 3, 4)
  const displayNum = sequentialNumber !== undefined ? sequentialNumber : instrumento.numero;
  const formattedNumber = String(displayNum).padStart(2, '0');
  const formattedPeso = instrumento.peso.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <article className="break-inside-avoid bg-white border border-[#E5E7EB] rounded-xl p-6 mb-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      {/* If this is a continuation from the previous page, show clear continuation indicator */}
      {isContinuation && (
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white font-bold flex items-center justify-center text-xs">
              {formattedNumber}
            </span>
            <span className="text-xs font-bold text-[#111827] uppercase tracking-tight">
              {instrumento.codigoIdentificador} – {instrumento.tipoNome}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            Continuação
          </span>
        </div>
      )}

      {/* MÓDULO 1: CABEÇALHO DO INSTRUMENTO */}
      {modules.includes('header') && !isContinuation && (
        <div className="instrument-module instrument-module-header break-inside-avoid flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-[#F3F4F6]">
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

          {/* Metadata Badges */}
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
      )}

      {/* MÓDULO 2: CONTEÚDO + FONTE DE ESTUDO */}
      {modules.includes('content_src') && (
        <div className="instrument-module instrument-module-content-src break-inside-avoid">
          <InfoGrid
            conteudo={instrumento.conteudo}
            fonteEstudo={instrumento.fonteEstudo}
          />
        </div>
      )}

      {/* MÓDULO 3: DESENVOLVIMENTO */}
      {modules.includes('development') && (
        <div className="instrument-module instrument-module-development break-inside-avoid">
          <DevelopmentSection desenvolvimento={instrumento.desenvolvimento} />
        </div>
      )}

      {/* MÓDULO 4: CRITÉRIOS AVALIATIVOS */}
      {modules.includes('criteria') && (
        <div className="instrument-module instrument-module-criteria break-inside-avoid">
          <CriteriaSection criterios={instrumento.criterios} />
        </div>
      )}

      {/* MÓDULO 5: HABILIDADES (BNCC) - Apenas se ativo */}
      {modules.includes('skills') && includeSkills && (
        <div className="instrument-module instrument-module-skills break-inside-avoid">
          <SkillsSection habilidades={instrumento.habilidades} />
        </div>
      )}
    </article>
  );
};
