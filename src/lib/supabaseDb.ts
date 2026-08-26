import { getSupabase, isSupabaseConfigured, createIsolatedAuthClient } from './supabase';
import {
  Turma,
  Disciplina,
  InstrumentoAvaliativo,
  User,
  Atribuicao,
  SystemSettings,
} from '../types';
import {
  initialTurmas,
  initialDisciplinas,
  initialUsers,
  initialAtribuicoes,
  initialSystemSettings,
  initialInstrumentos,
} from '../data/mockData';

export interface RemoteDataResult {
  isSupabaseActive: boolean;
  users: User[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  atribuicoes: Atribuicao[];
  systemSettings: SystemSettings;
  instrumentos: InstrumentoAvaliativo[];
}

export interface DbResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Carrega todos os dados do banco Supabase de forma íntegra.
 */
export async function loadAllDataFromSupabase(): Promise<RemoteDataResult | null> {
  const client = getSupabase();
  if (!client || !isSupabaseConfigured()) {
    return null;
  }

  try {
    // 1. Carregar Perfis / Usuários
    const { data: profilesData, error: profilesError } = await client
      .from('profiles')
      .select('*')
      .order('nome', { ascending: true });

    let loadedUsers: User[] = [];
    if (!profilesError && profilesData && profilesData.length > 0) {
      loadedUsers = profilesData.map((p) => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        role: p.role,
        avatar: p.avatar,
        ativo: p.ativo !== false,
      }));
    } else if (profilesError) {
      console.error('Erro ao consultar tabela profiles no Supabase:', profilesError.message);
    }

    // 2. Carregar Turmas
    const { data: turmasData, error: turmasError } = await client
      .from('turmas')
      .select('*')
      .order('nome', { ascending: true });

    let loadedTurmas: Turma[] = [];
    if (!turmasError && turmasData && turmasData.length > 0) {
      loadedTurmas = turmasData.map((t) => ({
        id: t.id,
        nome: t.nome,
        serie: t.serie,
        nivel: t.nivel,
        turno: t.turno,
        anoLetivo: t.ano_letivo,
      }));
    } else if (turmasError) {
      console.error('Erro ao consultar tabela turmas no Supabase:', turmasError.message);
    }

    // 3. Carregar Disciplinas
    const { data: discData, error: discError } = await client
      .from('disciplinas')
      .select('*')
      .order('ordem', { ascending: true });

    let loadedDisciplinas: Disciplina[] = [];
    if (!discError && discData && discData.length > 0) {
      loadedDisciplinas = discData.map((d) => ({
        id: d.id,
        nome: d.nome,
        codigo: d.codigo,
        ordem: d.ordem,
        cor: d.cor,
      }));
    } else if (discError) {
      console.error('Erro ao consultar tabela disciplinas no Supabase:', discError.message);
    }

    // 4. Carregar Atribuições
    const { data: atribData, error: atribError } = await client
      .from('atribuicoes')
      .select('*');

    let loadedAtribuicoes: Atribuicao[] = [];
    if (!atribError && atribData && atribData.length > 0) {
      loadedAtribuicoes = atribData.map((a) => ({
        id: a.id,
        professorId: a.professor_id,
        professorNome: a.professor_nome,
        disciplinaIds: Array.isArray(a.disciplina_ids) ? a.disciplina_ids : [],
        turmaIds: Array.isArray(a.turma_ids) ? a.turma_ids : [],
      }));
    } else if (atribError) {
      console.error('Erro ao consultar tabela atribuicoes no Supabase:', atribError.message);
    }

