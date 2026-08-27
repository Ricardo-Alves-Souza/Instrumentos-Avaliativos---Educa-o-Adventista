import React from 'react';
import { InstrumentoAvaliativo, Disciplina } from '../../types';
import { HeaderPDF } from './HeaderPDF';
import { DisciplinaSection } from './DisciplinaSection';
import { InstrumentoCardModular } from './InstrumentoCardModular';
import { FooterPDF } from './FooterPDF';
import { paginateTurmaDocument, PageData } from './paginationUtils';

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
  // Generate intelligent modular pages
  const pages: PageData[] = React.useMemo(() => {
    return paginateTurmaDocument({
      turmaNome,
      bimestre,
      anoLetivo,
      instrumentos,
      disciplinas,
      includeSkills,
    });
  }, [turmaNome, bimestre, anoLetivo, instrumentos, disciplinas, includeSkills]);

  return (
    <>
      {pages.map((page, pIdx) => (
        <div
          key={`${turmaNome}-page-${page.pageNumber}`}
          className="print-page-container w-full min-h-[297mm] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB] rounded-lg p-10 sm:p-14 flex flex-col justify-between"
          style={{ pageBreakBefore: pIdx > 0 ? 'always' : 'auto' }}
        >
          <div className="w-full">
            {/* Header: Full Institutional on Page 1, Compact on subsequent pages */}
            <HeaderPDF
              turmaNome={page.turmaNome}
              bimestre={page.bimestre}
              anoLetivo={page.anoLetivo}
              isContinuation={!page.isFirstPage}
            />

            {/* Empty State */}
            {page.sections.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl my-4">
                Nenhum instrumento avaliativo cadastrado para esta turma no {bimestre}º Bimestre ({anoLetivo}).
              </div>
            ) : (
              <main className="space-y-4">
                {page.sections.map((section, sIdx) => {
                  if (section.type === 'disciplina') {
                    return (
                      <DisciplinaSection
                        key={`disc-${section.disciplinaNome}-${sIdx}`}
                        disciplinaNome={section.disciplinaNome}
                      />
                    );
                  }

                  return (
                    <InstrumentoCardModular
                      key={`inst-${section.piece.instrumento.id}-${sIdx}`}
                      instrumento={section.piece.instrumento}
                      modules={section.piece.modules}
                      isContinuation={section.piece.isContinuation}
                      isCompleted={section.piece.isCompleted}
                      includeSkills={includeSkills}
                      sequentialNumber={section.piece.sequentialNumber}
                    />
                  );
                })}
              </main>
            )}
          </div>

          {/* Institutional Footer with Page Indicator */}
          {showFooter && (
            <FooterPDF
              pageNumber={page.pageNumber}
              totalPages={page.totalPages}
            />
          )}
        </div>
      ))}
    </>
  );
};
