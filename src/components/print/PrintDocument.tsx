import React from 'react';
import { InstrumentoAvaliativo, Disciplina } from '../../types';
import { HeaderPDF } from './HeaderPDF';
import { DisciplinaSection } from './DisciplinaSection';
import { InstrumentoCard } from './InstrumentoCard';
import { FooterPDF } from './FooterPDF';

interface PrintDocumentProps {
  turmaNome: string;
  bimestre: number;
  anoLetivo: number;
  instrumentos: InstrumentoAvaliativo[];
  disciplinas?: Disciplina[];
  includeSkills: boolean;
  showFooter?: boolean;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  turmaNome,
  bimestre,
  anoLetivo,
  instrumentos,
  disciplinas = [],
  includeSkills,
  showFooter = true,
}) => {
  // Group instruments by disciplina and sort by official precedence order
  const groupedByDisciplina = React.useMemo(() => {
    const map = new Map<string, { discId: string; discNome: string; items: InstrumentoAvaliativo[] }>();
    
    for (const inst of instrumentos) {
      const discNome = inst.disciplinaNome || 'Geral';
      const discId = inst.disciplinaId || 'general';
      if (!map.has(discNome)) {
        map.set(discNome, { discId, discNome, items: [] });
      }
      map.get(discNome)!.items.push(inst);
    }

    const groups = Array.from(map.values()).map((g) => {
      // Find discipline order
      const discObj = disciplinas.find((d) => d.id === g.discId || d.nome.toLowerCase() === g.discNome.toLowerCase());
      const ordem = discObj?.ordem ?? 999;
      return {
        disciplinaNome: g.discNome,
        ordem,
        items: g.items.sort((a, b) => a.numero - b.numero),
      };
    });

    // Sort by official academic precedence
    return groups.sort((a, b) => a.ordem - b.ordem);
  }, [instrumentos, disciplinas]);

  return (
    <div className="print-doc-root w-full bg-white text-slate-800">
      {/* Institutional Document Header */}
      <HeaderPDF
        turmaNome={turmaNome}
        bimestre={bimestre}
        anoLetivo={anoLetivo}
      />

      {/* Main Content Area: Disciplinas & Instrumentos */}
      {instrumentos.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl my-4">
          Nenhum instrumento avaliativo cadastrado para esta turma no {bimestre}º Bimestre ({anoLetivo}).
        </div>
      ) : (
        <main className="space-y-6">
          {groupedByDisciplina.map((group) => (
            <section key={group.disciplinaNome} className="w-full break-inside-avoid">
              {/* Disciplina Category Heading */}
              <DisciplinaSection disciplinaNome={group.disciplinaNome} />

              {/* List of Evaluation Instruments */}
              <div className="space-y-4">
                {group.items.map((instrumento) => (
                  <InstrumentoCard
                    key={instrumento.id}
                    instrumento={instrumento}
                    includeSkills={includeSkills}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      )}

      {/* Institutional Footer */}
      {showFooter && <FooterPDF />}
    </div>
  );
};
