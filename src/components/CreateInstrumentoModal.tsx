import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Award,
  AlertCircle,
  Calendar,
  Save,
  Send,
  CheckSquare,
  Square,
  Copy,
} from 'lucide-react';
import {
  InstrumentoAvaliativo,
  InstrumentoTurmaEntrega,
  CriterioAvaliativo,
  Habilidade,
  InstrumentoStatus,
} from '../types';
import { useApp } from '../context/AppContext';

interface CreateInstrumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft?: (inst: Partial<InstrumentoAvaliativo>) => void;
  onSubmitForApproval?: (inst: Partial<InstrumentoAvaliativo>) => void;
  onSave?: (inst: InstrumentoAvaliativo) => void;
  initialInstrumento?: InstrumentoAvaliativo | null;
  defaultTurmaId?: string;
  defaultDisciplinaId?: string;
}

export const CreateInstrumentoModal: React.FC<CreateInstrumentoModalProps> = ({
  isOpen,
  onClose,
  initialInstrumento,
  defaultTurmaId,
  defaultDisciplinaId,
}) => {
  const {
    turmas,
    disciplinas,
    systemSettings,
    currentUser,
    getProfessorTurmas,
    getProfessorDisciplinas,
    salvarRascunho,
    enviarParaAprovacao,
    addInstrumento,
    updateInstrumento,
  } = useApp();

  const isProfessor = currentUser.role === 'PROFESSOR';

  // Available classes & disciplines according to permissions and assignments
  const availableTurmas = isProfessor ? getProfessorTurmas(currentUser.id) : turmas;
  const availableDisciplinas = isProfessor ? getProfessorDisciplinas(currentUser.id) : disciplinas;

  const effectiveTurmas = availableTurmas.length > 0 ? availableTurmas : turmas;
  const effectiveDisciplinas = availableDisciplinas.length > 0 ? availableDisciplinas : disciplinas;

  // Selected turmas with individual delivery dates
  const [selectedTurmas, setSelectedTurmas] = useState<InstrumentoTurmaEntrega[]>(() => {
    if (initialInstrumento) {
      if (initialInstrumento.turmas && initialInstrumento.turmas.length > 0) {
        return initialInstrumento.turmas;
      }
      return [
        {
          turmaId: initialInstrumento.turmaId,
          turmaNome: initialInstrumento.turmaNome,
          data: initialInstrumento.data || '',
        },
      ];
    }
    if (defaultTurmaId) {
      const found = effectiveTurmas.find((t) => t.id === defaultTurmaId);
      if (found) {
        return [{ turmaId: found.id, turmaNome: found.nome, data: '' }];
      }
    }
    // Start completely unselected / empty by default per user requirement!
    return [];
  });

  const [disciplinaId, setDisciplinaId] = useState<string>(() => {
    if (initialInstrumento) return initialInstrumento.disciplinaId;
    if (defaultDisciplinaId) return defaultDisciplinaId;
    return '';
  });

  const [numero, setNumero] = useState<number | ''>(() => {
    if (initialInstrumento) return initialInstrumento.numero;
    return '';
  });

  const [codigoIdentificador, setCodigoIdentificador] = useState<string>(() => {
    if (initialInstrumento) return initialInstrumento.codigoIdentificador;
    return '';
  });

  const [tipoNome, setTipoNome] = useState<string>(() => {
    if (initialInstrumento) return initialInstrumento.tipoNome;
    return '';
  });

  const [peso, setPeso] = useState<number | ''>(() => {
    if (initialInstrumento) return initialInstrumento.peso;
    return '';
  });

  const [bimestre, setBimestre] = useState<number>(() => {
    if (initialInstrumento) return initialInstrumento.bimestre;
    return systemSettings.bimestreAtual;
  });

  const [anoLetivo, setAnoLetivo] = useState<number>(() => {
    if (initialInstrumento) return initialInstrumento.anoLetivo;
    return new Date().getFullYear();
  });

  const [conteudo, setConteudo] = useState<string>(() => {
    if (initialInstrumento) return initialInstrumento.conteudo;
    return '';
  });

  const [fonteEstudo, setFonteEstudo] = useState<string>(() => {
    if (initialInstrumento) return initialInstrumento.fonteEstudo;
    return '';
  });

  const [desenvolvimento, setDesenvolvimento] = useState<string>(() => {
    if (initialInstrumento) return initialInstrumento.desenvolvimento;
    return '';
  });

  // Criteria start EMPTY by default when creating new instrument
  const [criterios, setCriterios] = useState<CriterioAvaliativo[]>(() => {
    if (initialInstrumento) return initialInstrumento.criterios;
    return [];
  });

  // Skills start EMPTY by default when creating new instrument
  const [habilidades, setHabilidades] = useState<Habilidade[]>(() => {
    if (initialInstrumento?.habilidades) return initialInstrumento.habilidades;
    return [];
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync when initialInstrumento or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (initialInstrumento) {
        if (initialInstrumento.turmas && initialInstrumento.turmas.length > 0) {
          setSelectedTurmas(initialInstrumento.turmas);
        } else {
          setSelectedTurmas([
            {
              turmaId: initialInstrumento.turmaId,
              turmaNome: initialInstrumento.turmaNome,
              data: initialInstrumento.data || '',
            },
          ]);
        }
        setDisciplinaId(initialInstrumento.disciplinaId);
        setNumero(initialInstrumento.numero);
        setCodigoIdentificador(initialInstrumento.codigoIdentificador);
        setTipoNome(initialInstrumento.tipoNome);
        setPeso(initialInstrumento.peso);
        setBimestre(initialInstrumento.bimestre);
        setAnoLetivo(initialInstrumento.anoLetivo);
        setConteudo(initialInstrumento.conteudo);
        setFonteEstudo(initialInstrumento.fonteEstudo);
        setDesenvolvimento(initialInstrumento.desenvolvimento);
        setCriterios(initialInstrumento.criterios || []);
        setHabilidades(initialInstrumento.habilidades || []);
      } else {
        // Reset when opening fresh for new instrument
        setSelectedTurmas(
          defaultTurmaId
            ? [{ turmaId: defaultTurmaId, turmaNome: effectiveTurmas.find((t) => t.id === defaultTurmaId)?.nome || '', data: '' }]
            : []
        );
        setDisciplinaId(defaultDisciplinaId || '');
        setNumero('');
        setCodigoIdentificador('');
        setTipoNome('');
        setPeso('');
        setBimestre(systemSettings.bimestreAtual);
        setAnoLetivo(new Date().getFullYear());
        setConteudo('');
        setFonteEstudo('');
        setDesenvolvimento('');
        setCriterios([]);
        setHabilidades([]);
      }
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialInstrumento, defaultTurmaId, defaultDisciplinaId, systemSettings.bimestreAtual]);

  // Toggle turma selection
  const handleToggleTurma = (tId: string) => {
    const isSelected = selectedTurmas.some((t) => t.turmaId === tId);
    if (isSelected) {
      setSelectedTurmas(selectedTurmas.filter((t) => t.turmaId !== tId));
    } else {
      const found = effectiveTurmas.find((t) => t.id === tId);
      if (found) {
        // Inherit date from first selected class if available
        const defaultDate = selectedTurmas[0]?.data || '';
        setSelectedTurmas([
          ...selectedTurmas,
          { turmaId: found.id, turmaNome: found.nome, data: defaultDate },
        ]);
      }
    }
  };

  // Change delivery date for a specific turma
  const handleUpdateTurmaDate = (tId: string, newDate: string) => {
    setSelectedTurmas(
      selectedTurmas.map((t) => (t.turmaId === tId ? { ...t, data: newDate } : t))
    );
  };

  // Batch copy first class delivery date to all selected classes
  const handleCopyDateToAll = () => {
    if (selectedTurmas.length === 0) return;
    const firstDate = selectedTurmas[0].data;
    if (!firstDate) return;
    setSelectedTurmas(selectedTurmas.map((t) => ({ ...t, data: firstDate })));
  };

  // Criteria handlers
  const handleAddCriterio = () => {
    setCriterios([
      ...criterios,
      { id: 'c-' + Date.now(), descricao: '', valor: 1.0 },
    ]);
  };

  const handleRemoveCriterio = (id: string) => {
    setCriterios(criterios.filter((c) => c.id !== id));
  };

  // Skills handlers
  const handleAddHabilidade = () => {
    setHabilidades([
      ...habilidades,
      { id: 'h-' + Date.now(), codigo: '', descricao: '' },
    ]);
  };

  const handleRemoveHabilidade = (id: string) => {
    setHabilidades(habilidades.filter((h) => h.id !== id));
  };

  const buildInstrumentPayload = (): Partial<InstrumentoAvaliativo> => {
    const primaryTurma = selectedTurmas[0];
    const selDisc = disciplinas.find((d) => d.id === disciplinaId);

    return {
      ...(initialInstrumento ? { id: initialInstrumento.id } : {}),
      numero: numero === '' ? 1 : Number(numero),
      codigoIdentificador: (codigoIdentificador || 'AV1').trim().toUpperCase(),
      tipoNome: tipoNome.trim().toUpperCase(),
      data: primaryTurma?.data || '',
      peso: peso === '' ? 10.0 : Number(peso),
      turmaId: primaryTurma?.turmaId || '',
      turmaNome: primaryTurma?.turmaNome || '',
      turmas: selectedTurmas,
      disciplinaId,
      disciplinaNome: selDisc?.nome || '',
      professorId: initialInstrumento?.professorId || currentUser.id,
      professorNome: initialInstrumento?.professorNome || currentUser.nome,
      bimestre: isProfessor ? systemSettings.bimestreAtual : Number(bimestre),
      anoLetivo: Number(anoLetivo),
      conteudo: conteudo.trim(),
      fonteEstudo: fonteEstudo.trim(),
      desenvolvimento: desenvolvimento.trim(),
      criterios: criterios.filter((c) => c.descricao.trim() !== ''),
      habilidades: habilidades.filter((h) => h.codigo.trim() !== ''),
    };
  };

  // Handle Save as Draft
  const handleSaveDraft = () => {
    setErrorMessage(null);

    if (isProfessor && systemSettings.statusEdicao === 'BLOQUEADO') {
      setErrorMessage('A criação/edição de instrumentos está BLOQUEADA pela coordenação.');
      return;
    }

    if (selectedTurmas.length === 0) {
      setErrorMessage('Selecione ao menos 1 turma para vincular ao rascunho.');
      return;
    }

    if (!disciplinaId) {
      setErrorMessage('Selecione a disciplina correspondente.');
      return;
    }

    try {
      const payload = buildInstrumentPayload();
      salvarRascunho(payload);
      setSuccessMessage('Rascunho salvo com sucesso!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar rascunho.');
    }
  };

  // Handle Submit for Approval
  const handleSubmitForApproval = () => {
    setErrorMessage(null);

    if (isProfessor && systemSettings.statusEdicao === 'BLOQUEADO') {
      setErrorMessage('A criação/edição de instrumentos está BLOQUEADA pela coordenação.');
      return;
    }

    // Strict Validation for submission
    if (selectedTurmas.length === 0) {
      setErrorMessage('Selecione ao menos 1 turma para o instrumento.');
      return;
    }

    // Check delivery dates for all selected turmas
    const missingDate = selectedTurmas.find((t) => !t.data || t.data.trim() === '');
    if (missingDate) {
      setErrorMessage(`Informe a data de entrega para a turma: ${missingDate.turmaNome}.`);
      return;
    }

    if (!disciplinaId) {
      setErrorMessage('Selecione uma disciplina.');
      return;
    }

    if (!codigoIdentificador.trim()) {
      setErrorMessage('Informe o código identificador do instrumento (ex: AV1, AV2).');
      return;
    }

    if (!tipoNome.trim()) {
      setErrorMessage('Informe o tipo/nome do instrumento avaliativo.');
      return;
    }

    if (peso === '' || Number(peso) <= 0) {
      setErrorMessage('Informe o peso/pontuação máxima do instrumento.');
      return;
    }

    if (!conteudo.trim()) {
      setErrorMessage('Informe o conteúdo curricular cobrado.');
      return;
    }

    if (!fonteEstudo.trim()) {
      setErrorMessage('Informe as fontes de estudo e materiais de apoio.');
      return;
    }

    if (!desenvolvimento.trim()) {
      setErrorMessage('Descreva o desenvolvimento pedagógico da atividade.');
      return;
    }

    if (criterios.length === 0) {
      setErrorMessage('Adicione ao menos 1 critério avaliativo com pontuação.');
      return;
    }

    const emptyCriterio = criterios.find((c) => !c.descricao.trim());
    if (emptyCriterio) {
      setErrorMessage('Preencha a descrição de todos os critérios avaliativos.');
      return;
    }

    try {
      const payload = buildInstrumentPayload();
      enviarParaAprovacao(payload);
      setSuccessMessage('Instrumento enviado com sucesso para aprovação da coordenação!');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao enviar para aprovação.');
    }
  };

  // Direct save preserving status (e.g. for super admin or approved instruments)
  const handleSaveDirect = () => {
    setErrorMessage(null);
    try {
      const payload = buildInstrumentPayload();
      if (initialInstrumento?.id) {
        updateInstrumento({ ...initialInstrumento, ...payload } as InstrumentoAvaliativo);
      } else {
        addInstrumento(payload as any);
      }
      setSuccessMessage('Alterações salvas com sucesso!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar alterações.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {initialInstrumento ? 'Editar Instrumento Avaliativo' : 'Cadastrar Novo Instrumento Avaliativo'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Ano Letivo {anoLetivo} · {isProfessor ? `${systemSettings.bimestreAtual}º Bimestre (Vigente)` : 'Planejamento Pedagógico'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rejection Alert Banner if editing a rejected instrument */}
        {initialInstrumento?.status === 'REJEITADO' && initialInstrumento.motivoRejeicao && (
          <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-800 mb-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Instrumento Rejeitado pela Coordenação
            </div>
            <p className="text-xs text-rose-700 leading-relaxed pl-6">
              <strong>Motivo:</strong> {initialInstrumento.motivoRejeicao}
            </p>
            <p className="text-[11px] text-rose-600 font-semibold mt-1.5 pl-6">
              Faça os ajustes solicitados nos campos abaixo e clique em <strong>"Enviar para Aprovação"</strong> para reenviar à coordenação.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Turmas Vinculadas (Multi-turma com datas individuais) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-800 text-xs block">
                  Turmas Vinculadas *
                </label>
                <p className="text-[11px] text-slate-500">
                  {isProfessor
                    ? 'Selecione uma ou mais turmas atribuídas a você para aplicar este instrumento.'
                    : 'Selecione as turmas que realizarão este instrumento avaliativo.'}
                </p>
              </div>
              {selectedTurmas.length > 1 && (
                <button
                  type="button"
                  onClick={handleCopyDateToAll}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  title="Aplica a data da primeira turma para todas as turmas selecionadas"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar 1ª data para todas
                </button>
              )}
            </div>

            {/* Turmas Checkboxes/Pills */}
            <div className="flex flex-wrap gap-2">
              {effectiveTurmas.map((t) => {
                const isSelected = selectedTurmas.some((st) => st.turmaId === t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToggleTurma(t.id)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{t.nome}</span>
                  </button>
                );
              })}
            </div>

            {/* Individual Delivery Dates Inputs for each selected class */}
            {selectedTurmas.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Data de Entrega Individual por Turma:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedTurmas.map((st) => (
                    <div
                      key={st.turmaId}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 gap-2"
                    >
                      <span className="font-semibold text-slate-800 truncate text-xs">
                        {st.turmaNome}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={st.data}
                          onChange={(e) => handleUpdateTurmaDate(st.turmaId, e.target.value)}
                          placeholder="DD/MM/AAAA"
                          className="w-28 text-xs border border-slate-300 rounded px-2 py-1 font-mono text-slate-800 focus:border-blue-500 focus:outline-none bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Disciplina, Bimestre e Código */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Disciplina *
              </label>
              <select
                required
                value={disciplinaId}
                onChange={(e) => setDisciplinaId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                <option value="">Selecione uma disciplina...</option>
                {effectiveDisciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome} ({d.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Bimestre {isProfessor && '(Fixo no Atual)'}
              </label>
              <select
                disabled={isProfessor}
                value={isProfessor ? systemSettings.bimestreAtual : bimestre}
                onChange={(e) => setBimestre(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 disabled:opacity-80 font-medium"
              >
                <option value={1}>1º Bimestre</option>
                <option value={2}>2º Bimestre</option>
                <option value={3}>3º Bimestre</option>
                <option value={4}>4º Bimestre</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Código Identificador *
              </label>
              <input
                type="text"
                required
                value={codigoIdentificador}
                onChange={(e) => setCodigoIdentificador(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 uppercase font-mono font-bold focus:bg-white"
                placeholder="Ex: AV1, AV2, AV3"
              />
            </div>
          </div>

          {/* Section 3: Tipo do Instrumento e Pontuação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tipo / Nome do Instrumento *
              </label>
              <input
                type="text"
                required
                value={tipoNome}
                onChange={(e) => setTipoNome(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 uppercase font-bold focus:bg-white"
                placeholder="Ex: PESQUISA, PROVA ESCRITA, SEMINÁRIO, MAQUETE"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Peso / Nota Máx. (pts) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={peso}
                onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 font-bold focus:bg-white"
                placeholder="Ex: 10.0"
              />
            </div>
          </div>

          {/* Section 4: Conteúdo Cobrado & Fonte de Estudo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Conteúdo Cobrado *
              </label>
              <textarea
                rows={2}
                required
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Ex: Capítulo 7 – Fungos, bactérias e ecossistemas..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:bg-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Fonte de Estudo / Material *
              </label>
              <textarea
                rows={2}
                required
                value={fonteEstudo}
                onChange={(e) => setFonteEstudo(e.target.value)}
                placeholder="Ex: Apostila bimestral páginas 50 a 65, anotações de aula..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* Section 5: Desenvolvimento Pedagógico */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Desenvolvimento Pedagógico da Atividade *
            </label>
            <textarea
              rows={4}
              required
              value={desenvolvimento}
              onChange={(e) => setDesenvolvimento(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:bg-white leading-relaxed"
              placeholder="Descreva detalhadamente as etapas de execução da atividade, orientações aos alunos e critérios práticos..."
            />
          </div>

          {/* Section 6: Critérios Avaliativos */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-bold text-slate-900 block">
                  Critérios Avaliativos
                </label>
                <p className="text-[11px] text-slate-500">
                  Defina os critérios e a pontuação individual de cada item.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCriterio}
                className="text-[11px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 hover:bg-blue-100"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Critério
              </button>
            </div>

            <div className="space-y-2">
              {criterios.length === 0 && (
                <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500 italic">
                  Nenhum critério adicionado. Clique em "+ Adicionar Critério" para cadastrar.
                </div>
              )}
              {criterios.map((crit, idx) => (
                <div key={crit.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 w-5 text-center">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    required
                    value={crit.descricao}
                    onChange={(e) => {
                      const updated = [...criterios];
                      updated[idx].descricao = e.target.value;
                      setCriterios(updated);
                    }}
                    className="flex-1 text-xs border border-slate-300 rounded-md p-1.5 bg-white text-slate-800"
                    placeholder="Descrição do critério avaliativo..."
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={crit.valor}
                      onChange={(e) => {
                        const updated = [...criterios];
                        updated[idx].valor = Number(e.target.value);
                        setCriterios(updated);
                      }}
                      className="w-20 text-xs border border-slate-300 rounded-md p-1.5 bg-white text-slate-800 font-bold"
                    />
                    <span className="text-[11px] text-slate-500 font-bold">pts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterio(crit.id)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Habilidades BNCC */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Matriz de Habilidades (BNCC / Curricular)
              </label>
              <button
                type="button"
                onClick={handleAddHabilidade}
                className="text-[11px] text-purple-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 hover:bg-purple-100"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Habilidade
              </button>
            </div>

            <div className="space-y-2">
              {habilidades.length === 0 && (
                <p className="text-[11px] text-slate-400 italic">Nenhuma habilidade adicionada ainda (opcional).</p>
              )}
              {habilidades.map((hab, idx) => (
                <div key={hab.id} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    value={hab.codigo}
                    onChange={(e) => {
                      const updated = [...habilidades];
                      updated[idx].codigo = e.target.value.toUpperCase();
                      setHabilidades(updated);
                    }}
                    className="w-28 text-xs font-mono font-bold border border-slate-300 rounded p-1 bg-white text-slate-800 uppercase"
                    placeholder="Ex: EF04CI06"
                  />
                  <input
                    type="text"
                    value={hab.descricao}
                    onChange={(e) => {
                      const updated = [...habilidades];
                      updated[idx].descricao = e.target.value;
                      setHabilidades(updated);
                    }}
                    className="flex-1 text-xs border border-slate-300 rounded p-1 bg-white text-slate-800"
                    placeholder="Descrição da habilidade BNCC correspondente..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHabilidade(hab.id)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2.5">
            {(!initialInstrumento || initialInstrumento.status === 'RASCUNHO' || isProfessor) && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                Salvar Rascunho
              </button>
            )}

            {initialInstrumento && initialInstrumento.status === 'APROVADO' && !isProfessor ? (
              <button
                type="button"
                onClick={handleSaveDirect}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitForApproval}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {initialInstrumento
                  ? initialInstrumento.status === 'REJEITADO'
                    ? 'Corrigir e Reenviar'
                    : initialInstrumento.status === 'ENVIADO'
                    ? 'Atualizar e Reenviar'
                    : 'Enviar para Aprovação'
                  : 'Enviar para Aprovação'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
