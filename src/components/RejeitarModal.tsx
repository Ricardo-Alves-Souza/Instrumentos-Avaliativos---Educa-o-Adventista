import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { InstrumentoAvaliativo } from '../types';

interface RejeitarModalProps {
  isOpen: boolean;
  instrumento: InstrumentoAvaliativo | null;
  onClose: () => void;
  onConfirm: (id: string, motivo: string) => void;
}

export const RejeitarModal: React.FC<RejeitarModalProps> = ({
  isOpen,
  instrumento,
  onClose,
  onConfirm,
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !instrumento) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setError('Por favor, informe a justificativa/motivo da rejeição para orientar o professor.');
      return;
    }
    onConfirm(instrumento.id, motivo.trim());
    setMotivo('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-red-200">
        <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold">Rejeitar Instrumento Avaliativo</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-400 hover:text-red-700 p-1 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-700 leading-relaxed mb-2">
              Você está rejeitando o instrumento <strong>{instrumento.codigoIdentificador} – {instrumento.tipoNome}</strong> da disciplina <strong>{instrumento.disciplinaNome}</strong> ({instrumento.turmaNome}).
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              O status retornará para <span className="font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Rejeitado</span> e o docente responsável (<strong>{instrumento.professorNome}</strong>) poderá visualizar seu parecer e realizar as alterações necessárias.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Justificativa / Motivo da Rejeição *
            </label>
            <textarea
              required
              rows={4}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Descreva detalhadamente o que precisa ser ajustado (ex: critérios avaliativos, descrição do desenvolvimento, datas, etc.)..."
              className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none leading-relaxed"
            />
            {error && <p className="text-[11px] text-red-600 font-medium mt-1">{error}</p>}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Confirmar Rejeição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
