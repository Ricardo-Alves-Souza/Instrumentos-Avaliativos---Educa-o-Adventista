import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronRight,
  GraduationCap,
  Building,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrintDocument } from './print/PrintDocument';
import { sortSeriesPedagogically } from '../utils/pedagogicalSort';

interface DocumentosPDFViewProps {
  initialTurmaId?: string;
  initialBimestre?: number;
}

export const DocumentosPDFView: React.FC<DocumentosPDFViewProps> = ({
  initialTurmaId,
  initialBimestre,
}) => {
  const {
    turmas,
    disciplinas,
    instrumentos,
    systemSettings,
    currentUser,
    getAccessibleTurmas,
    getAccessibleDisciplinas,
    getAccessibleInstrumentos,
  } = useApp();

  const accessibleTurmas = useMemo(() => getAccessibleTurmas(currentUser), [getAccessibleTurmas, currentUser]);
  const accessibleDisciplinas = useMemo(() => getAccessibleDisciplinas(currentUser), [getAccessibleDisciplinas, currentUser]);
  const accessibleInstrumentos = useMemo(() => getAccessibleInstrumentos(currentUser), [getAccessibleInstrumentos, currentUser]);

  // Mode: 'single' (Turma Individual) or 'batch' (Geração em Massa por Série)
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');

  // Series List (Ordered pedagogically)
  const seriesList = useMemo(() => {
    const set = new Set<string>();
    accessibleTurmas.forEach((t) => {
      if (t.serie) set.add(t.serie);
    });
    return sortSeriesPedagogically(Array.from(set));
  }, [accessibleTurmas]);

  // Single Turma Filter: Série first, then Turma
  const initialTurma = accessibleTurmas.find((t) => t.id === initialTurmaId) || accessibleTurmas[0];
  const [selectedSerieSingle, setSelectedSerieSingle] = useState<string>(
    initialTurma?.serie || seriesList[0] || ''
  );

  // Turmas da série selecionada (modo individual)
  const turmasDaSerieSingle = useMemo(() => {
    if (!selectedSerieSingle) return [];
    return accessibleTurmas.filter((t) => t.serie === selectedSerieSingle);
  }, [accessibleTurmas, selectedSerieSingle]);

  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(
    initialTurma?.id || turmasDaSerieSingle[0]?.id || accessibleTurmas[0]?.id || ''
  );
  const [selectedBimestre, setSelectedBimestre] = useState<number>(
    initialBimestre || systemSettings.bimestreAtual
  );
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>('all');

  // Batch Filter: Inicia vazio para escolha explícita (Requisito 7)
  const [selectedSerie, setSelectedSerie] = useState<string>('');
  const [batchPdfType, setBatchPdfType] = useState<'consolidated' | 'individual'>('consolidated');
  const [selectedBatchTurmaId, setSelectedBatchTurmaId] = useState<string>('');

  // Sincronizar turma ao mudar a série no modo individual
  const handleSerieSingleChange = (newSerie: string) => {
    setSelectedSerieSingle(newSerie);
    const turmasDaNovaSerie = accessibleTurmas.filter((t) => t.serie === newSerie);
    if (turmasDaNovaSerie.length > 0) {
      setSelectedTurmaId(turmasDaNovaSerie[0].id);
    }
  };

  // MUST start as FALSE (unchecked)
  const [includeSkills, setIncludeSkills] = useState<boolean>(false);

  // Zoom scale state
  const [zoomScale, setZoomScale] = useState<number>(100);
  const previewScrollRef = React.useRef<HTMLElement>(null);

  const currentYear = new Date().getFullYear();

  // Turmas belonging to the selected batch serie
  const serieTurmas = useMemo(() => {
    if (!selectedSerie) return [];
    return accessibleTurmas.filter((t) => t.serie === selectedSerie);
  }, [accessibleTurmas, selectedSerie]);

  // Handle Print Action
  const handlePrint = () => {
    // Reset scroll position before invoking browser print so entire document prints cleanly
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollTop = 0;
      previewScrollRef.current.scrollLeft = 0;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    let documentName = 'Instrumento Avaliativo';

    if (generationMode === 'single') {
      const currentTurma = accessibleTurmas.find((t) => t.id === selectedTurmaId) || accessibleTurmas[0];
      if (currentTurma) {
        documentName = `Instrumento Avaliativo - ${currentTurma.nome}`;
      }
    } else {
      if (batchPdfType === 'consolidated') {
        documentName = `Instrumento Avaliativo - ${selectedSerie || 'Consolidado'}`;
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
      const currentTurma = accessibleTurmas.find((t) => t.id === selectedTurmaId) || accessibleTurmas[0];
      if (!currentTurma) return [];

      const filtered = accessibleInstrumentos
        .filter((inst) => {
          // Rule 5: SOMENTE INSTRUMENTOS COM STATUS "APROVADO"
          const isAprovado = inst.status === 'APROVADO';
          const matchTurma =
            inst.turmaId === currentTurma.id ||
            inst.turmas?.some((t) => t.turmaId === currentTurma.id);
          const matchBimestre = inst.bimestre === selectedBimestre;
          const matchDisc =
            selectedDisciplinaId === 'all' || inst.disciplinaId === selectedDisciplinaId;
          return isAprovado && matchTurma && matchBimestre && matchDisc;
        })
        .map((inst) => mapInstrumentForTurma(inst, currentTurma.id));

      return [
        {
          turma: currentTurma,
          instrumentos: filtered,
        },
      ];
    } else {
      // Batch mode
      if (!selectedSerie || serieTurmas.length === 0) {
        return [];
      }

      if (batchPdfType === 'consolidated') {
        return serieTurmas.map((turma) => {
          const filtered = accessibleInstrumentos
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

        if (!activeBatchTurma) return [];

        const filtered = accessibleInstrumentos
          .filter((inst) => {
            // Rule 5: SOMENTE INSTRUMENTOS COM STATUS "APROVADO"
            const isAprovado = inst.status === 'APROVADO';
            const matchTurma =
              inst.turmaId === activeBatchTurma.id ||
              inst.turmas?.some((t) => t.turmaId === activeBatchTurma.id);
            const matchBimestre = inst.bimestre === selectedBimestre;
            return isAprovado && matchTurma && matchBimestre;
          })
          .map((inst) => mapInstrumentForTurma(inst, activeBatchTurma.id));
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
    <div className="pdf-view-container flex flex-col lg:flex-row h-screen max-h-screen overflow-hidden bg-[#F3F4F6]">
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
                  {accessibleDisciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* Batch Mode Series Selection (Inicia vazio - Requisito 7) */
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#374151] flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Série Escolar *</span>
                </label>
                <select
                  value={selectedSerie}
                  onChange={(e) => {
                    setSelectedSerie(e.target.value);
                    setSelectedBatchTurmaId('');
                  }}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-medium focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Selecione uma Série...</option>
                  {seriesList.map((serie) => (
                    <option key={serie} value={serie}>
                      {serie} ({accessibleTurmas.filter((t) => t.serie === serie).length} turmas)
                    </option>
                  ))}
                </select>
              </div>

              {selectedSerie && (
                <>
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
              <input
                type="text"
                disabled
                value={currentYear}
                className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#6B7280] font-medium cursor-not-allowed"
              />
            </div>
          </div>

          {/* Habilidades BNCC Checkbox (Default unchecked) */}
          <div className="pt-2 border-t border-[#E5E7EB]">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSkills}
                onChange={(e) => setIncludeSkills(e.target.checked)}
                className="mt-0.5 rounded border-[#D1D5DB] text-[#3B82F6] focus:ring-[#3B82F6] h-4 w-4 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#111827] block">
                  Incluir Habilidades BNCC
                </span>
                <span className="text-[11px] text-[#6B7280] block mt-0.5 leading-tight">
                  Exibe a coluna de códigos BNCC vinculados a cada instrumento.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#E5E7EB] flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            disabled={generationMode === 'batch' && !selectedSerie}
            className="w-full py-2.5 px-4 bg-[#0c3966] hover:bg-[#092a4c] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>

        {/* Document Stats Info Card */}
        <div className="p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B7280] font-medium">Turmas Geradas:</span>
            <span className="font-bold text-[#111827]">{activeDocs.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B7280] font-medium">Instrumentos Aprovados:</span>
            <span className="font-bold text-emerald-600 font-mono">
              {totalInstrumentsCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#E5E7EB] text-[#6B7280]">
            <span>Status da Homologação:</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Apenas Aprovados
            </span>
          </div>
        </div>
      </aside>

      {/* DOCUMENT PREVIEW WORKSPACE */}
      <main
        ref={previewScrollRef as any}
        className="pdf-preview-main flex-1 overflow-y-auto overflow-x-auto p-6 lg:p-8 flex flex-col items-center bg-[#525659]/10"
      >
        {/* Floating Zoom Control Toolbar */}
        <div className="no-print sticky top-0 z-30 mb-6 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-xl shadow-md border border-[#E5E7EB] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.max(prev - 10, 50))}
            className="p-1.5 text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#111827] min-w-[45px] text-center">
            {zoomScale}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.min(prev + 10, 150))}
            className="p-1.5 text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#E5E7EB]"></div>
          <button
            type="button"
            onClick={() => setZoomScale(100)}
            className="text-[11px] font-semibold text-[#3B82F6] hover:underline cursor-pointer"
          >
            100%
          </button>
        </div>

        {/* Document Pages Container */}
        {generationMode === 'batch' && !selectedSerie ? (
          <div className="no-print my-auto bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center max-w-md space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Selecione a Série para Geração em Massa
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Escolha a série desejada no painel à esquerda para emitir os instrumentos avaliativos consolidados de todas as suas turmas.
            </p>
          </div>
        ) : activeDocs.length === 0 ? (
          <div className="no-print my-auto bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center max-w-md space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Nenhum documento disponível para impressão
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verifique os filtros selecionados ou certifique-se de que os instrumentos foram aprovados pela coordenação pedagógica.
            </p>
          </div>
        ) : (
          <div
            className="print-sheets-list flex flex-col gap-8 transition-transform duration-150 origin-top pb-16"
            style={{ transform: `scale(${zoomScale / 100})` }}
          >
            {activeDocs.map((doc, idx) => (
              <div key={doc.turma.id} className="print-doc-group relative">
                {generationMode === 'batch' && (
                  <div className="no-print mb-2 flex items-center justify-between text-xs font-bold text-[#4B5563] px-1">
                    <span>
                      Turma {idx + 1} de {activeDocs.length}: {doc.turma.nome}
                    </span>
                    <span className="text-[11px] font-medium text-[#6B7280]">
                      {doc.instrumentos.length} instrumentos aprovados
                    </span>
                  </div>
                )}
                <PrintDocument
                  turmaNome={doc.turma.nome}
                  bimestre={selectedBimestre}
                  anoLetivo={doc.turma.anoLetivo || currentYear}
                  instrumentos={doc.instrumentos}
                  disciplinas={disciplinas}
                  includeSkills={includeSkills}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
