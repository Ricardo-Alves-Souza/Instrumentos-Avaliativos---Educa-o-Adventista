import React from 'react';
import {
  X,
  Calendar,
  Layers,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  FileEdit,
  History,
  Unlock,
  Lock,
  AlertCircle,
  Building,
} from 'lucide-react';
import { InstrumentoAvaliativo, InstrumentoStatus } from '../types';
import { useApp } from '../context/AppContext';

interface InstrumentoDetailModalProps {
  isOpen: boolean;
  instrumento: InstrumentoAvaliativo | null;
  onClose: () => void;
  onEdit?: (inst: InstrumentoAvaliativo) => void;
  onApprove?: (id: string) => void;
  onOpenRejectModal?: (inst: InstrumentoAvaliativo) => void;
  onLiberar?: (id: string) => void;
  onBloquear?: (id: string) => void;
}

export const InstrumentoDetailModal: React.FC<InstrumentoDetailModalProps> = ({
  isOpen,
  instrumento,
  onClose,
  onEdit,
  onApprove,
  onOpenRejectModal,
  onLiberar,
  onBloquear,
}) => {
  const { currentUser, canEditInstrument, canApproveOrReject } = useApp();

  if (!isOpen || !instrumento) return null;

  const getStatusBadge = (status: InstrumentoStatus) => {
    switch (status) {
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Aprovado
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Enviado para Aprovação
          </span>
        );
      case 'REJEITADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejeitado
          </span>
        );
      case 'LIBERADO_MODIFICACAO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Unlock className="w-3.5 h-3.5 text-purple-600" />
            Liberado para Modificação
          </span>
        );
      case 'RASCUNHO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            Rascunho
          </span>
        );
    }
  };

  const isEditable = canEditInstrument(instrumento);
  const canManage = canApproveOrReject();

  return (
    <div className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {instrumento.codigoIdentificador}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {instrumento.tipoNome}
                </h3>
                {getStatusBadge(instrumento.status)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {instrumento.disciplinaNome} · {instrumento.bimestre}º Bimestre · Ano {instrumento.anoLetivo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Rejection Alert Banner if Rejected */}
          {instrumento.status === 'REJEITADO' && instrumento.motivoRejeicao && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800 mb-1">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                Parecer da Coordenação (Motivo da Rejeição)
              </div>
              <p className="text-xs text-rose-700 leading-relaxed pl-6">
                {instrumento.motivoRejeicao}
              </p>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Professor Responsável
              </span>
              <span className="font-semibold text-slate-800 text-xs">
                {instrumento.professorNome || 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Peso / Nota Máx.
              </span>
              <span className="font-bold text-blue-600 text-sm">
                {instrumento.peso?.toFixed(1) || '0.0'} pts
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Data Principal
              </span>
              <span className="font-semibold text-slate-800 text-xs">
                {instrumento.data || 'A definir'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Etapa / Bimestre
              </span>
              <span className="font-semibold text-slate-800 text-xs">
                {instrumento.bimestre}º Bimestre ({instrumento.anoLetivo})
              </span>
            </div>
          </div>

          {/* Multiple Turmas Delivery Dates */}
          {instrumento.turmas && instrumento.turmas.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" />
                Turmas Vinculadas e Datas de Entrega Individuais ({instrumento.turmas.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {instrumento.turmas.map((t) => (
                  <div
                    key={t.turmaId}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <span className="font-semibold text-slate-800">{t.turmaNome}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200 text-blue-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {t.data || instrumento.data}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conteúdo & Fonte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1.5 uppercase tracking-wider text-slate-500">
                Conteúdo Cobrado
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {instrumento.conteudo || 'Nenhum conteúdo especificado.'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1.5 uppercase tracking-wider text-slate-500">
                Fonte de Estudo / Material
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {instrumento.fonteEstudo || 'Nenhuma fonte de estudo especificada.'}
              </p>
            </div>
          </div>

          {/* Desenvolvimento Pedagógico */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs mb-1.5 uppercase tracking-wider text-slate-500">
              Desenvolvimento Pedagógico da Atividade
            </h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {instrumento.desenvolvimento || 'Nenhum desenvolvimento especificado.'}
            </p>
          </div>

          {/* Critérios Avaliativos */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Critérios Avaliativos
              </h4>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Soma: {instrumento.criterios?.reduce((acc, c) => acc + (c.valor || 0), 0).toFixed(2)} pts
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {instrumento.criterios && instrumento.criterios.length > 0 ? (
                instrumento.criterios.map((crit, idx) => (
                  <div key={crit.id || idx} className="py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-700 flex-1 leading-relaxed">
                      {crit.descricao}
                    </span>
                    <span className="font-bold text-blue-700 font-mono shrink-0 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {crit.valor?.toFixed(2)} pts
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic py-2">Nenhum critério cadastrado.</p>
              )}
            </div>
          </div>

          {/* BNCC Skills */}
          {instrumento.habilidades && instrumento.habilidades.length > 0 && (
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
              <h4 className="font-bold text-purple-900 text-xs mb-2.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Matriz de Habilidades (BNCC / Curricular)
              </h4>
              <div className="space-y-2">
                {instrumento.habilidades.map((hab) => (
                  <div key={hab.id} className="bg-white p-2.5 rounded-lg border border-purple-100">
                    <span className="font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px] mr-2">
                      {hab.codigo}
                    </span>
                    <span className="text-slate-700">{hab.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status & Audit History */}
          {instrumento.historico && instrumento.historico.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-600" />
                Histórico de Tramitação e Auditoria
              </h4>
              <div className="space-y-2">
                {instrumento.historico.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 text-[11px] p-2 bg-white rounded-lg border border-slate-200"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{h.usuarioNome}</span>
                        <span className="text-slate-400">({h.usuarioRole})</span>
                        <span className="font-semibold text-blue-600 uppercase text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
                          {h.status}
                        </span>
                      </div>
                      {h.motivo && <p className="text-slate-600 mt-1 italic">"{h.motivo}"</p>}
                    </div>
                    <span className="text-slate-400 font-mono shrink-0">{h.data}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Actions for Coordenação / Super Admin */}
            {canManage && instrumento.status === 'ENVIADO' && (
              <>
                {onOpenRejectModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRejectModal(instrumento);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeitar com Parecer
                  </button>
                )}
                {onApprove && (
                  <button
                    type="button"
                    onClick={() => {
                      onApprove(instrumento.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprovar Instrumento
                  </button>
                )}
              </>
            )}

            {canManage && instrumento.status === 'APROVADO' && onLiberar && (
              <button
                type="button"
                onClick={() => {
                  onLiberar(instrumento.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                Liberar p/ Edição
              </button>
            )}

            {canManage && instrumento.status === 'LIBERADO_MODIFICACAO' && (onBloquear || onApprove) && (
              <button
                type="button"
                onClick={() => {
                  if (onBloquear) {
                    onBloquear(instrumento.id);
                  } else if (onApprove) {
                    onApprove(instrumento.id);
                  }
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Bloquear Edição
              </button>
            )}

            {/* Actions for Professor / Editors */}
            {isEditable && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(instrumento);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <FileEdit className="w-4 h-4" />
                Editar Instrumento
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
