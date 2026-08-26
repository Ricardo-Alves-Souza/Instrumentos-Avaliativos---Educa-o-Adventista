import {
  Turma,
  Disciplina,
  InstrumentoAvaliativo,
  User,
  Atribuicao,
  SystemSettings,
} from '../types';

const currentYear = new Date().getFullYear();

// 1. ALL 45 TURMAS: 36 Ensino Fundamental (1º ao 9º Ano, 4 por série) + 9 Ensino Médio (1º ao 3º Ano, 3 por série)
export const initialTurmas: Turma[] = [
  // Ensino Fundamental I (1º ao 5º Ano)
  { id: 'turma-1a-m', nome: '1º Ano A - Manhã', serie: '1º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-1b-m', nome: '1º Ano B - Manhã', serie: '1º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-1a-t', nome: '1º Ano A - Tarde', serie: '1º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-1b-t', nome: '1º Ano B - Tarde', serie: '1º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },

  { id: 'turma-2a-m', nome: '2º Ano A - Manhã', serie: '2º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-2b-m', nome: '2º Ano B - Manhã', serie: '2º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-2a-t', nome: '2º Ano A - Tarde', serie: '2º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-2b-t', nome: '2º Ano B - Tarde', serie: '2º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },

  { id: 'turma-3a-m', nome: '3º Ano A - Manhã', serie: '3º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-3b-m', nome: '3º Ano B - Manhã', serie: '3º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-3a-t', nome: '3º Ano A - Tarde', serie: '3º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-3b-t', nome: '3º Ano B - Tarde', serie: '3º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },

  { id: 'turma-4a-m', nome: '4º Ano A - Manhã', serie: '4º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-4b-m', nome: '4º Ano B - Manhã', serie: '4º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-4a-t', nome: '4º Ano A - Tarde', serie: '4º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-4b-t', nome: '4º Ano B - Tarde', serie: '4º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },

  { id: 'turma-5a-m', nome: '5º Ano A - Manhã', serie: '5º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-5b-m', nome: '5º Ano B - Manhã', serie: '5º Ano', nivel: 'Ensino Fundamental I', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-5a-t', nome: '5º Ano A - Tarde', serie: '5º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-5b-t', nome: '5º Ano B - Tarde', serie: '5º Ano', nivel: 'Ensino Fundamental I', turno: 'Tarde', anoLetivo: currentYear },

  // Ensino Fundamental II (6º ao 9º Ano)
  { id: 'turma-6a-m', nome: '6º Ano A - Manhã', serie: '6º Ano', nivel: 'Ensino Fundamental II', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-6b-m', nome: '6º Ano B - Manhã', serie: '6º Ano', nivel: 'Ensino Fundamental II', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-6a-t', nome: '6º Ano A - Tarde', serie: '6º Ano', nivel: 'Ensino Fundamental II', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-6b-t', nome: '6º Ano B - Tarde', serie: '6º Ano', nivel: 'Ensino Fundamental II', turno: 'Tarde', anoLetivo: currentYear },

  { id: 'turma-7a-m', nome: '7º Ano A - Manhã', serie: '7º Ano', nivel: 'Ensino Fundamental II', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-7b-m', nome: '7º Ano B - Manhã', serie: '7º Ano', nivel: 'Ensino Fundamental II', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-7a-t', nome: '7º Ano A - Tarde', serie: '7º Ano', nivel: 'Ensino Fundamental II', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-7b-t', nome: '7º Ano B - Tarde', serie: '7º Ano', nivel: 'Ensino Fundamental II', turno: 'Tarde', anoLetivo: currentYear },

  { id: 'turma-8a-m', nome: '8º Ano A - Manhã', serie: '8º Ano', nivel: 'Ensino Fundamental II', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-8b-m', nome: '8º Ano B - Manhã', serie: '8º Ano', nivel: 'Ensino Fundamental II', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-8a-t', nome: '8º Ano A - Tarde', serie: '8º Ano', nivel: 'Ensino Fundamental II', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-8b-t', nome: '8º Ano B - Tarde', serie: '8º Ano', nivel: 'Ensino Fundamental II', turno: 'Tarde', anoLetivo: currentYear },

  { id: 'turma-9a-m', nome: '9º Ano A - Manhã', serie: '9º Ano', nivel: 'Ensino Fundamental II', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-9b-m', nome: '9º Ano B - Manhã', serie: '9º Ano', nivel: 'Ensino Fundamental II', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-9a-t', nome: '9º Ano A - Tarde', serie: '9º Ano', nivel: 'Ensino Fundamental II', turno: 'Tarde', anoLetivo: currentYear },
  { id: 'turma-9b-t', nome: '9º Ano B - Tarde', serie: '9º Ano', nivel: 'Ensino Fundamental II', turno: 'Tarde', anoLetivo: currentYear },

  // Ensino Médio (1º ao 3º Ano, Turno Manhã: A, B, C)
  { id: 'turma-em1a', nome: '1º Ens. Médio A', serie: '1º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-em1b', nome: '1º Ens. Médio B', serie: '1º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-em1c', nome: '1º Ens. Médio C', serie: '1º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },

  { id: 'turma-em2a', nome: '2º Ens. Médio A', serie: '2º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-em2b', nome: '2º Ens. Médio B', serie: '2º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-em2c', nome: '2º Ens. Médio C', serie: '2º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },

  { id: 'turma-em3a', nome: '3º Ens. Médio A', serie: '3º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-em3b', nome: '3º Ens. Médio B', serie: '3º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },
  { id: 'turma-em3c', nome: '3º Ens. Médio C', serie: '3º Ens. Médio', nivel: 'Ensino Médio', turno: 'Manhã', anoLetivo: currentYear },
];

// Compatibility alias
export const mockTurmas = initialTurmas;

// 2. ALL 23 DISCIPLINAS WITH ORDER OF PRECEDENCE
export const initialDisciplinas: Disciplina[] = [
  { id: 'disc-1', nome: 'Língua Portuguesa', codigo: 'POR', ordem: 1 },
  { id: 'disc-2', nome: 'Língua Inglesa', codigo: 'ING', ordem: 2 },
  { id: 'disc-3', nome: 'Matemática', codigo: 'MAT', ordem: 3 },
  { id: 'disc-4', nome: 'Arte', codigo: 'ART', ordem: 4 },
  { id: 'disc-5', nome: 'Educação Física', codigo: 'EDF', ordem: 5 },
  { id: 'disc-6', nome: 'História', codigo: 'HIS', ordem: 6 },
  { id: 'disc-7', nome: 'Geografia', codigo: 'GEO', ordem: 7 },
  { id: 'disc-8', nome: 'Ciências', codigo: 'CIE', ordem: 8 },
  { id: 'disc-9', nome: 'Biologia', codigo: 'BIO', ordem: 9 },
  { id: 'disc-10', nome: 'Física', codigo: 'FIS', ordem: 10 },
  { id: 'disc-11', nome: 'Química', codigo: 'QUI', ordem: 11 },
  { id: 'disc-12', nome: 'Filosofia', codigo: 'FIL', ordem: 12 },
  { id: 'disc-13', nome: 'Sociologia', codigo: 'SOC', ordem: 13 },
  { id: 'disc-14', nome: 'Ensino Religioso', codigo: 'REL', ordem: 14 },
  { id: 'disc-15', nome: 'Projeto de Vida', codigo: 'PVI', ordem: 15 },
  { id: 'disc-16', nome: 'Argumentação', codigo: 'ARG', ordem: 16 },
  { id: 'disc-17', nome: 'Investigação Matemática', codigo: 'INM', ordem: 17 },
  { id: 'disc-18', nome: 'Debates Filosóficos', codigo: 'DEF', ordem: 18 },
  { id: 'disc-19', nome: 'Aprofundamento em Biologia', codigo: 'ABI', ordem: 19 },
  { id: 'disc-20', nome: 'Aprofundamento em História', codigo: 'AHI', ordem: 20 },
  { id: 'disc-21', nome: 'Aprofundamento em Química', codigo: 'AQU', ordem: 21 },
  { id: 'disc-22', nome: 'Aprofundamento em Física', codigo: 'AFI', ordem: 22 },
  { id: 'disc-23', nome: 'Aprofundamento em Geografia', codigo: 'AGE', ordem: 23 },
];

export const mockDisciplinas = initialDisciplinas;

// 3. USERS (Super Admin, Coordenadores, Professores)
export const initialUsers: User[] = [
  {
    id: 'user-admin',
    nome: 'Ricardo Alves de Souza',
    email: 'ricardo.souza@eaportal.org',
    role: 'SUPER_ADMIN',
  },
  {
    id: 'user-coord',
    nome: 'Mariana Silveira',
    email: 'mariana.silveira@eaportal.org',
    role: 'COORDENADOR',
  },
  {
    id: 'user-prof-carlos',
    nome: 'Prof. Carlos Silva',
    email: 'carlos.silva@eaportal.org',
    role: 'PROFESSOR',
  },
  {
    id: 'user-prof-ana',
    nome: 'Profª. Ana Paula Oliveira',
    email: 'ana.oliveira@eaportal.org',
    role: 'PROFESSOR',
  },
  {
    id: 'user-prof-marcos',
    nome: 'Prof. Marcos Vinicius',
    email: 'marcos.vinicius@eaportal.org',
    role: 'PROFESSOR',
  },
  {
    id: 'user-prof-juliana',
    nome: 'Profª. Juliana Costa',
    email: 'juliana.costa@eaportal.org',
    role: 'PROFESSOR',
  },
];

// 4. ATRIBUIÇÕES (Professor -> Disciplinas + Turmas)
export const initialAtribuicoes: Atribuicao[] = [
  {
    id: 'atrib-1',
    professorId: 'user-prof-carlos',
    professorNome: 'Prof. Carlos Silva',
    disciplinaIds: ['disc-1', 'disc-16'], // Língua Portuguesa, Argumentação
    turmaIds: ['turma-4a-m', 'turma-4b-m', 'turma-6a-m', 'turma-em1a'],
  },
  {
    id: 'atrib-2',
    professorId: 'user-prof-ana',
    professorNome: 'Profª. Ana Paula Oliveira',
    disciplinaIds: ['disc-3', 'disc-17'], // Matemática, Investigação Matemática
    turmaIds: ['turma-4a-m', 'turma-4b-m', 'turma-6a-m', 'turma-em1a'],
  },
  {
    id: 'atrib-3',
    professorId: 'user-prof-marcos',
    professorNome: 'Prof. Marcos Vinicius',
    disciplinaIds: ['disc-8', 'disc-9'], // Ciências, Biologia
    turmaIds: ['turma-4a-m', 'turma-6a-m', 'turma-em1a'],
  },
  {
    id: 'atrib-4',
    professorId: 'user-prof-juliana',
    professorNome: 'Profª. Juliana Costa',
    disciplinaIds: ['disc-6', 'disc-7'], // História, Geografia
    turmaIds: ['turma-4a-m', 'turma-6a-m'],
  },
];

// 5. SYSTEM SETTINGS
export const initialSystemSettings: SystemSettings = {
  bimestreAtual: 3,
  statusEdicao: 'LIBERADO',
};

// 6. INITIAL EVALUATION INSTRUMENTS
export const initialInstrumentos: InstrumentoAvaliativo[] = [
  {
    id: 'inst-1',
    numero: 1,
    codigoIdentificador: 'AV1',
    tipoNome: 'PESQUISA',
    data: '26/08/2026',
    peso: 6.0,
    turmaId: 'turma-4a-m',
    turmaNome: '4º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-4a-m', turmaNome: '4º Ano A - Manhã', data: '26/08/2026' },
      { turmaId: 'turma-4b-m', turmaNome: '4º Ano B - Manhã', data: '28/08/2026' },
    ],
    disciplinaId: 'disc-8',
    disciplinaNome: 'Ciências',
    professorId: 'user-prof-marcos',
    professorNome: 'Prof. Marcos Vinicius',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Capítulo 7 – Quero ver de perto.',
    fonteEstudo: 'Capítulo 7 – Quero ver de perto',
    desenvolvimento: `Em sala de aula, os alunos realizarão um experimento em grupo com fermento biológico, açúcar, água morna e um balão para observar a ação dos fungos da página 73 da apostila de ciências.
Durante a atividade, acompanharão as mudanças ocorridas na mistura e identificarão a produção de gás que faz o balão inflar.
Ao final, registrarão suas observações no caderno e concluirão que os fungos são seres vivos, pois realizam processos vitais, como a alimentação e a respiração.`,
    criterios: [
      { id: 'c1', descricao: 'Participação e envolvimento na realização do experimento', valor: 1.5 },
      { id: 'c2', descricao: 'Observação e registro das mudanças ocorridas durante a atividade', valor: 1.5 },
      { id: 'c3', descricao: 'Compreensão do papel do fermento como ser vivo, demonstrada nas respostas e discussões', valor: 1.5 },
      { id: 'c4', descricao: 'Organização, capricho e conclusão da atividade escrita', valor: 1.5 },
    ],
    habilidades: [
      {
        id: 'hab-1',
        codigo: 'EF04CI06',
        descricao: 'Relacionar a participação de fungos e bactérias no processo de decomposição e produção de alimentos, combustíveis, medicamentos, entre outros.',
      },
      {
        id: 'hab-2',
        codigo: 'EF04CI07',
        descricao: 'Verificar a participação de microrganismos na produção de alimentos, combustíveis e processos de transformação da matéria.',
      },
    ],
    status: 'APROVADO',
    dataCriacao: '15/08/2026',
    dataEnvio: '18/08/2026',
    dataAprovacao: '20/08/2026',
    coordenadorId: 'user-coord',
    coordenadorNome: 'Mariana Silveira',
    historico: [
      { status: 'RASCUNHO', data: '15/08/2026 09:00', usuarioNome: 'Prof. Marcos Vinicius', usuarioRole: 'PROFESSOR' },
      { status: 'ENVIADO', data: '18/08/2026 14:15', usuarioNome: 'Prof. Marcos Vinicius', usuarioRole: 'PROFESSOR' },
      { status: 'APROVADO', data: '20/08/2026 11:30', usuarioNome: 'Mariana Silveira', usuarioRole: 'COORDENADOR' },
    ],
  },
  {
    id: 'inst-2',
    numero: 2,
    codigoIdentificador: 'AV2',
    tipoNome: 'PROVA ESCRITA',
    data: '15/09/2026',
    peso: 10.0,
    turmaId: 'turma-4a-m',
    turmaNome: '4º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-4a-m', turmaNome: '4º Ano A - Manhã', data: '15/09/2026' },
    ],
    disciplinaId: 'disc-8',
    disciplinaNome: 'Ciências',
    professorId: 'user-prof-marcos',
    professorNome: 'Prof. Marcos Vinicius',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Capítulo 7 – Fungos, bactérias e ecossistemas. Capítulo 8 – Cadeias alimentares e decompositores.',
    fonteEstudo: 'Livro didático de Ciências, páginas 70 a 92; anotações e resumos do caderno.',
    desenvolvimento: `Avaliação individual escrita e sem consulta prévia, composta por questões dissertativas e de múltipla escolha.
A prova abordará a classificação dos microrganismos, a importância ecológica da decomposição e os cuidados de higiene para conservação de alimentos.
Os alunos devem demonstrar leitura atenta dos enunciados e argumentação clara nas respostas dissertativas.`,
    criterios: [
      { id: 'c5', descricao: 'Identificação correta dos grupos de microrganismos e suas características', valor: 3.0 },
      { id: 'c6', descricao: 'Explicação fundamentada sobre o ciclo da matéria e decomposição', valor: 3.0 },
      { id: 'c7', descricao: 'Resolução adequada das questões de aplicação prática e contextualizadas', valor: 2.5 },
      { id: 'c8', descricao: 'Coerência textual, clareza e ortografia nas respostas abertas', valor: 1.5 },
    ],
    habilidades: [
      {
        id: 'hab-3',
        codigo: 'EF04CI08',
        descricao: 'Propor, a partir do conhecimento das formas de transmissão de alguns microrganismos, atitudes e medidas adequadas para a prevenção de doenças a eles associadas.',
      },
    ],
    status: 'ENVIADO',
    dataCriacao: '20/08/2026',
    dataEnvio: '22/08/2026',
    historico: [
      { status: 'RASCUNHO', data: '20/08/2026 10:20', usuarioNome: 'Prof. Marcos Vinicius', usuarioRole: 'PROFESSOR' },
      { status: 'ENVIADO', data: '22/08/2026 16:40', usuarioNome: 'Prof. Marcos Vinicius', usuarioRole: 'PROFESSOR' },
    ],
  },
  {
    id: 'inst-3',
    numero: 1,
    codigoIdentificador: 'AV1',
    tipoNome: 'PRODUÇÃO DE TEXTO',
    data: '08/09/2026',
    peso: 10.0,
    turmaId: 'turma-4a-m',
    turmaNome: '4º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-4a-m', turmaNome: '4º Ano A - Manhã', data: '08/09/2026' },
      { turmaId: 'turma-4b-m', turmaNome: '4º Ano B - Manhã', data: '09/09/2026' },
    ],
    disciplinaId: 'disc-1',
    disciplinaNome: 'Língua Portuguesa',
    professorId: 'user-prof-carlos',
    professorNome: 'Prof. Carlos Silva',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Gênero Textual: Crônica e Narrativa de Aventura. Uso de pontuação e paragrafação.',
    fonteEstudo: 'Apostila bimestral de Língua Portuguesa páginas 50 a 65.',
    desenvolvimento: `Produção textual individual em sala de aula baseada em tema surpresa apresentado no quadro. Os alunos deverão estruturar introdução, conflito, clímax e desfecho, utilizando vocabulário adequado e regras ortográficas vigentes.`,
    criterios: [
      { id: 'c-por-1', descricao: 'Adequação ao gênero proposto e pertinência temática', valor: 3.0 },
      { id: 'c-por-2', descricao: 'Estruturação de parágrafos, coesão e coerência', valor: 3.0 },
      { id: 'c-por-3', descricao: 'Ortografia, acentuação e pontuação correta', valor: 2.5 },
      { id: 'c-por-4', descricao: 'Legibilidade e capricho na entrega final', valor: 1.5 },
    ],
    habilidades: [
      {
        id: 'hab-por-1',
        codigo: 'EF04LP05',
        descricao: 'Identificar a função na leitura e usar na escrita ponto final, ponto de interrogação, ponto de exclamação, dois-pontos e travessão em diálogos.',
      },
    ],
    status: 'APROVADO',
    dataCriacao: '12/08/2026',
    dataEnvio: '16/08/2026',
    dataAprovacao: '19/08/2026',
    coordenadorId: 'user-coord',
    coordenadorNome: 'Mariana Silveira',
    historico: [
      { status: 'RASCUNHO', data: '12/08/2026 14:00', usuarioNome: 'Prof. Carlos Silva', usuarioRole: 'PROFESSOR' },
      { status: 'ENVIADO', data: '16/08/2026 17:30', usuarioNome: 'Prof. Carlos Silva', usuarioRole: 'PROFESSOR' },
      { status: 'APROVADO', data: '19/08/2026 10:00', usuarioNome: 'Mariana Silveira', usuarioRole: 'COORDENADOR' },
    ],
  },
  {
    id: 'inst-3b',
    numero: 2,
    codigoIdentificador: 'AV2',
    tipoNome: 'AVALIAÇÃO DE GRAMÁTICA',
    data: '22/09/2026',
    peso: 8.0,
    turmaId: 'turma-4a-m',
    turmaNome: '4º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-4a-m', turmaNome: '4º Ano A - Manhã', data: '22/09/2026' },
    ],
    disciplinaId: 'disc-1',
    disciplinaNome: 'Língua Portuguesa',
    professorId: 'user-prof-carlos',
    professorNome: 'Prof. Carlos Silva',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Classes gramaticais: Substantivos, Adjetivos e Verbos regulares.',
    fonteEstudo: 'Livro didático páginas 70 a 88.',
    desenvolvimento: 'Avaliação escrita individual sobre identificação e flexão de substantivos e adjetivos no texto.',
    criterios: [
      { id: 'c-por-5', descricao: 'Identificação correta de substantivos próprios e comuns', valor: 4.0 },
      { id: 'c-por-6', descricao: 'Emprego correto de adjetivos e concordância nominal', valor: 4.0 },
    ],
    habilidades: [],
    status: 'ENVIADO',
    dataCriacao: '23/08/2026',
    dataEnvio: '24/08/2026',
    historico: [
      { status: 'RASCUNHO', data: '23/08/2026 08:30', usuarioNome: 'Prof. Carlos Silva', usuarioRole: 'PROFESSOR' },
      { status: 'ENVIADO', data: '24/08/2026 15:10', usuarioNome: 'Prof. Carlos Silva', usuarioRole: 'PROFESSOR' },
    ],
  },
  {
    id: 'inst-3c',
    numero: 1,
    codigoIdentificador: 'AV1',
    tipoNome: 'SEMINÁRIO DE ARGUMENTAÇÃO',
    data: '29/09/2026',
    peso: 6.0,
    turmaId: 'turma-4a-m',
    turmaNome: '4º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-4a-m', turmaNome: '4º Ano A - Manhã', data: '29/09/2026' },
    ],
    disciplinaId: 'disc-16',
    disciplinaNome: 'Argumentação',
    professorId: 'user-prof-carlos',
    professorNome: 'Prof. Carlos Silva',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Técnicas de oratória e sustentação de teses sobre sustentabilidade.',
    fonteEstudo: 'Artigos de divulgação científica e vídeos de debates.',
    desenvolvimento: 'Apresentação oral em equipes de 3 alunos debatendo temas de sustentabilidade e consumo consciente.',
    criterios: [
      { id: 'c-arg-1', descricao: 'Clareza na exposição das teses e argumentos', valor: 3.0 },
      { id: 'c-arg-2', descricao: 'Postura, respeito ao tempo e réplica colaborativa', valor: 3.0 },
    ],
    habilidades: [],
    status: 'RASCUNHO',
    dataCriacao: '25/08/2026',
    historico: [
      { status: 'RASCUNHO', data: '25/08/2026 11:00', usuarioNome: 'Prof. Carlos Silva', usuarioRole: 'PROFESSOR' },
    ],
  },
  {
    id: 'inst-4',
    numero: 1,
    codigoIdentificador: 'AV1',
    tipoNome: 'PESQUISA',
    data: '10/09/2026',
    peso: 6.0,
    turmaId: 'turma-6a-m',
    turmaNome: '6º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-6a-m', turmaNome: '6º Ano A - Manhã', data: '10/09/2026' },
    ],
    disciplinaId: 'disc-6',
    disciplinaNome: 'História',
    professorId: 'user-prof-juliana',
    professorNome: 'Profª. Juliana Costa',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Unidade 3 – Civilizações da Antiguidade Oriental: Egito Antigo e Mesopotâmia.',
    fonteEstudo: 'Apostila bimestral de História (páginas 45 a 68) e atlas histórico digital.',
    desenvolvimento: `Pesquisa temática em duplas sobre o modo de vida e organização das civilizações do Crescente Fértil.
O trabalho deve contemplar os seguintes eixos investigativos:
• Localização geográfica e rios; • Organização social e poder político; • Costumes e tradições religiosas;
• Alimentação e agricultura de regadio; • Construções e realizações arquitetônicas; • Curiosidades históricas.
Os alunos deverão redigir uma síntese ilustrada com mapas conceituais e referências bibliográficas consultadas.`,
    criterios: [
      { id: 'c9', descricao: 'Entrega da pesquisa com todos os eixos solicitados contemplados', valor: 2.0 },
      { id: 'c10', descricao: 'Organização estrutural, clareza e uso correto de termos históricos', valor: 1.5 },
      { id: 'c11', descricao: 'Participação colaborativa e divisão equilibrada de tarefas na dupla', valor: 1.5 },
      { id: 'c12', descricao: 'Criatividade na elaboração dos mapas conceituais e ilustrações', valor: 1.0 },
    ],
    habilidades: [
      {
        id: 'hab-4',
        codigo: 'EF06HI07',
        descricao: 'Identificar aspectos e formas de registro das sociedades antigas na África e no Oriente Médio, compreendendo as noções de espaço e tempo.',
      },
      {
        id: 'hab-5',
        codigo: 'EF06HI08',
        descricao: 'Analisar a importância dos rios (Nilo, Tigre e Eufrates) para o desenvolvimento das sociedades agrárias no Crescente Fértil.',
      },
    ],
    status: 'REJEITADO',
    dataCriacao: '16/08/2026',
    dataEnvio: '20/08/2026',
    dataRejeicao: '24/08/2026',
    coordenadorId: 'user-coord',
    coordenadorNome: 'Mariana Silveira',
    motivoRejeicao: 'Por favor, detalhar melhor os critérios de pontuação (c11 e c12) e especificar se a pesquisa será feita em duplas fixas ou individuais com apoio em sala.',
    historico: [
      { status: 'RASCUNHO', data: '16/08/2026 10:00', usuarioNome: 'Profª. Juliana Costa', usuarioRole: 'PROFESSOR' },
      { status: 'ENVIADO', data: '20/08/2026 16:30', usuarioNome: 'Profª. Juliana Costa', usuarioRole: 'PROFESSOR' },
      { status: 'REJEITADO', data: '24/08/2026 09:45', usuarioNome: 'Mariana Silveira', usuarioRole: 'COORDENADOR', motivo: 'Por favor, detalhar melhor os critérios de pontuação (c11 e c12) e especificar se a pesquisa será feita em duplas fixas ou individuais com apoio em sala.' },
    ],
  },
  {
    id: 'inst-5',
    numero: 2,
    codigoIdentificador: 'AV2',
    tipoNome: 'CARTAZ E APRESENTAÇÃO',
    data: '24/09/2026',
    peso: 4.0,
    turmaId: 'turma-6a-m',
    turmaNome: '6º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-6a-m', turmaNome: '6º Ano A - Manhã', data: '24/09/2026' },
    ],
    disciplinaId: 'disc-6',
    disciplinaNome: 'História',
    professorId: 'user-prof-juliana',
    professorNome: 'Profª. Juliana Costa',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'A escrita cuneiforme e os hieróglifos egípcios.',
    fonteEstudo: 'Caderno do estudante e material complementar de apoio pedagógico.',
    desenvolvimento: `Confecção de um cartaz expositivo em cartolina apresentando a evolução da escrita e a codificação das leis na Mesopotâmia (Código de Hamurabi).
Os grupos apresentarão seus cartazes em seminário oral de 5 minutos, explicando o significado dos símbolos para a preservação da memória histórica.`,
    criterios: [
      { id: 'c13', descricao: 'Domínio do conteúdo e clareza na exposição oral', valor: 2.0 },
      { id: 'c14', descricao: 'Qualidade visual, acabamento e pertinência das imagens no cartaz', valor: 1.0 },
      { id: 'c15', descricao: 'Cumprimento do tempo estipulado e pontualidade na entrega', valor: 1.0 },
    ],
    habilidades: [],
    status: 'RASCUNHO',
    dataCriacao: '25/08/2026',
    historico: [
      { status: 'RASCUNHO', data: '25/08/2026 15:20', usuarioNome: 'Profª. Juliana Costa', usuarioRole: 'PROFESSOR' },
    ],
  },
  {
    id: 'inst-6',
    numero: 1,
    codigoIdentificador: 'AV1',
    tipoNome: 'AVALIAÇÃO BIMESTRAL',
    data: '11/09/2026',
    peso: 10.0,
    turmaId: 'turma-6a-m',
    turmaNome: '6º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-6a-m', turmaNome: '6º Ano A - Manhã', data: '11/09/2026' },
      { turmaId: 'turma-6b-m', turmaNome: '6º Ano B - Manhã', data: '12/09/2026' },
    ],
    disciplinaId: 'disc-3',
    disciplinaNome: 'Matemática',
    professorId: 'user-prof-ana',
    professorNome: 'Profª. Ana Paula Oliveira',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Operações com Frações e Números Decimais.',
    fonteEstudo: 'Apostila bimestral páginas 30 a 60.',
    desenvolvimento: 'Avaliação individual sem consulta de resolução de problemas envolvendo frações equivalentes e operações decimais.',
    criterios: [
      { id: 'c-mat-1', descricao: 'Cálculo correto de frações e equivalência', valor: 5.0 },
      { id: 'c-mat-2', descricao: 'Interpretação e resolução de situações-problema', valor: 5.0 },
    ],
    habilidades: [],
    status: 'APROVADO',
    dataCriacao: '10/08/2026',
    dataEnvio: '14/08/2026',
    dataAprovacao: '17/08/2026',
    coordenadorId: 'user-coord',
    coordenadorNome: 'Mariana Silveira',
    historico: [
      { status: 'RASCUNHO', data: '10/08/2026 09:00', usuarioNome: 'Profª. Ana Paula Oliveira', usuarioRole: 'PROFESSOR' },
      { status: 'ENVIADO', data: '14/08/2026 14:00', usuarioNome: 'Profª. Ana Paula Oliveira', usuarioRole: 'PROFESSOR' },
      { status: 'APROVADO', data: '17/08/2026 10:30', usuarioNome: 'Mariana Silveira', usuarioRole: 'COORDENADOR' },
    ],
  },
  {
    id: 'inst-7',
    numero: 2,
    codigoIdentificador: 'AV2',
    tipoNome: 'TRABALHO DE GEOMETRIA',
    data: '18/09/2026',
    peso: 6.0,
    turmaId: 'turma-6a-m',
    turmaNome: '6º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-6a-m', turmaNome: '6º Ano A - Manhã', data: '18/09/2026' },
    ],
    disciplinaId: 'disc-3',
    disciplinaNome: 'Matemática',
    professorId: 'user-prof-ana',
    professorNome: 'Profª. Ana Paula Oliveira',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Construção de polígonos e cálculo de áreas e perímetros.',
    fonteEstudo: 'Material de desenho geométrico e apostila páginas 62 a 75.',
    desenvolvimento: 'Trabalho prático com régua e transferidor para desenhar polígonos regulares e calcular suas respectivas áreas.',
    criterios: [
      { id: 'c-mat-3', descricao: 'Precisão nos traçados geométricos', valor: 3.0 },
      { id: 'c-mat-4', descricao: 'Cálculo exato de áreas e perímetros', valor: 3.0 },
    ],
    habilidades: [],
    status: 'ENVIADO',
    dataCriacao: '21/08/2026',
    dataEnvio: '23/08/2026',
    historico: [
      { status: 'RASCUNHO', data: '21/08/2026 11:15', usuarioNome: 'Profª. Ana Paula Oliveira', usuarioRole: 'PROFESSOR' },
      { status: 'ENVIADO', data: '23/08/2026 16:00', usuarioNome: 'Profª. Ana Paula Oliveira', usuarioRole: 'PROFESSOR' },
    ],
  },
  {
    id: 'inst-8',
    numero: 3,
    codigoIdentificador: 'AV3',
    tipoNome: 'LISTA AVALIATIVA',
    data: '25/09/2026',
    peso: 4.0,
    turmaId: 'turma-6a-m',
    turmaNome: '6º Ano A - Manhã',
    turmas: [
      { turmaId: 'turma-6a-m', turmaNome: '6º Ano A - Manhã', data: '25/09/2026' },
    ],
    disciplinaId: 'disc-3',
    disciplinaNome: 'Matemática',
    professorId: 'user-prof-ana',
    professorNome: 'Profª. Ana Paula Oliveira',
    bimestre: 3,
    anoLetivo: currentYear,
    conteudo: 'Exercícios de fixação e desafios lógicos.',
    fonteEstudo: 'Caderno de atividades.',
    desenvolvimento: 'Resolução de lista com 10 questões desafiadoras em sala de aula.',
    criterios: [
      { id: 'c-mat-5', descricao: 'Entrega completa dos exercícios resolvidos com memória de cálculo', valor: 4.0 },
    ],
    habilidades: [],
    status: 'RASCUNHO',
    dataCriacao: '25/08/2026',
    historico: [
      { status: 'RASCUNHO', data: '25/08/2026 14:00', usuarioNome: 'Profª. Ana Paula Oliveira', usuarioRole: 'PROFESSOR' },
    ],
  },
];
