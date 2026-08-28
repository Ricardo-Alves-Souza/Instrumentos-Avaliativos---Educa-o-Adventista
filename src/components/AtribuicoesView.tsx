import React, { useState, useMemo } from 'react';
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
  Layers,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Atribuicao, Turma } from '../types';
import { SearchableCombobox, ComboboxOption } from './SearchableCombobox';
import { sortSeriesPedagogically } from '../utils/pedagogicalSort';

type TurmaSegment = 'FUNDAMENTAL_1' | 'FUNDAMENTAL_2' | 'ENSINO_MEDIO';

const SEGMENTS_CONFIG: {
  id: TurmaSegment;
  label: string;
  shortLabel: string;
  nivelMatch: string;
}[] = [
  {
    id: 'FUNDAMENTAL_1',
    label: 'Fundamental I',
    shortLabel: 'Fund. I',
    nivelMatch: 'Ensino Fundamental I',
  },
  {
    id: 'FUNDAMENTAL_2',
    label: 'Fundamental II',
    shortLabel: 'Fund. II',
    nivelMatch: 'Ensino Fundamental II',
  },
  {
    id: 'ENSINO_MEDIO',
    label: 'Ensino Médio',
    shortLabel: 'Ens. Médio',
    nivelMatch: 'Ensino Médio',
  },
];

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

  const isAuthorized = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TI' || currentUser.role === 'COORDENADOR';

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [atribToDelete, setAtribToDelete] = useState<Atribuicao | null>(null);
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>('');
  const [selectedDisciplinaIds, setSelectedDisciplinaIds] = useState<string[]>([]);
  const [selectedTurmaIds, setSelectedTurmaIds] = useState<string[]>([]);
  
  // Filters & Search
  const [searchProfList, setSearchProfList] = useState('');
  const [searchDisciplinaModal, setSearchDisciplinaModal] = useState('');
  const [activeTurmaSegment, setActiveTurmaSegment] = useState<TurmaSegment>('FUNDAMENTAL_1');

  // Apenas usuários reais com perfil PROFESSOR e ativos no sistema
  const professoresValidos = useMemo(
    () => users.filter((u) => u.role === 'PROFESSOR'),
    [users]
  );

  // Opções para o Combobox de Professores
  const professorOptions: ComboboxOption[] = useMemo(
    () =>
      professoresValidos.map((p) => ({
        id: p.id,
        label: p.nome,
        subLabel: p.email,
        badge: 'Docente',
      })),
    [professoresValidos]
  );

  // Filtrar atribuições para garantir que pertençam a professores reais existentes no sistema
  const validAtribuicoes = useMemo(
    () =>
      atribuicoes.filter((a) =>
        users.some((u) => u.id === a.professorId && u.role === 'PROFESSOR')
      ),
    [atribuicoes, users]
  );

  // Open modal for editing or new assignment
  const handleOpenModal = (atrib?: Atribuicao) => {
    if (atrib) {
      setSelectedProfessorId(atrib.professorId);
      setSelectedDisciplinaIds([...atrib.disciplinaIds]);
      setSelectedTurmaIds([...atrib.turmaIds]);
    } else {
      setSelectedProfessorId(''); // Requisito: Campo "Selecione o Professor" deve iniciar vazio
      setSelectedDisciplinaIds([]);
      setSelectedTurmaIds([]);
    }
    setSearchDisciplinaModal('');
    setActiveTurmaSegment('FUNDAMENTAL_1');
    setIsModalOpen(true);
  };

  // --- DISCIPLINAS HANDLERS ---
  const handleToggleDisciplina = (id: string) => {
    if (selectedDisciplinaIds.includes(id)) {
      setSelectedDisciplinaIds(selectedDisciplinaIds.filter((d) => d !== id));
    } else {
      setSelectedDisciplinaIds([...selectedDisciplinaIds, id]);
    }
  };

  const filteredDisciplinasModal = useMemo(() => {
    const term = searchDisciplinaModal.trim().toLowerCase();
    if (!term) return disciplinas;
    return disciplinas.filter(
      (d) =>
        d.nome.toLowerCase().includes(term) ||
        d.codigo.toLowerCase().includes(term)
    );
  }, [disciplinas, searchDisciplinaModal]);

  const handleSelectVisibleDisciplinas = () => {
    const visibleIds = filteredDisciplinasModal.map((d) => d.id);
    const combined = Array.from(new Set([...selectedDisciplinaIds, ...visibleIds]));
    setSelectedDisciplinaIds(combined);
  };

  const handleClearDisciplinas = () => {
    if (searchDisciplinaModal.trim()) {
      const visibleIds = new Set(filteredDisciplinasModal.map((d) => d.id));
      setSelectedDisciplinaIds(selectedDisciplinaIds.filter((id) => !visibleIds.has(id)));
    } else {
      setSelectedDisciplinaIds([]);
    }
  };

  // --- TURMAS SEGMENTATION & GROUPING ---
  const segmentTurmasMap = useMemo(() => {
    const f1 = turmas.filter((t) => t.nivel === 'Ensino Fundamental I');
    const f2 = turmas.filter((t) => t.nivel === 'Ensino Fundamental II');
    const em = turmas.filter((t) => t.nivel === 'Ensino Médio');
    return {
      FUNDAMENTAL_1: f1,
      FUNDAMENTAL_2: f2,
      ENSINO_MEDIO: em,
    };
  }, [turmas]);

  const currentSegmentTurmas = segmentTurmasMap[activeTurmaSegment] || [];

  // Group current segment turmas by series/ano
  const groupedCurrentSegment = useMemo<Record<string, Turma[]>>(() => {
    const groups: Record<string, Turma[]> = {};
    currentSegmentTurmas.forEach((t) => {
      const key = t.serie || 'Outras Turmas';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(t);
    });
    return groups;
  }, [currentSegmentTurmas]);

  const handleToggleTurma = (id: string) => {
    if (selectedTurmaIds.includes(id)) {
      setSelectedTurmaIds(selectedTurmaIds.filter((t) => t !== id));
    } else {
      setSelectedTurmaIds([...selectedTurmaIds, id]);
    }
  };

  // Select all in current segment
  const handleSelectAllInSegment = () => {
    const segIds = currentSegmentTurmas.map((t) => t.id);
    const combined = Array.from(new Set([...selectedTurmaIds, ...segIds]));
    setSelectedTurmaIds(combined);
  };

  // Deselect all in current segment
  const handleDeselectAllInSegment = () => {
    const segIdsSet = new Set(currentSegmentTurmas.map((t) => t.id));
    setSelectedTurmaIds(selectedTurmaIds.filter((id) => !segIdsSet.has(id)));
  };

  // Toggle an entire series/year group within the active segment
  const handleToggleSeriesGroup = (serieTurmas: Turma[]) => {
    const seriesIds = serieTurmas.map((t) => t.id);
    const allSelected = seriesIds.every((id) => selectedTurmaIds.includes(id));
    if (allSelected) {
      const seriesSet = new Set(seriesIds);
      setSelectedTurmaIds(selectedTurmaIds.filter((id) => !seriesSet.has(id)));
    } else {
      const combined = Array.from(new Set([...selectedTurmaIds, ...seriesIds]));
      setSelectedTurmaIds(combined);
    }
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
    const profName = prof ? prof.nome : (a.professorNome || '');
    return (profName || '').toLowerCase().includes(searchProfList.toLowerCase());
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
            Relacione professores às suas respectivas disciplinas e turmas com filtros e seleção por segmentos.
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
            placeholder="Buscar atribuição por nome do professor..."
            value={searchProfList}
            onChange={(e) => setSearchProfList(e.target.value)}
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

      {/* MODAL: CONFIGURAR / EDITAR ATRIBUIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#F3F4F6] bg-[#F9FAFB] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Configurar Atribuição de Aulas
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Vincule o docente às disciplinas e turmas com organização estruturada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* ITEM 1: SELEÇÃO DO PROFESSOR COM AUTOCOMPLETE SEARCHABLE COMBOBOX */}
              <div>
                <SearchableCombobox
                  label="Selecione o Professor"
                  required
                  placeholder="Digite o nome ou e-mail do docente..."
                  options={professorOptions}
                  value={selectedProfessorId}
                  onChange={(id) => setSelectedProfessorId(id)}
                />
              </div>

              {/* ITEM 3: GERENCIAMENTO DAS DISCIPLINAS COM BUSCA RÁPIDA NO TOPO */}
              <div className="border border-[#E5E7EB] rounded-xl p-4 bg-[#F9FAFB]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                      Disciplinas
                      <span className="font-semibold text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#DBEAFE] text-[10px]">
                        {selectedDisciplinaIds.length} selecionadas de {disciplinas.length}
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#6B7280]">
                      Marque as disciplinas que este professor leciona.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectVisibleDisciplinas}
                      className="text-[11px] font-semibold text-[#3B82F6] hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-md border border-[#E5E7EB]"
                    >
                      {searchDisciplinaModal.trim()
                        ? `Selecionar Filtradas (${filteredDisciplinasModal.length})`
                        : `Selecionar Todas (${disciplinas.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDisciplinas}
                      className="text-[11px] font-semibold text-[#6B7280] hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-md border border-[#E5E7EB]"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Quick Search Filter for Disciplines */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar disciplinas (ex: Física, Matemática, Biologia)..."
                    value={searchDisciplinaModal}
                    onChange={(e) => setSearchDisciplinaModal(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                  />
                  {searchDisciplinaModal && (
                    <button
                      type="button"
                      onClick={() => setSearchDisciplinaModal('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Disciplines Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1.5 bg-white border border-[#E5E7EB] rounded-lg">
                  {filteredDisciplinasModal.length === 0 ? (
                    <div className="col-span-full py-4 text-center text-[#9CA3AF] text-xs">
                      Nenhuma disciplina encontrada com "{searchDisciplinaModal}".
                    </div>
                  ) : (
                    filteredDisciplinasModal.map((d) => {
                      const isChecked = selectedDisciplinaIds.includes(d.id);
                      return (
                        <div
                          key={d.id}
                          onClick={() => handleToggleDisciplina(d.id)}
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all border ${
                            isChecked
                              ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
                              : 'bg-white border-[#F3F4F6] hover:bg-[#F9FAFB] text-[#374151]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#3B82F6] shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                            )}
                            <span className="text-xs font-medium truncate">{d.nome}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#9CA3AF] shrink-0 ml-1">
                            {d.codigo}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ITEM 2: ORGANIZAÇÃO DAS TURMAS POR SEGMENTO (ABAS + AGRUPAMENTO POR ANO + AÇÕES GLOBAIS POR SEGMENTO) */}
              <div className="border border-[#E5E7EB] rounded-xl p-4 bg-[#F9FAFB]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#3B82F6]" />
                      Turmas por Segmento
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        Total: {selectedTurmaIds.length} de {turmas.length} turmas
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#6B7280]">
                      Navegue pelas abas dos segmentos e marque as turmas correspondentes.
                    </p>
                  </div>
                </div>

                {/* 3 Top Tabs for Segments */}
                <div className="flex items-center gap-1 p-1 bg-[#E5E7EB]/60 rounded-lg">
                  {SEGMENTS_CONFIG.map((seg) => {
                    const segTurmas = segmentTurmasMap[seg.id] || [];
                    const segSelectedCount = segTurmas.filter((t) =>
                      selectedTurmaIds.includes(t.id)
                    ).length;
                    const isActive = activeTurmaSegment === seg.id;

                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setActiveTurmaSegment(seg.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white text-[#111827] shadow-xs'
                            : 'text-[#6B7280] hover:text-[#111827]'
                        }`}
                      >
                        <span>{seg.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            segSelectedCount > 0
                              ? 'bg-[#3B82F6] text-white'
                              : 'bg-[#E5E7EB] text-[#6B7280]'
                          }`}
                        >
                          {segSelectedCount}/{segTurmas.length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Inside the Active Tab: Segment Header & Global Actions */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#F3F4F6] gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111827]">
                        {SEGMENTS_CONFIG.find((s) => s.id === activeTurmaSegment)?.label}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        ({currentSegmentTurmas.filter((t) => selectedTurmaIds.includes(t.id)).length} de {currentSegmentTurmas.length} selecionadas)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllInSegment}
                        className="text-[11px] font-bold text-[#3B82F6] hover:bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#DBEAFE] transition-colors cursor-pointer"
                      >
                        Selecionar Todas do {SEGMENTS_CONFIG.find((s) => s.id === activeTurmaSegment)?.label}
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllInSegment}
                        className="text-[11px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6] px-2.5 py-1 rounded-md border border-[#E5E7EB] transition-colors cursor-pointer"
                      >
                        Desmarcar Segmento
                      </button>
                    </div>
                  </div>

                  {/* Agrupamento por Ano / Série */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {Object.entries(groupedCurrentSegment).length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#9CA3AF]">
                        Nenhuma turma cadastrada neste segmento.
                      </div>
                    ) : (
                      sortSeriesPedagogically(Object.keys(groupedCurrentSegment)).map((serie) => {
                        const serieTurmas = groupedCurrentSegment[serie] || [];
                        const serieSelectedCount = serieTurmas.filter((t) =>
                          selectedTurmaIds.includes(t.id)
                        ).length;
                        const isAllSerieSelected =
                          serieTurmas.length > 0 &&
                          serieSelectedCount === serieTurmas.length;

                        return (
                          <div
                            key={serie}
                            className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2.5 space-y-2"
                          >
                            {/* Row Header with Year/Serie and quick toggle */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#111827]">
                                  {serie}
                                </span>
                                <span className="text-[10px] font-semibold text-[#6B7280] bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                                  {serieSelectedCount}/{serieTurmas.length}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleSeriesGroup(serieTurmas)}
                                className="text-[10px] font-bold text-[#3B82F6] hover:underline cursor-pointer"
                              >
                                {isAllSerieSelected ? 'Desmarcar Ano' : 'Marcar Ano'}
                              </button>
                            </div>

                            {/* Turmas in this Year/Serie */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {serieTurmas.map((t) => {
                                const isChecked = selectedTurmaIds.includes(t.id);
                                return (
                                  <div
                                    key={t.id}
                                    onClick={() => handleToggleTurma(t.id)}
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                      isChecked
                                        ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#1E40AF] shadow-2xs'
                                        : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB] text-[#374151]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {isChecked ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                                      )}
                                      <span className="text-xs font-semibold truncate">
                                        {t.nome}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                                        t.turno === 'Manhã'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                      }`}
                                    >
                                      {t.turno.slice(0, 1)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-[#111827] hover:bg-[#1f2937] text-white font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
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
