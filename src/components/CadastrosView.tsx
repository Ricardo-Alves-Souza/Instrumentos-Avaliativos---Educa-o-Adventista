import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  X,
  Layers,
  Filter,
  AlertCircle,
  FileCheck,
  Sun,
  Sunset,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Disciplina, Turma, TipoInstrumentoItem } from '../types';
import { ConfirmModal } from './ConfirmModal';

type TurmaSegmentTab = 'FUNDAMENTAL_1' | 'FUNDAMENTAL_2' | 'ENSINO_MEDIO';

const TURMA_SEGMENTS_CONFIG: {
  id: TurmaSegmentTab;
  label: string;
  shortLabel: string;
  subtitle: string;
  nivelMatch: string;
}[] = [
  {
    id: 'FUNDAMENTAL_1',
    label: 'Fundamental I',
    shortLabel: 'Fund. I',
    subtitle: '1º ao 5º Ano',
    nivelMatch: 'Ensino Fundamental I',
  },
  {
    id: 'FUNDAMENTAL_2',
    label: 'Fundamental II',
    shortLabel: 'Fund. II',
    subtitle: '6º ao 9º Ano',
    nivelMatch: 'Ensino Fundamental II',
  },
  {
    id: 'ENSINO_MEDIO',
    label: 'Ensino Médio',
    shortLabel: 'Ens. Médio',
    subtitle: '1ª à 3ª Série',
    nivelMatch: 'Ensino Médio',
  },
];