    // 5. Carregar Configurações
    const { data: settData, error: settError } = await client
      .from('system_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    let loadedSettings: SystemSettings = initialSystemSettings;
    if (!settError && settData) {
      loadedSettings = {
        bimestreAtual: settData.bimestre_atual,
        statusEdicao: settData.status_edicao,
      };
    }

    // 6. Carregar Instrumentos Avaliativos
    const { data: instData, error: instError } = await client
      .from('instrumentos')
      .select('*')
      .order('numero', { ascending: true });

    let loadedInstrumentos: InstrumentoAvaliativo[] = [];
    if (!instError && instData && instData.length > 0) {
      loadedInstrumentos = instData.map((i) => ({
        id: i.id,
        numero: i.numero,
        codigoIdentificador: i.codigo_identificador,
        tipoNome: i.tipo_nome,
        etapa: i.etapa,
        data: i.data,
        peso: Number(i.peso),
        turmaId: i.turma_id,
        turmaNome: i.turma_nome,
        turmas: Array.isArray(i.turmas) ? i.turmas : [],
        disciplinaId: i.disciplina_id,
        disciplinaNome: i.disciplina_nome,
        professorId: i.professor_id,
        professorNome: i.professor_nome,
        bimestre: i.bimestre,
        anoLetivo: i.ano_letivo,
        conteudo: i.conteudo || '',
        fonteEstudo: i.fonte_estudo || '',
        desenvolvimento: i.desenvolvimento || '',
        criterios: Array.isArray(i.criterios) ? i.criterios : [],
        habilidades: Array.isArray(i.habilidades) ? i.habilidades : [],
        status: i.status,
        dataCriacao: i.data_criacao,
        dataEnvio: i.data_envio,
        dataAprovacao: i.data_aprovacao,
        dataRejeicao: i.data_rejeicao,
        coordenadorId: i.coordenador_id,
        coordenadorNome: i.coordenador_nome,
        motivoRejeicao: i.motivo_rejeicao,
        historico: Array.isArray(i.historico) ? i.historico : [],
      }));
    } else if (instError) {
      console.error('Erro ao consultar tabela instrumentos no Supabase:', instError.message);
    }

    // Se o banco estiver virgem (sem turmas), executamos seed estruturado
    if (loadedTurmas.length === 0 && !turmasError) {
      await seedInitialDataToSupabase();
      return {
        isSupabaseActive: true,
        users: loadedUsers.length > 0 ? loadedUsers : initialUsers,
        turmas: initialTurmas,
        disciplinas: initialDisciplinas,
        atribuicoes: initialAtribuicoes,
        systemSettings: initialSystemSettings,
        instrumentos: initialInstrumentos,
      };
    }

    return {
      isSupabaseActive: true,
      users: loadedUsers.length > 0 ? loadedUsers : initialUsers,
      turmas: loadedTurmas,
      disciplinas: loadedDisciplinas,
      atribuicoes: loadedAtribuicoes,
      systemSettings: loadedSettings,
      instrumentos: loadedInstrumentos,
    };
  } catch (err) {
    console.error('Erro crítico ao buscar dados do Supabase:', err);
    return null;
  }
}

/**
 * Seeding automático dos dados mestres caso o banco esteja vazio
 */
export async function seedInitialDataToSupabase(): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  try {
    // Inserir Turmas
    const turmasPayload = initialTurmas.map((t) => ({
      id: t.id,
      nome: t.nome,
      serie: t.serie,
      nivel: t.nivel,
      turno: t.turno,
      ano_letivo: t.anoLetivo,
    }));
    await client.from('turmas').upsert(turmasPayload, { onConflict: 'id' });

    // Inserir Disciplinas
    const discPayload = initialDisciplinas.map((d) => ({
      id: d.id,
      nome: d.nome,
      codigo: d.codigo,
      ordem: d.ordem,
      cor: d.cor,
    }));
    await client.from('disciplinas').upsert(discPayload, { onConflict: 'id' });

    // Inserir Atribuições
    const atribPayload = initialAtribuicoes.map((a) => ({
      id: a.id,
      professor_id: a.professorId,
      professor_nome: a.professorNome,
      disciplina_ids: a.disciplinaIds,
      turma_ids: a.turmaIds,
    }));
    await client.from('atribuicoes').upsert(atribPayload, { onConflict: 'id' });

    // Inserir Configurações
    await client.from('system_settings').upsert({
      id: 'global',
      bimestre_atual: initialSystemSettings.bimestreAtual,
      status_edicao: initialSystemSettings.statusEdicao,
    });
  } catch (e) {
    console.warn('Seed no Supabase:', e);
  }
}

// ---------------------------------------------------------------------------
// OPERAÇÕES DE USUÁRIO COM SUPABASE AUTH & PROFILES
// ---------------------------------------------------------------------------

/**
 * Cria credencial real no Supabase Auth (usando cliente isolado sem afetar a sessão atual)
 * e persiste o registro correspondente na tabela 'profiles'.
 */
