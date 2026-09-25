import React from 'react';
import { LeaderProfile, Operation } from '../types';
import { TBLLogo } from './TBLLogo';
import { 
  Clock, 
  PlusCircle, 
  FileSpreadsheet, 
  Truck, 
  ArrowRight, 
  Play, 
  Ship, 
  Table, 
  CheckCircle,
  FileText,
  Anchor
} from 'lucide-react';

interface MainMenuScreenProps {
  currentLeader: LeaderProfile;
  operations: Operation[];
  onNavigate: (screen: 'pending' | 'new' | 'history' | 'daily') => void;
  onQuickStartOperation: (op: Operation) => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  currentLeader,
  operations,
  onNavigate,
  onQuickStartOperation,
}) => {
  const leaderOps = operations.filter(o => o.leaderId === currentLeader.id);
  const pendingOrActiveOps = leaderOps.filter(
    o => o.status === 'AGUARDANDO_INICIO' || o.status === 'EM_ANDAMENTO' || o.status === 'PAUSADA'
  );
  const completedOps = leaderOps.filter(o => o.status === 'CONCLUIDA');
  const activeNow = leaderOps.find(o => o.status === 'EM_ANDAMENTO');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
      {/* Cabeçalho Corporativo TBL do Líder */}
      <div className="bg-white border border-sky-100 rounded-2xl p-5 sm:p-6 mb-6 shadow-md shadow-sky-950/5 relative overflow-hidden">
        {/* Subtle Water Ripples background decoration */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-sky-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#004b87]">
                TBL Fluvial • Painel Operacional
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
                Turno: {currentLeader.defaultShift || 'Dia'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Base: {currentLeader.basePort}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentLeader.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Matrícula Operacional: <span className="font-semibold text-slate-700">{currentLeader.registrationNumber}</span>
              {currentLeader.defaultBarge && (
                <span> • Balsa: <strong className="text-slate-700">{currentLeader.defaultBarge}</strong></span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-sky-100 pt-3 md:pt-0 md:pl-6">
            <div className="text-center px-3">
              <span className="block text-2xl font-black text-[#0284c7]">{pendingOrActiveOps.length}</span>
              <span className="text-[11px] font-medium text-slate-500">Na Fila</span>
            </div>
            <div className="text-center px-3 border-l border-sky-100">
              <span className="block text-2xl font-black text-emerald-600">{completedOps.length}</span>
              <span className="text-[11px] font-medium text-slate-500">Concluídas</span>
            </div>
            <div className="text-center px-3 border-l border-sky-100">
              <span className="block text-2xl font-black text-slate-700">{currentLeader.drivers.length}</span>
              <span className="text-[11px] font-medium text-slate-500">Motoristas</span>
            </div>
          </div>
        </div>

        {/* Alerta de Operação em Andamento */}
        {activeNow && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span><strong>Operação em execução:</strong> {activeNow.operationCode} ({activeNow.bargeName})</span>
            </div>
            <button
              onClick={() => onQuickStartOperation(activeNow)}
              className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Abrir Cronômetro</span>
            </button>
          </div>
        )}
      </div>

      {/* Menu Principal Padrão com as Opções da Cascata */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* OPÇÃO 1: PAINEL DE OPERAÇÕES */}
        <div
          onClick={() => onNavigate('pending')}
          className="bg-white border border-sky-100 hover:border-[#0284c7] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-sky-950/5 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#003865] to-[#0284c7] text-white flex items-center justify-center font-bold shadow-sm shadow-sky-900/20 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5 text-sky-200" />
              </div>
              <span className="text-xs font-bold text-[#004b87] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                {pendingOrActiveOps.length} ativas
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 group-hover:text-[#004b87] transition-colors">
              Painel de Operações
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Fila de operações cadastradas. Inicie ou retome a cronometragem por frota e motorista.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[#0284c7] text-xs font-bold group-hover:translate-x-0.5 transition-transform">
            <span>Acessar Fila</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* OPÇÃO 2: ADICIONAR NOVA OPERAÇÃO */}
        <div
          onClick={() => onNavigate('new')}
          className="bg-white border border-emerald-100 hover:border-emerald-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-950/5 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#166534] to-[#22c55e] text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-900/20 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Novo Ciclo
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
              Adicionar Nova Operação
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cadastre balsa, empurrador, turno, horário de atracação e motoristas operacionais.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-700 text-xs font-bold group-hover:translate-x-0.5 transition-transform">
            <span>Cadastrar Manobra</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* OPÇÃO 3: CONTROLE DIÁRIO - KPIS */}
        <div
          onClick={() => onNavigate('daily')}
          className="bg-white border border-sky-100 hover:border-[#004b87] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-sky-950/5 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#002f5e] to-[#004b87] text-white flex items-center justify-center font-bold shadow-sm shadow-slate-900/20 group-hover:scale-105 transition-transform">
                <Table className="w-5 h-5 text-sky-200" />
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                Planilha Oficial
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 group-hover:text-[#004b87] transition-colors">
              Controle Diário (KPIs)
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tabela oficial com atracação, desatracação, frotas, prainha e ocorrências.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[#004b87] text-xs font-bold group-hover:translate-x-0.5 transition-transform">
            <span>Ver Tabela Diária</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* OPÇÃO 4: HISTÓRICO DE OPERAÇÕES */}
        <div
          onClick={() => onNavigate('history')}
          className="bg-white border border-sky-100 hover:border-[#0284c7] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-sky-950/5 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0369a1] to-[#0ea5e9] text-white flex items-center justify-center font-bold shadow-sm shadow-cyan-900/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5 text-cyan-100" />
              </div>
              <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                {completedOps.length} concluídas
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 group-hover:text-[#0284c7] transition-colors">
              Consultar Histórico
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Histórico com geração de PDF e relatórios Excel individualizados por operação.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[#0284c7] text-xs font-bold group-hover:translate-x-0.5 transition-transform">
            <span>Ver Histórico</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Rodapé da Equipe do Líder com Identidade TBL */}
      <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#004b87] flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#0284c7]" />
            Equipe Operacional Vinculada ao Líder
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentLeader.drivers.length} motorista{currentLeader.drivers.length !== 1 ? 's' : ''} e {currentLeader.teamMembers.length} integrantes de apoio registrados
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {currentLeader.drivers.slice(0, 4).map(drv => (
            <span key={drv.id} className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/60 text-xs font-medium text-[#004b87]">
              {drv.name}
            </span>
          ))}
          {currentLeader.drivers.length > 4 && (
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs text-slate-600">
              +{currentLeader.drivers.length - 4} mais
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

