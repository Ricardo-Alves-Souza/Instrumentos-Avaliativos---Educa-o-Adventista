import React from 'react';
import { AdventistLogo } from './AdventistLogo';

interface HeaderPDFProps {
  turmaNome: string;
  bimestre: number;
  anoLetivo: number;
  escolaNome?: string;
  isContinuation?: boolean;
}

export const HeaderPDF: React.FC<HeaderPDFProps> = ({
  turmaNome,
  bimestre,
  anoLetivo,
  escolaNome = 'COLÉGIO ADVENTISTA DE SANTO AMARO',
  isContinuation = false,
}) => {
  // Format turma title cleanly (e.g. "Turma 4º Ano A")
  const safeTurmaNome = turmaNome || '';
  const formattedTurmaNome = safeTurmaNome.toLowerCase().startsWith('turma')
    ? safeTurmaNome
    : safeTurmaNome
    ? `Turma ${safeTurmaNome}`
    : 'Turma';

  if (isContinuation) {
    return (
      <header className="mb-5 pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AdventistLogo size={28} />
            <div>
              <h2 className="text-[13px] font-bold text-[#0c3966] leading-tight">
                {escolaNome}
              </h2>
              <p className="text-[9px] font-medium tracking-wider text-slate-500 uppercase">
                INSTRUMENTOS AVALIATIVOS
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-[#0c3966]">
              {formattedTurmaNome} <span className="font-normal text-slate-500">(Continuação)</span>
            </h3>
            <p className="text-[10px] text-slate-500">
              {bimestre}º Bimestre · Ano letivo {anoLetivo}
            </p>
          </div>
        </div>
      </header>
    );
  }

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

