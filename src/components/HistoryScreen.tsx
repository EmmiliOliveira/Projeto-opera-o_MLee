import React, { useState } from 'react';
import { Operation, LeaderProfile } from '../types';
import { formatDuration } from '../utils/storage';
import { exportOperationPdf } from '../utils/exportPdf';
import { exportOperationExcel, exportAllOperationsExcel } from '../utils/exportExcel';
import { OperationDetailModal } from './OperationDetailModal';
import { 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Ship, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Download, 
  Layers,
  ArrowUpDown,
  Eye,
  ArrowLeft
} from 'lucide-react';

interface HistoryScreenProps {
  currentLeader: LeaderProfile;
  operations: Operation[];
  onBackToMenu: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  currentLeader,
  operations,
  onBackToMenu,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EMBARQUE' | 'DESEMBARQUE'>('ALL');
  const [filterDays, setFilterDays] = useState<number>(30); // Default 30 days as requested in brief
  const [selectedOperationForModal, setSelectedOperationForModal] = useState<Operation | null>(null);

  // Filter completed operations
  const completedOps = operations.filter(op => {
    const isCompleted = op.status === 'CONCLUIDA';
    const matchesLeader = op.leaderId === currentLeader.id;
    const matchesType = filterType === 'ALL' || op.type === filterType;
    
    // Check 30 days window
    const opDate = new Date(op.date);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - opDate.getTime()) / (1000 * 3600 * 24));
    const matchesDays = filterDays === 0 || diffDays <= filterDays;

    const matchesSearch = 
      op.operationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.bargeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.date.includes(searchTerm);

    return isCompleted && matchesLeader && matchesType && matchesDays && matchesSearch;
  });

  const handleExportAll = () => {
    if (completedOps.length === 0) {
      alert('Nenhuma operação concluída para exportar.');
      return;
    }
    exportAllOperationsExcel(completedOps);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Histórico Operacional</span>
            <span>•</span>
            <span>Líder: {currentLeader.name}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            <span>Consultar Histórico de Operações (Últimos 30 dias)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consulte as operações concluídas pela sua equipe, emita relatórios em PDF ou baixe planilhas de dados em Excel.
          </p>
        </div>

        {/* Global Action: Export All */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportAll}
            className="px-3.5 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Exportar base consolidada com todas as operações finalizadas"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exportar Base Geral (Todas as Operações)</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por operação (ex: OP-76), balsa ou data..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 text-slate-900"
          />
        </div>

        {/* Type and Date window pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterType === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('EMBARQUE')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterType === 'EMBARQUE' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Embarque
            </button>
            <button
              onClick={() => setFilterType('DESEMBARQUE')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterType === 'DESEMBARQUE' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Desembarque
            </button>
          </div>

          <select
            value={filterDays}
            onChange={(e) => setFilterDays(Number(e.target.value))}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer"
          >
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={0}>Todo o período</option>
          </select>
        </div>
      </div>

      {/* Cards matching exact PDF layout with [PDF] on left and [GERAR TABELA DE DADOS] on right */}
      {completedOps.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhuma operação concluída encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Não há registros com os filtros selecionados. Conclua uma operação ativa na tela de cronometragem para visualizá-la aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {completedOps.map((op) => {
            const avgCycleTime = op.movements.length > 0
              ? Math.round(op.activeOperatingSeconds / op.movements.length)
              : 0;

            return (
              <div
                key={op.id}
                onClick={() => setSelectedOperationForModal(op)}
                className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Side: [PDF] Button + Operation Title Block */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded border border-slate-300 bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    <Ship className="w-5 h-5 text-blue-700" />
                  </div>

                  {/* Operation Title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                        {op.operationCode}
                      </span>
                      <span className="text-slate-500 font-normal text-xs">
                        • {op.date.split('-').reverse().slice(0, 2).join('/')} • {op.scheduledTime}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        op.type === 'EMBARQUE'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {op.type}
                      </span>
                    </div>

                    {/* Operational Details Summary */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-slate-600 mt-1">
                      <span className="font-medium text-slate-800">
                        Balsa: {op.bargeName}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>{op.movements.length}</strong> frotas
                      </span>
                      <span>•</span>
                      <span>
                        Tempo: <span className="font-mono font-semibold">{formatDuration(op.totalDurationSeconds)}</span>
                      </span>
                      <span>•</span>
                      <span>
                        Média/Frota: <span className="font-mono">{avgCycleTime > 0 ? formatDuration(avgCycleTime) : '--'}</span>
                      </span>
                      {op.pauses.length > 0 && (
                        <span>
                          • <span className="text-amber-800 font-medium">{op.pauses.length} pausa(s) ({formatDuration(op.pausedSeconds)})</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportOperationExcel(op);
                    }}
                    title="Baixar planilha Excel detalhada exclusivamente desta operação (frotas, tempos e pausas)"
                    className="px-3 py-1.5 rounded border border-emerald-700 bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel Desta Operação</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportOperationPdf(op);
                    }}
                    title="Baixar relatório em PDF desta operação"
                    className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOperationForModal(op);
                    }}
                    title="Ver detalhes da operação"
                    className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for inspection when clicking a card */}
      {selectedOperationForModal && (
        <OperationDetailModal
          operation={selectedOperationForModal}
          onClose={() => setSelectedOperationForModal(null)}
        />
      )}
    </div>
  );
};