export async function dbCreateUserWithAuth(
  userData: Omit<User, 'id'>,
  password?: string
): Promise<DbResult<User>> {
  const client = getSupabase();
  const isolatedClient = createIsolatedAuthClient();

  if (!client || !isolatedClient) {
    return { success: false, error: 'Conexão com o Supabase não inicializada.' };
  }

  const cleanEmail = userData.email.trim().toLowerCase();
  const pass = password && password.trim().length >= 6 ? password.trim() : 'instrumentos2026';

  try {
    // 1. Criar usuário no Supabase Authentication
    const { data: authData, error: authError } = await isolatedClient.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: {
          nome: userData.nome.trim(),
          role: userData.role,
        },
      },
    });

    let userId = authData?.user?.id;

    if (authError) {
      // Se o e-mail já estiver cadastrado no Auth, verificamos se existe no Auth para sincronizar
      if (authError.message.toLowerCase().includes('already registered')) {
        const { data: signInData, error: signInErr } = await isolatedClient.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (signInData?.user?.id) {
          userId = signInData.user.id;
        } else {
          return {
            success: false,
            error: 'Este e-mail já possui cadastro no Supabase. Caso necessário, utilize a redefinição de senha.',
          };
        }
      } else {
        console.error('Erro no Supabase Auth signUp:', authError);
        return {
          success: false,
          error: authError.message || 'Erro ao registrar credenciais no Supabase Authentication.',
        };
      }
    }

    if (!userId) {
      return {
        success: false,
        error: 'Não foi possível obter o identificador único (UUID) do Supabase Auth.',
      };
    }

    // 2. Persistir perfil correspondente na tabela 'profiles'
    const profilePayload = {
      id: userId,
      nome: userData.nome.trim(),
      email: cleanEmail,
      role: userData.role,
      avatar: userData.avatar || null,
      ativo: userData.ativo !== false,
      updated_at: new Date().toISOString(),
    };

    const { data: pData, error: pError } = await client
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select()
      .single();

    if (pError) {
      console.error('Erro ao salvar tabela profiles:', pError);
      return {
        success: false,
        error: `Erro ao salvar perfil no banco de dados: ${pError.message}`,
      };
    }

    const createdUser: User = {
      id: pData.id,
      nome: pData.nome,
      email: pData.email,
      role: pData.role,
      avatar: pData.avatar,
      ativo: pData.ativo !== false,
    };

    return {
      success: true,
      data: createdUser,
    };
  } catch (err: any) {
    console.error('dbCreateUserWithAuth catch:', err);
    return {
      success: false,
      error: err.message || 'Falha ao criar usuário no Supabase.',
    };
  }
}

