import React from 'react';
import { AdventistLogo } from './AdventistLogo';

interface HeaderPDFProps {
  turmaNome: string;
  bimestre: number;
  anoLetivo: number;
  escolaNome?: string;
}

export const HeaderPDF: React.FC<HeaderPDFProps> = ({
  turmaNome,
  bimestre,
  anoLetivo,
  escolaNome = 'Colégio Adventista de Santo Amaro',
}) => {
  // Format turma title cleanly (e.g. "Turma 4º Ano A")
  const formattedTurmaNome = turmaNome.toLowerCase().startsWith('turma')
    ? turmaNome
    : `Turma ${turmaNome}`;

  return (
    <header className="mb-6">
      {/* Institutional Top: Logo + School Name + Subtitle */}
      <div className="flex items-center gap-3.5">
        <AdventistLogo size={42} />
        <div>
          <h2 className="text-[17px] font-bold text-[#0c3966] leading-tight tracking-normal">
            {escolaNome}
          </h2>
          <p className="text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase mt-0.5">
            INSTRUMENTOS AVALIATIVOS
          </p>
        </div>
      </div>

      {/* Class & Academic Period Title */}
      <div className="mt-5">
        <h1 className="text-[26px] font-bold tracking-tight text-[#0c3966] leading-tight">
          {formattedTurmaNome}
        </h1>
        <p className="text-sm text-slate-600 font-normal mt-1">
          {bimestre}º Bimestre · Ano letivo {anoLetivo}
        </p>
      </div>

      {/* Clean Divider Line as in image.png */}
      <hr className="border-t border-slate-200 mt-5 mb-6" />
    </header>
  );
};

