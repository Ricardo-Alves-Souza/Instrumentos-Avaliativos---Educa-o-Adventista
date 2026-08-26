export type UserRole = 'SUPER_ADMIN' | 'COORDENADOR' | 'PROFESSOR';

export type InstrumentoStatus =
  | 'RASCUNHO'
  | 'ENVIADO'
  | 'APROVADO'
  | 'REJEITADO'
  | 'LIBERADO_MODIFICACAO';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar?: string;
  ativo?: boolean;
}

export interface CriterioAvaliativo {
  id: string;
  descricao: string;
  valor: number; // e.g. 1.50
}

export interface Habilidade {
  id: string;
  codigo: string; // e.g. "EF04CI06"
  descricao: string;
}

export interface InstrumentoTurmaEntrega {
  turmaId: string;
  turmaNome: string;
  data: string; // e.g. "26/08/2026"
}

export interface StatusHistoryEntry {
  status: InstrumentoStatus;
  data: string; // e.g. "26/08/2026 14:30"
  usuarioNome: string;
  usuarioRole: UserRole;
  motivo?: string;
}

export interface InstrumentoAvaliativo {
  id: string;
  numero: number;
  codigoIdentificador: string; // e.g. "AV1", "AV2", "AV3"
  tipoNome: string; // e.g. "PESQUISA", "PROVA ESCRITA", "MAQUETE"
  etapa?: string;
  data: string; // Data de referência ou data principal (e.g. "26/08/2026")
  peso: number; // e.g. 6.00
  turmaId: string; // Turma principal ou primeira selecionada
  turmaNome: string; // Nome da turma principal
  turmas?: InstrumentoTurmaEntrega[]; // Lista de turmas selecionadas com datas de entrega individuais
  disciplinaId: string;
  disciplinaNome: string;
  professorId?: string;
  professorNome?: string;
  bimestre: number; // 1, 2, 3, 4
  anoLetivo: number; // e.g. 2026
  conteudo: string;
  fonteEstudo: string;
  desenvolvimento: string;
  criterios: CriterioAvaliativo[];
  habilidades?: Habilidade[];
  // Fluxo de Status & Auditoria
  status: InstrumentoStatus;
  dataCriacao?: string;
  dataEnvio?: string;
  dataAprovacao?: string;
  dataRejeicao?: string;
  coordenadorId?: string;
  coordenadorNome?: string;
  motivoRejeicao?: string;
  historico?: StatusHistoryEntry[];
}

export interface Turma {
  id: string;
  nome: string; // e.g. "1º Ano A - Manhã", "1º Ens. Médio A"
  serie: string; // e.g. "1º Ano", "4º Ano", "1º Ens. Médio"
  nivel: string; // "Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio"
  turno: 'Manhã' | 'Tarde';
  anoLetivo: number;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  ordem: number; // Ordem de precedência (1, 2, 3...)
  cor?: string;
}

export interface Atribuicao {
  id: string;
  professorId: string;
  professorNome: string;
  disciplinaIds: string[];
  turmaIds: string[];
}

export interface SystemSettings {
  bimestreAtual: number; // 1, 2, 3, 4
  statusEdicao: 'LIBERADO' | 'BLOQUEADO';
}

export interface ExportOptions {
  includeSkills: boolean;
}