export async function dbSaveUserProfile(user: User): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client.from('profiles').upsert({
      id: user.id,
      nome: user.nome,
      email: user.email.toLowerCase(),
      role: user.role,
      avatar: user.avatar || null,
      ativo: user.ativo !== false,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Erro dbSaveUserProfile:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dbDeleteUserProfile(id: string): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    // 1. Deletar atribuições do professor
    await client.from('atribuicoes').delete().eq('professor_id', id);

    // 2. Deletar perfil
    const { error } = await client.from('profiles').delete().eq('id', id);
    if (error) {
      console.error('Erro dbDeleteUserProfile:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dbToggleUserActive(id: string, ativo: boolean): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client
      .from('profiles')
      .update({
        ativo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Erro dbToggleUserActive:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// OPERAÇÕES CRUD DE DISCIPLINAS
// ---------------------------------------------------------------------------

export async function dbSaveDisciplina(disciplina: Disciplina): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client.from('disciplinas').upsert({
      id: disciplina.id,
      nome: disciplina.nome,
      codigo: disciplina.codigo,
      ordem: disciplina.ordem,
      cor: disciplina.cor,
    });

    if (error) {
      console.error('Erro dbSaveDisciplina:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dbDeleteDisciplina(id: string): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    // 1. Tratar dependências em atribuições (remover o id do array)
    const { data: atribs } = await client.from('atribuicoes').select('id, disciplina_ids');
    if (atribs) {
      for (const a of atribs) {
        if (Array.isArray(a.disciplina_ids) && a.disciplina_ids.includes(id)) {
          const updated = a.disciplina_ids.filter((did: string) => did !== id);
          await client.from('atribuicoes').update({ disciplina_ids: updated }).eq('id', a.id);
        }
      }
    }

    // 2. Executar delete real
    const { error } = await client.from('disciplinas').delete().eq('id', id);
    if (error) {
      console.error('Erro dbDeleteDisciplina:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// OPERAÇÕES CRUD DE TURMAS
// ---------------------------------------------------------------------------

export async function dbSaveTurma(turma: Turma): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client.from('turmas').upsert({
      id: turma.id,
      nome: turma.nome,
      serie: turma.serie,
      nivel: turma.nivel,
      turno: turma.turno,
      ano_letivo: turma.anoLetivo,
    });

    if (error) {
      console.error('Erro dbSaveTurma:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dbDeleteTurma(id: string): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    // 1. Tratar dependências em atribuições (remover o id do array)
    const { data: atribs } = await client.from('atribuicoes').select('id, turma_ids');
    if (atribs) {
      for (const a of atribs) {
        if (Array.isArray(a.turma_ids) && a.turma_ids.includes(id)) {
          const updated = a.turma_ids.filter((tid: string) => tid !== id);
          await client.from('atribuicoes').update({ turma_ids: updated }).eq('id', a.id);
        }
      }
    }

    // 2. Executar delete real
    const { error } = await client.from('turmas').delete().eq('id', id);
    if (error) {
      console.error('Erro dbDeleteTurma:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// OPERAÇÕES CRUD DE INSTRUMENTOS AVALIATIVOS
// ---------------------------------------------------------------------------

export async function dbSaveInstrumento(inst: InstrumentoAvaliativo): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client.from('instrumentos').upsert({
      id: inst.id,
      numero: inst.numero,
      codigo_identificador: inst.codigoIdentificador,
      tipo_nome: inst.tipoNome,
      etapa: inst.etapa,
      data: inst.data,
      peso: inst.peso,
      turma_id: inst.turmaId,
      turma_nome: inst.turmaNome,
      turmas: inst.turmas || [],
      disciplina_id: inst.disciplinaId,
      disciplina_nome: inst.disciplinaNome,
      professor_id: inst.professorId,
      professor_nome: inst.professorNome,
      bimestre: inst.bimestre,
      ano_letivo: inst.anoLetivo,
      conteudo: inst.conteudo,
      fonte_estudo: inst.fonteEstudo,
      desenvolvimento: inst.desenvolvimento,
      criterios: inst.criterios,
      habilidades: inst.habilidades || [],
      status: inst.status,
      data_criacao: inst.dataCriacao,
      data_envio: inst.dataEnvio,
      data_aprovacao: inst.dataAprovacao,
      data_rejeicao: inst.dataRejeicao,
      coordenador_id: inst.coordenadorId,
      coordenador_nome: inst.coordenadorNome,
      motivo_rejeicao: inst.motivoRejeicao,
      historico: inst.historico || [],
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Erro dbSaveInstrumento:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dbDeleteInstrumento(id: string): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client.from('instrumentos').delete().eq('id', id);
    if (error) {
      console.error('Erro dbDeleteInstrumento:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// OPERAÇÕES DE ATRIBUIÇÕES E CONFIGURAÇÕES
// ---------------------------------------------------------------------------

export async function dbSaveAtribuicao(atribuicao: Atribuicao): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client.from('atribuicoes').upsert({
      id: atribuicao.id,
      professor_id: atribuicao.professorId,
      professor_nome: atribuicao.professorNome,
      disciplina_ids: atribuicao.disciplinaIds,
      turma_ids: atribuicao.turmaIds,
    });

    if (error) {
      console.error('Erro dbSaveAtribuicao:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dbDeleteAtribuicao(id: string): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client.from('atribuicoes').delete().eq('id', id);
    if (error) {
      console.error('Erro dbDeleteAtribuicao:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dbSaveSystemSettings(settings: SystemSettings): Promise<DbResult> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client.from('system_settings').upsert({
      id: 'global',
      bimestre_atual: settings.bimestreAtual,
      status_edicao: settings.statusEdicao,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Erro dbSaveSystemSettings:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
