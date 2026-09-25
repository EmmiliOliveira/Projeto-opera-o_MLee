import React, { useState } from 'react';
import { Operation, LeaderProfile, ShiftType } from '../types';
import { saveSingleOperation } from '../utils/storage';
import { exportAllOperationsExcel } from '../utils/exportExcel';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  ArrowLeft, 
  Ship, 
  AlertCircle,
  Clock,
  Sparkles,
  Calendar
} from 'lucide-react';

interface DailyControlTableScreenProps {
  currentLeader: LeaderProfile;
  operations: Operation[];
  onBackToMenu: () => void;
  onRefresh: () => void;
}

export const DailyControlTableScreen: React.FC<DailyControlTableScreenProps> = ({
  currentLeader,
  operations,
  onBackToMenu,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<'ALL' | 'Dia' | 'Noite'>('ALL');
  const [editingOpId, setEditingOpId] = useState<string | null>(null);

  // Edit quick state
  const [editFormData, setEditFormData] = useState<Partial<Operation>>({});

  const filteredOps = operations.filter(op => {
    const matchesShift = filterShift === 'ALL' || op.shift === filterShift;
    const matchesSearch = 
      op.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.operationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.tugboat && op.tugboat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      op.date.includes(searchTerm);
    return matchesShift && matchesSearch;
  });

  const handleStartEdit = (op: Operation) => {
    setEditingOpId(op.id);
    setEditFormData({
      dockingTime: op.dockingTime,
      undockingTime: op.undockingTime,
      embarkedCount: op.embarkedCount,
      disembarkedCount: op.disembarkedCount,
      inspectionsCount: op.inspectionsCount,
      waitingPrainhaCount: op.waitingPrainhaCount,
      teamAbsencesCount: op.teamAbsencesCount,
      teamAbsencesNote: op.teamAbsencesNote,
      incidentNotes: op.incidentNotes,
      closedListBefore: op.closedListBefore,
      hadOperation: op.hadOperation,
      hadDirection: op.hadDirection,
      tugboat: op.tugboat,
    });
  };

  const handleSaveEdit = (op: Operation) => {
    const updated: Operation = {
      ...op,
      ...editFormData,
      updatedAt: new Date().toISOString(),
    };
    saveSingleOperation(updated);
    setEditingOpId(null);
    onRefresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onBackToMenu}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Menu Principal</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
            <span>Gestão Operacional de Turno</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            <span>Controle Diário — KPIs | Equipes Dia e Noite</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Espelho digital interativo da planilha operacional oficial. Acompanhe atracação, desatracação, frotas, vistorias e ocorrências.
          </p>
        </div>

        {/* Global Action: Baixar Planilha Oficial */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportAllOperationsExcel(operations)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Planilha Oficial (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por data, equipe (Willison, Samuel...), empurrador ou operação..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setFilterShift('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterShift === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos os Turnos ({operations.length})
          </button>
          <button
            onClick={() => setFilterShift('Dia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterShift === 'Dia' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ☀️ Dia
          </button>
          <button
            onClick={() => setFilterShift('Noite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterShift === 'Noite' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🌙 Noite
          </button>
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-900 text-white sticky top-0 z-20 text-[10px] uppercase tracking-wider font-extrabold">
              <tr>
                <th className="p-3 border-r border-slate-800">Data</th>
                <th className="p-3 border-r border-slate-800">Turno</th>
                <th className="p-3 border-r border-slate-800">Equipe</th>
                <th className="p-3 border-r border-slate-800">Operação</th>
                <th className="p-3 border-r border-slate-800">Empurrador</th>
                <th className="p-3 border-r border-slate-800">Atracação</th>
                <th className="p-3 border-r border-slate-800">Início</th>
                <th className="p-3 border-r border-slate-800">Fim</th>
                <th className="p-3 border-r border-slate-800">Desatracação</th>
                <th className="p-3 border-r border-slate-800 text-center">Frotas Embarc.</th>
                <th className="p-3 border-r border-slate-800 text-center">Frotas Desemb.</th>
                <th className="p-3 border-r border-slate-800 text-center">Vistorias</th>
                <th className="p-3 border-r border-slate-800 text-center">Prainha</th>
                <th className="p-3 border-r border-slate-800 text-center">Lista Fechada?</th>
                <th className="p-3 border-r border-slate-800 text-center">Ausências</th>
                <th className="p-3 border-r border-slate-800">Observações / Placas</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredOps.map((op, idx) => {
                const isEditing = editingOpId === op.id;
                const isNight = op.shift === 'Noite';

                const startStr = op.actualStartTime 
                  ? (op.actualStartTime.includes('T') ? new Date(op.actualStartTime).toLocaleTimeString('pt-BR') : op.actualStartTime)
                  : op.scheduledTime;

                const endStr = op.actualEndTime
                  ? (op.actualEndTime.includes('T') ? new Date(op.actualEndTime).toLocaleTimeString('pt-BR') : op.actualEndTime)
                  : '--:--';

                return (
                  <tr
                    key={op.id}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900 border-r border-slate-200 font-mono">
                      {op.date}
                    </td>

                    <td className="p-3 border-r border-slate-200">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isNight ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {op.shift || 'Dia'}
                      </span>
                    </td>

                    <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                      {op.leaderName.split(' ')[0]}
                    </td>

                    <td className="p-3 font-bold text-blue-900 border-r border-slate-200 font-mono">
                      {op.operationCode}
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-700 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.tugboat || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, tugboat: e.target.value })}
                          className="px-2 py-1 text-xs border rounded bg-white w-20"
                        />
                      ) : (
                        op.tugboat || '82'
                      )}
                    </td>

                    <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.dockingTime || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, dockingTime: e.target.value })}
                          className="px-1.5 py-0.5 text-xs border rounded w-20 font-mono"
                        />
                      ) : (
                        op.dockingTime || '--:--'
                      )}
                    </td>

                    <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                      {startStr}
                    </td>

                    <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                      {endStr}
                    </td>

                    <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.undockingTime || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, undockingTime: e.target.value })}
                          className="px-1.5 py-0.5 text-xs border rounded w-20 font-mono"
                        />
                      ) : (
                        op.undockingTime || '--:--'
                      )}
                    </td>

                    <td className="p-3 font-mono font-bold text-center border-r border-slate-200 text-blue-800">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.embarkedCount ?? 0}
                          onChange={(e) => setEditFormData({ ...editFormData, embarkedCount: Number(e.target.value) })}
                          className="px-1 py-0.5 text-xs border rounded w-14 text-center"
                        />
                      ) : (
                        op.embarkedCount ?? 0
                      )}
                    </td>

                    <td className="p-3 font-mono font-bold text-center border-r border-slate-200 text-amber-800">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.disembarkedCount ?? 0}
                          onChange={(e) => setEditFormData({ ...editFormData, disembarkedCount: Number(e.target.value) })}
                          className="px-1 py-0.5 text-xs border rounded w-14 text-center"
                        />
                      ) : (
                        op.disembarkedCount ?? 0
                      )}
                    </td>

                    <td className="p-3 font-mono text-center border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.inspectionsCount ?? 0}
                          onChange={(e) => setEditFormData({ ...editFormData, inspectionsCount: Number(e.target.value) })}
                          className="px-1 py-0.5 text-xs border rounded w-14 text-center"
                        />
                      ) : (
                        <span className={op.inspectionsCount ? 'font-bold text-red-600' : 'text-slate-400'}>
                          {op.inspectionsCount || 0}
                        </span>
                      )}
                    </td>

                    <td className="p-3 font-mono text-center border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.waitingPrainhaCount ?? 0}
                          onChange={(e) => setEditFormData({ ...editFormData, waitingPrainhaCount: Number(e.target.value) })}
                          className="px-1 py-0.5 text-xs border rounded w-14 text-center"
                        />
                      ) : (
                        <span className={op.waitingPrainhaCount ? 'font-bold text-amber-700' : 'text-slate-400'}>
                          {op.waitingPrainhaCount || 0}
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {op.closedListBefore || 'SIM'}
                      </span>
                    </td>

                    <td className="p-3 text-center border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.teamAbsencesCount ?? 0}
                          onChange={(e) => setEditFormData({ ...editFormData, teamAbsencesCount: Number(e.target.value) })}
                          className="px-1 py-0.5 text-xs border rounded w-12 text-center"
                        />
                      ) : (
                        <span className={op.teamAbsencesCount ? 'font-bold text-red-600' : 'text-slate-400'}>
                          {op.teamAbsencesCount || 0}
                        </span>
                      )}
                    </td>

                    <td className="p-3 border-r border-slate-200 max-w-xs truncate text-[11px] text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.incidentNotes || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, incidentNotes: e.target.value })}
                          className="px-2 py-0.5 text-xs border rounded w-full"
                          placeholder="Avarias / placas..."
                        />
                      ) : (
                        op.incidentNotes || op.generalObservations || '-'
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(op)}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Salvar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(op)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-800 text-[10px] font-semibold cursor-pointer"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
