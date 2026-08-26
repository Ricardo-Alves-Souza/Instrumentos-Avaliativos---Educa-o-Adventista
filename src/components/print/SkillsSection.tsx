import React from 'react';
import { Award } from 'lucide-react';
import { Habilidade } from '../../types';

interface SkillsSectionProps {
  habilidades?: Habilidade[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ habilidades }) => {
  // If no skills or empty array, return null (requirement: do not show empty section)
  if (!habilidades || habilidades.length === 0) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-[#F3F4F6]">
      <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider mb-3">
        Habilidades (BNCC)
      </p>

      <div className="flex flex-wrap gap-2">
        {habilidades.map((hab) => (
          <div
            key={hab.id}
            className="text-[10px] bg-[#F3F4F6] px-2.5 py-1.5 rounded-md border border-[#E5E7EB] text-[#4B5563] leading-relaxed"
          >
            <span className="font-bold text-[#111827]">{hab.codigo}</span> – {hab.descricao}
          </div>
        ))}
      </div>
    </div>
  );
};
