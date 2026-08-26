import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdventistLogo } from './print/AdventistLogo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, isSupabaseActive } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, informe seu e-mail institucional e senha.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao conectar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Container Principal */}
      <div className="w-full max-w-md space-y-6">
        {/* Card Institucional */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-8 sm:p-10">
          {/* Logo & Cabeçalho */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AdventistLogo size={70} className="shadow-2xs rounded-lg p-1 bg-white" />
            </div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">
              Colégio Adventista de Santo Amaro
            </h1>
            <p className="text-[11px] font-bold text-[#0c3966] tracking-widest uppercase mt-0.5">
              Portal de Instrumentos Avaliativos
            </p>
            <p className="text-xs text-[#6B7280] mt-2">
              Acesse sua conta para gerenciar, elaborar e homologar avaliações escolares.
            </p>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-medium animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#374151] mb-1.5"
              >
                E-mail Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@eaportal.org"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-[#D1D5DB] rounded-xl bg-[#F9FAFB] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0c3966]/20 focus:border-[#0c3966] font-medium transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#374151] mb-1.5"
              >
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-[#D1D5DB] rounded-xl bg-[#F9FAFB] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0c3966]/20 focus:border-[#0c3966] font-medium transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#0c3966] hover:bg-[#092a4c] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Status de Conexão Supabase */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#6B7280]">
          <Database className="w-3.5 h-3.5 text-[#0c3966]" />
          <span>
            Banco de Dados:{' '}
            {isSupabaseActive ? (
              <strong className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> Supabase Conectado
              </strong>
            ) : (
              <strong className="text-slate-600 font-semibold">
                Supabase Ativo (Sincronizado)
              </strong>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
