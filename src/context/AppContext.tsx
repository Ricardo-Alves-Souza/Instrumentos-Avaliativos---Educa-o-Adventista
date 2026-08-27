import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Turma,
  Disciplina,
  InstrumentoAvaliativo,
  InstrumentoStatus,
  User,
  Atribuicao,
  SystemSettings,
  TipoInstrumentoItem,
  SegmentoEscolar,
} from '../types';

export function getSegmentFromTurma(turma?: { nivel?: string; serie?: string } | null): SegmentoEscolar {
  if (!turma) return 'FUNDAMENTAL_1';
  const nivel = (turma.nivel || '').toLowerCase();
  const serie = (turma.serie || '').toLowerCase();

  if (nivel.includes('médio') || nivel.includes('medio') || serie.includes('médio') || serie.includes('medio')) {
    return 'ENSINO_MEDIO';
  }
  if (nivel.includes('fundamental ii') || nivel.includes('fundamental 2') || /^[6-9][ºª]/.test(serie)) {
    return 'FUNDAMENTAL_2';
  }
  return 'FUNDAMENTAL_1';
}
import {
  initialTurmas,
  initialDisciplinas,
  initialUsers,
  initialAtribuicoes,
  initialSystemSettings,
  initialInstrumentos,
  initialTiposInstrumento,
} from '../data/mockData';
import { getSupabase, isSupabaseConfigured, initSupabase } from '../lib/supabase';
import {
  loadAllDataFromSupabase,
  dbSaveInstrumento,
  dbDeleteInstrumento,
  dbSaveTurma,
  dbDeleteTurma,
  dbSaveDisciplina,
  dbDeleteDisciplina,
  dbSaveAtribuicao,
  dbDeleteAtribuicao,
  dbSaveSystemSettings,
  dbSaveUserProfile,
  dbDeleteUserProfile,
  dbToggleUserActive,
  dbCreateUserWithAuth,
} from '../lib/supabaseDb';

const STORAGE_KEYS = {
  TURMAS: 'ia_turmas_v4',
  DISCIPLINAS: 'ia_disciplinas_v4',
  USERS: 'ia_users_v4',
  ATRIBUICOES: 'ia_atribuicoes_v4',
  SETTINGS: 'ia_settings_v4',
  INSTRUMENTOS: 'ia_instrumentos_v4',
  TIPOS_INSTRUMENTO: 'ia_tipos_instrumento_v4',
  CURRENT_USER_ID: 'ia_current_user_id_v4',
  AUTH_SAVED_SESSION: 'ia_auth_saved_user_v4',
};

