import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  FileText,
  AlertCircle,
  TrendingUp,
  XCircle,
  Unlock,
  FileEdit,
  Plus,
  Eye,
  Filter,
  Layers,
  Building,
  User,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstrumentoAvaliativo, InstrumentoStatus, Turma, Disciplina } from '../types';
import { InstrumentoDetailModal } from './InstrumentoDetailModal';
import { RejeitarModal } from './RejeitarModal';
import { sortSeriesPedagogically } from '../utils/pedagogicalSort';

interface DashboardViewProps {
  onNavigateToDocumentos?: (turmaId: string, bimestre: number) => void;
  onOpenCreateModal?: (turmaId?: string, disciplinaId?: string) => void;
  onOpenEditModal?: (inst: InstrumentoAvaliativo) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToDocumentos,
  onOpenCreateModal,
  onOpenEditModal,
}) => {
  const {
    turmas,
    disciplinas,
    instrumentos,
    systemSettings,
    currentUser,
    canCreateInstrument,
    canEditInstrument,
    canApproveOrReject,
    getAccessibleTurmas,
    getAccessibleDisciplinas,
    getAccessibleInstrumentos,
    getInstrumentosForTurma,
    getDeliveryDateForTurma,
    aprovarInstrumento,
    rejeitarInstrumento,
    liberarParaModificacao,
  } = useApp();

  const isProfessor = currentUser.role === 'PROFESSOR';
  const accessibleTurmas = getAccessibleTurmas(currentUser);
  const accessibleDisciplinas = getAccessibleDisciplinas(currentUser);
  const accessibleInstrumentos = getAccessibleInstrumentos(currentUser);

  // Available unique series for the current user's accessible turmas (ordered pedagogically)
  const availableSeries = React.useMemo(() => {
    const list: string[] = [];
    accessibleTurmas.forEach((t) => {
      if (t.serie && !list.includes(t.serie)) {
        list.push(t.serie);
      }
    });
    return sortSeriesPedagogically(list);
  }, [accessibleTurmas]);

  const seriesWithLevel = React.useMemo(() => {
    return availableSeries.map((serieName) => {
      const sample = accessibleTurmas.find((t) => t.serie === serieName);
      return {
        serie: serieName,
        nivel: sample?.nivel || '',
      };
    });
  }, [availableSeries, accessibleTurmas]);

  // Filter state: Starts at "TODAS" (Todas as Séries)
  const [selectedSerie, setSelectedSerie] = useState<string>('TODAS');

  // Turmas belonging to the selected series (or all accessible turmas if TODAS)
  const turmasDaSerie = React.useMemo(() => {
    if (!selectedSerie || selectedSerie === 'TODAS') {
      return accessibleTurmas;
    }
    return accessibleTurmas.filter((t) => t.serie === selectedSerie);
  }, [accessibleTurmas, selectedSerie]);

  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('TODAS');
  const [selectedBimestre, setSelectedBimestre] = useState<number>(
    systemSettings.bimestreAtual
  );
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Modals state
  const [selectedDetailInst, setSelectedDetailInst] = useState<InstrumentoAvaliativo | null>(null);
  const [rejectingInst, setRejectingInst] = useState<InstrumentoAvaliativo | null>(null);

  // Sync selected turma whenever selected series or available turmas for that series change
  useEffect(() => {
    if (selectedTurmaId !== 'TODAS' && !turmasDaSerie.some((t) => t.id === selectedTurmaId)) {
      setSelectedTurmaId('TODAS');
    }
  }, [selectedSerie, turmasDaSerie, selectedTurmaId]);

  const handleSerieChange = (newSerie: string) => {
    setSelectedSerie(newSerie);
    setSelectedTurmaId('TODAS');
  };

  const currentTurma = accessibleTurmas.find((t) => t.id === selectedTurmaId);

  // Status Badge Component
  const renderStatusBadge = (status: InstrumentoStatus, compact: boolean = false) => {
    switch (status) {
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {compact ? 'Aprovado' : 'Aprovado'}
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            {compact ? 'Enviado' : 'Enviado para Aprovação'}
          </span>
        );
      case 'REJEITADO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {compact ? 'Rejeitado' : 'Rejeitado pela Coordenação'}
          </span>
        );
      case 'LIBERADO_MODIFICACAO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Unlock className="w-3.5 h-3.5 text-purple-600" />
            {compact ? 'Liberado' : 'Liberado para Edição'}
          </span>
        );
      case 'RASCUNHO':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            Rascunho
          </span>
        );
    }
  };

  // ----------------------------------------------------
  // PROFESSOR DASHBOARD LOGIC
  // ----------------------------------------------------
  const professorInstruments = React.useMemo(() => {
    return accessibleInstrumentos.filter((inst) => {
      if (inst.professorId !== currentUser.id) return false;
      if (inst.bimestre !== selectedBimestre) return false;
      if (statusFilter !== 'TODOS' && inst.status !== statusFilter) return false;

      if (selectedTurmaId === 'TODAS') {
        return turmasDaSerie.some(
          (t) => inst.turmaId === t.id || inst.turmas?.some((it) => it.turmaId === t.id)
        );
      } else {
        return (
          inst.turmaId === selectedTurmaId ||
          inst.turmas?.some((t) => t.turmaId === selectedTurmaId)
        );
      }
    });
  }, [accessibleInstrumentos, currentUser.id, selectedBimestre, statusFilter, selectedTurmaId, turmasDaSerie]);

  // Group professor instruments by Discipline
  const professorDisciplinasMap = new Map<string, { disciplina: Disciplina; instruments: InstrumentoAvaliativo[] }>();
  professorInstruments.forEach((inst) => {
    const disc = disciplinas.find((d) => d.id === inst.disciplinaId) || {
      id: inst.disciplinaId,
      nome: inst.disciplinaNome,
      codigo: '',
      ordem: 99,
    };
    if (!professorDisciplinasMap.has(disc.id)) {
      professorDisciplinasMap.set(disc.id, { disciplina: disc, instruments: [] });
    }
    professorDisciplinasMap.get(disc.id)!.instruments.push(inst);
  });

  const professorDisciplineGroups = Array.from(professorDisciplinasMap.values()).sort(
    (a, b) => (a.disciplina.ordem || 0) - (b.disciplina.ordem || 0)
  );

  // Metrics for Professor
  const profTotalInsts = professorInstruments.length;
  const profAprovados = professorInstruments.filter((i) => i.status === 'APROVADO').length;
  const profEnviados = professorInstruments.filter((i) => i.status === 'ENVIADO').length;
  const profRejeitados = professorInstruments.filter((i) => i.status === 'REJEITADO').length;
  const profRascunhos = professorInstruments.filter(
    (i) => i.status === 'RASCUNHO' || i.status === 'LIBERADO_MODIFICACAO'
  ).length;

  // ----------------------------------------------------
  // COORDINATION / SUPER ADMIN / TI DASHBOARD LOGIC
  // ----------------------------------------------------
  const coordFilteredTurmas = React.useMemo(() => {
    if (selectedTurmaId === 'TODAS') {
      return turmasDaSerie;
    }
    return turmasDaSerie.filter((t) => t.id === selectedTurmaId);
  }, [selectedTurmaId, turmasDaSerie]);

  // Filter instruments for coordination
  const coordInstruments = React.useMemo(() => {
    return accessibleInstrumentos.filter((inst) => {
      if (inst.bimestre !== selectedBimestre) return false;
      if (statusFilter !== 'TODOS' && inst.status !== statusFilter) return false;

      return coordFilteredTurmas.some(
        (t) => inst.turmaId === t.id || inst.turmas?.some((it) => it.turmaId === t.id)
      );
    });
  }, [accessibleInstrumentos, selectedBimestre, statusFilter, coordFilteredTurmas]);

  const coordTotalInsts = coordInstruments.length;
  const coordAguardando = coordInstruments.filter((i) => i.status === 'ENVIADO').length;
  const coordAprovados = coordInstruments.filter((i) => i.status === 'APROVADO').length;
  const coordRejeitados = coordInstruments.filter((i) => i.status === 'REJEITADO').length;
  const coordRascunhos = coordInstruments.filter(
    (i) => i.status === 'RASCUNHO' || i.status === 'LIBERADO_MODIFICACAO'
  ).length;

  if (isProfessor && accessibleTurmas.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-xs">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Nenhuma turma atribuída</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Você ainda não possui turmas atribuídas ao seu perfil. Entre em contato com a coordenação pedagógica para efetuar as atribuições.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            {isProfessor ? 'Meu Painel de Acompanhamento' : 'Painel de Gestão e Homologação Pedagógica'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isProfessor
              ? `Status em tempo real dos seus instrumentos avaliativos no ${selectedBimestre}º Bimestre.`
              : 'Acompanhe, revise e aprove os instrumentos avaliativos dentro do seu escopo pedagógico.'}
          </p>
        </div>

        {/* Global summary badge & Quick Create Button */}
        <div className="flex items-center gap-3">
          {canCreateInstrument() && onOpenCreateModal && (
            <button
              type="button"
              id="btn-novo-instrumento-header"
              onClick={() => {
                const defaultTurma = selectedTurmaId && selectedTurmaId !== 'TODAS'
                  ? selectedTurmaId
                  : (turmasDaSerie[0]?.id || undefined);
                onOpenCreateModal(defaultTurma);
              }}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Instrumento</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs text-xs">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500">Bimestre Vigente:</span>
            <strong className="text-slate-900">{systemSettings.bimestreAtual}º Bimestre</strong>
          </div>
        </div>
      </div>

      {/* Filter Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* 1. Série / Ano Select */}
          <div className="flex flex-col gap-1 min-w-[190px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600" />
              1. Série / Ano
            </label>
            <select
              id="dashboard-filter-serie"
              value={selectedSerie}
              onChange={(e) => handleSerieChange(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="TODAS">Todas as Séries ({availableSeries.length})</option>
              {seriesWithLevel.map((item) => (
                <option key={item.serie} value={item.serie}>
                  {item.serie} {item.nivel ? `(${item.nivel})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Turma Select */}
          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Building className="w-3 h-3 text-blue-600" />
              2. Turma
            </label>
            <select
              id="dashboard-filter-turma"
              value={selectedTurmaId}
              onChange={(e) => setSelectedTurmaId(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="TODAS">
                {selectedSerie === 'TODAS' ? 'Todas as Turmas' : `Todas as Turmas do ${selectedSerie}`} ({turmasDaSerie.length})
              </option>
              {turmasDaSerie.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.turno})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Bimestre Select */}
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-600" />
              Bimestre
            </label>
            <select
              id="dashboard-filter-bimestre"
              value={selectedBimestre}
              onChange={(e) => setSelectedBimestre(Number(e.target.value))}
              className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 focus:bg-white cursor-pointer"
            >
              <option value={1}>1º Bimestre</option>
              <option value={2}>2º Bimestre</option>
              <option value={3}>3º Bimestre</option>
              <option value={4}>4º Bimestre</option>
            </select>
          </div>

          {/* 4. Status Filter */}
          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Filter className="w-3 h-3 text-blue-600" />
              Status do Instrumento
            </label>
            <select
              id="dashboard-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 focus:bg-white cursor-pointer"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ENVIADO">Aguardando Aprovação</option>
              <option value="APROVADO">Aprovados</option>
              <option value="REJEITADO">Rejeitados</option>
              <option value="RASCUNHO">Rascunhos</option>
              <option value="LIBERADO_MODIFICACAO">Liberados p/ Modificação</option>
            </select>
          </div>
        </div>

        {/* Action Link to PDF View: ADMIN / COORDENADOR ONLY */}
        {!isProfessor && onNavigateToDocumentos && selectedTurmaId && selectedTurmaId !== 'TODAS' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-gerar-pdf-turma-selecionada"
              onClick={() => onNavigateToDocumentos(selectedTurmaId, selectedBimestre)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gerar PDF Desta Turma</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Metrics Cards (Strictly scoped) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Cadastrado
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900">
              {isProfessor ? profTotalInsts : coordTotalInsts}
            </h3>
            <span className="text-xs text-slate-400 font-medium">instrumentos</span>
          </div>
        </div>

        {/* Metric 2: Aguardando Aprovação */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          (isProfessor ? profEnviados : coordAguardando) > 0
            ? 'bg-blue-50/70 border-blue-200'
            : 'bg-white border-slate-200'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
            Aguardando Aprovação
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-blue-700">
              {isProfessor ? profEnviados : coordAguardando}
            </h3>
            {(isProfessor ? profEnviados : coordAguardando) > 0 && (
              <span className="text-[11px] font-bold text-blue-700 animate-pulse">Em análise</span>
            )}
          </div>
        </div>

        {/* Metric 3: Aprovados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Homologados / Aprovados
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-600">
              {isProfessor ? profAprovados : coordAprovados}
            </h3>
            <span className="text-xs text-emerald-600 font-medium">aptos p/ PDF</span>
          </div>
        </div>

        {/* Metric 4: Rejeitados / Ajustes */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          (isProfessor ? profRejeitados : coordRejeitados) > 0
            ? 'bg-rose-50 border-rose-200'
            : 'bg-white border-slate-200'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
            Rejeitados / Pendentes
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-rose-700">
              {isProfessor ? profRejeitados : coordRejeitados}
            </h3>
            {(isProfessor ? profRejeitados : coordRejeitados) > 0 && (
              <span className="text-[11px] font-bold text-rose-700">Requer ajuste</span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PROFESSOR VIEW: Strict Disciplina -> Instrumentos -> Status */}
      {/* ======================================================== */}
      {isProfessor ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {selectedSerie === 'TODAS'
                ? `Status de Entrega por Disciplina — Todas as Séries · ${selectedBimestre}º Bimestre`
                : selectedTurmaId === 'TODAS'
                ? `Status de Entrega por Disciplina — ${selectedSerie} (Todas as Turmas) · ${selectedBimestre}º Bimestre`
                : `Status de Entrega por Disciplina — ${currentTurma?.nome || selectedSerie} · ${selectedBimestre}º Bimestre`}
            </h2>
            <span className="text-xs text-slate-500">
              {professorDisciplineGroups.length} {professorDisciplineGroups.length === 1 ? 'disciplina com instrumentos' : 'disciplinas com instrumentos'}
            </span>
          </div>

          {professorDisciplineGroups.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-dashed border-slate-300 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Nenhum instrumento avaliativo encontrado para os filtros selecionados no {selectedBimestre}º Bimestre.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Você ainda não registrou instrumentos avaliativos para este recorte neste bimestre.
              </p>
              {canCreateInstrument() && onOpenCreateModal && (
                <button
                  type="button"
                  id="btn-cadastrar-primeiro-instrumento"
                  onClick={() => onOpenCreateModal(selectedTurmaId && selectedTurmaId !== 'TODAS' ? selectedTurmaId : (turmasDaSerie[0]?.id || undefined))}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Instrumento
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {professorDisciplineGroups.map(({ disciplina, instruments }) => (
                <div
                  key={disciplina.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Discipline Group Header */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                        {String(disciplina.ordem || 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          {disciplina.nome}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Código: {disciplina.codigo || 'DISC'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        {instruments.length} {instruments.length === 1 ? 'instrumento' : 'instrumentos'}
                      </span>
                      {canCreateInstrument() && onOpenCreateModal && (
                        <button
                          type="button"
                          onClick={() => onOpenCreateModal(selectedTurmaId && selectedTurmaId !== 'TODAS' ? selectedTurmaId : (turmasDaSerie[0]?.id || undefined), disciplina.id)}
                          className="text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition-colors cursor-pointer"
                        >
                          + Novo p/ esta disciplina
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Instruments Tree List */}
                  <div className="divide-y divide-slate-100">
                    {instruments.map((inst) => {
                      const deliveryDate = selectedTurmaId && selectedTurmaId !== 'TODAS'
                        ? getDeliveryDateForTurma(inst, selectedTurmaId)
                        : inst.data;
                      const isEditable = canEditInstrument(inst);

                      return (
                        <div
                          key={inst.id}
                          className="p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/60 transition-colors gap-3"
                        >
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 shrink-0">
                              {inst.codigoIdentificador}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {inst.tipoNome}
                                </h4>
                                {renderStatusBadge(inst.status)}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 font-mono">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Entrega: <strong>{deliveryDate}</strong>
                                </span>
                                <span>·</span>
                                <span>
                                  Peso: <strong className="text-blue-700">{inst.peso?.toFixed(1)} pts</strong>
                                </span>
                                {inst.turmas && inst.turmas.length > 1 && (
                                  <>
                                    <span>·</span>
                                    <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                      Aplicado em {inst.turmas.length} turmas
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Rejection Notice Banner */}
                              {inst.status === 'REJEITADO' && inst.motivoRejeicao && (
                                <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                                  <span className="font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                    Motivo do Retorno:
                                  </span>
                                  <p className="mt-0.5 text-rose-700 pl-4">{inst.motivoRejeicao}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailInst(inst)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              Visualizar
                            </button>

                            {isEditable && onOpenEditModal && (
                              <button
                                type="button"
                                onClick={() => onOpenEditModal(inst)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                                {inst.status === 'REJEITADO' ? 'Editar e Corrigir' : 'Editar'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* COORDINATION / SUPER ADMIN / TI VIEW: Turma -> Disciplina -> Professor -> Instrumentos */
        /* ======================================================== */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {selectedSerie === 'TODAS'
                ? `Visão da Coordenação — Todas as Séries (${selectedBimestre}º Bimestre)`
                : `Visão da Coordenação — ${selectedSerie} (${selectedBimestre}º Bimestre)`}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {coordInstruments.length} {coordInstruments.length === 1 ? 'instrumento filtrado' : 'instrumentos filtrados'}
            </span>
          </div>

          {coordFilteredTurmas.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-dashed border-slate-300 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Nenhuma turma encontrada para o filtro selecionado
              </h3>
            </div>
          ) : (
            coordFilteredTurmas.map((turma) => {
              // Get instruments for this specific turma
              const turmaInsts = coordInstruments.filter(
                (inst) =>
                  inst.turmaId === turma.id ||
                  inst.turmas?.some((t) => t.turmaId === turma.id)
              );

              if (turmaInsts.length === 0 && selectedTurmaId === 'TODAS') {
                return null;
              }

              // Group by discipline
              const discMap = new Map<string, { disciplina: Disciplina; instruments: InstrumentoAvaliativo[] }>();
              turmaInsts.forEach((inst) => {
                const disc = disciplinas.find((d) => d.id === inst.disciplinaId) || {
                  id: inst.disciplinaId,
                  nome: inst.disciplinaNome,
                  codigo: '',
                  ordem: 99,
                };
                if (!discMap.has(disc.id)) {
                  discMap.set(disc.id, { disciplina: disc, instruments: [] });
                }
                discMap.get(disc.id)!.instruments.push(inst);
              });

              const disciplineGroups = Array.from(discMap.values()).sort(
                (a, b) => (a.disciplina.ordem || 0) - (b.disciplina.ordem || 0)
              );

              return (
                <div
                  key={turma.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Turma Header */}
                  <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-blue-400" />
                      <div>
                        <h3 className="text-sm font-bold">{turma.nome}</h3>
                        <p className="text-[11px] text-slate-400">
                          {turma.nivel} · {turma.turno} · Ano Letivo {turma.anoLetivo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full text-slate-200">
                        {turmaInsts.length} {turmaInsts.length === 1 ? 'instrumento' : 'instrumentos'}
                      </span>
                      {onNavigateToDocumentos && turmaInsts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onNavigateToDocumentos(turma.id, selectedBimestre)}
                          className="text-xs font-bold text-blue-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                        >
                          PDF <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Turma Disciplines Breakdown */}
                  {disciplineGroups.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 italic">
                      Nenhum instrumento cadastrado para esta turma no {selectedBimestre}º Bimestre.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {disciplineGroups.map(({ disciplina, instruments }) => (
                        <div key={disciplina.id} className="p-5 space-y-3">
                          {/* Discipline Title */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                                {String(disciplina.ordem || 1).padStart(2, '0')}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900">
                                {disciplina.nome}
                              </h4>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {disciplina.codigo}
                            </span>
                          </div>

                          {/* Instruments Table under Discipline */}
                          <div className="space-y-2 pl-2">
                            {instruments.map((inst) => {
                              const deliveryDate = getDeliveryDateForTurma(inst, turma.id);

                              return (
                                <div
                                  key={inst.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white transition-all gap-3"
                                >
                                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                    <span className="font-mono font-bold text-xs bg-white text-blue-700 px-2 py-1 rounded border border-slate-200 shrink-0">
                                      {inst.codigoIdentificador}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-xs text-slate-900">
                                          {inst.tipoNome}
                                        </span>
                                        {renderStatusBadge(inst.status)}
                                      </div>
                                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                                          <User className="w-3 h-3 text-slate-400" />
                                          {inst.professorNome || 'Professor não informado'}
                                        </span>
                                        <span>·</span>
                                        <span className="font-mono">
                                          Entrega: <strong>{deliveryDate}</strong>
                                        </span>
                                        <span>·</span>
                                        <span>
                                          Peso: <strong>{inst.peso?.toFixed(1)} pts</strong>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick Actions for Coordination */}
                                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedDetailInst(inst)}
                                      className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                      Ver Detalhes
                                    </button>

                                    {inst.status === 'ENVIADO' && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setRejectingInst(inst)}
                                          className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                          Rejeitar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => aprovarInstrumento(inst.id)}
                                          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                          Aprovar
                                        </button>
                                      </>
                                    )}

                                    {inst.status === 'APROVADO' && (
                                      <button
                                        type="button"
                                        onClick={() => liberarParaModificacao(inst.id)}
                                        className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                      >
                                        Liberar p/ Edição
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal */}
      <InstrumentoDetailModal
        isOpen={!!selectedDetailInst}
        instrumento={selectedDetailInst}
        onClose={() => setSelectedDetailInst(null)}
        onEdit={(inst) => {
          if (onOpenEditModal) onOpenEditModal(inst);
        }}
        onApprove={(id) => aprovarInstrumento(id)}
        onOpenRejectModal={(inst) => setRejectingInst(inst)}
        onLiberar={(id) => liberarParaModificacao(id)}
      />

      {/* Reject Modal */}
      <RejeitarModal
        isOpen={!!rejectingInst}
        instrumento={rejectingInst}
        onClose={() => setRejectingInst(null)}
        onConfirm={(id, motivo) => rejeitarInstrumento(id, motivo)}
      />
    </div>
  );
};
