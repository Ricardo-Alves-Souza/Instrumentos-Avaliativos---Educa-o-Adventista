import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InstrumentosListView } from './components/InstrumentosListView';
import { DocumentosPDFView } from './components/DocumentosPDFView';
import { CadastrosView } from './components/CadastrosView';
import { AtribuicoesView } from './components/AtribuicoesView';
import { UsuariosView } from './components/UsuariosView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { CreateInstrumentoModal } from './components/CreateInstrumentoModal';
import { PrintDocument } from './components/print/PrintDocument';
import { LoginView } from './components/LoginView';
import { InstrumentoAvaliativo } from './types';
import { AdventistLogo } from './components/print/AdventistLogo';

function MainAppContent() {
  const {
    turmas,
    disciplinas,
    instrumentos,
    addInstrumento,
    updateInstrumento,
    currentUser,
    isAuthenticated,
    authLoading,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstrumento, setEditingInstrumento] = useState<InstrumentoAvaliativo | null>(null);
  const [modalDefaultTurmaId, setModalDefaultTurmaId] = useState<string | undefined>();
  const [modalDefaultDisciplinaId, setModalDefaultDisciplinaId] = useState<string | undefined>();

  // Route security: If user is PROFESSOR, block access to administrative tabs
  useEffect(() => {
    if (currentUser.role === 'PROFESSOR' && !['dashboard', 'instrumentos'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser.role, activeTab]);

  // Standalone print route handling
  const [isStandalonePrintRoute, setIsStandalonePrintRoute] = useState(false);
  const [routeIncludeSkills, setRouteIncludeSkills] = useState(false);
  const [routeTurmaId, setRouteTurmaId] = useState('turma-4a-m');
  const [routeBimestre, setRouteBimestre] = useState(3);

  // Cross-navigation state
  const [targetPdfTurmaId, setTargetPdfTurmaId] = useState<string | undefined>();
  const [targetPdfBimestre, setTargetPdfBimestre] = useState<number | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const skillsParam = params.get('skills');
    const turmaParam = params.get('turma');
    const bimParam = params.get('bimestre');

    if (mode === 'print' || window.location.pathname.startsWith('/print')) {
      setIsStandalonePrintRoute(true);
      if (skillsParam === 'true') setRouteIncludeSkills(true);
      if (turmaParam) setRouteTurmaId(turmaParam);
      if (bimParam) setRouteBimestre(Number(bimParam));
    }
  }, []);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#E5E7EB] text-center max-w-sm w-full space-y-4">
          <div className="flex justify-center">
            <AdventistLogo size={60} />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#111827]">Colégio Adventista</h2>
            <p className="text-[11px] text-[#6B7280]">Inicializando conexão com o Supabase...</p>
          </div>
          <div className="w-8 h-8 border-3 border-[#0c3966] border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>
        </div>
      </div>
    );
  }

  // Not authenticated: render real Supabase Login screen
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleOpenCreateModal = (defaultTurma?: string, defaultDisc?: string) => {
    setEditingInstrumento(null);
    setModalDefaultTurmaId(defaultTurma);
    setModalDefaultDisciplinaId(defaultDisc);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inst: InstrumentoAvaliativo) => {
    setEditingInstrumento(inst);
    setIsModalOpen(true);
  };

  const handleSaveModal = (inst: InstrumentoAvaliativo) => {
    if (editingInstrumento) {
      updateInstrumento(inst);
    } else {
      addInstrumento(inst);
    }
  };

  const handleNavigateToDocumentos = (turmaId: string, bimestre: number) => {
    if (currentUser.role === 'PROFESSOR') return;
    setTargetPdfTurmaId(turmaId);
    setTargetPdfBimestre(bimestre);
    setActiveTab('gerar-instrumentos');
  };

  // If in dedicated standalone print route /print/...
  if (isStandalonePrintRoute) {
    const turma = turmas.find((t) => t.id === routeTurmaId) || turmas[0];
    const filteredInsts = instrumentos.filter(
      (i) => i.turmaId === routeTurmaId && i.bimestre === routeBimestre
    );

    return (
      <div className="min-h-screen bg-white p-6">
        <div className="no-print mb-4 p-4 bg-slate-100 rounded-xl flex items-center justify-between border border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Página de Impressão Oficial
            </h2>
            <p className="text-xs text-slate-500">
              {routeIncludeSkills ? 'Versão Professores (+ Habilidades)' : 'Versão Pais (Sem Habilidades)'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-[#111827] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              Imprimir
            </button>
            <button
              type="button"
              onClick={() => setIsStandalonePrintRoute(false)}
              className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer"
            >
              Voltar ao Sistema
            </button>
          </div>
        </div>

        <PrintDocument
          turmaNome={turma?.nome || 'Turma'}
          bimestre={routeBimestre}
          anoLetivo={turma?.anoLetivo || new Date().getFullYear()}
          instrumentos={filteredInsts}
          disciplinas={disciplinas}
          includeSkills={routeIncludeSkills}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] text-[#1A1A1A] antialiased selection:bg-[#EFF6FF] selection:text-[#1E40AF]">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Workspace Content Router */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateToDocumentos={handleNavigateToDocumentos}
              onOpenCreateModal={handleOpenCreateModal}
              onOpenEditModal={handleOpenEditModal}
            />
          )}

          {activeTab === 'instrumentos' && (
            <InstrumentosListView
              onOpenCreateModal={() => handleOpenCreateModal()}
              onOpenEditModal={handleOpenEditModal}
            />
          )}

          {activeTab === 'gerar-instrumentos' && currentUser.role !== 'PROFESSOR' && (
            <DocumentosPDFView
              initialTurmaId={targetPdfTurmaId}
              initialBimestre={targetPdfBimestre}
            />
          )}

          {activeTab === 'cadastros' && currentUser.role !== 'PROFESSOR' && <CadastrosView />}

          {activeTab === 'atribuicoes' && currentUser.role !== 'PROFESSOR' && <AtribuicoesView />}

          {activeTab === 'usuarios' && currentUser.role !== 'PROFESSOR' && <UsuariosView />}

          {activeTab === 'configuracoes' && currentUser.role !== 'PROFESSOR' && <ConfiguracoesView />}
        </main>
      </div>

      {/* Creation & Edition Modal */}
      <CreateInstrumentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialInstrumento={editingInstrumento}
        defaultTurmaId={modalDefaultTurmaId}
        defaultDisciplinaId={modalDefaultDisciplinaId}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
