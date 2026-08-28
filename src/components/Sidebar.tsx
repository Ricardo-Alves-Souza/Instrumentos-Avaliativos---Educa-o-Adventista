import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  BookMarked,
  Link2,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { AdventistLogo } from './print/AdventistLogo';
import { useApp } from '../context/AppContext';

export type ActiveTab =
  | 'dashboard'
  | 'instrumentos'
  | 'gerar-instrumentos'
  | 'cadastros'
  | 'atribuicoes'
  | 'usuarios'
  | 'configuracoes';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const {
    currentUser,
    logout,
  } = useApp();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Administrador';
      case 'TI':
        return 'Suporte / TI';
      case 'COORDENADOR':
        return 'Coordenador Pedagógico';
      case 'PROFESSOR':
        return 'Docente / Professor';
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isProfessor = currentUser.role === 'PROFESSOR';

  return (
    <aside className="no-print w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-xs">
      {/* Top Header Logo */}
      <div>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F3F4F6]">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-xs shrink-0 p-1">
            <AdventistLogo size={32} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-[#0c3966] leading-tight truncate">
              Colégio Adventista
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
              Instrumentos
            </p>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-4 space-y-6">
          {/* TRABALHO Group */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280] mb-2">
              Trabalho
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#111827] text-white font-semibold shadow-xs'
                    : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#3B82F6]" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('instrumentos')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'instrumentos'
                    ? 'bg-[#111827] text-white font-semibold shadow-xs'
                    : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-[#3B82F6]" />
                <span>Instrumentos</span>
              </button>

              {/* Documentos PDF: only for Admin / Coordenador */}
              {!isProfessor && (
                <button
                  type="button"
                  onClick={() => onSelectTab('gerar-instrumentos')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'gerar-instrumentos'
                      ? 'bg-[#111827] text-white font-semibold shadow-xs'
                      : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#3B82F6]" />
                  <span>Documentos PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* GESTÃO Group - Admin / Coordenador only */}
          {!isProfessor && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280] mb-2">
                Gestão
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onSelectTab('cadastros')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'cadastros'
                      ? 'bg-[#111827] text-white font-semibold shadow-xs'
                      : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                  }`}
                >
                  <BookMarked className="w-4 h-4 text-[#3B82F6]" />
                  <span>Cadastros Gerais</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('atribuicoes')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'atribuicoes'
                      ? 'bg-[#111827] text-white font-semibold shadow-xs'
                      : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-[#3B82F6]" />
                  <span>Atribuições</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('usuarios')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'usuarios'
                      ? 'bg-[#111827] text-white font-semibold shadow-xs'
                      : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#3B82F6]" />
                  <span>Usuários</span>
                </button>
              </div>
            </div>
          )}

          {/* SISTEMA Group - Admin / Coordenador only */}
          {!isProfessor && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280] mb-2">
                Sistema
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onSelectTab('configuracoes')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'configuracoes'
                      ? 'bg-[#111827] text-white font-semibold shadow-xs'
                      : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#3B82F6]" />
                  <span>Configurações</span>
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User Footer Profile & Clean Logout */}
      <div className="p-3 border-t border-[#E5E7EB] bg-[#F9FAFB]/80">
        <div className="space-y-2">
          {/* User Info Card (Read-only representation of logged-in account) */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E5E7EB] shadow-2xs">
            <div
              className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                currentUser.role === 'SUPER_ADMIN'
                  ? 'bg-[#1E40AF] text-white'
                  : currentUser.role === 'COORDENADOR'
                  ? 'bg-[#0D9488] text-white'
                  : 'bg-[#111827] text-white'
              }`}
            >
              {getInitials(currentUser.nome)}
            </div>
            <div className="truncate flex-1 min-w-0">
              <p className="text-xs font-bold text-[#111827] truncate">
                {currentUser.nome}
              </p>
              <p className="text-[10px] text-[#6B7280] truncate font-medium">
                {getRoleLabel(currentUser.role)}
              </p>
            </div>
          </div>

          {/* Sair / Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[#6B7280] hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-red-200"
            title="Encerrar sessão no sistema"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
