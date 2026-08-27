import React, { useState, useEffect, useMemo } from 'react';
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
  Calculator,
  HelpCircle,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import {
  InstrumentoAvaliativo,
  InstrumentoTurmaEntrega,
  CriterioAvaliativo,
  Habilidade,
} from '../types';
import { useApp } from '../context/AppContext';
import { AutoResizeTextarea } from './AutoResizeTextarea';

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

interface LocalCriterio {
  id: string;
  descricao: string;
  valorInput: string;
}

// Funções auxiliares para conversão de data ISO (YYYY-MM-DD) <-> BR (DD/MM/YYYY)
function toDateInputValue(brDate: string): string {
  if (!brDate) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(brDate)) return brDate;
  const parts = brDate.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d && m && y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return '';
}

function fromDateInputValue(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return isoDate;
}

function isValidDateStr(str: string): boolean {
  if (!str) return false;
  const parts = str.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 2000 || year > 2100) return false;
  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
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
    tiposInstrumento,
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

  // Turmas e Disciplinas disponíveis
  const availableTurmas = isProfessor ? getProfessorTurmas(currentUser.id) : turmas;
  const availableDisciplinas = isProfessor ? getProfessorDisciplinas(currentUser.id) : disciplinas;

  const effectiveTurmas = availableTurmas.length > 0 ? availableTurmas : turmas;
  const effectiveDisciplinas = availableDisciplinas.length > 0 ? availableDisciplinas : disciplinas;

  // Estados do formulário
  const [selectedTurmas, setSelectedTurmas] = useState<InstrumentoTurmaEntrega[]>([]);
  const [disciplinaId, setDisciplinaId] = useState<string>('');
  const [numero, setNumero] = useState<number | ''>('');
  const [codigoIdentificador, setCodigoIdentificador] = useState<string>('');
  const [tipoNome, setTipoNome] = useState<string>('');
  const [peso, setPeso] = useState<number | ''>('');
  const [bimestre, setBimestre] = useState<number>(systemSettings.bimestreAtual);
  const [anoLetivo, setAnoLetivo] = useState<number>(new Date().getFullYear());
  const [conteudo, setConteudo] = useState<string>('');
  const [fonteEstudo, setFonteEstudo] = useState<string>('');
  const [desenvolvimento, setDesenvolvimento] = useState<string>('');
  const [criterios, setCriterios] = useState<LocalCriterio[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);

  // Estados de feedback e modais de fluxo
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal de confirmação ao enviar para aprovação
  const [isApprovalConfirmOpen, setIsApprovalConfirmOpen] = useState(false);

  // Modal pós-salvamento: "Deseja cadastrar outro instrumento?"
  const [isPostSavePromptOpen, setIsPostSavePromptOpen] = useState(false);
  const [postSaveType, setPostSaveType] = useState<'ENVIADO' | 'RASCUNHO' | 'SALVO'>('ENVIADO');

  // Inicialização / Reset
  const resetFormState = (preserveDefaults = true) => {
    if (initialInstrumento && preserveDefaults) {
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
      setCodigoIdentificador(initialInstrumento.codigoIdentificador || 'AV1');
      setTipoNome(initialInstrumento.tipoNome);
      setPeso(initialInstrumento.peso);
      setBimestre(initialInstrumento.bimestre);
      setAnoLetivo(initialInstrumento.anoLetivo);
      setConteudo(initialInstrumento.conteudo);
      setFonteEstudo(initialInstrumento.fonteEstudo);
      setDesenvolvimento(initialInstrumento.desenvolvimento);
      setCriterios(
        (initialInstrumento.criterios || []).map((c) => ({
          id: c.id || 'c-' + Math.random(),
          descricao: c.descricao,
          valorInput: String(c.valor).replace('.', ','),
        }))
      );
      setHabilidades(initialInstrumento.habilidades || []);
    } else {
      // Novo instrumento do zero
      const initialTurmaList = defaultTurmaId
        ? [{ turmaId: defaultTurmaId, turmaNome: effectiveTurmas.find((t) => t.id === defaultTurmaId)?.nome || '', data: '' }]
        : [];
      setSelectedTurmas(initialTurmaList);
      setDisciplinaId(defaultDisciplinaId || (effectiveDisciplinas.length === 1 ? effectiveDisciplinas[0].id : ''));
      setNumero('');
      setCodigoIdentificador(tiposInstrumento.length > 0 ? tiposInstrumento[0].nome : 'AV1');
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
    setIsApprovalConfirmOpen(false);
    setIsPostSavePromptOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetFormState(true);
    }
  }, [isOpen, initialInstrumento, defaultTurmaId, defaultDisciplinaId, systemSettings.bimestreAtual]);

  // Seletor de Turmas
  const handleToggleTurma = (tId: string) => {
    const isSelected = selectedTurmas.some((t) => t.turmaId === tId);
    if (isSelected) {
      setSelectedTurmas(selectedTurmas.filter((t) => t.turmaId !== tId));
    } else {
      const found = effectiveTurmas.find((t) => t.id === tId);
      if (found) {
        const defaultDate = selectedTurmas[0]?.data || '';
        setSelectedTurmas([
          ...selectedTurmas,
          { turmaId: found.id, turmaNome: found.nome, data: defaultDate },
        ]);
      }
    }
  };

  // Atualização de Data por Turma
  const handleUpdateTurmaDate = (tId: string, rawIsoDate: string) => {
    const brDate = fromDateInputValue(rawIsoDate);
    setSelectedTurmas(
      selectedTurmas.map((t) => (t.turmaId === tId ? { ...t, data: brDate } : t))
    );
  };

  // Copiar primeira data para todas
  const handleCopyDateToAll = () => {
    if (selectedTurmas.length === 0) return;
    const firstDate = selectedTurmas[0].data;
    if (!firstDate) return;
    setSelectedTurmas(selectedTurmas.map((t) => ({ ...t, data: firstDate })));
  };

  // Critérios Avaliativos
  const handleAddCriterio = () => {
    setCriterios([
      ...criterios,
      { id: 'c-' + Date.now(), descricao: '', valorInput: '1,0' },
    ]);
  };

  const handleRemoveCriterio = (id: string) => {
    setCriterios(criterios.filter((c) => c.id !== id));
  };

  // Somatória em tempo real dos critérios avaliativos
  const somaCriterios = useMemo(() => {
    return criterios.reduce((total, crit) => {
      const parsed = parseFloat((crit.valorInput || '0').replace(',', '.'));
      return total + (isNaN(parsed) ? 0 : parsed);
    }, 0);
  }, [criterios]);

  const somaCriteriosFormatada = somaCriterios.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  // Habilidades
  const handleAddHabilidade = () => {
    setHabilidades([
      ...habilidades,
      { id: 'h-' + Date.now(), codigo: '', descricao: '' },
    ]);
  };

  const handleRemoveHabilidade = (id: string) => {
    setHabilidades(habilidades.filter((h) => h.id !== id));
  };

  // Montagem do Payload
  const buildInstrumentPayload = (): Partial<InstrumentoAvaliativo> => {
    const primaryTurma = selectedTurmas[0];
    const selDisc = disciplinas.find((d) => d.id === disciplinaId);

    const parsedCriterios: CriterioAvaliativo[] = criterios
      .filter((c) => c.descricao.trim() !== '')
      .map((c) => {
        const val = parseFloat((c.valorInput || '0').replace(',', '.'));
        return {
          id: c.id,
          descricao: c.descricao.trim(),
          valor: isNaN(val) ? 0 : val,
        };
      });

    return {
      ...(initialInstrumento ? { id: initialInstrumento.id } : {}),
      numero: numero === '' ? 1 : Number(numero),
      codigoIdentificador: (codigoIdentificador || 'AV1').trim(),
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
      criterios: parsedCriterios,
      habilidades: habilidades.filter((h) => h.codigo.trim() !== ''),
    };
  };

  // Validação para Envio de Aprovação
  const validateForApproval = (): boolean => {
    setErrorMessage(null);

    if (isProfessor && systemSettings.statusEdicao === 'BLOQUEADO') {
      setErrorMessage('A criação/edição de instrumentos está BLOQUEADA pela coordenação.');
      return false;
    }

    if (selectedTurmas.length === 0) {
      setErrorMessage('Selecione ao menos 1 turma para o instrumento.');
      return false;
    }

    // Validação de datas válidas em todas as turmas
    const missingDateTurma = selectedTurmas.find((t) => !t.data || t.data.trim() === '');
    if (missingDateTurma) {
      setErrorMessage(`Informe a data de entrega para a turma: ${missingDateTurma.turmaNome}.`);
      return false;
    }

    const invalidDateTurma = selectedTurmas.find((t) => !isValidDateStr(t.data));
    if (invalidDateTurma) {
      setErrorMessage(`Data de entrega inválida para a turma "${invalidDateTurma.turmaNome}". Utilize uma data válida.`);
      return false;
    }

    if (!disciplinaId) {
      setErrorMessage('Selecione uma disciplina.');
      return false;
    }

    if (!codigoIdentificador.trim()) {
      setErrorMessage('Selecione o instrumento correspondente (ex: AV1, AV2).');
      return false;
    }

    if (!tipoNome.trim()) {
      setErrorMessage('Informe o tipo/nome do instrumento avaliativo (ex: PROVA ESCRITA, SEMINÁRIO).');
      return false;
    }

    if (peso === '' || Number(peso) <= 0) {
      setErrorMessage('Informe o peso/pontuação máxima do instrumento.');
      return false;
    }

    if (!conteudo.trim()) {
      setErrorMessage('Informe o conteúdo curricular cobrado.');
      return false;
    }

    if (!fonteEstudo.trim()) {
      setErrorMessage('Informe as fontes de estudo e materiais de apoio.');
      return false;
    }

    if (!desenvolvimento.trim()) {
      setErrorMessage('Descreva o desenvolvimento pedagógico da atividade.');
      return false;
    }

    if (criterios.length === 0) {
      setErrorMessage('Adicione ao menos 1 critério avaliativo com pontuação.');
      return false;
    }

    const emptyCriterio = criterios.find((c) => !c.descricao.trim());
    if (emptyCriterio) {
      setErrorMessage('Preencha a descrição de todos os critérios avaliativos cadastrados.');
      return false;
    }

    return true;
  };

  // Clique no botão "Enviar para Aprovação" -> Abre diálogo de confirmação
  const handleClickSubmitButton = () => {
    if (!validateForApproval()) {
      return;
    }
    setIsApprovalConfirmOpen(true);
  };

  // Executa o envio definitivo para aprovação
  const handleConfirmSendForApproval = () => {
    try {
      const payload = buildInstrumentPayload();
      enviarParaAprovacao(payload);
      setIsApprovalConfirmOpen(false);
      setPostSaveType('ENVIADO');
      setIsPostSavePromptOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao enviar para aprovação.');
      setIsApprovalConfirmOpen(false);
    }
  };

  // Salvar como rascunho a partir do modal ou botão direto
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
      setIsApprovalConfirmOpen(false);
      setPostSaveType('RASCUNHO');
      setIsPostSavePromptOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar rascunho.');
      setIsApprovalConfirmOpen(false);
    }
  };

  // Salvamento direto (para admin/coord ou instrumentos já aprovados)
  const handleSaveDirect = () => {
    setErrorMessage(null);
    try {
      const payload = buildInstrumentPayload();
      if (initialInstrumento?.id) {
        updateInstrumento({ ...initialInstrumento, ...payload } as InstrumentoAvaliativo);
      } else {
        addInstrumento(payload as any);
      }
      setPostSaveType('SALVO');
      setIsPostSavePromptOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar alterações.');
    }
  };

  // Resposta pós-salvamento: "Cadastrar outro instrumento?"
  const handlePromptCadastrarOutro = () => {
    setIsPostSavePromptOpen(false);
    resetFormState(false);
  };

  const handlePromptFinalizar = () => {
    setIsPostSavePromptOpen(false);
    onClose();
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

        {/* Rejection Alert Banner */}
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
          {/* Section 1: Turmas Vinculadas e Datas */}
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

            {/* Turmas Checkboxes */}
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

            {/* Data de Entrega Individual por Turma com input de data real */}
            {selectedTurmas.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Data de Entrega Individual por Turma *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedTurmas.map((st) => {
                    const isoDateVal = toDateInputValue(st.data);
                    return (
                      <div
                        key={st.turmaId}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 gap-2 hover:border-blue-300 transition-colors"
                      >
                        <span className="font-semibold text-slate-800 truncate text-xs">
                          {st.turmaNome}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="date"
                            required
                            value={isoDateVal}
                            onChange={(e) => handleUpdateTurmaDate(st.turmaId, e.target.value)}
                            className="text-xs border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 font-medium focus:border-blue-500 focus:outline-none bg-slate-50 focus:bg-white cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Disciplina, Bimestre e Instrumento (Antigo Código Identificador) */}
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
                Instrumento *
              </label>
              <select
                required
                value={codigoIdentificador}
                onChange={(e) => setCodigoIdentificador(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:bg-white font-bold"
              >
                <option value="">Selecione o instrumento...</option>
                {tiposInstrumento.map((tipo) => (
                  <option key={tipo.id} value={tipo.nome}>
                    {tipo.nome}
                  </option>
                ))}
                {codigoIdentificador &&
                  !tiposInstrumento.some(
                    (t) => t.nome.toUpperCase() === codigoIdentificador.toUpperCase()
                  ) && (
                    <option value={codigoIdentificador}>{codigoIdentificador}</option>
                  )}
              </select>
            </div>
          </div>

          {/* Section 3: Tipo / Nome e Pontuação */}
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

          {/* Section 4: Conteúdo Cobrado & Fonte de Estudo (Auto-grow) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Conteúdo Cobrado *
              </label>
              <AutoResizeTextarea
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
              <AutoResizeTextarea
                rows={2}
                required
                value={fonteEstudo}
                onChange={(e) => setFonteEstudo(e.target.value)}
                placeholder="Ex: Apostila bimestral páginas 50 a 65, anotações de aula..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* Section 5: Desenvolvimento Pedagógico (Auto-grow) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Desenvolvimento Pedagógico da Atividade *
            </label>
            <AutoResizeTextarea
              rows={3}
              required
              value={desenvolvimento}
              onChange={(e) => setDesenvolvimento(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:bg-white leading-relaxed"
              placeholder="Descreva detalhadamente as etapas de execução da atividade, orientações aos alunos e critérios práticos..."
            />
          </div>

          {/* Section 6: Critérios Avaliativos com Somatória e Auto-grow */}
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
              <div className="flex items-center gap-2">
                {/* Somatória visível em tempo real */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs font-bold shadow-xs">
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total: {somaCriteriosFormatada} pts</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddCriterio}
                  className="text-[11px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Critério
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {criterios.length === 0 && (
                <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500 italic">
                  Nenhum critério adicionado. Clique em "+ Adicionar Critério" para cadastrar.
                </div>
              )}
              {criterios.map((crit, idx) => (
                <div key={crit.id} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 w-5 text-center mt-2">
                    {idx + 1}.
                  </span>
                  <div className="flex-1">
                    <AutoResizeTextarea
                      rows={1}
                      required
                      value={crit.descricao}
                      onChange={(e) => {
                        const updated = [...criterios];
                        updated[idx].descricao = e.target.value;
                        setCriterios(updated);
                      }}
                      className="w-full text-xs border border-slate-300 rounded-md p-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Descrição do critério avaliativo..."
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <input
                      type="text"
                      required
                      value={crit.valorInput}
                      onChange={(e) => {
                        const updated = [...criterios];
                        updated[idx].valorInput = e.target.value;
                        setCriterios(updated);
                      }}
                      className="w-20 text-xs border border-slate-300 rounded-md p-1.5 bg-white text-slate-800 font-bold text-center"
                      placeholder="1,5"
                    />
                    <span className="text-[11px] text-slate-500 font-bold">pts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterio(crit.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 cursor-pointer transition-colors mt-0.5"
                    title="Remover Critério"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Habilidades BNCC (Auto-grow) */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Matriz de Habilidades (BNCC / Curricular)
              </label>
              <button
                type="button"
                onClick={handleAddHabilidade}
                className="text-[11px] text-purple-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 hover:bg-purple-100 transition-colors"
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
                    className="w-28 text-xs font-mono font-bold border border-slate-300 rounded p-1.5 bg-white text-slate-800 uppercase shrink-0 mt-0.5"
                    placeholder="Ex: EF04CI06"
                  />
                  <div className="flex-1">
                    <AutoResizeTextarea
                      rows={1}
                      value={hab.descricao}
                      onChange={(e) => {
                        const updated = [...habilidades];
                        updated[idx].descricao = e.target.value;
                        setHabilidades(updated);
                      }}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Descrição da habilidade BNCC correspondente..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHabilidade(hab.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 cursor-pointer transition-colors mt-0.5"
                    title="Remover Habilidade"
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
                onClick={handleClickSubmitButton}
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

      {/* MODAL DE CONFIRMAÇÃO PARA ENVIO DE APROVAÇÃO */}
      {isApprovalConfirmOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
                <Send className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h4 className="text-base font-bold text-slate-900">
                  Enviar para Aprovação
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Este instrumento será enviado para a aprovação da Coordenação Pedagógica.
                  Após o envio, ele ficará <strong>bloqueado para edição</strong> enquanto estiver sob análise.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Caso ainda precise fazer alterações antes de formalizar o envio, você pode optar por <strong>Salvar como Rascunho</strong>.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApprovalConfirmOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Voltar ao Formulário
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  Salvar como Rascunho
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendForApproval}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Continuar e Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PÓS-SALVAMENTO: "DESEJA CADASTRAR OUTRO INSTRUMENTO?" */}
      {isPostSavePromptOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="text-base font-bold text-slate-900">
                  {postSaveType === 'ENVIADO'
                    ? 'Instrumento Enviado com Sucesso!'
                    : postSaveType === 'RASCUNHO'
                    ? 'Rascunho Salvo com Sucesso!'
                    : 'Alterações Salvas com Sucesso!'}
                </h4>
                <p className="text-xs text-slate-600">
                  {postSaveType === 'ENVIADO'
                    ? 'O instrumento avaliativo foi submetido e está aguardando revisão da coordenação.'
                    : 'Os dados foram guardados e continuam disponíveis para edição a qualquer momento.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-800">
                  Deseja cadastrar outro instrumento agora?
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selecione "Sim" para abrir um novo formulário limpo ou "Não" para retornar à listagem.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePromptFinalizar}
                  className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Não, finalizar
                </button>
                <button
                  type="button"
                  onClick={handlePromptCadastrarOutro}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Sim, cadastrar outro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
