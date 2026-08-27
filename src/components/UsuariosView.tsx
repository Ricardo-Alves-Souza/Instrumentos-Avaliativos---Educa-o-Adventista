import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  GraduationCap,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle2,
  AlertOctagon,
  KeyRound,
  Power,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole, SegmentoEscolar } from '../types';

const SEGMENTOS_OPTIONS: { id: SegmentoEscolar; label: string; badge: string }[] = [
  { id: 'FUNDAMENTAL_1', label: 'Fundamental I', badge: '1º ao 5º Ano' },
  { id: 'FUNDAMENTAL_2', label: 'Fundamental II', badge: '6º ao 9º Ano' },
  { id: 'ENSINO_MEDIO', label: 'Ensino Médio', badge: '1ª à 3ª Série' },
];

export const UsuariosView: React.FC = () => {
  const {
    users,
    getAccessibleUsers,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    toggleUserActive,
    currentUser,
    baseUser,
    atribuicoes,
  } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal Novo / Editar Usuário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('PROFESSOR');
  const [segmentosPermitidos, setSegmentosPermitidos] = useState<SegmentoEscolar[]>([]);
  const [userPassword, setUserPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Redefinir Senha
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [resetStatus, setResetStatus] = useState<{ loading: boolean; error?: string; success?: string }>({
    loading: false,
  });

  // Modal Confirmação de Exclusão
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSuperAdmin = baseUser.role === 'SUPER_ADMIN';
  const isAuthorized = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COORDENADOR';

  if (!isAuthorized) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] text-center shadow-xs">
          <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#111827]">Acesso Restrito</h2>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1">
            Esta tela é de uso exclusivo de administradores e coordenadores pedagógicos.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenModal = (u?: User) => {
    // Security check: Coordenador cannot edit Super Admin
    if (u && u.role === 'SUPER_ADMIN' && !isSuperAdmin) {
      alert('Acesso negado: Apenas o Super Administrador pode visualizar ou editar esta conta.');
      return;
    }

    setFormError(null);
    if (u) {
      setEditingUser(u);
      setNome(u.nome);
      setEmail(u.email);
      setRole(u.role);
      setSegmentosPermitidos(u.segmentosPermitidos || (u.role === 'COORDENADOR' ? ['FUNDAMENTAL_1', 'FUNDAMENTAL_2', 'ENSINO_MEDIO'] : []));
      setUserPassword('');
    } else {
      setEditingUser(null);
      setNome('');
      setEmail('');
      setRole('PROFESSOR');
      setSegmentosPermitidos(['FUNDAMENTAL_1', 'FUNDAMENTAL_2', 'ENSINO_MEDIO']);
      setUserPassword('');
    }
    setIsModalOpen(true);
  };

  const handleToggleSegmentoCheckbox = (segId: SegmentoEscolar) => {
    setSegmentosPermitidos((prev) =>
      prev.includes(segId) ? prev.filter((s) => s !== segId) : [...prev, segId]
    );
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!nome.trim() || !email.trim()) return;

    if (role === 'COORDENADOR' && segmentosPermitidos.length === 0) {
      setFormError('Selecione pelo menos 1 segmento escolar para o Coordenador.');
      return;
    }

    if (!editingUser && userPassword && userPassword.length < 6) {
      setFormError('A senha inicial deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSaving(true);

    try {
      if (editingUser) {
        if (!isSuperAdmin && (editingUser.role === 'SUPER_ADMIN' || role === 'SUPER_ADMIN')) {
          setFormError('Acesso negado: Coordenação não pode gerenciar ou atribuir perfil de Super Administrador.');
          setIsSaving(false);
          return;
        }

        await updateUser({
          ...editingUser,
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          role,
          segmentosPermitidos: role === 'COORDENADOR' ? segmentosPermitidos : undefined,
        });
      } else {
        if (!isSuperAdmin && role === 'SUPER_ADMIN') {
          setFormError('Acesso negado: Coordenação não pode criar usuários com perfil de Super Administrador.');
          setIsSaving(false);
          return;
        }

        await addUser(
          {
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            role,
            ativo: true,
            segmentosPermitidos: role === 'COORDENADOR' ? segmentosPermitidos : undefined,
          },
          undefined,
          userPassword || undefined
        );
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar usuário.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenResetModal = (u: User) => {
    setResetTargetUser(u);
    setResetStatus({ loading: false });
    setIsResetModalOpen(true);
  };

  // Send Supabase Reset Password Email
  const handleExecuteResetPassword = async () => {
    if (!resetTargetUser) return;
    try {
      setResetStatus({ loading: true });
      const res = await resetUserPassword(resetTargetUser.id, resetTargetUser.email);
      if (res.success) {
        setResetStatus({
          loading: false,
          success: `E-mail de recuperação de senha enviado com sucesso para ${resetTargetUser.email}! O usuário receberá as instruções para cadastrar a nova senha.`,
        });
      } else {
        setResetStatus({ loading: false, error: res.error || 'Erro ao solicitar redefinição de senha.' });
      }
    } catch (err: any) {
      setResetStatus({ loading: false, error: err.message || 'Falha ao solicitar redefinição.' });
    }
  };

  // Toggle user active status
  const handleToggleActive = async (u: User) => {
    const nextStatus = u.ativo === false;
    await toggleUserActive(u.id, nextStatus);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const accessibleUsers = getAccessibleUsers(currentUser);

  const filteredUsers = accessibleUsers.filter((u) => {
    const matchSearch =
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            Super Admin
          </span>
        );
      case 'COORDENADOR':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Shield className="w-3 h-3 text-blue-600" />
            Coordenador
          </span>
        );
      case 'PROFESSOR':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <GraduationCap className="w-3 h-3 text-emerald-600" />
            Professor
          </span>
        );
    }
  };

  const renderCoordinatorSegments = (u: User) => {
    if (u.role !== 'COORDENADOR') return null;
    const segments = u.segmentosPermitidos;
    if (!segments || segments.length === 0) {
      return (
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          Todos os Segmentos
        </span>
      );
    }
    return (
      <div className="flex flex-wrap gap-1">
        {segments.map((s) => {
          const opt = SEGMENTOS_OPTIONS.find((o) => o.id === s);
          return (
            <span
              key={s}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
            >
              {opt?.label || s}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B82F6]" />
            Gestão de Usuários e Permissões
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Cadastre professores, coordenadores, defina segmentos de atuação e gerencie acessos e senhas com segurança.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="bg-[#111827] hover:bg-[#1f2937] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail institucional..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#6B7280]">Filtrar por perfil:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-[#E5E7EB] rounded-lg px-3 py-2 bg-[#F9FAFB] text-[#111827] font-medium"
          >
            <option value="all">Todos os Perfis ({accessibleUsers.length})</option>
            <option value="PROFESSOR">Professores</option>
            <option value="COORDENADOR">Coordenadores</option>
            {isSuperAdmin && <option value="SUPER_ADMIN">Super Administradores</option>}
          </select>
        </div>
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const userAtrib = atribuicoes.find((a) => a.professorId === u.id);
          const assignedDiscsCount = userAtrib ? userAtrib.disciplinaIds.length : 0;
          const assignedTurmasCount = userAtrib ? userAtrib.turmaIds.length : 0;
          const isUserActive = u.ativo !== false;

          return (
            <div
              key={u.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                currentUser.id === u.id ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/10' : 'border-[#E5E7EB]'
              } ${!isUserActive ? 'opacity-70 bg-gray-50' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#111827] font-bold text-sm flex items-center justify-center border border-[#E5E7EB]">
                      {u.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs font-bold text-[#111827] leading-snug">{u.nome}</h3>
                        {!isUserActive && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280]">{u.email}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  {getRoleBadge(u.role)}
                  <span className="text-[10px] text-[#9CA3AF] font-mono">
                    ID: {u.id.slice(0, 8)}...
                  </span>
                </div>

                {u.role === 'COORDENADOR' && (
                  <div className="text-[11px] text-[#6B7280] space-y-1.5 bg-[#F9FAFB] p-2.5 rounded-lg border border-[#F3F4F6]">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <Layers className="w-3 h-3 text-blue-600" />
                      <span>Segmentos Vinculados:</span>
                    </div>
                    {renderCoordinatorSegments(u)}
                  </div>
                )}

                {u.role === 'PROFESSOR' && (
                  <div className="text-[11px] text-[#6B7280] space-y-1 bg-[#F9FAFB] p-2.5 rounded-lg border border-[#F3F4F6]">
                    <div className="flex justify-between">
                      <span>Disciplinas atribuídas:</span>
                      <strong className="text-[#111827]">{assignedDiscsCount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Turmas atendidas:</span>
                      <strong className="text-[#111827]">{assignedTurmasCount}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] text-[#9CA3AF] font-medium">
                  {currentUser.id === u.id ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Sua Conta Atual
                    </span>
                  ) : isUserActive ? (
                    <span className="text-slate-500">Conta Habilitada</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Conta Suspensa</span>
                  )}
                </span>

                <div className="flex items-center gap-1 ml-auto">
                  {/* Redefinir Senha: Somente Super Admin */}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleOpenResetModal(u)}
                      className="p-1.5 text-[#6B7280] hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                      title="Solicitar Redefinição de Senha no Supabase"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Ativar/Desativar Usuário */}
                  {isSuperAdmin && u.id !== currentUser.id && u.role !== 'SUPER_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className={`p-1.5 rounded cursor-pointer transition-colors ${
                        isUserActive
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={isUserActive ? 'Desativar Usuário (bloqueia login)' : 'Reativar Usuário'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Editar Usuário */}
                  {(isSuperAdmin || u.role !== 'SUPER_ADMIN') && (
                    <button
                      type="button"
                      onClick={() => handleOpenModal(u)}
                      className="p-1.5 text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#EFF6FF] rounded cursor-pointer transition-colors"
                      title="Editar Usuário"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Excluir Usuário */}
                  {u.id !== currentUser.id && (isSuperAdmin || u.role !== 'SUPER_ADMIN') && (
                    <button
                      type="button"
                      onClick={() => setUserToDelete(u)}
                      className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CRIAÇÃO / EDIÇÃO DE USUÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário (Supabase)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Profª Juliana Costa"
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@eaportal.org"
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Senha Inicial de Acesso
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Cadastra a conta no banco de dados e Supabase Auth.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Perfil de Acesso
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setRole(newRole);
                    if (newRole === 'COORDENADOR' && segmentosPermitidos.length === 0) {
                      setSegmentosPermitidos(['FUNDAMENTAL_1', 'FUNDAMENTAL_2', 'ENSINO_MEDIO']);
                    }
                  }}
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#111827] font-medium"
                >
                  <option value="PROFESSOR">Professor (Docente)</option>
                  <option value="COORDENADOR">Coordenador Pedagógico</option>
                  {isSuperAdmin && <option value="SUPER_ADMIN">Super Administrador</option>}
                </select>
              </div>

              {/* Vínculo de Segmentos Escolares para COORDENADOR */}
              {role === 'COORDENADOR' && (
                <div className="bg-[#F9FAFB] p-3.5 rounded-lg border border-[#E5E7EB] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Segmentos de Atuação do Coordenador
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      (Múltipla escolha)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    O coordenador terá visibilidade e aprovação restritas às turmas dos segmentos marcados abaixo.
                  </p>

                  <div className="space-y-2 pt-1">
                    {SEGMENTOS_OPTIONS.map((seg) => {
                      const isChecked = segmentosPermitidos.includes(seg.id);
                      return (
                        <label
                          key={seg.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSegmentoCheckbox(seg.id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs">{seg.label}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-medium">
                            {seg.badge}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

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
                  disabled={isSaving}
                  className="px-5 py-2 text-xs bg-[#111827] hover:bg-[#1f2937] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REDEFINIR SENHA (SUPER ADMIN) */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-[#111827]">
                  Redefinição de Senha
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                Você está solicitando o link oficial de redefinição de senha para:{' '}
                <strong>{resetTargetUser.nome}</strong> ({resetTargetUser.email}).
                O Supabase enviará um link seguro ao e-mail institucional do usuário.
              </div>

              {resetStatus.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  {resetStatus.error}
                </div>
              )}

              {resetStatus.success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetStatus.success}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg font-medium cursor-pointer"
                >
                  Fechar
                </button>
                {!resetStatus.success && (
                  <button
                    type="button"
                    disabled={resetStatus.loading}
                    onClick={handleExecuteResetPassword}
                    className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {resetStatus.loading ? 'Enviando link...' : 'Enviar Link de Redefinição'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR EXCLUSÃO */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-[#111827]">Excluir Usuário</h3>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                Tem certeza que deseja remover <strong>{userToDelete.nome}</strong>?
                Esta operação remove o perfil e revoga os acessos correspondentes.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2 text-xs text-[#374151] hover:bg-[#F3F4F6] rounded-lg font-medium border border-[#E5E7EB] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