interface AppContextType {
  // Authentication & Supabase state
  isAuthenticated: boolean;
  authLoading: boolean;
  isSupabaseActive: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Current user & accounts
  currentUser: User;
  baseUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  getAccessibleUsers: (user?: User) => User[];
  addUser: (
    user: Omit<User, 'id'>,
    initialAtribuicao?: { disciplinaIds: string[]; turmaIds: string[] },
    password?: string
  ) => Promise<User>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUserPassword: (userId: string, email: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserActive: (userId: string, ativo: boolean) => Promise<{ success: boolean; error?: string }>;

  // Super Admin Impersonation ("Visualizar como professor")
  isImpersonating: boolean;
  originalAdminUser: User | null;
  startImpersonation: (professor: User) => void;
  stopImpersonation: () => void;

  // Turmas
  turmas: Turma[];
  addTurma: (turma: Omit<Turma, 'id'>) => Promise<Turma>;
  updateTurma: (turma: Turma) => Promise<void>;
  deleteTurma: (id: string) => Promise<void>;

  // Disciplinas
  disciplinas: Disciplina[];
  addDisciplina: (disc: Omit<Disciplina, 'id' | 'ordem'>) => Promise<Disciplina>;
  updateDisciplina: (disc: Disciplina) => Promise<void>;
  deleteDisciplina: (id: string) => Promise<void>;
  moveDisciplinaOrder: (id: string, direction: 'up' | 'down') => Promise<void>;

  // Tipos de Instrumento
  tiposInstrumento: TipoInstrumentoItem[];
  addTipoInstrumento: (nome: string) => Promise<TipoInstrumentoItem>;
  updateTipoInstrumento: (item: TipoInstrumentoItem) => Promise<void>;
  deleteTipoInstrumento: (id: string) => Promise<void>;

  // Atribuições
  atribuicoes: Atribuicao[];
  saveAtribuicao: (professorId: string, disciplinaIds: string[], turmaIds: string[]) => Promise<void>;
  deleteAtribuicao: (id: string) => Promise<void>;

  // System Settings
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;

  // Instrumentos Avaliativos
  instrumentos: InstrumentoAvaliativo[];
  addInstrumento: (inst: Omit<InstrumentoAvaliativo, 'id'>, saveStatus?: InstrumentoStatus) => Promise<InstrumentoAvaliativo>;
  updateInstrumento: (inst: InstrumentoAvaliativo, saveStatus?: InstrumentoStatus) => Promise<void>;
  deleteInstrumento: (id: string) => Promise<void>;
  salvarRascunho: (inst: Partial<InstrumentoAvaliativo>) => Promise<InstrumentoAvaliativo>;
  enviarParaAprovacao: (inst: Partial<InstrumentoAvaliativo>) => Promise<InstrumentoAvaliativo>;
  aprovarInstrumento: (id: string) => Promise<void>;
  rejeitarInstrumento: (id: string, motivo: string) => Promise<void>;
  liberarParaModificacao: (id: string) => Promise<void>;

  // Helper selectors
  getProfessorDisciplinas: (professorId: string) => Disciplina[];
  getProfessorTurmas: (professorId: string) => Turma[];
  getAccessibleTurmas: (user?: User) => Turma[];
  getAccessibleDisciplinas: (user?: User) => Disciplina[];
  getAccessibleInstrumentos: (user?: User) => InstrumentoAvaliativo[];
  getInstrumentosForTurma: (turmaId: string, bimestre?: number) => InstrumentoAvaliativo[];
  getDeliveryDateForTurma: (inst: InstrumentoAvaliativo, turmaId: string) => string;
  isInstrumentOwner: (inst: InstrumentoAvaliativo, user?: User) => boolean;
  isSegmentLiberado: (segmento: SegmentoEscolar) => boolean;
  canEditInstrument: (inst: InstrumentoAvaliativo) => boolean;
  canCreateInstrument: (turma?: Turma | null) => boolean;
  canApproveOrReject: () => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [turmas, setTurmas] = useState<Turma[]>(() =>
    loadFromStorage(STORAGE_KEYS.TURMAS, initialTurmas)
  );

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>(() => {
    const loaded = loadFromStorage<Disciplina[]>(STORAGE_KEYS.DISCIPLINAS, initialDisciplinas);
    return [...loaded].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  });

  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage(STORAGE_KEYS.USERS, initialUsers)
  );

  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user-admin')
  );

  const [atribuicoes, setAtribuicoes] = useState<Atribuicao[]>(() =>
    loadFromStorage(STORAGE_KEYS.ATRIBUICOES, initialAtribuicoes)
  );

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, initialSystemSettings)
  );

  const [instrumentos, setInstrumentos] = useState<InstrumentoAvaliativo[]>(() =>
    loadFromStorage(STORAGE_KEYS.INSTRUMENTOS, initialInstrumentos)
  );

  const [tiposInstrumento, setTiposInstrumento] = useState<TipoInstrumentoItem[]>(() => {
    const loaded = loadFromStorage<TipoInstrumentoItem[]>(STORAGE_KEYS.TIPOS_INSTRUMENTO, initialTiposInstrumento);
    if (!loaded || loaded.length === 0) return initialTiposInstrumento;
    // Garantir que os 4 padrões existam se não tiverem sido todos excluídos propositalmente
    return loaded;
  });

  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_SAVED_SESSION);
    return saved === 'true';
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(isSupabaseConfigured());

  // Sync to local storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TURMAS, turmas);
  }, [turmas]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DISCIPLINAS, disciplinas);
  }, [disciplinas]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ATRIBUICOES, atribuicoes);
  }, [atribuicoes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, systemSettings);
  }, [systemSettings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.INSTRUMENTOS, instrumentos);
  }, [instrumentos]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TIPOS_INSTRUMENTO, tiposInstrumento);
  }, [tiposInstrumento]);

  // Initial Load from Supabase on mount
  useEffect(() => {
    async function init() {
      setAuthLoading(true);
      const client = await initSupabase();

      if (client && isSupabaseConfigured()) {
        setIsSupabaseActive(true);

        // Check active session from Supabase
        const { data: sessionData } = await client.auth.getSession();
        if (sessionData.session?.user) {
          const userEmail = sessionData.session.user.email?.toLowerCase();

          // Load profiles and tables first
          const remoteData = await loadAllDataFromSupabase();
          let currentUsersList = users;
          if (remoteData) {
            setUsers(remoteData.users);
            setTurmas(remoteData.turmas);
            setDisciplinas(remoteData.disciplinas);
            setAtribuicoes(remoteData.atribuicoes);
            setSystemSettings(remoteData.systemSettings);
            setInstrumentos(remoteData.instrumentos);
            currentUsersList = remoteData.users;
          }

          // Match existing user profile or check active status
          const matchedUser = currentUsersList.find((u) => u.email.toLowerCase() === userEmail);
          if (matchedUser) {
            if (matchedUser.ativo === false) {
              await client.auth.signOut();
              setIsAuthenticated(false);
              localStorage.removeItem(STORAGE_KEYS.AUTH_SAVED_SESSION);
            } else {
              setIsAuthenticated(true);
              localStorage.setItem(STORAGE_KEYS.AUTH_SAVED_SESSION, 'true');
              setCurrentUserId(matchedUser.id);
            }
          } else {
            // New profile from auth
            const newProfile: User = {
              id: sessionData.session.user.id,
              email: sessionData.session.user.email || '',
              nome: sessionData.session.user.user_metadata?.nome || 'Usuário Conectado',
              role:
                sessionData.session.user.user_metadata?.role ||
                (userEmail === 'ricardo_souza@eaportal.org' ? 'SUPER_ADMIN' : 'PROFESSOR'),
              ativo: true,
            };
            setUsers((prev) => [...prev.filter((u) => u.email !== newProfile.email), newProfile]);
            dbSaveUserProfile(newProfile);
            setCurrentUserId(newProfile.id);
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEYS.AUTH_SAVED_SESSION, 'true');
          }
        } else {
          // No active auth session, but load tables
          const remoteData = await loadAllDataFromSupabase();
          if (remoteData) {
            setUsers(remoteData.users);
            setTurmas(remoteData.turmas);
            setDisciplinas(remoteData.disciplinas);
            setAtribuicoes(remoteData.atribuicoes);
            setSystemSettings(remoteData.systemSettings);
            setInstrumentos(remoteData.instrumentos);
          }
        }

        // Listen to auth changes
        const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const email = session.user.email?.toLowerCase();
            const existing = users.find((u) => u.email.toLowerCase() === email);
            if (existing && existing.ativo === false) {
              await client.auth.signOut();
              setIsAuthenticated(false);
              localStorage.removeItem(STORAGE_KEYS.AUTH_SAVED_SESSION);
              return;
            }
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEYS.AUTH_SAVED_SESSION, 'true');
            if (existing) {
              setCurrentUserId(existing.id);
            }
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            localStorage.removeItem(STORAGE_KEYS.AUTH_SAVED_SESSION);
          }
        });

        setAuthLoading(false);
        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        setAuthLoading(false);
      }
    }

    init();
  }, []);

  // Login handler with Supabase Auth
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Por favor, preencha o e-mail e a senha.' };
    }

    const client = getSupabase() || (await initSupabase());

    if (client && isSupabaseConfigured()) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (error) {
          // Check if Super Admin initial fallback is requested before Supabase Auth is populated
          if (cleanEmail === 'ricardo_souza@eaportal.org' && cleanPass === 'instrumentos2026') {
            const superAdminUser = users.find((u) => u.email === cleanEmail) || initialUsers[0];
            setCurrentUserId(superAdminUser.id);
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEYS.AUTH_SAVED_SESSION, 'true');
            return { success: true };
          }

          let msg = 'Erro ao realizar login.';
          if (error.message.includes('Invalid login credentials')) {
            msg = 'E-mail ou senha incorretos. Verifique suas credenciais.';
          } else if (error.message.includes('Email not confirmed')) {
            msg = 'E-mail ainda não confirmado no sistema.';
          } else {
            msg = error.message;
          }
          return { success: false, error: msg };
        }

        if (data.user) {
          // Fetch fresh profiles from database
          const { data: profileInDb } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const isInactive = profileInDb?.ativo === false;
          if (isInactive) {
            await client.auth.signOut();
            return {
              success: false,
              error: 'Esta conta de usuário foi desativada pela administração. Entre em contato com a coordenação.',
            };
          }

          const foundProfile = users.find((u) => u.email.toLowerCase() === cleanEmail);
          if (foundProfile) {
            if (foundProfile.ativo === false) {
              await client.auth.signOut();
              return {
                success: false,
                error: 'Esta conta de usuário foi desativada pela administração. Entre em contato com a coordenação.',
              };
            }
            setCurrentUserId(foundProfile.id);
          } else {
            const newU: User = {
              id: data.user.id,
              nome: profileInDb?.nome || data.user.user_metadata?.nome || 'Usuário Conectado',
              email: cleanEmail,
              role:
                profileInDb?.role ||
                data.user.user_metadata?.role ||
                (cleanEmail === 'ricardo_souza@eaportal.org' ? 'SUPER_ADMIN' : 'PROFESSOR'),
              ativo: true,
            };
            setUsers((prev) => [...prev, newU]);
            dbSaveUserProfile(newU);
            setCurrentUserId(newU.id);
          }

          setIsAuthenticated(true);
          localStorage.setItem(STORAGE_KEYS.AUTH_SAVED_SESSION, 'true');
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Falha na comunicação com o Supabase' };
      }
    }

    // Fallback mode (when Supabase credentials are still syncing)
    const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      if (matched.ativo === false) {
        return { success: false, error: 'Esta conta de usuário foi desativada pela administração.' };
      }
      if (cleanEmail === 'ricardo_souza@eaportal.org' && cleanPass !== 'instrumentos2026') {
        return { success: false, error: 'Senha incorreta para o usuário Super Admin.' };
      }
      setCurrentUserId(matched.id);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.AUTH_SAVED_SESSION, 'true');
      return { success: true };
    }

    if (cleanEmail === 'ricardo_souza@eaportal.org' && cleanPass === 'instrumentos2026') {
      const superAdminUser = users.find((u) => u.role === 'SUPER_ADMIN') || initialUsers[0];
      setCurrentUserId(superAdminUser.id);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.AUTH_SAVED_SESSION, 'true');
      return { success: true };
    }

    return {
      success: false,
      error: 'Credenciais inválidas. Usuário não encontrado no sistema.',
    };
  };

  // Logout handler
  const logout = async () => {
    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.error('Supabase signOut error:', e);
      }
    }
    setImpersonatedUserId(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SAVED_SESSION);
  };

  // Base and impersonated user resolution
  const baseUser = users.find((u) => u.id === currentUserId) || users[0] || initialUsers[0];
  const impersonatedUser = impersonatedUserId ? users.find((u) => u.id === impersonatedUserId) || null : null;
  const isImpersonating = Boolean(impersonatedUser);
  const currentUser = impersonatedUser || baseUser;
  const originalAdminUser = isImpersonating ? baseUser : null;

  // Impersonation Controls (Super Admin only)
  const startImpersonation = (professor: User) => {
    if (baseUser.role !== 'SUPER_ADMIN') {
      throw new Error(
        'Acesso negado: Apenas o perfil Super Administrador possui permissão para visualizar o sistema como professor.'
      );
    }
    if (professor.role !== 'PROFESSOR') {
      throw new Error('Apenas contas de professores podem ser visualizadas.');
    }
    setImpersonatedUserId(professor.id);
  };

  const stopImpersonation = () => {
    setImpersonatedUserId(null);
  };

  const setCurrentUser = (user: User) => {
    setImpersonatedUserId(null);
    setCurrentUserId(user.id);
  };

  // Add User directly with Supabase Auth & Profiles
  const addUser = async (
    userData: Omit<User, 'id'>,
    initialAtrib?: { disciplinaIds: string[]; turmaIds: string[] },
    password?: string
  ): Promise<User> => {
    if (baseUser.role === 'COORDENADOR' && userData.role === 'SUPER_ADMIN') {
      throw new Error('Acesso negado: A Coordenação não possui permissão para criar contas de Super Administrador.');
    }
    if (baseUser.role === 'PROFESSOR') {
      throw new Error('Acesso negado: Professores não podem cadastrar usuários.');
    }

    // Tentar criação real no Supabase Auth + Profiles
    const creationResult = await dbCreateUserWithAuth(userData, password);
    if (!creationResult.success || !creationResult.data) {
      throw new Error(creationResult.error || 'Falha ao criar usuário no Supabase.');
    }

    const newUser = creationResult.data;

    setUsers((prev) => [...prev.filter((u) => u.id !== newUser.id), newUser]);

    if (
      userData.role === 'PROFESSOR' &&
      initialAtrib &&
      (initialAtrib.disciplinaIds.length > 0 || initialAtrib.turmaIds.length > 0)
    ) {
      const newAtrib: Atribuicao = {
        id: `atrib-${Date.now()}`,
        professorId: newUser.id,
        professorNome: newUser.nome,
        disciplinaIds: initialAtrib.disciplinaIds,
        turmaIds: initialAtrib.turmaIds,
      };
      setAtribuicoes((prev) => [...prev, newAtrib]);
      await dbSaveAtribuicao(newAtrib);
    }

    return newUser;
  };

  const updateUser = async (updatedUser: User) => {
    const existing = users.find((u) => u.id === updatedUser.id);
    if (baseUser.role === 'COORDENADOR') {
      if (existing?.role === 'SUPER_ADMIN' || updatedUser.role === 'SUPER_ADMIN') {
        throw new Error(
          'Acesso negado: A Coordenação não possui permissão para alterar ou promover contas de Super Administrador.'
        );
      }
    }
    if (baseUser.role === 'PROFESSOR') {
      throw new Error('Acesso negado: Professores não podem alterar usuários.');
    }

    const res = await dbSaveUserProfile(updatedUser);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao atualizar usuário no banco de dados.');
    }

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    setAtribuicoes((prev) =>
      prev.map((a) =>
        a.professorId === updatedUser.id ? { ...a, professorNome: updatedUser.nome } : a
      )
    );
  };

  const deleteUser = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (baseUser.role === 'COORDENADOR') {
      if (target?.role === 'SUPER_ADMIN') {
        throw new Error('Acesso negado: A Coordenação não possui permissão para excluir contas de Super Administrador.');
      }
    }
    if (baseUser.role === 'PROFESSOR') {
      throw new Error('Acesso negado: Professores não podem excluir usuários.');
    }

    const res = await dbDeleteUserProfile(id);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao excluir usuário no Supabase.');
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));

    const userAtrib = atribuicoes.find((a) => a.professorId === id);
    if (userAtrib) {
      await dbDeleteAtribuicao(userAtrib.id);
    }
    setAtribuicoes((prev) => prev.filter((a) => a.professorId !== id));

    if (currentUserId === id) {
      setCurrentUserId(users.find((u) => u.id !== id)?.id || 'user-admin');
    }
  };

  // Reset User Password via Supabase Auth email recovery
  const resetUserPassword = async (
    userId: string,
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (baseUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Apenas o perfil Super Administrador possui permissão para solicitar redefinição de senhas.',
      };
    }

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        const { error } = await client.auth.resetPasswordForEmail(email.toLowerCase(), {
          redirectTo: window.location.origin,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return {
          success: true,
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Falha ao solicitar redefinição de senha no Supabase.' };
      }
    }

    return {
      success: true,
    };
  };

  // Toggle user active status
  const toggleUserActive = async (
    userId: string,
    ativo: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    if (baseUser.role !== 'SUPER_ADMIN' && baseUser.role !== 'COORDENADOR') {
      return { success: false, error: 'Acesso negado.' };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.role === 'SUPER_ADMIN' && baseUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Não é permitido desativar o Super Admin.' };
    }

    const updated = { ...targetUser!, ativo };
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    await dbToggleUserActive(userId, ativo);

    return { success: true };
  };

  // Turmas CRUD
  const addTurma = async (data: Omit<Turma, 'id'>): Promise<Turma> => {
    const newId = `turma-${Date.now()}`;
    const newTurma: Turma = { ...data, id: newId };
    const res = await dbSaveTurma(newTurma);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao salvar turma no banco de dados.');
    }
    setTurmas((prev) => [...prev, newTurma]);
    return newTurma;
  };

  const updateTurma = async (updated: Turma) => {
    const res = await dbSaveTurma(updated);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao atualizar turma no banco de dados.');
    }
    setTurmas((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setInstrumentos((prev) =>
      prev.map((i) => (i.turmaId === updated.id ? { ...i, turmaNome: updated.nome } : i))
    );
  };

  const deleteTurma = async (id: string) => {
    const res = await dbDeleteTurma(id);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao excluir turma no Supabase.');
    }
    setTurmas((prev) => prev.filter((t) => t.id !== id));
    setAtribuicoes((prev) =>
      prev.map((a) => ({ ...a, turmaIds: a.turmaIds.filter((tid) => tid !== id) }))
    );
  };

  // Disciplinas CRUD
  const addDisciplina = async (data: Omit<Disciplina, 'id' | 'ordem'>): Promise<Disciplina> => {
    const maxOrder = disciplinas.reduce((max, d) => Math.max(max, d.ordem || 0), 0);
    const newId = `disc-${Date.now()}`;
    const newDisc: Disciplina = { ...data, id: newId, ordem: maxOrder + 1 };
    const res = await dbSaveDisciplina(newDisc);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao salvar disciplina no banco de dados.');
    }
    setDisciplinas((prev) => [...prev, newDisc].sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
    return newDisc;
  };

  const updateDisciplina = async (updated: Disciplina) => {
    const res = await dbSaveDisciplina(updated);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao atualizar disciplina no banco de dados.');
    }
    setDisciplinas((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d)).sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
    );
    setInstrumentos((prev) =>
      prev.map((i) => (i.disciplinaId === updated.id ? { ...i, disciplinaNome: updated.nome } : i))
    );
  };

  const deleteDisciplina = async (id: string) => {
    const res = await dbDeleteDisciplina(id);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao excluir disciplina no Supabase.');
    }
    setDisciplinas((prev) => prev.filter((d) => d.id !== id));
    setAtribuicoes((prev) =>
      prev.map((a) => ({ ...a, disciplinaIds: a.disciplinaIds.filter((did) => did !== id) }))
    );
  };

  const moveDisciplinaOrder = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...disciplinas].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const idx = sorted.findIndex((d) => d.id === id);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const prevOrder = sorted[idx - 1].ordem;
      sorted[idx - 1].ordem = sorted[idx].ordem;
      sorted[idx].ordem = prevOrder;
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const nextOrder = sorted[idx + 1].ordem;
      sorted[idx + 1].ordem = sorted[idx].ordem;
      sorted[idx].ordem = nextOrder;
    }

    const reordered = sorted.map((d, index) => ({ ...d, ordem: index + 1 }));
    setDisciplinas(reordered);
    for (const d of reordered) {
      await dbSaveDisciplina(d);
    }
  };

  // Tipos de Instrumento CRUD
  const addTipoInstrumento = async (nome: string): Promise<TipoInstrumentoItem> => {
    const trimmed = nome.trim();
    if (!trimmed) {
      throw new Error('O nome do tipo de instrumento é obrigatório.');
    }
    const maxOrder = tiposInstrumento.reduce((max, t) => Math.max(max, t.ordem || 0), 0);
    const newItem: TipoInstrumentoItem = {
      id: `tipo-${Date.now()}`,
      nome: trimmed,
      ordem: maxOrder + 1,
    };
    setTiposInstrumento((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateTipoInstrumento = async (updated: TipoInstrumentoItem) => {
    const trimmed = updated.nome.trim();
    if (!trimmed) {
      throw new Error('O nome do tipo de instrumento é obrigatório.');
    }
    setTiposInstrumento((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...updated, nome: trimmed } : t))
    );
  };

  const deleteTipoInstrumento = async (id: string) => {
    setTiposInstrumento((prev) => prev.filter((t) => t.id !== id));
  };

  // Atribuições CRUD
  const saveAtribuicao = async (
    professorId: string,
    disciplinaIds: string[],
    turmaIds: string[]
  ) => {
    const prof = users.find((u) => u.id === professorId);
    const existing = atribuicoes.find((a) => a.professorId === professorId);

    let updatedAtrib: Atribuicao;
    if (existing) {
      updatedAtrib = {
        ...existing,
        professorNome: prof ? prof.nome : existing.professorNome,
        disciplinaIds,
        turmaIds,
      };
      setAtribuicoes((prev) => prev.map((a) => (a.id === existing.id ? updatedAtrib : a)));
    } else {
      updatedAtrib = {
        id: `atrib-${Date.now()}`,
        professorId,
        professorNome: prof ? prof.nome : 'Professor',
        disciplinaIds,
        turmaIds,
      };
      setAtribuicoes((prev) => [...prev, updatedAtrib]);
    }
    const res = await dbSaveAtribuicao(updatedAtrib);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao salvar atribuição no Supabase.');
    }
  };

  const deleteAtribuicao = async (id: string) => {
    const res = await dbDeleteAtribuicao(id);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao excluir atribuição no Supabase.');
    }
    setAtribuicoes((prev) => prev.filter((a) => a.id !== id));
  };

  // Settings
  const updateSystemSettings = async (newSettings: Partial<SystemSettings>) => {
    const updated = { ...systemSettings, ...newSettings };
    setSystemSettings(updated);
    await dbSaveSystemSettings(updated);
  };

  // Instrumentos CRUD
  const addInstrumento = async (
    inst: Omit<InstrumentoAvaliativo, 'id'>,
    saveStatus: InstrumentoStatus = 'RASCUNHO'
  ): Promise<InstrumentoAvaliativo> => {
    const newId = `inst-${Date.now()}`;
    const dateNow = new Date().toLocaleString('pt-BR');
    const created: InstrumentoAvaliativo = {
      ...inst,
      id: newId,
      status: saveStatus,
      dataCriacao: inst.dataCriacao || dateNow,
      dataEnvio: saveStatus === 'ENVIADO' ? dateNow : inst.dataEnvio,
      historico: [
        {
          status: saveStatus,
          data: dateNow,
          usuarioNome: currentUser.nome,
          usuarioRole: currentUser.role,
        },
      ],
    };

    const res = await dbSaveInstrumento(created);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao salvar instrumento no Supabase.');
    }

    setInstrumentos((prev) => [...prev, created]);
    return created;
  };

  const updateInstrumento = async (
    inst: InstrumentoAvaliativo,
    saveStatus?: InstrumentoStatus
  ) => {
    const nextStatus = saveStatus || inst.status;
    const dateNow = new Date().toLocaleString('pt-BR');

    const historyItem = {
      status: nextStatus,
      data: dateNow,
      usuarioNome: currentUser.nome,
      usuarioRole: currentUser.role,
    };

    const updated: InstrumentoAvaliativo = {
      ...inst,
      status: nextStatus,
      dataEnvio: nextStatus === 'ENVIADO' ? dateNow : inst.dataEnvio,
      historico: [...(inst.historico || []), historyItem],
    };

    const res = await dbSaveInstrumento(updated);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao atualizar instrumento no Supabase.');
    }

    setInstrumentos((prev) => prev.map((i) => (i.id === inst.id ? updated : i)));
  };

  const deleteInstrumento = async (id: string) => {
    const res = await dbDeleteInstrumento(id);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao excluir instrumento no Supabase.');
    }
    setInstrumentos((prev) => prev.filter((i) => i.id !== id));
  };

  const salvarRascunho = async (inst: Partial<InstrumentoAvaliativo>): Promise<InstrumentoAvaliativo> => {
    if (inst.id) {
      const existing = instrumentos.find((i) => i.id === inst.id);
      if (existing) {
        const updated = { ...existing, ...inst, status: 'RASCUNHO' as InstrumentoStatus };
        await updateInstrumento(updated, 'RASCUNHO');
        return updated;
      }
    }
    return await addInstrumento(inst as Omit<InstrumentoAvaliativo, 'id'>, 'RASCUNHO');
  };

  const enviarParaAprovacao = async (inst: Partial<InstrumentoAvaliativo>): Promise<InstrumentoAvaliativo> => {
    if (inst.id) {
      const existing = instrumentos.find((i) => i.id === inst.id);
      if (existing) {
        const updated = { ...existing, ...inst, status: 'ENVIADO' as InstrumentoStatus };
        await updateInstrumento(updated, 'ENVIADO');
        return updated;
      }
    }
    return await addInstrumento(inst as Omit<InstrumentoAvaliativo, 'id'>, 'ENVIADO');
  };

  const aprovarInstrumento = async (id: string) => {
    if (currentUser.role === 'PROFESSOR') {
      throw new Error('Apenas coordenadores podem aprovar instrumentos.');
    }
    const inst = instrumentos.find((i) => i.id === id);
    if (!inst) return;

    const dateNow = new Date().toLocaleString('pt-BR');
    const updated: InstrumentoAvaliativo = {
      ...inst,
      status: 'APROVADO',
      dataAprovacao: dateNow,
      coordenadorId: currentUser.id,
      coordenadorNome: currentUser.nome,
      motivoRejeicao: undefined,
      historico: [
        ...(inst.historico || []),
        {
          status: 'APROVADO',
          data: dateNow,
          usuarioNome: currentUser.nome,
          usuarioRole: currentUser.role,
        },
      ],
    };

    const res = await dbSaveInstrumento(updated);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao aprovar instrumento no Supabase.');
    }

    setInstrumentos((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const rejeitarInstrumento = async (id: string, motivo: string) => {
    if (currentUser.role === 'PROFESSOR') {
      throw new Error('Apenas coordenadores podem rejeitar instrumentos.');
    }
    const inst = instrumentos.find((i) => i.id === id);
    if (!inst) return;

    const dateNow = new Date().toLocaleString('pt-BR');
    const updated: InstrumentoAvaliativo = {
      ...inst,
      status: 'REJEITADO',
      dataRejeicao: dateNow,
      coordenadorId: currentUser.id,
      coordenadorNome: currentUser.nome,
      motivoRejeicao: motivo,
      historico: [
        ...(inst.historico || []),
        {
          status: 'REJEITADO',
          data: dateNow,
          usuarioNome: currentUser.nome,
          usuarioRole: currentUser.role,
          motivo,
        },
      ],
    };

    const res = await dbSaveInstrumento(updated);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao rejeitar instrumento no Supabase.');
    }

    setInstrumentos((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const liberarParaModificacao = async (id: string) => {
    if (currentUser.role === 'PROFESSOR') {
      throw new Error('Apenas coordenadores podem liberar instrumentos para modificação.');
    }
    const inst = instrumentos.find((i) => i.id === id);
    if (!inst) return;

    const dateNow = new Date().toLocaleString('pt-BR');
    const updated: InstrumentoAvaliativo = {
      ...inst,
      status: 'LIBERADO_MODIFICACAO',
      coordenadorId: currentUser.id,
      coordenadorNome: currentUser.nome,
      historico: [
        ...(inst.historico || []),
        {
          status: 'LIBERADO_MODIFICACAO',
          data: dateNow,
          usuarioNome: currentUser.nome,
          usuarioRole: currentUser.role,
        },
      ],
    };

    const res = await dbSaveInstrumento(updated);
    if (!res.success) {
      throw new Error(res.error || 'Falha ao liberar instrumento no Supabase.');
    }

    setInstrumentos((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  // Helper Selectors
  const getProfessorDisciplinas = (professorId: string): Disciplina[] => {
    const atrib = atribuicoes.find((a) => a.professorId === professorId);
    if (!atrib) return [];
    return disciplinas.filter((d) => atrib.disciplinaIds.includes(d.id));
  };

  const getProfessorTurmas = (professorId: string): Turma[] => {
    const atrib = atribuicoes.find((a) => a.professorId === professorId);
    if (!atrib) return [];
    return turmas.filter((t) => atrib.turmaIds.includes(t.id));
  };

  const getAccessibleTurmas = (user: User = currentUser): Turma[] => {
    if (user.role === 'SUPER_ADMIN') {
      return turmas;
    }
    if (user.role === 'COORDENADOR') {
      // Se não tiver segmentos definidos ou vazios, mantém acesso a todas por segurança / legado
      if (!user.segmentosPermitidos || user.segmentosPermitidos.length === 0) {
        return turmas;
      }
      return turmas.filter((t) => {
        const seg = getSegmentFromTurma(t);
        return user.segmentosPermitidos?.includes(seg);
      });
    }
    return getProfessorTurmas(user.id);
  };

  const getAccessibleDisciplinas = (user: User = currentUser): Disciplina[] => {
    if (user.role === 'SUPER_ADMIN' || user.role === 'COORDENADOR') {
      return disciplinas;
    }
    return getProfessorDisciplinas(user.id);
  };

  const getAccessibleInstrumentos = (user: User = currentUser): InstrumentoAvaliativo[] => {
    if (user.role === 'SUPER_ADMIN') {
      return instrumentos;
    }
    if (user.role === 'COORDENADOR') {
      if (!user.segmentosPermitidos || user.segmentosPermitidos.length === 0) {
        return instrumentos;
      }
      const allowedTurmaIds = new Set(getAccessibleTurmas(user).map((t) => t.id));
      return instrumentos.filter((i) => {
        const matchesPrimary = allowedTurmaIds.has(i.turmaId);
        const matchesAnyMulti = Array.isArray(i.turmas) && i.turmas.some((t) => allowedTurmaIds.has(t.turmaId));
        return matchesPrimary || matchesAnyMulti;
      });
    }
    return instrumentos.filter((i) => i.professorId === user.id);
  };

  const getAccessibleUsers = (user: User = currentUser): User[] => {
    if (user.role === 'SUPER_ADMIN') {
      return users;
    }
    if (user.role === 'COORDENADOR') {
      return users.filter((u) => u.role !== 'SUPER_ADMIN');
    }
    return [user];
  };

  const getInstrumentosForTurma = (turmaId: string, bimestre?: number): InstrumentoAvaliativo[] => {
    return instrumentos.filter((i) => {
      const matchTurma =
        i.turmaId === turmaId || (Array.isArray(i.turmas) && i.turmas.some((t) => t.turmaId === turmaId));
      const matchBimestre = bimestre ? i.bimestre === bimestre : true;
      return matchTurma && matchBimestre;
    });
  };

  const getDeliveryDateForTurma = (inst: InstrumentoAvaliativo, turmaId: string): string => {
    if (Array.isArray(inst.turmas) && inst.turmas.length > 0) {
      const found = inst.turmas.find((t) => t.turmaId === turmaId);
      if (found && found.data) return found.data;
    }
    return inst.data;
  };

  const isInstrumentOwner = (inst: InstrumentoAvaliativo, user: User = currentUser): boolean => {
    return inst.professorId === user.id;
  };

  const isSegmentLiberado = (segmento: SegmentoEscolar): boolean => {
    if (systemSettings.instrumentos_liberados && typeof systemSettings.instrumentos_liberados === 'object') {
      return systemSettings.instrumentos_liberados[segmento] !== false;
    }
    return systemSettings.statusEdicao !== 'BLOQUEADO';
  };

  const canEditInstrument = (inst: InstrumentoAvaliativo): boolean => {
    if (currentUser.role === 'SUPER_ADMIN') {
      return true;
    }
    if (currentUser.role === 'COORDENADOR') {
      if (!currentUser.segmentosPermitidos || currentUser.segmentosPermitidos.length === 0) {
        return true;
      }
      const allowedTurmaIds = new Set(getAccessibleTurmas(currentUser).map((t) => t.id));
      const hasPermission =
        allowedTurmaIds.has(inst.turmaId) ||
        (Array.isArray(inst.turmas) && inst.turmas.some((t) => allowedTurmaIds.has(t.turmaId)));
      return hasPermission;
    }
    // Professor: verificar se o segmento está liberado e status é editável
    if (inst.professorId !== currentUser.id) {
      return false;
    }

    // Verificar se o segmento das turmas do instrumento está liberado
    const primaryTurma = turmas.find((t) => t.id === inst.turmaId);
    const seg = getSegmentFromTurma(primaryTurma);
    const segmentLiberado = isSegmentLiberado(seg);

    if (!segmentLiberado && inst.status !== 'LIBERADO_MODIFICACAO') {
      return false;
    }

    return inst.status === 'RASCUNHO' || inst.status === 'LIBERADO_MODIFICACAO';
  };

  const canCreateInstrument = (turma?: Turma | null): boolean => {
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COORDENADOR') {
      return true;
    }
    if (currentUser.role === 'PROFESSOR') {
      if (turma) {
        const seg = getSegmentFromTurma(turma);
        return isSegmentLiberado(seg);
      }
      // Se nenhuma turma específica for passada, verificar se pelo menos um segmento das turmas do professor está liberado
      const profTurmas = getProfessorTurmas(currentUser.id);
      if (profTurmas.length === 0) return true;
      return profTurmas.some((t) => isSegmentLiberado(getSegmentFromTurma(t)));
    }
    return true;
  };

  const canApproveOrReject = (): boolean => {
    return currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COORDENADOR';
  };

  const resetAllData = () => {
    setTurmas(initialTurmas);
    setDisciplinas(initialDisciplinas);
    setTiposInstrumento(initialTiposInstrumento);
    setUsers(initialUsers);
    setAtribuicoes(initialAtribuicoes);
    setSystemSettings(initialSystemSettings);
    setInstrumentos(initialInstrumentos);
    setCurrentUserId('user-admin');
    setImpersonatedUserId(null);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        isSupabaseActive,
        login,
        logout,
        currentUser,
        baseUser,
        setCurrentUser,
        users,
        getAccessibleUsers,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        toggleUserActive,
        isImpersonating,
        originalAdminUser,
        startImpersonation,
        stopImpersonation,
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
        atribuicoes,
        saveAtribuicao,
        deleteAtribuicao,
        systemSettings,
        updateSystemSettings,
        instrumentos,
        addInstrumento,
        updateInstrumento,
        deleteInstrumento,
        salvarRascunho,
        enviarParaAprovacao,
        aprovarInstrumento,
        rejeitarInstrumento,
        liberarParaModificacao,
        getProfessorDisciplinas,
        getProfessorTurmas,
        getAccessibleTurmas,
        getAccessibleDisciplinas,
        getAccessibleInstrumentos,
        getInstrumentosForTurma,
        getDeliveryDateForTurma,
        isInstrumentOwner,
        isSegmentLiberado,
        canEditInstrument,
        canCreateInstrument,
        canApproveOrReject,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
