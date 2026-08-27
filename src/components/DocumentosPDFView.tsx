import React, { useState } from 'react';
import {
  Printer,
  FileText,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrintDocument } from './print/PrintDocument';

interface DocumentosPDFViewProps {
  initialTurmaId?: string;
  initialBimestre?: number;
}

export const DocumentosPDFView: React.FC<DocumentosPDFViewProps> = ({
  initialTurmaId,
  initialBimestre,
}) => {
  const { turmas, disciplinas, instrumentos, systemSettings } = useApp();

  // Mode: 'single' (Turma Individual) or 'batch' (Geração em Massa por Série)
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');

  // Series List
  const seriesList = Array.from(new Set(turmas.map((t) => t.serie)));

  // Single Turma Filter: Série first, then Turma
  const initialTurma = turmas.find((t) => t.id === initialTurmaId) || turmas[0];
  const [selectedSerieSingle, setSelectedSerieSingle] = useState<string>(
    initialTurma?.serie || seriesList[0] || '4º Ano'
  );

  // Turmas da série selecionada (modo individual)
  const turmasDaSerieSingle = turmas.filter((t) => t.serie === selectedSerieSingle);

  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(
    initialTurma?.id || turmasDaSerieSingle[0]?.id || turmas[0]?.id || ''
  );
  const [selectedBimestre, setSelectedBimestre] = useState<number>(
    initialBimestre || systemSettings.bimestreAtual
  );
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>('all');

  // Batch Filter
  const [selectedSerie, setSelectedSerie] = useState<string>('4º Ano');
  const [batchPdfType, setBatchPdfType] = useState<'consolidated' | 'individual'>('consolidated');
  const [selectedBatchTurmaId, setSelectedBatchTurmaId] = useState<string>('');

  // Sincronizar turma ao mudar a série no modo individual
  const handleSerieSingleChange = (newSerie: string) => {
    setSelectedSerieSingle(newSerie);
    const turmasDaNovaSerie = turmas.filter((t) => t.serie === newSerie);
    if (turmasDaNovaSerie.length > 0) {
      setSelectedTurmaId(turmasDaNovaSerie[0].id);
    }
  };

  // MUST start as FALSE (unchecked)
  const [includeSkills, setIncludeSkills] = useState<boolean>(false);

  // Zoom scale state
  const [zoomScale, setZoomScale] = useState<number>(100);

  const currentYear = new Date().getFullYear();

  // Turmas belonging to the selected batch serie
  const serieTurmas = turmas.filter((t) => t.serie === selectedSerie);

  // Handle Print Action
  const handlePrint = () => {
    let documentName = 'Instrumento Avaliativo';

    if (generationMode === 'single') {
      const currentTurma = turmas.find((t) => t.id === selectedTurmaId) || turmas[0];
      if (currentTurma) {
        documentName = `Instrumento Avaliativo - ${currentTurma.nome}`;
      }
    } else {
      if (batchPdfType === 'consolidated') {
        documentName = `Instrumento Avaliativo - ${selectedSerie}`;
      } else {
        const activeBatchTurma =
          serieTurmas.find((t) => t.id === (selectedBatchTurmaId || serieTurmas[0]?.id)) ||
          serieTurmas[0];
        if (activeBatchTurma) {
          documentName = `Instrumento Avaliativo - ${activeBatchTurma.nome}`;
        }
      }
    }

    // Set document title so the browser default PDF filename matches the institutional standard
    const previousTitle = document.title;
    document.title = documentName;

    try {
      if (typeof window !== 'undefined') {
        window.focus();
        window.print();
      }
    } catch (err) {
      console.error('Erro ao invocar janela de impressão do navegador:', err);
    }
  };

  // Helper to map instrument with turma-specific date
  const mapInstrumentForTurma = (inst: any, turmaId: string) => {
    const tEntrega = inst.turmas?.find((t: any) => t.turmaId === turmaId);
    return {
      ...inst,
      data: tEntrega?.data || inst.data,
      turmaId: turmaId,
    };
  };

  // Get active documents to render — STRICTLY FILTERING ONLY "APROVADO" INSTRUMENTS
  const renderDocuments = () => {
    if (generationMode === 'single') {
      const currentTurma = turmas.find((t) => t.id === selectedTurmaId) || turmas[0];
      const filtered = instrumentos
        .filter((inst) => {
          // Rule 5: SOMENTE INSTRUMENTOS COM STATUS "APROVADO"
          const isAprovado = inst.status === 'APROVADO';
          const matchTurma =
            inst.turmaId === selectedTurmaId ||
            inst.turmas?.some((t) => t.turmaId === selectedTurmaId);
          const matchBimestre = inst.bimestre === selectedBimestre;
          const matchDisc =
            selectedDisciplinaId === 'all' || inst.disciplinaId === selectedDisciplinaId;
          return isAprovado && matchTurma && matchBimestre && matchDisc;
        })
        .map((inst) => mapInstrumentForTurma(inst, selectedTurmaId));

      return [
        {
          turma: currentTurma,
          instrumentos: filtered,
        },
      ];
    } else {
      // Batch mode
      if (batchPdfType === 'consolidated') {
        return serieTurmas.map((turma) => {
          const filtered = instrumentos
            .filter((inst) => {
              // Rule 5: SOMENTE INSTRUMENTOS COM STATUS "APROVADO"
              const isAprovado = inst.status === 'APROVADO';
              const matchTurma =
                inst.turmaId === turma.id ||
                inst.turmas?.some((t) => t.turmaId === turma.id);
              const matchBimestre = inst.bimestre === selectedBimestre;
              return isAprovado && matchTurma && matchBimestre;
            })
            .map((inst) => mapInstrumentForTurma(inst, turma.id));
          return {
            turma,
            instrumentos: filtered,
          };
        });
      } else {
        const activeBatchTurma =
          serieTurmas.find((t) => t.id === (selectedBatchTurmaId || serieTurmas[0]?.id)) ||
          serieTurmas[0];
        const filtered = instrumentos
          .filter((inst) => {
            // Rule 5: SOMENTE INSTRUMENTOS COM STATUS "APROVADO"
            const isAprovado = inst.status === 'APROVADO';
            const matchTurma =
              inst.turmaId === activeBatchTurma?.id ||
              inst.turmas?.some((t) => t.turmaId === activeBatchTurma?.id);
            const matchBimestre = inst.bimestre === selectedBimestre;
            return isAprovado && matchTurma && matchBimestre;
          })
          .map((inst) => mapInstrumentForTurma(inst, activeBatchTurma?.id));
        return [
          {
            turma: activeBatchTurma,
            instrumentos: filtered,
          },
        ];
      }
    }
  };

  const activeDocs = renderDocuments();
  const totalInstrumentsCount = activeDocs.reduce(
    (acc, doc) => acc + doc.instrumentos.length,
    0
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen max-h-screen overflow-hidden bg-[#F3F4F6]">
      {/* CONTROL & EXPORT PANEL (Fixed on screen, only its inner content scrolls if needed) */}
      <aside className="no-print w-full lg:w-[360px] bg-white border-r border-[#E5E7EB] p-6 flex flex-col gap-5 shrink-0 overflow-y-auto shadow-xs h-auto lg:h-full">
        {/* Title Header */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium mb-1">
            <span>Impressão</span>
            <ChevronRight className="w-3 h-3 text-[#9CA3AF]" />
            <span className="text-[#3B82F6] font-semibold">Documentos PDF</span>
          </div>
          <h2 className="text-xl font-bold text-[#111827] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3B82F6]" />
            Gerar Instrumentos
          </h2>
          <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
            Emita e visualize os Instrumentos Avaliativos em padrão institucional A4 para impressão ou exportação.
          </p>
        </div>

        {/* Mode Selector: Turma Individual vs Geração em Massa por Série */}
        <div className="bg-[#F3F4F6] p-1 rounded-lg flex items-center">
          <button
            type="button"
            onClick={() => setGenerationMode('single')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer text-center ${
              generationMode === 'single'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Por Turma
          </button>
          <button
            type="button"
            onClick={() => setGenerationMode('batch')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
              generationMode === 'batch'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Layers className="w-3 h-3 text-[#3B82F6]" />
            <span>Em Massa (Série)</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3.5">
          <h3 className="text-[10px] font-bold tracking-[0.08em] text-[#6B7280] uppercase">
            Parâmetros do Documento
          </h3>

          {generationMode === 'single' ? (
            <>
              {/* 1º Campo: Série */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#374151] flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Série</span>
                </label>
                <select
                  value={selectedSerieSingle}
                  onChange={(e) => handleSerieSingleChange(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                >
                  {seriesList.map((serie) => (
                    <option key={serie} value={serie}>
                      {serie}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2º Campo: Turma (apresentando apenas as turmas da série selecionada) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#374151]">
                  Turma
                </label>
                <select
                  value={selectedTurmaId}
                  onChange={(e) => setSelectedTurmaId(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                >
                  {turmasDaSerieSingle.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.turno})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3º Campo: Disciplina Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#374151]">
                  Disciplina
                </label>
                <select
                  value={selectedDisciplinaId}
                  onChange={(e) => setSelectedDisciplinaId(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                >
                  <option value="all">Todas as Disciplinas da Turma</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* Batch Mode Series Selection */
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#374151]">
                  Série Escolar
                </label>
                <select
                  value={selectedSerie}
                  onChange={(e) => {
                    setSelectedSerie(e.target.value);
                    setSelectedBatchTurmaId('');
                  }}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-medium"
                >
                  {seriesList.map((serie) => (
                    <option key={serie} value={serie}>
                      {serie} ({turmas.filter((t) => t.serie === serie).length} turmas)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#374151]">
                  Formato de Saída em Massa
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchPdfType('consolidated')}
                    className={`p-2 rounded-lg border text-left text-[11px] font-medium cursor-pointer transition-all ${
                      batchPdfType === 'consolidated'
                        ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#1E40AF] font-bold'
                        : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]'
                    }`}
                  >
                    PDF Único Consolidado
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchPdfType('individual')}
                    className={`p-2 rounded-lg border text-left text-[11px] font-medium cursor-pointer transition-all ${
                      batchPdfType === 'individual'
                        ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#1E40AF] font-bold'
                        : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]'
                    }`}
                  >
                    Turma a Turma
                  </button>
                </div>
              </div>

              {batchPdfType === 'individual' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#374151]">
                    Selecione a Turma da Série
                  </label>
                  <select
                    value={selectedBatchTurmaId || serieTurmas[0]?.id}
                    onChange={(e) => setSelectedBatchTurmaId(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-medium"
                  >
                    {serieTurmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Bimestre & Ano Letivo */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">
                Bimestre
              </label>
              <select
                value={selectedBimestre}
                onChange={(e) => setSelectedBimestre(Number(e.target.value))}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-medium"
              >
                <option value={1}>1º Bimestre</option>
                <option value={2}>2º Bimestre</option>
                <option value={3}>3º Bimestre</option>
                <option value={4}>4º Bimestre</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">
                Ano Letivo
              </label>
              <div className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono font-semibold">
                {currentYear}
              </div>
            </div>
          </div>
        </div>

        {/* EXPORT OPTIONS BOX */}
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.08em] text-[#6B7280] uppercase mb-2">
            Opções de Exportação
          </h3>

          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3.5">
            <div
              onClick={() => setIncludeSkills(!includeSkills)}
              className="flex items-center gap-3 mb-1.5 cursor-pointer select-none"
            >
              <div
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  includeSkills ? 'bg-[#3B82F6]' : 'bg-[#CBD5E1]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                    includeSkills ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </div>
              <span className="text-xs font-bold text-[#1E40AF]">
                Incluir Habilidades (BNCC)
              </span>
            </div>

            <p className="text-[10px] text-[#3B82F6] leading-relaxed">
              {includeSkills
                ? 'Versão completa com matriz de habilidades para professores e coordenação'
                : 'Versão simplificada para entrega aos alunos e pais'}
            </p>
          </div>
        </div>

        {/* Action Print Button */}
        <div className="pt-2">
          <button
            id="btn-exportar-pdf"
            type="button"
            onClick={handlePrint}
            className="w-full bg-[#111827] hover:bg-[#1f2937] text-white font-bold py-3 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar PDF / Imprimir</span>
          </button>
        </div>
      </aside>

      {/* RIGHT: INTERACTIVE A4 LIVE PREVIEW & PRINT CANVAS (Only this section scrolls vertically) */}
      <main className="flex-1 flex flex-col items-center p-6 lg:p-8 overflow-y-auto h-full">
        {/* Top Preview Toolbar (Hidden in Print) */}
        <div className="no-print w-full max-w-[210mm] mb-4 flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-[#E5E7EB] shadow-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#111827]">Pré-visualização A4</span>
            <span className="text-[11px] text-[#6B7280]">
              ({activeDocs.length} {activeDocs.length === 1 ? 'turma' : 'turmas'} · {totalInstrumentsCount} {totalInstrumentsCount === 1 ? 'instrumento aprovado' : 'instrumentos aprovados'})
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomScale(Math.max(50, zoomScale - 10))}
              className="p-1 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors cursor-pointer"
              title="Reduzir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-medium text-[#374151] w-10 text-center">
              {zoomScale}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale(Math.min(130, zoomScale + 10))}
              className="p-1 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors cursor-pointer"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(100)}
              className="text-[11px] text-[#3B82F6] font-semibold px-2 py-0.5 hover:bg-[#EFF6FF] rounded transition-colors cursor-pointer ml-1"
            >
              100%
            </button>
          </div>
        </div>

        {/* List of A4 Sheets (Single or Multiple Consolidated) */}
        <div
          className="print-sheets-list space-y-8 w-full max-w-[210mm] transition-transform origin-top pb-16"
          style={{ transform: `scale(${zoomScale / 100})` }}
        >
          {activeDocs.map((doc) => (
            <PrintDocument
              key={doc.turma.id}
              turmaNome={doc.turma.nome}
              bimestre={selectedBimestre}
              anoLetivo={currentYear}
              instrumentos={doc.instrumentos}
              disciplinas={disciplinas}
              includeSkills={includeSkills}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