export const CadastrosView: React.FC = () => {
  const {
    turmas,
    addTurma,
    updateTurma,
    deleteTurma,
    disciplinas,
    addDisciplina,
    updateDisciplina,
    deleteDisciplina,
    moveDisciplinaOrder,
    tiposInstrumento,
    addTipoInstrumento,
    updateTipoInstrumento,
    deleteTipoInstrumento,
    currentUser,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'disciplinas' | 'turmas' | 'tiposInstrumento'>('disciplinas');

  // Search and Filters
  const [searchDisc, setSearchDisc] = useState('');
  const [searchTurma, setSearchTurma] = useState('');
  const [searchTipoInst, setSearchTipoInst] = useState('');
  const [turmaActiveSegment, setTurmaActiveSegment] = useState<TurmaSegmentTab>('FUNDAMENTAL_1');

  // Disciplina Modal State
  const [isDiscModalOpen, setIsDiscModalOpen] = useState(false);
  const [editingDisc, setEditingDisc] = useState<Disciplina | null>(null);
  const [discNome, setDiscNome] = useState('');
  const [discCodigo, setDiscCodigo] = useState('');
  const [discOrdem, setDiscOrdem] = useState<number>(1);
  const [isSavingDisc, setIsSavingDisc] = useState(false);
  const [discError, setDiscError] = useState<string | null>(null);

  // Turma Modal State
  const [isTurmaModalOpen, setIsTurmaModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [turmaNome, setTurmaNome] = useState('');
  const [turmaSerie, setTurmaSerie] = useState('1º Ano');
  const [turmaNivel, setTurmaNivel] = useState('Ensino Fundamental I');
  const [turmaTurno, setTurmaTurno] = useState<'Manhã' | 'Tarde'>('Manhã');
  const [isSavingTurma, setIsSavingTurma] = useState(false);
  const [turmaError, setTurmaError] = useState<string | null>(null);

  // Tipo Instrumento Modal State
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoInstrumentoItem | null>(null);
  const [tipoNome, setTipoNome] = useState('');
  const [isSavingTipo, setIsSavingTipo] = useState(false);
  const [tipoError, setTipoError] = useState<string | null>(null);

  // Confirm Delete Modals
  const [deletingDisc, setDeletingDisc] = useState<Disciplina | null>(null);
  const [isDeletingDisc, setIsDeletingDisc] = useState(false);
  const [deletingTurma, setDeletingTurma] = useState<Turma | null>(null);
  const [isDeletingTurma, setIsDeletingTurma] = useState(false);
  const [deletingTipo, setDeletingTipo] = useState<TipoInstrumentoItem | null>(null);
  const [isDeletingTipo, setIsDeletingTipo] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isAuthorized =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'TI' ||
    currentUser.role === 'COORDENADOR';

  // Open Disciplina Modal for Create or Edit
  const handleOpenDiscModal = (disc?: Disciplina) => {
    setDiscError(null);
    if (disc) {
      setEditingDisc(disc);
      setDiscNome(disc.nome);
      setDiscCodigo(disc.codigo);
      setDiscOrdem(disc.ordem);
    } else {
      setEditingDisc(null);
      setDiscNome('');
      setDiscCodigo('');
      setDiscOrdem(disciplinas.length + 1);
    }
    setIsDiscModalOpen(true);
  };

  const handleSaveDisc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discNome.trim() || !discCodigo.trim()) return;

    try {
      setIsSavingDisc(true);
      setDiscError(null);
      if (editingDisc) {
        await updateDisciplina({
          ...editingDisc,
          nome: discNome.trim(),
          codigo: discCodigo.trim().toUpperCase(),
          ordem: Number(discOrdem),
        });
      } else {
        await addDisciplina({
          nome: discNome.trim(),
          codigo: discCodigo.trim().toUpperCase(),
        });
      }
      setIsDiscModalOpen(false);
    } catch (err: any) {
      setDiscError(err?.message || 'Erro ao salvar disciplina.');
    } finally {
      setIsSavingDisc(false);
    }
  };

  // Open Turma Modal for Create or Edit
  const handleOpenTurmaModal = (t?: Turma, defaultTurno?: 'Manhã' | 'Tarde') => {
    setTurmaError(null);
    if (t) {
      setEditingTurma(t);
      setTurmaNome(t.nome);
      setTurmaSerie(t.serie);
      setTurmaNivel(t.nivel);
      setTurmaTurno(t.turno);
    } else {
      setEditingTurma(null);
      setTurmaNome('');

      const currentSegment = TURMA_SEGMENTS_CONFIG.find((s) => s.id === turmaActiveSegment);
      const defaultNivel = currentSegment ? currentSegment.nivelMatch : 'Ensino Fundamental I';
      let defaultSerie = '1º Ano';
      if (turmaActiveSegment === 'FUNDAMENTAL_2') {
        defaultSerie = '6º Ano';
      } else if (turmaActiveSegment === 'ENSINO_MEDIO') {
        defaultSerie = '1ª Série';
      }

      setTurmaNivel(defaultNivel);
      setTurmaSerie(defaultSerie);
      setTurmaTurno(defaultTurno || 'Manhã');
    }
    setIsTurmaModalOpen(true);
  };

  const handleSaveTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaNome.trim()) return;

    try {
      setIsSavingTurma(true);
      setTurmaError(null);
      if (editingTurma) {
        await updateTurma({
          ...editingTurma,
          nome: turmaNome.trim(),
          serie: turmaSerie,
          nivel: turmaNivel,
          turno: turmaTurno,
        });
      } else {
        await addTurma({
          nome: turmaNome.trim(),
          serie: turmaSerie,
          nivel: turmaNivel,
          turno: turmaTurno,
          anoLetivo: new Date().getFullYear(),
        });
      }
      setIsTurmaModalOpen(false);
    } catch (err: any) {
      setTurmaError(err?.message || 'Erro ao salvar turma.');
    } finally {
      setIsSavingTurma(false);
    }
  };

  // Open Tipo Instrumento Modal for Create or Edit
  const handleOpenTipoModal = (tipo?: TipoInstrumentoItem) => {
    setTipoError(null);
    if (tipo) {
      setEditingTipo(tipo);
      setTipoNome(tipo.nome);
    } else {
      setEditingTipo(null);
      setTipoNome('');
    }
    setIsTipoModalOpen(true);
  };

  const handleSaveTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoNome.trim()) return;

    try {
      setIsSavingTipo(true);
      setTipoError(null);
      if (editingTipo) {
        await updateTipoInstrumento({
          ...editingTipo,
          nome: tipoNome.trim(),
        });
      } else {
        await addTipoInstrumento(tipoNome.trim());
      }
      setIsTipoModalOpen(false);
    } catch (err: any) {
      setTipoError(err?.message || 'Erro ao salvar tipo de instrumento.');
    } finally {
      setIsSavingTipo(false);
    }
  };

  const handleConfirmDeleteDisc = async () => {
    if (!deletingDisc) return;
    try {
      setIsDeletingDisc(true);
      setGeneralError(null);
      await deleteDisciplina(deletingDisc.id);
      setDeletingDisc(null);
    } catch (err: any) {
      setGeneralError(err?.message || 'Erro ao excluir disciplina.');
    } finally {
      setIsDeletingDisc(false);
    }
  };

  const handleConfirmDeleteTurma = async () => {
    if (!deletingTurma) return;
    try {
      setIsDeletingTurma(true);
      setGeneralError(null);
      await deleteTurma(deletingTurma.id);
      setDeletingTurma(null);
    } catch (err: any) {
      setGeneralError(err?.message || 'Erro ao excluir turma.');
    } finally {
      setIsDeletingTurma(false);
    }
  };

  const handleConfirmDeleteTipo = async () => {
    if (!deletingTipo) return;
    try {
      setIsDeletingTipo(true);
      setGeneralError(null);
      await deleteTipoInstrumento(deletingTipo.id);
      setDeletingTipo(null);
    } catch (err: any) {
      setGeneralError(err?.message || 'Erro ao excluir tipo de instrumento.');
    } finally {
      setIsDeletingTipo(false);
    }
  };

  // Filtered lists
  const filteredDisciplinas = disciplinas.filter(
    (d) =>
      (d.nome || '').toLowerCase().includes(searchDisc.toLowerCase()) ||
      (d.codigo || '').toLowerCase().includes(searchDisc.toLowerCase())
  );

  const activeSegmentObj = useMemo(() => {
    return TURMA_SEGMENTS_CONFIG.find((s) => s.id === turmaActiveSegment) || TURMA_SEGMENTS_CONFIG[0];
  }, [turmaActiveSegment]);

  const turmasInActiveSegment = useMemo(() => {
    return turmas.filter((t) => t.nivel === activeSegmentObj.nivelMatch);
  }, [turmas, activeSegmentObj]);

  const filteredTurmasInSegment = useMemo(() => {
    const term = searchTurma.trim().toLowerCase();
    if (!term) return turmasInActiveSegment;
    return turmasInActiveSegment.filter(
      (t) =>
        (t.nome || '').toLowerCase().includes(term) ||
        (t.serie || '').toLowerCase().includes(term)
    );
  }, [turmasInActiveSegment, searchTurma]);

  const turmasManha = useMemo(() => {
    return filteredTurmasInSegment.filter((t) => t.turno === 'Manhã');
  }, [filteredTurmasInSegment]);

  const turmasTarde = useMemo(() => {
    return filteredTurmasInSegment.filter((t) => t.turno === 'Tarde');
  }, [filteredTurmasInSegment]);

  const filteredTipos = tiposInstrumento.filter((t) =>
    t.nome.toLowerCase().includes(searchTipoInst.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">
            Cadastros Gerais
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Gerencie a matriz curricular oficial, turmas, séries e ordem acadêmica de precedência.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#E5E7EB]/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubTab('disciplinas')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'disciplinas'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Disciplinas ({disciplinas.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('turmas')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'turmas'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Turmas ({turmas.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tiposInstrumento')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'tiposInstrumento'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Tipos de Instrumento ({tiposInstrumento.length})</span>
          </button>
        </div>
      </div>

      {/* DISCIPLINAS SUB-TAB */}
      {activeSubTab === 'disciplinas' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar disciplina por nome ou código..."
                value={searchDisc}
                onChange={(e) => setSearchDisc(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
              />
            </div>

            {isAuthorized && (
              <button
                type="button"
                onClick={() => handleOpenDiscModal()}
                className="inline-flex items-center gap-2 bg-[#111827] hover:bg-[#1f2937] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Disciplina</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] bg-[#F9FAFB]/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#111827]">
                  Matriz Curricular & Ordem de Precedência
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  A ordem abaixo define a sequência exata de exibição dos instrumentos no PDF oficial.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#DBEAFE]">
                {filteredDisciplinas.length} disciplinas
              </span>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {filteredDisciplinas.map((disc, idx) => (
                <div
                  key={disc.id}
                  className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] text-[#111827] font-bold text-xs flex items-center justify-center border border-[#E5E7EB] shrink-0 font-mono">
                      {String(disc.ordem).padStart(2, '0')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111827]">{disc.nome}</h4>
                      <p className="text-[11px] text-[#6B7280] font-mono">
                        Código: {disc.codigo} · Posição #{disc.ordem}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAuthorized && (
                      <>
                        <button
                          type="button"
                          onClick={() => moveDisciplinaOrder(disc.id, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md disabled:opacity-30 cursor-pointer transition-colors"
                          title="Mover para cima na precedência"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDisciplinaOrder(disc.id, 'down')}
                          disabled={idx === filteredDisciplinas.length - 1}
                          className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md disabled:opacity-30 cursor-pointer transition-colors"
                          title="Mover para baixo na precedência"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDiscModal(disc)}
                          className="p-1.5 text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#EFF6FF] rounded-md cursor-pointer transition-colors"
                          title="Editar Disciplina"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDisc(disc)}
                          className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TURMAS SUB-TAB */}
      {activeSubTab === 'turmas' && (
        <div className="space-y-6">
          {/* NÍVEL DE ENSINO: ABAS SUPERIORES */}
          <div className="bg-white p-2 border border-[#E5E7EB] rounded-2xl shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TURMA_SEGMENTS_CONFIG.map((seg) => {
                const isSelected = turmaActiveSegment === seg.id;
                const segCount = turmas.filter((t) => t.nivel === seg.nivelMatch).length;
                const manhaCount = turmas.filter(
                  (t) => t.nivel === seg.nivelMatch && t.turno === 'Manhã'
                ).length;
                const tardeCount = turmas.filter(
                  (t) => t.nivel === seg.nivelMatch && t.turno === 'Tarde'
                ).length;

                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setTurmaActiveSegment(seg.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#111827] text-white border-[#111827] shadow-sm'
                        : 'bg-[#F9FAFB] text-[#374151] border-[#E5E7EB] hover:bg-white hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/10 text-white'
                            : 'bg-white text-[#3B82F6] border border-[#E5E7EB]'
                        }`}
                      >
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-white' : 'text-[#111827]'
                            }`}
                          >
                            {seg.label}
                          </h3>
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-slate-300' : 'text-[#6B7280]'
                          }`}
                        >
                          {seg.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-[#111827] border border-[#E5E7EB]'
                        }`}
                      >
                        {segCount} {segCount === 1 ? 'turma' : 'turmas'}
                      </span>
                      <span
                        className={`text-[9px] mt-1 font-medium ${
                          isSelected ? 'text-slate-300' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {manhaCount}M · {tardeCount}T
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BARRA DE PESQUISA & AÇÕES RÁPIDAS */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Buscar turma em ${activeSegmentObj.label} (ex: 1º Ano A, 6º Ano)...`}
                value={searchTurma}
                onChange={(e) => setSearchTurma(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
              />
              {searchTurma && (
                <button
                  type="button"
                  onClick={() => setSearchTurma('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-[#6B7280] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-[#E5E7EB] font-medium">
                <span>{filteredTurmasInSegment.length} turmas encontradas</span>
              </span>

              {isAuthorized && (
                <button
                  type="button"
                  onClick={() => handleOpenTurmaModal()}
                  className="inline-flex items-center gap-2 bg-[#111827] hover:bg-[#1f2937] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Turma</span>
                </button>
              )}
            </div>
          </div>

          {/* SEPARAÇÃO VISUAL POR TURNO: MANHÃ E TARDE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* COLUNA: TURNO DA MANHÃ */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#111827]">Turno da Manhã</h3>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {turmasManha.length} {turmasManha.length === 1 ? 'turma' : 'turmas'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">
                      Período matutino no {activeSegmentObj.label}
                    </p>
                  </div>
                </div>

                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => handleOpenTurmaModal(undefined, 'Manhã')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                )}
              </div>

              {turmasManha.length === 0 ? (
                <div className="p-8 text-center bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-xl space-y-2">
                  <div className="w-8 h-8 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-[#6B7280]">
                    {searchTurma.trim()
                      ? `Nenhuma turma da manhã encontrada com "${searchTurma}".`
                      : `Nenhuma turma cadastrada no turno da manhã para ${activeSegmentObj.label}.`}
                  </p>
                  {isAuthorized && (
                    <button
                      type="button"
                      onClick={() => handleOpenTurmaModal(undefined, 'Manhã')}
                      className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                    >
                      Cadastrar primeira turma da manhã
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {turmasManha.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border border-[#E5E7EB] hover:border-amber-400 rounded-xl p-3.5 shadow-xs transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-[#111827] group-hover:text-amber-700 transition-colors">
                            {t.nome}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0 flex items-center gap-1">
                            <Sun className="w-3 h-3" />
                            Manhã
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] font-medium flex items-center gap-1.5">
                          <span>Série:</span>
                          <span className="text-[#111827] font-semibold">{t.serie}</span>
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between">
                        <span className="text-[10px] text-[#9CA3AF] font-mono">
                          Ano: {t.anoLetivo || new Date().getFullYear()}
                        </span>
                        {isAuthorized && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenTurmaModal(t)}
                              className="p-1 text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#EFF6FF] rounded cursor-pointer transition-colors"
                              title="Editar Turma"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTurma(t)}
                              className="p-1 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                              title="Excluir Turma"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLUNA: TURNO DA TARDE */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                    <Sunset className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#111827]">Turno da Tarde</h3>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {turmasTarde.length} {turmasTarde.length === 1 ? 'turma' : 'turmas'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">
                      Período vespertino no {activeSegmentObj.label}
                    </p>
                  </div>
                </div>

                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => handleOpenTurmaModal(undefined, 'Tarde')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                )}
              </div>

              {turmasTarde.length === 0 ? (
                <div className="p-8 text-center bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-xl space-y-2">
                  <div className="w-8 h-8 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sunset className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-[#6B7280]">
                    {searchTurma.trim()
                      ? `Nenhuma turma da tarde encontrada com "${searchTurma}".`
                      : `Nenhuma turma cadastrada no turno da tarde para ${activeSegmentObj.label}.`}
                  </p>
                  {isAuthorized && (
                    <button
                      type="button"
                      onClick={() => handleOpenTurmaModal(undefined, 'Tarde')}
                      className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Cadastrar primeira turma da tarde
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {turmasTarde.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border border-[#E5E7EB] hover:border-blue-400 rounded-xl p-3.5 shadow-xs transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-[#111827] group-hover:text-blue-700 transition-colors">
                            {t.nome}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0 flex items-center gap-1">
                            <Sunset className="w-3 h-3" />
                            Tarde
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] font-medium flex items-center gap-1.5">
                          <span>Série:</span>
                          <span className="text-[#111827] font-semibold">{t.serie}</span>
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between">
                        <span className="text-[10px] text-[#9CA3AF] font-mono">
                          Ano: {t.anoLetivo || new Date().getFullYear()}
                        </span>
                        {isAuthorized && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenTurmaModal(t)}
                              className="p-1 text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#EFF6FF] rounded cursor-pointer transition-colors"
                              title="Editar Turma"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTurma(t)}
                              className="p-1 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                              title="Excluir Turma"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TIPOS DE INSTRUMENTO SUB-TAB */}
      {activeSubTab === 'tiposInstrumento' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar tipo de instrumento por nome..."
                value={searchTipoInst}
                onChange={(e) => setSearchTipoInst(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
              />
            </div>

            {isAuthorized && (
              <button
                type="button"
                onClick={() => handleOpenTipoModal()}
                className="inline-flex items-center gap-2 bg-[#111827] hover:bg-[#1f2937] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Tipo de Instrumento</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] bg-[#F9FAFB]/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#111827]">
                  Opções Disponíveis no Formulário de Cadastro
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Estes são os tipos de instrumentos avaliativos exibidos no seletor "Instrumento" para os professores.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#DBEAFE]">
                {filteredTipos.length} tipos cadastrados
              </span>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {filteredTipos.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6B7280]">
                  Nenhum tipo de instrumento encontrado.
                </div>
              ) : (
                filteredTipos.map((tipo, idx) => (
                  <div
                    key={tipo.id}
                    className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#111827]">{tipo.nome}</h4>
                        <span className="text-[10px] text-[#9CA3AF]">
                          Disponível para seleção em novos instrumentos
                        </span>
                      </div>
                    </div>

                    {isAuthorized && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenTipoModal(tipo)}
                          className="p-1.5 text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#EFF6FF] rounded cursor-pointer transition-colors"
                          title="Editar Tipo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTipo(tipo)}
                          className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                          title="Excluir Tipo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{generalError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeneralError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* MODAL DISCIPLINA */}
      {isDiscModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">
                {editingDisc ? 'Editar Disciplina' : 'Nova Disciplina'}
              </h3>
              <button
                type="button"
                onClick={() => setIsDiscModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDisc} className="p-6 space-y-4">
              {discError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{discError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  required
                  value={discNome}
                  onChange={(e) => setDiscNome(e.target.value)}
                  placeholder="Ex: Língua Portuguesa, Robótica..."
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Código Abrev.
                  </label>
                  <input
                    type="text"
                    required
                    value={discCodigo}
                    onChange={(e) => setDiscCodigo(e.target.value)}
                    placeholder="Ex: POR, MAT"
                    className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Ordem de Precedência
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={discOrdem}
                    onChange={(e) => setDiscOrdem(Number(e.target.value))}
                    className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] font-mono focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSavingDisc}
                  onClick={() => setIsDiscModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg font-medium cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingDisc}
                  className="px-5 py-2 text-xs bg-[#111827] hover:bg-[#1f2937] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSavingDisc ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TURMA */}
      {isTurmaModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">
                {editingTurma ? 'Editar Turma' : 'Nova Turma'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTurmaModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTurma} className="p-6 space-y-4">
              {turmaError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{turmaError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Nome da Turma
                </label>
                <input
                  type="text"
                  required
                  value={turmaNome}
                  onChange={(e) => setTurmaNome(e.target.value)}
                  placeholder="Ex: 4º Ano A - Manhã"
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Série
                  </label>
                  <input
                    type="text"
                    required
                    value={turmaSerie}
                    onChange={(e) => setTurmaSerie(e.target.value)}
                    placeholder="Ex: 4º Ano"
                    className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Turno
                  </label>
                  <select
                    value={turmaTurno}
                    onChange={(e) => setTurmaTurno(e.target.value as 'Manhã' | 'Tarde')}
                    className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] font-medium"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Nível de Ensino
                </label>
                <select
                  value={turmaNivel}
                  onChange={(e) => setTurmaNivel(e.target.value)}
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] font-medium"
                >
                  <option value="Ensino Fundamental I">Ensino Fundamental I</option>
                  <option value="Ensino Fundamental II">Ensino Fundamental II</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSavingTurma}
                  onClick={() => setIsTurmaModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg font-medium cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingTurma}
                  className="px-5 py-2 text-xs bg-[#111827] hover:bg-[#1f2937] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSavingTurma ? 'Salvando...' : 'Salvar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TIPO DE INSTRUMENTO */}
      {isTipoModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">
                {editingTipo ? 'Editar Tipo de Instrumento' : 'Novo Tipo de Instrumento'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTipoModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTipo} className="p-6 space-y-4">
              {tipoError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{tipoError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Nome do Instrumento *
                </label>
                <input
                  type="text"
                  required
                  value={tipoNome}
                  onChange={(e) => setTipoNome(e.target.value)}
                  placeholder="Ex: AV1, AV2, Recuperação, Simulado, Trabalho"
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                />
                <p className="text-[11px] text-[#6B7280] mt-1.5">
                  Este nome aparecerá diretamente no campo de seleção "Instrumento" ao cadastrar novos instrumentos.
                </p>
              </div>

              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSavingTipo}
                  onClick={() => setIsTipoModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg font-medium cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingTipo}
                  className="px-5 py-2 text-xs bg-[#111827] hover:bg-[#1f2937] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSavingTipo ? 'Salvando...' : 'Salvar Tipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODALS */}
      <ConfirmModal
        isOpen={!!deletingDisc}
        title="Excluir Disciplina"
        message={`Tem certeza que deseja excluir permanentemente a disciplina "${deletingDisc?.nome}" (${deletingDisc?.codigo})? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Disciplina"
        confirmVariant="danger"
        isLoading={isDeletingDisc}
        onClose={() => setDeletingDisc(null)}
        onConfirm={handleConfirmDeleteDisc}
      />

      <ConfirmModal
        isOpen={!!deletingTurma}
        title="Excluir Turma"
        message={`Tem certeza que deseja excluir permanentemente a turma "${deletingTurma?.nome}"? Todas as atribuições e referências a esta turma serão removidas.`}
        confirmText="Excluir Turma"
        confirmVariant="danger"
        isLoading={isDeletingTurma}
        onClose={() => setDeletingTurma(null)}
        onConfirm={handleConfirmDeleteTurma}
      />

      <ConfirmModal
        isOpen={!!deletingTipo}
        title="Excluir Tipo de Instrumento"
        message={`Tem certeza que deseja excluir o tipo de instrumento "${deletingTipo?.nome}"? Novos cadastros não exibirão mais esta opção.`}
        confirmText="Excluir Tipo"
        confirmVariant="danger"
        isLoading={isDeletingTipo}
        onClose={() => setDeletingTipo(null)}
        onConfirm={handleConfirmDeleteTipo}
      />
    </div>
  );
};
