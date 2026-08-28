import React, { useState, useEffect } from 'react';
import {
  Settings,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstrumentosLiberadosMap, SegmentoEscolar } from '../types';

interface SegmentControlConfig {
  id: SegmentoEscolar;
  label: string;
  badge: string;
  description: string;
}

const SEGMENTS: SegmentControlConfig[] = [
  {
    id: 'FUNDAMENTAL_1',
    label: 'Ensino Fundamental I',
    badge: '1º ao 5º Ano',
    description: 'Controla a criação e alteração de instrumentos nas turmas de 1º ao 5º Ano.',
  },
  {
    id: 'FUNDAMENTAL_2',
    label: 'Ensino Fundamental II',
    badge: '6º ao 9º Ano',
    description: 'Controla a criação e alteração de instrumentos nas turmas de 6º ao 9º Ano.',
  },
  {
    id: 'ENSINO_MEDIO',
    label: 'Ensino Médio',
    badge: '1ª à 3ª Série',
    description: 'Controla a criação e alteração de instrumentos nas turmas de 1ª à 3ª Série do EM.',
  },
];

export const ConfiguracoesView: React.FC = () => {
  const { systemSettings, updateSystemSettings, currentUser, resetAllData } = useApp();

  const [bimestre, setBimestre] = useState<number>(systemSettings.bimestreAtual);
  const [liberados, setLiberados] = useState<InstrumentosLiberadosMap>(() => {
    if (systemSettings.instrumentos_liberados && typeof systemSettings.instrumentos_liberados === 'object') {
      return {
        FUNDAMENTAL_1: systemSettings.instrumentos_liberados.FUNDAMENTAL_1 !== false,
        FUNDAMENTAL_2: systemSettings.instrumentos_liberados.FUNDAMENTAL_2 !== false,
        ENSINO_MEDIO: systemSettings.instrumentos_liberados.ENSINO_MEDIO !== false,
      };
    }
    const isGlobalLiberado = systemSettings.statusEdicao !== 'BLOQUEADO';
    return {
      FUNDAMENTAL_1: isGlobalLiberado,
      FUNDAMENTAL_2: isGlobalLiberado,
      ENSINO_MEDIO: isGlobalLiberado,
    };
  });

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Sync state if systemSettings changes externally
  useEffect(() => {
    setBimestre(systemSettings.bimestreAtual);
    if (systemSettings.instrumentos_liberados && typeof systemSettings.instrumentos_liberados === 'object') {
      setLiberados({
        FUNDAMENTAL_1: systemSettings.instrumentos_liberados.FUNDAMENTAL_1 !== false,
        FUNDAMENTAL_2: systemSettings.instrumentos_liberados.FUNDAMENTAL_2 !== false,
        ENSINO_MEDIO: systemSettings.instrumentos_liberados.ENSINO_MEDIO !== false,
      });
    }
  }, [systemSettings]);

  const isAuthorized =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'TI' ||
    currentUser.role === 'COORDENADOR';

  const handleToggleSegment = (segId: SegmentoEscolar, value: boolean) => {
    setLiberados((prev) => ({
      ...prev,
      [segId]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const isAnyLiberado = Object.values(liberados).some(Boolean);
      await updateSystemSettings({
        bimestreAtual: bimestre,
        statusEdicao: isAnyLiberado ? 'LIBERADO' : 'BLOQUEADO',
        instrumentos_liberados: liberados,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    setBimestre(3);
    setLiberados({
      FUNDAMENTAL_1: true,
      FUNDAMENTAL_2: true,
      ENSINO_MEDIO: true,
    });
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
              Apenas Coordenadores e Super Administradores têm permissão para alterar as configurações do sistema.
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
          Defina o período avaliativo vigente e o controle individual de permissão de instrumentos por segmento escolar.
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Configurações salvas e aplicadas com sucesso a todos os segmentos!
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
                      ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#1E40AF] font-bold shadow-xs ring-2 ring-[#3B82F6]/20'
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

        {/* Card 2: Status de Edição dos Instrumentos por Segmento */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Status de Edição dos Instrumentos por Segmento
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                Controle individualmente quais etapas de ensino estão autorizadas a cadastrar e editar instrumentos avaliativos. A coordenação e o Super Admin mantêm acesso irrestrito.
              </p>
            </div>
          </div>

          {/* 3 Linhas de Controle Individual por Segmento */}
          <div className="space-y-3 pt-1">
            {SEGMENTS.map((seg) => {
              const isLiberado = liberados[seg.id] !== false;

              return (
                <div
                  key={seg.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLiberado
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <GraduationCap className={`w-4 h-4 shrink-0 ${isLiberado ? 'text-emerald-700' : 'text-rose-600'}`} />
                        <h3 className="text-xs font-bold text-slate-900">
                          {seg.label}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {seg.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {seg.description}
                      </p>
                    </div>

                    {/* Right: Switch / Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleToggleSegment(seg.id, true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          isLiberado
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Liberado</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSegment(seg.id, false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          !isLiberado
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Bloqueado</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
            disabled={isSaving}
            className="bg-[#111827] hover:bg-[#1f2937] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
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
              Restaura as turmas completas, disciplinas na ordem acadêmica oficial, usuários e configurações padrão de segmentos liberados.
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
