import React, { useState } from 'react';
import {
  Settings,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConfiguracoesView: React.FC = () => {
  const { systemSettings, updateSystemSettings, currentUser, resetAllData } = useApp();
  const [bimestre, setBimestre] = useState<number>(systemSettings.bimestreAtual);
  const [statusEdicao, setStatusEdicao] = useState<'LIBERADO' | 'BLOQUEADO'>(
    systemSettings.statusEdicao
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const isAuthorized = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COORDENADOR';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      bimestreAtual: bimestre,
      statusEdicao,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    setBimestre(3);
    setStatusEdicao('LIBERADO');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!isAuthorized) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">Acesso Restrito</h3>
            <p className="text-xs text-amber-700 mt-1">
              Apenas Coordenadores e Super Administradores têm permissão para alterar as configurações globais do sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
            Administração do Sistema
          </span>
        </div>
        <h1 className="text-xl font-bold text-[#111827] tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#3B82F6]" />
          Configurações Gerais
        </h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Defina o período avaliativo vigente e o controle de permissão para criação e edição de instrumentos pelos professores.
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Configurações salvas e aplicadas a todo o sistema com sucesso!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Bimestre Atual */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Bimestre Atual Aberto
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                Define o período avaliativo ativo na instituição. Professores criarão instrumentos obrigatoriamente vinculados a este bimestre.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[1, 2, 3, 4].map((b) => {
              const isSelected = bimestre === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBimestre(b)}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#1E40AF] font-bold shadow-xs'
                      : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:border-[#D1D5DB] font-medium'
                  }`}
                >
                  <span className="block text-sm">{b}º Bimestre</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">
                    {isSelected ? '● Ativo no momento' : 'Selecionar'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Bloqueio de Instrumentos */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              statusEdicao === 'LIBERADO' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FEF2F2] text-[#EF4444]'
            }`}>
              {statusEdicao === 'LIBERADO' ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Status de Edição dos Instrumentos (Professores)
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                Controla se os professores podem cadastrar novos instrumentos ou alterar os existentes. A coordenação e o Super Admin mantêm acesso permanente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => setStatusEdicao('LIBERADO')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                statusEdicao === 'LIBERADO'
                  ? 'border-[#10B981] bg-[#ECFDF5]/60 text-[#065F46] ring-2 ring-[#10B981]/20'
                  : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Unlock className="w-4 h-4 text-[#10B981]" />
                  LIBERADO
                </span>
                {statusEdicao === 'LIBERADO' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                )}
              </div>
              <p className="text-[11px] text-[#4B5563] leading-relaxed">
                Professores podem criar novos instrumentos avaliativos e editar os existentes dentro de suas disciplinas e turmas atribuídas.
              </p>
            </div>

            <div
              onClick={() => setStatusEdicao('BLOQUEADO')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                statusEdicao === 'BLOQUEADO'
                  ? 'border-[#EF4444] bg-[#FEF2F2]/60 text-[#991B1B] ring-2 ring-[#EF4444]/20'
                  : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#EF4444]" />
                  BLOQUEADO
                </span>
                {statusEdicao === 'BLOQUEADO' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                )}
              </div>
              <p className="text-[11px] text-[#4B5563] leading-relaxed">
                Professores ficam impossibilitados de cadastrar ou alterar instrumentos. O sistema rejeita alterações no backend e na interface.
              </p>
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
            <span>Ano Letivo Vigente: <strong>{new Date().getFullYear()}</strong> (automático)</span>
          </div>

          <button
            type="submit"
            className="bg-[#111827] hover:bg-[#1f2937] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Salvar Configurações
          </button>
        </div>
      </form>

      {/* System Restore / Reset Section for QA */}
      <div className="pt-6 border-t border-[#E5E7EB]">
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-[#6B7280]" />
              Restaurar Dados Originais do Sistema
            </h3>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              Restaura as 45 turmas completas, as 23 disciplinas na ordem acadêmica oficial, usuários e atribuições iniciais.
            </p>
          </div>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Confirmar Restauração
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] px-3 py-2 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB] bg-white px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Restaurar Padrões
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
