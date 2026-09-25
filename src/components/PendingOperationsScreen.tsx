import React, { useState } from 'react';
import { Operation, LeaderProfile } from '../types';
import { deleteOperation } from '../utils/storage';
import { 
  Clock, 
  Play, 
  Trash2, 
  PlusCircle, 
  ArrowRight, 
  Ship, 
  Truck, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Layers
} from 'lucide-react';

interface PendingOperationsScreenProps {
  currentLeader: LeaderProfile;
  operations: Operation[];
  onStartOrResumeOperation: (operation: Operation) => void;
  onNavigateNew: () => void;
  onBackToMenu: () => void;
  onRefreshOperations: () => void;
}

export const PendingOperationsScreen: React.FC<PendingOperationsScreenProps> = ({
  currentLeader,
  operations,
  onStartOrResumeOperation,
  onNavigateNew,
  onBackToMenu,
  onRefreshOperations,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EMBARQUE' | 'DESEMBARQUE'>('ALL');

  // Filter operations: only pending, paused, or in-progress for this leader
  const pendingOps = operations.filter(op => {
    const isStatusPending = op.status === 'AGUARDANDO_INICIO' || op.status === 'EM_ANDAMENTO' || op.status === 'PAUSADA';
    const matchesLeader = op.leaderId === currentLeader.id;
    const matchesType = filterType === 'ALL' || op.type === filterType;
    const matchesSearch = 
      op.operationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.bargeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.date.includes(searchTerm);
    return isStatusPending && matchesLeader && matchesType && matchesSearch;
  });

  const handleDelete = (e: React.MouseEvent, op: Operation) => {
    e.stopPropagation();
    if (window.confirm(`Deseja realmente apagar o registro de "${op.operationCode}" (${op.bargeName})?`)) {
      deleteOperation(op.id);
      onRefreshOperations();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Fila Operacional</span>
            <span>•</span>
            <span>Líder: {currentLeader.name}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-amber-500" />
            <span>Operações em Aguardo de Início ou Continuação</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Clique na seta azul ou no card para abrir o cronômetro e registrar manobras simultâneas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateNew}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Operação</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ex: OP-76), balsa ou data..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({operations.filter(o => o.leaderId === currentLeader.id && o.status !== 'CONCLUIDA').length})
          </button>
          <button
            onClick={() => setFilterType('EMBARQUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'EMBARQUE'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Embarque
          </button>
          <button
            onClick={() => setFilterType('DESEMBARQUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'DESEMBARQUE'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Desembarque
          </button>
        </div>
      </div>

      {/* Operations List / Cards matching the exact PDF cascata */}
      {pendingOps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhuma operação pendente encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Todas as operações planejadas já foram concluídas ou você ainda não cadastrou novas operações para esta balsa.
          </p>
          <button
            onClick={onNavigateNew}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Nova Operação Agora
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {pendingOps.map((op) => {
            const isRunning = op.status === 'EM_ANDAMENTO';
            const isPaused = op.status === 'PAUSADA';

            return (
              <div
                key={op.id}
                onClick={() => onStartOrResumeOperation(op)}
                className={`group relative bg-white rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-4 ${
                  isRunning
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : isPaused
                    ? 'border-amber-400 bg-amber-50/20'
                    : 'border-slate-200 hover:border-blue-500'
                }`}
              >
                {/* Left Side: Delete [X] + Status Badge + Operation Name & Data */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Red X Button (Apagar conforme diagrama) */}
                  <button
                    onClick={(e) => handleDelete(e, op)}
                    title="Excluir operação"
                    className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-600 text-red-500 hover:text-white border border-red-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Status Indicator Badge */}
                  <div className="shrink-0">
                    {isRunning ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                        EM ANDAMENTO
                      </span>
                    ) : isPaused ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        PAUSADA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        AGUARDANDO INÍCIO
                      </span>
                    )}
                  </div>

                  {/* Operation Info Title (as in PDF: OPERAÇÃO 76 - [23/09] - 9:00 - EMBARQUE) */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-900">
                        {op.operationCode}
                      </span>
                      <span className="text-slate-400 font-normal text-xs sm:text-sm">
                        - [{op.date.split('-').reverse().slice(0, 2).join('/')}] - {op.scheduledTime} -
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        op.type === 'EMBARQUE' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {op.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Ship className="w-3.5 h-3.5 text-blue-600" />
                        {op.bargeName}
                      </span>
                      <span>•</span>
                      <span>Meta: {op.plannedCargosCount} cargas ({op.movements.length} feitas)</span>
                      <span>•</span>
                      <span>Est.: {op.estimatedTimeMinutes} min</span>
                      {op.hasCriticalCargos && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> Cargas Críticas (Sem borda)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Button [->] / Iniciar Operação */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onStartOrResumeOperation(op)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow cursor-pointer ${
                      isRunning
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {isRunning ? 'Continuar' : 'Iniciar'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
