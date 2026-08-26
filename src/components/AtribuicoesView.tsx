import React, { useState } from 'react';
import {
  Link2,
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  CheckCircle2,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Atribuicao } from '../types';

export const AtribuicoesView: React.FC = () => {
  const {
    users,
    disciplinas,
    turmas,
    atribuicoes,
    saveAtribuicao,
    deleteAtribuicao,
    currentUser,
  } = useApp();

  const isAuthorized = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COORDENADOR';

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [atribToDelete, setAtribToDelete] = useState<Atribuicao | null>(null);
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>('');
  const [selectedDisciplinaIds, setSelectedDisciplinaIds] = useState<string[]>([]);
  const [selectedTurmaIds, setSelectedTurmaIds] = useState<string[]>([]);
  const [searchProf, setSearchProf] = useState('');
  const [searchTurmaModal, setSearchTurmaModal] = useState('');

  // Apenas usuários reais com perfil PROFESSOR e ativos no sistema
  const professoresValidos = users.filter((u) => u.role === 'PROFESSOR');

  // Filtrar atribuições para garantir que pertençam a professores reais existentes no sistema
  const validAtribuicoes = atribuicoes.filter((a) =>
    users.some((u) => u.id === a.professorId && u.role === 'PROFESSOR')
  );

  // Open modal for editing or new assignment
  const handleOpenModal = (atrib?: Atribuicao) => {
    if (atrib) {
      setSelectedProfessorId(atrib.professorId);
      setSelectedDisciplinaIds([...atrib.disciplinaIds]);
      setSelectedTurmaIds([...atrib.turmaIds]);
    } else {
      setSelectedProfessorId(professoresValidos[0]?.id || '');
      setSelectedDisciplinaIds([]);
      setSelectedTurmaIds([]);
    }
    setSearchTurmaModal('');
    setIsModalOpen(true);
  };

  const handleToggleDisciplina = (id: string) => {
    if (selectedDisciplinaIds.includes(id)) {
      setSelectedDisciplinaIds(selectedDisciplinaIds.filter((d) => d !== id));
    } else {
      setSelectedDisciplinaIds([...selectedDisciplinaIds, id]);
    }
  };

  const handleSelectAllDisciplinas = () => {
    setSelectedDisciplinaIds(disciplinas.map((d) => d.id));
  };

  const handleClearDisciplinas = () => {
    setSelectedDisciplinaIds([]);
  };

  const handleToggleTurma = (id: string) => {
    if (selectedTurmaIds.includes(id)) {
      setSelectedTurmaIds(selectedTurmaIds.filter((t) => t !== id));
    } else {
      setSelectedTurmaIds([...selectedTurmaIds, id]);
    }
  };

  const handleSelectAllTurmas = () => {
    setSelectedTurmaIds(turmas.map((t) => t.id));
  };

  const handleClearTurmas = () => {
    setSelectedTurmaIds([]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfessorId) return;

    saveAtribuicao(selectedProfessorId, selectedDisciplinaIds, selectedTurmaIds);
    setIsModalOpen(false);
  };

  const handleConfirmDeleteAtrib = () => {
    if (!atribToDelete) return;
    deleteAtribuicao(atribToDelete.id);
    setAtribToDelete(null);
  };

  const filteredAtribuicoes = validAtribuicoes.filter((a) => {
    const prof = users.find((u) => u.id === a.professorId);
    const profName = prof ? prof.nome : a.professorNome;
    return profName.toLowerCase().includes(searchProf.toLowerCase());
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#3B82F6]" />
            Atribuições de Aulas
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Relacione professores às suas respectivas disciplinas e turmas com seleção múltipla.
          </p>
        </div>

        {isAuthorized && (
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-[#111827] hover:bg-[#1f2937] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Atribuição</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do professor..."
            value={searchProf}
            onChange={(e) => setSearchProf(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
          />
        </div>
      </div>

      {/* Assignments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAtribuicoes.map((atrib) => {
          const assignedDiscs = disciplinas.filter((d) => atrib.disciplinaIds.includes(d.id));
          const assignedTurmas = turmas.filter((t) => atrib.turmaIds.includes(t.id));

          return (
            <div
              key={atrib.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#3B82F6] transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#3B82F6] font-bold text-xs flex items-center justify-center border border-[#DBEAFE]">
                      {atrib.professorNome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#111827]">{atrib.professorNome}</h3>
                      <p className="text-[10px] text-[#6B7280]">Docente</p>
                    </div>
                  </div>

                  {isAuthorized && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(atrib)}
                        className="p-1.5 text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#EFF6FF] rounded-md cursor-pointer transition-colors"
                        title="Editar Atribuição"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAtribToDelete(atrib)}
                        className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                        title="Excluir Atribuição"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Disciplines Section */}
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280] block mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#3B82F6]" />
                    Disciplinas Atribuídas ({assignedDiscs.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedDiscs.length === 0 ? (
                      <span className="text-[11px] text-[#9CA3AF] italic">Nenhuma disciplina</span>
                    ) : (
                      assignedDiscs.map((d) => (
                        <span
                          key={d.id}
                          className="bg-[#EFF6FF] text-[#1E40AF] border border-[#DBEAFE] text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        >
                          {d.nome}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Classes Section */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280] block mb-1.5 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-[#3B82F6]" />
                    Turmas Atribuídas ({assignedTurmas.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {assignedTurmas.length === 0 ? (
                      <span className="text-[11px] text-[#9CA3AF] italic">Nenhuma turma</span>
                    ) : (
                      assignedTurmas.map((t) => (
                        <span
                          key={t.id}
                          className="bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {t.nome}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: NOVA / EDITAR ATRIBUIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">
                Configurar Atribuição de Aulas
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Professor select */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Selecione o Professor
                </label>
                <select
                  required
                  value={selectedProfessorId}
                  onChange={(e) => setSelectedProfessorId(e.target.value)}
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] font-medium focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  {professoresValidos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Disciplinas Multi-select */}
              <div className="border border-[#E5E7EB] rounded-xl p-4 bg-[#F9FAFB]/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">
                      Disciplinas ({selectedDisciplinaIds.length} selecionadas)
                    </h4>
                    <p className="text-[11px] text-[#6B7280]">
                      Marque as disciplinas que este professor leciona.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllDisciplinas}
                      className="text-[11px] font-semibold text-[#3B82F6] hover:underline cursor-pointer"
                    >
                      Selecionar Todas
                    </button>
                    <span className="text-[#D1D5DB]">·</span>
                    <button
                      type="button"
                      onClick={handleClearDisciplinas}
                      className="text-[11px] font-semibold text-[#6B7280] hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-white border border-[#E5E7EB] rounded-lg">
                  {disciplinas.map((d) => {
                    const isChecked = selectedDisciplinaIds.includes(d.id);
                    return (
                      <div
                        key={d.id}
                        onClick={() => handleToggleDisciplina(d.id)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          isChecked ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'hover:bg-[#F9FAFB] text-[#374151]'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#3B82F6] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        )}
                        <span className="text-xs font-medium truncate">{d.nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Turmas Multi-select */}
              <div className="border border-[#E5E7EB] rounded-xl p-4 bg-[#F9FAFB]/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">
                      Turmas ({selectedTurmaIds.length} selecionadas de {turmas.length})
                    </h4>
                    <p className="text-[11px] text-[#6B7280]">
                      Marque as turmas em que o professor atuará.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllTurmas}
                      className="text-[11px] font-semibold text-[#3B82F6] hover:underline cursor-pointer"
                    >
                      Selecionar Todas ({turmas.length})
                    </button>
                    <span className="text-[#D1D5DB]">·</span>
                    <button
                      type="button"
                      onClick={handleClearTurmas}
                      className="text-[11px] font-semibold text-[#6B7280] hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1 bg-white border border-[#E5E7EB] rounded-lg">
                  {turmas.map((t) => {
                    const isChecked = selectedTurmaIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTurma(t.id)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          isChecked ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'hover:bg-[#F9FAFB] text-[#374151]'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#3B82F6] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        )}
                        <span className="text-xs font-medium truncate">{t.nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-[#111827] hover:bg-[#1f2937] text-white font-bold rounded-lg cursor-pointer"
                >
                  Salvar Atribuições
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO EXCLUSÃO DE ATRIBUIÇÃO */}
      {atribToDelete && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-bold text-[#111827]">Remover Atribuição</h3>
              </div>
              <button
                type="button"
                onClick={() => setAtribToDelete(null)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#374151] leading-relaxed">
                Tem certeza de que deseja remover todas as atribuições de turmas e disciplinas vinculadas ao docente <strong className="text-[#111827]">{atribToDelete.professorNome}</strong>?
              </p>
              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAtribToDelete(null)}
                  className="px-4 py-2 text-xs text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAtrib}
                  className="px-5 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Atribuição</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
