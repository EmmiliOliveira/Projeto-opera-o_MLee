import React from 'react';
import { LeaderProfile, Operation } from '../types';
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
  FileText
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
      {/* Cabeçalho Simples do Líder */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                PortoBalsa • Painel do Líder
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Turno: {currentLeader.defaultShift || 'Dia'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentLeader.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Matrícula: {currentLeader.registrationNumber} • Base: {currentLeader.basePort}
            </p>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
            <div className="text-center px-3">
              <span className="block text-xl font-bold text-blue-700">{pendingOrActiveOps.length}</span>
              <span className="text-[11px] text-slate-500">Na Fila</span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-xl font-bold text-emerald-700">{completedOps.length}</span>
              <span className="text-[11px] text-slate-500">Concluídas</span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-xl font-bold text-slate-800">{currentLeader.drivers.length}</span>
              <span className="text-[11px] text-slate-500">Motoristas</span>
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
          className="bg-white border border-slate-300 hover:border-blue-600 rounded-lg p-5 cursor-pointer transition-colors flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {pendingOrActiveOps.length} ativas
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Painel de Operações
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Fila de operações cadastradas. Inicie ou retome o cronômetro das frotas.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-blue-700 text-xs font-bold">
            <span>Acessar Fila</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* OPÇÃO 2: ADICIONAR NOVA OPERAÇÃO */}
        <div
          onClick={() => onNavigate('new')}
          className="bg-white border border-slate-300 hover:border-blue-600 rounded-lg p-5 cursor-pointer transition-colors flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Novo
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Adicionar Nova Operação
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Cadastre balsa, empurrador, turno, horários de atracação e motoristas.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-700 text-xs font-bold">
            <span>Cadastrar Manobra</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* OPÇÃO 3: CONTROLE DIÁRIO - KPIS */}
        <div
          onClick={() => onNavigate('daily')}
          className="bg-white border border-slate-300 hover:border-blue-600 rounded-lg p-5 cursor-pointer transition-colors flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <Table className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Planilha
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Controle Diário (KPIs)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Tabela diária com atracação, desatracação, frotas, prainha e ocorrências.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-800 text-xs font-bold">
            <span>Ver Tabela Diária</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* OPÇÃO 4: HISTÓRICO DE OPERAÇÕES */}
        <div
          onClick={() => onNavigate('history')}
          className="bg-white border border-slate-300 hover:border-blue-600 rounded-lg p-5 cursor-pointer transition-colors flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                {completedOps.length} salvas
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Consultar Histórico
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Histórico das operações com geração de PDF e Excel individual ou geral.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-indigo-700 text-xs font-bold">
            <span>Ver Histórico</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Rodapé da Equipe do Líder */}
      <div className="bg-white border border-slate-300 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase">
              Motoristas Cadastrados na Equipe:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentLeader.drivers.map((d) => (
              <span
                key={d.id}
                className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs border border-slate-200 font-medium"
              >
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
