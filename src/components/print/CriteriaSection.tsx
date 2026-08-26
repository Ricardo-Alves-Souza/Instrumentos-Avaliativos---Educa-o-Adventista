import React from 'react';
import { Check } from 'lucide-react';
import { CriterioAvaliativo } from '../../types';

interface CriteriaSectionProps {
  criterios: CriterioAvaliativo[];
}

export const CriteriaSection: React.FC<CriteriaSectionProps> = ({ criterios }) => {
  if (!criterios || criterios.length === 0) {
    return null;
  }

  // Format decimal values with comma (e.g. 1.5 -> "1,50")
  const formatValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">
        Critérios Avaliativos
      </p>

      <div className="space-y-1.5 w-full">
        {criterios.map((crit) => (
          <div
            key={crit.id}
            className="flex items-center text-xs text-[#374151] w-full py-0.5"
          >
            {/* Emerald Checkmark */}
            <span className="text-[#10B981] font-bold mr-2 text-sm leading-none">✓</span>

            {/* Description */}
            <span className="shrink-0 max-w-[70%] sm:max-w-[75%] leading-tight text-[#374151]">
              {crit.descricao}
            </span>

            {/* Dotted leader line */}
            <div className="flex-1 border-b border-dotted border-[#E5E7EB] mx-2 mb-1" />

            {/* Right-aligned point value */}
            <span className="font-semibold text-[#111827] shrink-0 tabular-nums text-xs">
              {formatValor(crit.valor)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
