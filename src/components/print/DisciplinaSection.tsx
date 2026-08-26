import React from 'react';

interface DisciplinaSectionProps {
  disciplinaNome: string;
}

export const DisciplinaSection: React.FC<DisciplinaSectionProps> = ({ disciplinaNome }) => {
  return (
    <div className="mb-4">
      <div className="inline-block border-b-2 border-[#3B82F6] pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          {disciplinaNome}
        </h3>
      </div>
    </div>
  );
};
