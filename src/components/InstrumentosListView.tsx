import React, { useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Scale,
  BookOpen,
  Award,
  Edit2,
  Trash2,
  Lock,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Unlock,
  FileEdit,
  Eye,
  Building,
} from 'lucide-react';
import { InstrumentoAvaliativo, InstrumentoStatus, Turma, Disciplina } from '../types';
import { useApp } from '../context/AppContext';
import { InstrumentoDetailModal } from './InstrumentoDetailModal';
import { RejeitarModal } from './RejeitarModal';
import { ConfirmModal } from './ConfirmModal';

interface InstrumentosListViewProps {
  onOpenCreateModal: () => void;
  onOpenEditModal: (inst: InstrumentoAvaliativo) => void;
}

export const InstrumentosListView: React.FC<InstrumentosListViewProps> = ({
  onOpenCreateModal,
  onOpenEditModal,
}) => {
  const {
    instrumentos,
    turmas,
    disciplinas,
    deleteInstrumento,
    currentUser,
    systemSettings,
    canEditInstrument,
    canCreateInstrument,
    canApproveOrReject,
    getAccessibleTurmas,
    getAccessibleDisciplinas,
    getAccessibleInstrumentos,
    aprovarInstrumento,
    rejeitarInstrumento,
    liberarParaModificacao,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurma, setFilterTurma] = useState('all');
  const [filterDisciplina, setFilterDisciplina] = useState('all');
  const [filterBimestre, setFilterBimestre] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals state
  const [selectedDetailInst, setSelectedDetailInst] = useState<InstrumentoAvaliativo | null>(null);
  const [rejectingInst, setRejectingInst] = useState<InstrumentoAvaliativo | null>(null);
  const [deletingInst, setDeletingInst] = useState<InstrumentoAvaliativo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isProfessor = currentUser.role === 'PROFESSOR';
  const isLockedForProf = isProfessor && !canCreateInstrument();

  const accessibleTurmas = getAccessibleTurmas(currentUser);
  const accessibleDisciplinas = getAccessibleDisciplinas(currentUser);
  const baseInstrumentos = getAccessibleInstrumentos(currentUser);

  const handleConfirmDelete = async () => {
    if (!deletingInst) return;
    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await deleteInstrumento(deletingInst.id);
      setDeletingInst(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao excluir instrumento no Supabase.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = baseInstrumentos.filter((inst) => {
    const matchSearch =
      inst.tipoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.codigoIdentificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.professorNome && inst.professorNome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchTurma =
      filterTurma === 'all' ||
      inst.turmaId === filterTurma ||
      inst.turmas?.some((t) => t.turmaId === filterTurma);

    const matchDisc = filterDisciplina === 'all' || inst.disciplinaId === filterDisciplina;
    const matchBimestre = filterBimestre === 'all' || inst.bimestre === Number(filterBimestre);
    const matchStatus = filterStatus === 'all' || inst.status === filterStatus;

    return matchSearch && matchTurma && matchDisc && matchBimestre && matchStatus;
  });

  const renderStatusBadge = (status: InstrumentoStatus) => {
    switch (status) {
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aprovado
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Enviado p/ Aprovação
          </span>
        );
      case 'REJEITADO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejeitado
          </span>
        );
      case 'LIBERADO_MODIFICACAO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Unlock className="w-3.5 h-3.5 text-purple-600" />
            Liberado p/ Edição
          </span>
        );
      case 'RASCUNHO':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            Rascunho
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Instrumentos Avaliativos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre, edite, acompanhe o fluxo de aprovação e gerencie critérios e pesos avaliativos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canCreateInstrument() ? (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Instrumento</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span>Edição Bloqueada</span>
            </div>
          )}
        </div>
      </div>

      {/* Lock Notice for Professor */}
      {isLockedForProf && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-800 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            A coordenação bloqueou a criação e edição de instrumentos avaliativos para os professores. Modo somente leitura ativo.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, conteúdo, professor ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-900 font-medium focus:bg-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:bg-white"
        >
          <option value="all">Todos os Status</option>
          <option value="ENVIADO">Aguardando Aprovação</option>
          <option value="APROVADO">Aprovados</option>
          <option value="REJEITADO">Rejeitados</option>
          <option value="RASCUNHO">Rascunhos</option>
          <option value="LIBERADO_MODIFICACAO">Liberados p/ Edição</option>
        </select>

        <select
          value={filterBimestre}
          onChange={(e) => setFilterBimestre(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:bg-white"
        >
          <option value="all">Todos os Bimestres</option>
          <option value="1">1º Bimestre</option>
          <option value="2">2º Bimestre</option>
          <option value="3">3º Bimestre</option>
          <option value="4">4º Bimestre</option>
        </select>

        <select
          value={filterTurma}
          onChange={(e) => setFilterTurma(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:bg-white"
        >
          <option value="all">Todas as Turmas</option>
          {accessibleTurmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>

        <select
          value={filterDisciplina}
          onChange={(e) => setFilterDisciplina(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:bg-white"
        >
          <option value="all">Todas as Disciplinas</option>
          {accessibleDisciplinas.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Instruments Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
          Nenhum instrumento avaliativo encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((inst) => {
            const canEdit = canEditInstrument(inst);
            const canManage = canApproveOrReject();

            return (
              <div
                key={inst.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs font-mono">
                        {inst.codigoIdentificador}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                            {inst.tipoNome}
                          </h3>
                          {renderStatusBadge(inst.status)}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {inst.disciplinaNome} · {inst.bimestre}º Bimestre ({inst.anoLetivo})
                        </p>
                      </div>
                    </div>

                    {/* Actions: View Details, Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailInst(inst)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Ver Detalhes Completos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(inst)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Instrumento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {(currentUser.role === 'SUPER_ADMIN' || canEdit) && (
                        <button
                          type="button"
                          onClick={() => setDeletingInst(inst)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Instrumento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection Notice Banner if Rejected */}
                  {inst.status === 'REJEITADO' && inst.motivoRejeicao && (
                    <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs">
                      <span className="font-bold flex items-center gap-1 text-rose-800">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Parecer da Coordenação:
                      </span>
                      <p className="mt-0.5 text-rose-700 pl-4">{inst.motivoRejeicao}</p>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      {inst.data || 'A definir'}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      <Scale className="w-3 h-3 text-blue-600" />
                      Peso {inst.peso?.toFixed(1) || '0.0'} pts
                    </span>
                    {inst.turmas && inst.turmas.length > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        <Building className="w-3 h-3 text-slate-500" />
                        {inst.turmas.map((t) => t.turmaNome).join(', ')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        <Building className="w-3 h-3 text-slate-500" />
                        {inst.turmaNome}
                      </span>
                    )}
                    {inst.habilidades && inst.habilidades.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <Award className="w-3 h-3 text-purple-600" />
                        {inst.habilidades.length} {inst.habilidades.length === 1 ? 'Habilidade' : 'Habilidades'}
                      </span>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="text-xs text-slate-700 space-y-1.5 mb-3">
                    <p>
                      <strong className="text-slate-900">Conteúdo:</strong> {inst.conteudo}
                    </p>
                    <p className="line-clamp-2 text-slate-500">
                      <strong className="text-slate-900">Desenvolvimento:</strong> {inst.desenvolvimento}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{inst.criterios?.length || 0} critérios avaliativos</span>
                  {inst.professorNome && (
                    <span className="font-semibold text-slate-700">
                      Prof. {inst.professorNome}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <InstrumentoDetailModal
        isOpen={!!selectedDetailInst}
        instrumento={selectedDetailInst}
        onClose={() => setSelectedDetailInst(null)}
        onEdit={(inst) => onOpenEditModal(inst)}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingInst}
        title="Excluir Instrumento Avaliativo"
        message={`Tem certeza que deseja excluir o instrumento "${deletingInst?.codigoIdentificador} – ${deletingInst?.tipoNome}"? Esta ação removerá o registro permanentemente do banco de dados.`}
        confirmText="Excluir Instrumento"
        confirmVariant="danger"
        isLoading={isDeleting}
        onClose={() => setDeletingInst(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
