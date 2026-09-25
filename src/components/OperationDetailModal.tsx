import React from 'react';
import { Operation } from '../types';
import { formatDuration } from '../utils/storage';
import { exportOperationPdf } from '../utils/exportPdf';
import { exportOperationExcel } from '../utils/exportExcel';
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  Ship, 
  Clock, 
  Truck, 
  AlertTriangle, 
  Scale, 
  Layers, 
  CheckCircle2, 
  Calendar,
  Anchor,
  Compass,
  Users
} from 'lucide-react';

interface OperationDetailModalProps {
  operation: Operation;
  onClose: () => void;
}

export const OperationDetailModal: React.FC<OperationDetailModalProps> = ({
  operation,
  onClose,
}) => {
  const avgCycle = operation.movements.length > 0
    ? Math.round(operation.activeOperatingSeconds / operation.movements.length)
    : 0;

  const driverPerformance: Record<string, { name: string; count: number; totalTime: number }> = {};
  operation.movements.forEach(m => {
    if (!driverPerformance[m.driverId]) {
      driverPerformance[m.driverId] = { name: m.driverName, count: 0, totalTime: 0 };
    }
    driverPerformance[m.driverId].count += 1;
    driverPerformance[m.driverId].totalTime += m.durationSeconds;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">{operation.operationCode}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                  {operation.shift || 'Dia'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  operation.type === 'EMBARQUE' ? 'bg-blue-800 text-blue-200' : 'bg-amber-800 text-amber-200'
                }`}>
                  {operation.type}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Balsa: <span className="text-white font-semibold">{operation.bargeName}</span> • Empurrador: <span className="text-blue-300 font-semibold">{operation.tugboat || '82'}</span> • {operation.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportOperationPdf(operation)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportOperationExcel(operation)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Card: Dados do Controle Diário (Planilha da Empresa) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-extrabold uppercase text-slate-900 tracking-wider mb-3 flex items-center gap-1.5 text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Informações do Controle Diário de Embarcação</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Atracação</span>
                <span className="text-sm font-mono font-bold text-slate-900">{operation.dockingTime || '--:--'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Início da Operação</span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {operation.actualStartTime ? (operation.actualStartTime.includes('T') ? new Date(operation.actualStartTime).toLocaleTimeString('pt-BR') : operation.actualStartTime) : operation.scheduledTime}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Fim da Operação</span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {operation.actualEndTime ? (operation.actualEndTime.includes('T') ? new Date(operation.actualEndTime).toLocaleTimeString('pt-BR') : operation.actualEndTime) : '--:--'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Desatracação</span>
                <span className="text-sm font-mono font-bold text-slate-900">{operation.undockingTime || '--:--'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
                <span className="text-[10px] text-blue-700 font-bold uppercase block">Frotas Embarcadas</span>
                <span className="text-base font-black text-blue-900">{operation.embarkedCount ?? (operation.type === 'EMBARQUE' ? operation.movements.length : 0)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                <span className="text-[10px] text-amber-700 font-bold uppercase block">Frotas Desembarcadas</span>
                <span className="text-base font-black text-amber-900">{operation.disembarkedCount ?? (operation.type === 'DESEMBARQUE' ? operation.movements.length : 0)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 text-center">
                <span className="text-[10px] text-red-700 font-bold uppercase block">Vistorias (Avaria)</span>
                <span className="text-base font-black text-red-900">{operation.inspectionsCount || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Aguardando Prainha</span>
                <span className="text-base font-black text-slate-900">{operation.waitingPrainhaCount || 0}</span>
              </div>
            </div>

            {/* Ocorrências e Faltas */}
            <div className="mt-3 p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Ausências da Equipe:</span>
                <span className="font-semibold text-slate-800">{operation.teamAbsencesCount || 0} • {operation.teamAbsencesNote || 'Sem faltas'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Ocorrências / Placas:</span>
                <span className="font-semibold text-slate-800">{operation.incidentNotes || 'Nenhuma ocorrência registrada'}</span>
              </div>
            </div>
          </div>

          {/* Tempos & Ritmo da Cronometragem */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Tempo Total</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {formatDuration(operation.totalDurationSeconds)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="block text-[10px] font-bold text-emerald-800 uppercase">Tempo Líquido Ativo</span>
              <span className="text-lg font-black text-emerald-900 font-mono">
                {formatDuration(operation.activeOperatingSeconds)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="block text-[10px] font-bold text-amber-800 uppercase">Tempo em Pausa</span>
              <span className="text-lg font-black text-amber-900 font-mono">
                {formatDuration(operation.pausedSeconds)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="block text-[10px] font-bold text-blue-800 uppercase">Cargas / Ritmo</span>
              <span className="text-lg font-black text-blue-900">
                {operation.movements.length} <span className="text-xs font-medium font-mono text-blue-700">({avgCycle > 0 ? formatDuration(avgCycle) : '--'}/un)</span>
              </span>
            </div>
          </div>

          {/* Safety & Weight Balance Info */}
          {operation.hasCriticalCargos && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 block">Critério de Balanceamento e Cargas Críticas:</span>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  {operation.criticalCargoRules || 'Cargas críticas alinhadas no centro; restrição absoluta de posicionamento na borda da balsa.'}
                </p>
              </div>
            </div>
          )}

          {/* Performance by Driver Breakdown */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Desempenho Consolidado por Motorista</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(driverPerformance).map((dp, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">{dp.name}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Cargas feitas:</span>
                    <span className="font-bold text-blue-800">{dp.count} ({Math.round((dp.count / (operation.movements.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Tempo médio:</span>
                    <span className="font-mono font-bold text-slate-700">{formatDuration(Math.round(dp.totalTime / dp.count))}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Tempo total:</span>
                    <span className="font-mono font-semibold text-slate-700">{formatDuration(dp.totalTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Movements Timeline Table */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Registro Detalhado das Movimentações ({operation.movements.length})</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Motorista</th>
                    <th className="p-2.5">Carga</th>
                    <th className="p-2.5">Identificação</th>
                    <th className="p-2.5">Início</th>
                    <th className="p-2.5 text-right">Duração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operation.movements.map((mov, idx) => (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{mov.driverName}</td>
                      <td className="p-2.5 text-blue-800">{mov.cargoType}</td>
                      <td className="p-2.5 font-mono text-slate-600">{mov.unitIdentifier}</td>
                      <td className="p-2.5 font-mono text-slate-500 text-[11px]">
                        {mov.startTime.includes('T') ? new Date(mov.startTime).toLocaleTimeString('pt-BR') : mov.startTime}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatDuration(mov.durationSeconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pauses Log */}
          {operation.pauses.length > 0 && (
            <div>
              <h4 className="font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Paradas e Esperas ({operation.pauses.length})</span>
              </h4>
              <div className="space-y-2">
                {operation.pauses.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-950">{p.category}</span>
                      <p className="text-[11px] text-slate-600">{p.reason}</p>
                    </div>
                    <span className="font-mono font-bold text-amber-800">{formatDuration(p.durationSeconds)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
