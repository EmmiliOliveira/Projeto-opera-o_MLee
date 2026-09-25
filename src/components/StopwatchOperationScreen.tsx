import React, { useState, useEffect } from 'react';
import { 
  Operation, 
  LeaderProfile, 
  CargoType, 
  MovementCycle, 
  PauseRecord, 
  ActiveDriverMovement 
} from '../types';
import { formatDuration, saveSingleOperation } from '../utils/storage';
import { exportOperationPdf } from '../utils/exportPdf';
import { exportOperationExcel } from '../utils/exportExcel';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Ship, 
  FileText, 
  FileSpreadsheet, 
  AlertTriangle, 
  ArrowLeft, 
  Check, 
  X, 
  Save, 
  Layers, 
  Edit2
} from 'lucide-react';

interface StopwatchOperationScreenProps {
  operation: Operation;
  currentLeader: LeaderProfile;
  onOperationUpdated: (op: Operation) => void;
  onFinishAndNavigateHistory: (op: Operation) => void;
  onBack: () => void;
}

const CARGO_OPTIONS: CargoType[] = [
  'Baú 30 pés',
  'Baú 28 pés',
  'Carreta Sider',
  'Carreta Graneleira',
  'Container 20ft/40ft',
  'Veículo Leve / Utilitário',
  'Carga Crítica (Sem borda)',
  'Carga Geral / Paletizada',
];

export const StopwatchOperationScreen: React.FC<StopwatchOperationScreenProps> = ({
  operation: initialOperation,
  currentLeader,
  onOperationUpdated,
  onFinishAndNavigateHistory,
  onBack,
}) => {
  const [currentOp, setCurrentOp] = useState<Operation>(initialOperation);

  // Movimentos ativos por motorista
  const [activeDriverMovements, setActiveDriverMovements] = useState<Record<string, ActiveDriverMovement>>({});

  // Inputs de carga e identificação por motorista
  const [driverInputs, setDriverInputs] = useState<Record<string, { cargoType: CargoType; unitId: string }>>(() => {
    const initial: Record<string, { cargoType: CargoType; unitId: string }> = {};
    initialOperation.assignedDrivers.forEach((d) => {
      initial[d.id] = {
        cargoType: initialOperation.hasCriticalCargos ? 'Carga Crítica (Sem borda)' : 'Baú 30 pés',
        unitId: '',
      };
    });
    return initial;
  });

  // Modais
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pauseCategory, setPauseCategory] = useState<PauseRecord['category']>('Condições Climáticas / Maré');
  const [pauseReason, setPauseReason] = useState('');

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isCompletedSuccessModalOpen, setIsCompletedSuccessModalOpen] = useState(false);

  // Modal de Ajuste de Dados do Controle Diário
  const [isDailyDataModalOpen, setIsDailyDataModalOpen] = useState(false);
  const [dailyForm, setDailyForm] = useState({
    dockingTime: currentOp.dockingTime || '',
    undockingTime: currentOp.undockingTime || '',
    tugboat: currentOp.tugboat || '',
    inspectionsCount: currentOp.inspectionsCount || 0,
    waitingPrainhaCount: currentOp.waitingPrainhaCount || 0,
    teamAbsencesCount: currentOp.teamAbsencesCount || 0,
    teamAbsencesNote: currentOp.teamAbsencesNote || '',
    incidentNotes: currentOp.incidentNotes || '',
    closedListBefore: currentOp.closedListBefore || 'SIM',
  });

  const [currentPauseStartTime, setCurrentPauseStartTime] = useState<number | null>(null);

  // Atualizador de segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentOp.status === 'EM_ANDAMENTO') {
        setCurrentOp(prev => ({
          ...prev,
          totalDurationSeconds: prev.totalDurationSeconds + 1,
          activeOperatingSeconds: prev.activeOperatingSeconds + 1,
        }));

        setActiveDriverMovements(prev => {
          const updated: Record<string, ActiveDriverMovement> = {};
          Object.keys(prev).forEach(driverId => {
            updated[driverId] = {
              ...prev[driverId],
              elapsedSeconds: prev[driverId].elapsedSeconds + 1,
            };
          });
          return updated;
        });
      } else if (currentOp.status === 'PAUSADA') {
        setCurrentOp(prev => ({
          ...prev,
          totalDurationSeconds: prev.totalDurationSeconds + 1,
          pausedSeconds: prev.pausedSeconds + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentOp.status]);

  // Auto-save a cada 10s
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveSingleOperation(currentOp);
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [currentOp]);

  // Iniciar operação global
  const handleStartGlobalOperation = () => {
    const nowTime = new Date().toLocaleTimeString('pt-BR');
    const updated: Operation = {
      ...currentOp,
      status: 'EM_ANDAMENTO',
      actualStartTime: currentOp.actualStartTime || nowTime,
      dockingTime: currentOp.dockingTime || nowTime,
    };
    setCurrentOp(updated);
    saveSingleOperation(updated);
    onOperationUpdated(updated);
  };

  // Pausar
  const handleConfirmPause = () => {
    setCurrentPauseStartTime(Date.now());
    const updated: Operation = {
      ...currentOp,
      status: 'PAUSADA',
    };
    setCurrentOp(updated);
    saveSingleOperation(updated);
    onOperationUpdated(updated);
    setIsPauseModalOpen(false);
  };

  // Retomar
  const handleResumeOperation = () => {
    let pauseDuration = 0;
    if (currentPauseStartTime) {
      pauseDuration = Math.round((Date.now() - currentPauseStartTime) / 1000);
    }

    const newPauseRecord: PauseRecord = {
      id: `p-${Date.now()}`,
      startTime: new Date(currentPauseStartTime || Date.now()).toLocaleTimeString('pt-BR'),
      endTime: new Date().toLocaleTimeString('pt-BR'),
      durationSeconds: Math.max(pauseDuration, 1),
      reason: pauseReason.trim() || 'Pausa operacional temporária',
      category: pauseCategory,
    };

    const updated: Operation = {
      ...currentOp,
      status: 'EM_ANDAMENTO',
      pauses: [...currentOp.pauses, newPauseRecord],
      pausedSeconds: currentOp.pausedSeconds + pauseDuration,
    };

    setCurrentPauseStartTime(null);
    setCurrentOp(updated);
    saveSingleOperation(updated);
    onOperationUpdated(updated);
  };

  // Iniciar manobra de motorista
  const handleStartDriverMovement = (driverId: string, driverName: string) => {
    if (currentOp.status === 'AGUARDANDO_INICIO') {
      handleStartGlobalOperation();
    }

    const inputs = driverInputs[driverId] || {
      cargoType: 'Baú 30 pés',
      unitId: `BAÚ #${100 + currentOp.movements.length + 1}`,
    };

    const now = new Date().toISOString();

    setActiveDriverMovements(prev => ({
      ...prev,
      [driverId]: {
        driverId,
        driverName,
        cargoType: inputs.cargoType,
        unitIdentifier: inputs.unitId.trim() || `UNIDADE #${currentOp.movements.length + 1}`,
        startTime: now,
        elapsedSeconds: 0,
      },
    }));
  };

  // Concluir manobra de motorista
  const handleCompleteDriverMovement = (driverId: string) => {
    const active = activeDriverMovements[driverId];
    if (!active) return;

    const endTime = new Date().toISOString();
    const durationSeconds = Math.max(active.elapsedSeconds, 1);

    const newMovement: MovementCycle = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      driverId: active.driverId,
      driverName: active.driverName,
      cargoType: active.cargoType,
      unitIdentifier: active.unitIdentifier,
      startTime: active.startTime,
      endTime,
      durationSeconds,
    };

    const isEmb = currentOp.type === 'EMBARQUE' || currentOp.type === 'MISTO (EMBARQUE & DESEMBARQUE)';
    const newEmbCount = isEmb ? (currentOp.embarkedCount || 0) + 1 : currentOp.embarkedCount;
    const newDisembCount = currentOp.type === 'DESEMBARQUE' ? (currentOp.disembarkedCount || 0) + 1 : currentOp.disembarkedCount;

    const updated: Operation = {
      ...currentOp,
      movements: [newMovement, ...currentOp.movements],
      embarkedCount: newEmbCount,
      disembarkedCount: newDisembCount,
    };

    setActiveDriverMovements(prev => {
      const next = { ...prev };
      delete next[driverId];
      return next;
    });

    setDriverInputs(prev => ({
      ...prev,
      [driverId]: {
        cargoType: prev[driverId]?.cargoType || 'Baú 30 pés',
        unitId: `BAÚ #${100 + updated.movements.length + 1}`,
      },
    }));

    setCurrentOp(updated);
    saveSingleOperation(updated);
    onOperationUpdated(updated);
  };

  // Descartar manobra
  const handleCancelDriverMovement = (driverId: string) => {
    if (window.confirm('Descartar a cronometragem desta manobra em andamento?')) {
      setActiveDriverMovements(prev => {
        const next = { ...prev };
        delete next[driverId];
        return next;
      });
    }
  };

  // Finalizar operação
  const handleConfirmFinish = () => {
    const nowTime = new Date().toLocaleTimeString('pt-BR');
    const updated: Operation = {
      ...currentOp,
      status: 'CONCLUIDA',
      actualEndTime: nowTime,
      undockingTime: currentOp.undockingTime || nowTime,
    };

    setActiveDriverMovements({});
    setCurrentOp(updated);
    saveSingleOperation(updated);
    onOperationUpdated(updated);

    setIsFinishModalOpen(false);
    setIsCompletedSuccessModalOpen(true);
  };

  // Salvar ajustes da planilha
  const handleSaveDailyDataModal = () => {
    const updated: Operation = {
      ...currentOp,
      dockingTime: dailyForm.dockingTime,
      undockingTime: dailyForm.undockingTime,
      tugboat: dailyForm.tugboat,
      inspectionsCount: Number(dailyForm.inspectionsCount) || 0,
      waitingPrainhaCount: Number(dailyForm.waitingPrainhaCount) || 0,
      teamAbsencesCount: Number(dailyForm.teamAbsencesCount) || 0,
      teamAbsencesNote: dailyForm.teamAbsencesNote,
      incidentNotes: dailyForm.incidentNotes,
      closedListBefore: dailyForm.closedListBefore as any,
    };
    setCurrentOp(updated);
    saveSingleOperation(updated);
    onOperationUpdated(updated);
    setIsDailyDataModalOpen(false);
  };

  // Exportação individual
  const handleExportIndividualExcel = () => {
    exportOperationExcel(currentOp);
  };

  const handleExportPdf = () => {
    exportOperationPdf(currentOp);
  };

  const completedCount = currentOp.movements.length;
  const progressPercent = Math.min(
    Math.round((completedCount / (currentOp.plannedCargosCount || 1)) * 100),
    100
  );

  const avgCycleSeconds = completedCount > 0
    ? Math.round(currentOp.activeOperatingSeconds / completedCount)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
      {/* Barra Superior Simples */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Voltar à Fila</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">
                {currentOp.operationCode}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-800">
                {currentOp.type}
              </span>
              <span className="text-xs text-slate-600">
                • Balsa: <strong>{currentOp.bargeName}</strong> (Empurrador {currentOp.tugboat || '82'})
              </span>
            </div>
          </div>
        </div>

        {/* Badge de Status */}
        <div>
          {currentOp.status === 'EM_ANDAMENTO' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              EM ANDAMENTO
            </span>
          )}
          {currentOp.status === 'PAUSADA' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Pause className="w-3 h-3 fill-current" />
              EM PAUSA
            </span>
          )}
          {currentOp.status === 'AGUARDANDO_INICIO' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              <Clock className="w-3 h-3" />
              AGUARDANDO INÍCIO
            </span>
          )}
          {currentOp.status === 'CONCLUIDA' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-emerald-700 text-white">
              <CheckCircle2 className="w-3.5 h-3.5" />
              CONCLUÍDA
            </span>
          )}
        </div>
      </div>

      {/* Barra de Dados do Controle Diário (Simples e Limpa) */}
      <div className="bg-white border border-slate-300 rounded-lg p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div>
            <span className="text-slate-500">Turno: </span>
            <strong className="text-slate-800">{currentOp.shift || 'Dia'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Atracação: </span>
            <strong className="font-mono text-slate-900">{currentOp.dockingTime || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Desatracação: </span>
            <strong className="font-mono text-slate-900">{currentOp.undockingTime || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Frotas Emb./Desemb.: </span>
            <strong className="text-blue-700 font-mono">{currentOp.embarkedCount ?? completedCount}</strong> / <strong className="text-amber-700 font-mono">{currentOp.disembarkedCount ?? 0}</strong>
          </div>
          <div>
            <span className="text-slate-500">Prainha: </span>
            <strong className="text-slate-900 font-mono">{currentOp.waitingPrainhaCount || 0}</strong>
          </div>
          <div>
            <span className="text-slate-500">Vistorias: </span>
            <strong className={currentOp.inspectionsCount ? 'text-red-600 font-mono' : 'text-slate-700 font-mono'}>
              {currentOp.inspectionsCount || 0}
            </strong>
          </div>
        </div>

        <button
          onClick={() => {
            setDailyForm({
              dockingTime: currentOp.dockingTime || '07:30:00',
              undockingTime: currentOp.undockingTime || '15:25:00',
              tugboat: currentOp.tugboat || '82',
              inspectionsCount: currentOp.inspectionsCount || 0,
              waitingPrainhaCount: currentOp.waitingPrainhaCount || 0,
              teamAbsencesCount: currentOp.teamAbsencesCount || 0,
              teamAbsencesNote: currentOp.teamAbsencesNote || 'Sem faltas',
              incidentNotes: currentOp.incidentNotes || '',
              closedListBefore: currentOp.closedListBefore || 'SIM',
            });
            setIsDailyDataModalOpen(true);
          }}
          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1 border border-slate-300 cursor-pointer"
        >
          <Edit2 className="w-3 h-3 text-slate-600" />
          <span>Editar Horários & Dados</span>
        </button>
      </div>

      {/* Alerta de Cargas Críticas */}
      {currentOp.hasCriticalCargos && (
        <div className="mb-5 p-3 rounded-md bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span><strong>Regra de Borda:</strong> {currentOp.criticalCargoRules || 'Cargas críticas não podem viajar na borda da balsa.'}</span>
          </div>
        </div>
      )}

      {/* 1. CRONÔMETRO PRINCIPAL DA OPERAÇÃO (Layout Sóbrio e Padrão) */}
      <div className="bg-slate-900 text-white rounded-lg p-5 mb-6 border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Display Digital */}
          <div className="md:col-span-5 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Tempo Total da Operação
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-bold tracking-normal text-white">
              {formatDuration(currentOp.totalDurationSeconds)}
            </div>
            <div className="mt-2 flex items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
              <span>Líquido: <strong className="text-emerald-400 font-mono">{formatDuration(currentOp.activeOperatingSeconds)}</strong></span>
              <span>•</span>
              <span>Pausas: <strong className="text-amber-400 font-mono">{formatDuration(currentOp.pausedSeconds)}</strong> ({currentOp.pauses.length})</span>
            </div>
          </div>

          {/* Cargas e Médias */}
          <div className="md:col-span-3 bg-slate-800 p-3.5 rounded border border-slate-700 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Frotas Feitas:</span>
              <strong className="text-white">{completedCount} / {currentOp.plannedCargosCount}</strong>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded overflow-hidden mb-2">
              <div 
                className="bg-blue-500 h-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Progresso: {progressPercent}%</span>
              <span>Média: {avgCycleSeconds > 0 ? formatDuration(avgCycleSeconds) : '--'}/un</span>
            </div>
          </div>

          {/* Botões de Ação Global */}
          <div className="md:col-span-4 flex flex-col gap-2">
            {currentOp.status === 'AGUARDANDO_INICIO' && (
              <button
                onClick={handleStartGlobalOperation}
                className="w-full py-2.5 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>INICIAR OPERAÇÃO</span>
              </button>
            )}

            {currentOp.status === 'EM_ANDAMENTO' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPauseModalOpen(true)}
                  className="flex-1 py-2.5 px-3 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSAR</span>
                </button>
                <button
                  onClick={() => setIsFinishModalOpen(true)}
                  className="flex-1 py-2.5 px-3 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>FINALIZAR</span>
                </button>
              </div>
            )}

            {currentOp.status === 'PAUSADA' && (
              <div className="flex gap-2">
                <button
                  onClick={handleResumeOperation}
                  className="flex-1 py-2.5 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>RETOMAR</span>
                </button>
                <button
                  onClick={() => setIsFinishModalOpen(true)}
                  className="py-2.5 px-3 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer"
                >
                  Finalizar
                </button>
              </div>
            )}

            {currentOp.status === 'CONCLUIDA' && (
              <div className="flex gap-2">
                <button
                  onClick={handleExportIndividualExcel}
                  className="flex-1 py-2 px-3 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Baixar planilha Excel detalhada apenas desta operação"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel Desta Operação</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="py-2 px-3 rounded bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CONTROLE INDIVIDUAL POR MOTORISTA */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-blue-700" />
            <span>Cronometragem por Motorista (Manobras Simultâneas)</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {Object.keys(activeDriverMovements).length} motorista(s) em manobra agora
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentOp.assignedDrivers.map((driver) => {
            const activeMov = activeDriverMovements[driver.id];
            const isDriverActive = !!activeMov;
            const inputState = driverInputs[driver.id] || {
              cargoType: 'Baú 30 pés',
              unitId: `BAÚ #${100 + completedCount + 1}`,
            };

            const driverDoneCount = currentOp.movements.filter(m => m.driverId === driver.id).length;

            return (
              <div
                key={driver.id}
                className={`bg-white border rounded-lg p-4 flex flex-col justify-between ${
                  isDriverActive ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {driver.name}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {driverDoneCount} manobra(s) realizada(s)
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isDriverActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isDriverActive ? 'EM MANOBRA' : 'DISPONÍVEL'}
                    </span>
                  </div>

                  {isDriverActive ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded mb-3 text-center">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                        Tempo Atual da Manobra
                      </span>
                      <div className="font-mono text-3xl font-bold text-emerald-950 my-1">
                        {formatDuration(activeMov.elapsedSeconds)}
                      </div>
                      <div className="text-xs text-emerald-900 font-semibold truncate">
                        {activeMov.cargoType} • {activeMov.unitIdentifier}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                          Tipo de Carga
                        </label>
                        <select
                          value={inputState.cargoType}
                          onChange={(e) =>
                            setDriverInputs(prev => ({
                              ...prev,
                              [driver.id]: {
                                ...inputState,
                                cargoType: e.target.value as CargoType,
                              },
                            }))
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-900"
                        >
                          {CARGO_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                          Placa / Número do Baú
                        </label>
                        <input
                          type="text"
                          value={inputState.unitId}
                          onChange={(e) =>
                            setDriverInputs(prev => ({
                              ...prev,
                              [driver.id]: {
                                ...inputState,
                                unitId: e.target.value,
                              },
                            }))
                          }
                          placeholder="Ex: BAÚ #104 (ABC-1234)"
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {isDriverActive ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCompleteDriverMovement(driver.id)}
                        className="flex-1 py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>CONCLUIR MANOBRA</span>
                      </button>

                      <button
                        onClick={() => handleCancelDriverMovement(driver.id)}
                        title="Descartar manobra"
                        className="p-2 rounded bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-300 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartDriverMovement(driver.id, driver.name)}
                      className="w-full py-2 px-3 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>INICIAR MANOBRA</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TABELA DE MANOBRAS REALIZADAS E PAUSAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tabela de Frotas Feitas */}
        <div className="lg:col-span-8 bg-white border border-slate-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>Frotas Realizadas no Cronômetro ({currentOp.movements.length})</span>
            </h3>
            <span className="text-xs text-slate-500">Mais recentes primeiro</span>
          </div>

          <div className="overflow-x-auto max-h-80">
            {currentOp.movements.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Nenhuma frota individual movimentada ainda. Selecione um motorista acima e inicie a contagem.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold">
                    <th className="pb-1.5">#</th>
                    <th className="pb-1.5">Motorista</th>
                    <th className="pb-1.5">Carga</th>
                    <th className="pb-1.5">Identificação</th>
                    <th className="pb-1.5">Tempo</th>
                    <th className="pb-1.5 text-right">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentOp.movements.map((mov, idx) => (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="py-2 text-slate-400 font-bold">#{currentOp.movements.length - idx}</td>
                      <td className="py-2 font-semibold text-slate-900">{mov.driverName}</td>
                      <td className="py-2 text-slate-700">{mov.cargoType}</td>
                      <td className="py-2 font-mono text-slate-600">{mov.unitIdentifier}</td>
                      <td className="py-2 font-mono font-bold text-blue-900">{formatDuration(mov.durationSeconds)}</td>
                      <td className="py-2 text-right font-mono text-slate-500 text-[11px]">
                        {mov.endTime.includes('T') ? new Date(mov.endTime).toLocaleTimeString('pt-BR') : mov.endTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Tabela de Pausas */}
        <div className="lg:col-span-4 bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Pausas ({currentOp.pauses.length})</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                {formatDuration(currentOp.pausedSeconds)}
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {currentOp.pauses.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Nenhuma pausa registrada.</p>
              ) : (
                currentOp.pauses.map((p) => (
                  <div key={p.id} className="p-2 rounded bg-amber-50/70 border border-amber-200 text-xs">
                    <div className="flex justify-between font-bold text-amber-900">
                      <span>{p.category}</span>
                      <span className="font-mono">{formatDuration(p.durationSeconds)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{p.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Exportações Rápidas desta Operação */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <span className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
              Exportar Arquivos Desta Operação:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportIndividualExcel}
                className="py-2 px-2.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                title="Gera planilha Excel apenas desta operação com detalhe de cada frota e cada pausa"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (Operação)</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="py-2 px-2.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF (Operação)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: AJUSTAR DADOS DO CONTROLE DIÁRIO */}
      {isDailyDataModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 border border-slate-300 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Ajustar Dados da Planilha (Controle Diário)</h3>
              <button onClick={() => setIsDailyDataModalOpen(false)} className="text-slate-500 hover:text-slate-800 cursor-pointer">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Atracação</label>
                  <input
                    type="text"
                    value={dailyForm.dockingTime}
                    onChange={(e) => setDailyForm({ ...dailyForm, dockingTime: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Desatracação</label>
                  <input
                    type="text"
                    value={dailyForm.undockingTime}
                    onChange={(e) => setDailyForm({ ...dailyForm, undockingTime: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Empurrador</label>
                  <input
                    type="text"
                    value={dailyForm.tugboat}
                    onChange={(e) => setDailyForm({ ...dailyForm, tugboat: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Vistorias (Avaria)</label>
                  <input
                    type="number"
                    min="0"
                    value={dailyForm.inspectionsCount}
                    onChange={(e) => setDailyForm({ ...dailyForm, inspectionsCount: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Frotas em Prainha</label>
                  <input
                    type="number"
                    min="0"
                    value={dailyForm.waitingPrainhaCount}
                    onChange={(e) => setDailyForm({ ...dailyForm, waitingPrainhaCount: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Ausências da Equipe</label>
                  <input
                    type="number"
                    min="0"
                    value={dailyForm.teamAbsencesCount}
                    onChange={(e) => setDailyForm({ ...dailyForm, teamAbsencesCount: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Detalhe das Faltas</label>
                <input
                  type="text"
                  value={dailyForm.teamAbsencesNote}
                  onChange={(e) => setDailyForm({ ...dailyForm, teamAbsencesNote: e.target.value })}
                  placeholder="Ex: Faltas: 1/7 férias, Faltas: 1/7 atestado..."
                  className="w-full px-2 py-1 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Observações / Placas / Avarias</label>
                <textarea
                  rows={2}
                  value={dailyForm.incidentNotes}
                  onChange={(e) => setDailyForm({ ...dailyForm, incidentNotes: e.target.value })}
                  placeholder="Ex: CT 5910 danificado na rampa..."
                  className="w-full px-2 py-1 rounded border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
              <button
                onClick={() => setIsDailyDataModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDailyDataModal}
                className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAUSA */}
      {isPauseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-300 shadow-lg">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Registrar Pausa na Operação</h3>
            <p className="text-xs text-slate-500 mb-3">Informe a justificativa da paralisação</p>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Motivo *</label>
                <select
                  value={pauseCategory}
                  onChange={(e) => setPauseCategory(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="Condições Climáticas / Maré">Condições Climáticas / Maré</option>
                  <option value="Manobra de Balsa">Manobra de Balsa / Rebocador</option>
                  <option value="Aguardando Rampa / Trânsito">Aguardando Rampa / Trânsito</option>
                  <option value="Avaria Mecânica">Avaria Mecânica na Carreta</option>
                  <option value="Vistoria / Documentação">Vistoria / Documentação Fiscal</option>
                  <option value="Almoço / Troca de Turno">Almoço / Troca de Turno</option>
                  <option value="Outro">Outro Motivo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Justificativa Detalhada *</label>
                <textarea
                  rows={2}
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPauseModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPause}
                className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirmar Pausa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FINALIZAR */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-300 shadow-lg">
            <h3 className="text-base font-bold text-slate-900 mb-2">Finalizar Operação?</h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Operação:</span>
                <strong>{currentOp.operationCode} ({currentOp.bargeName})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tempo Total:</span>
                <strong className="font-mono">{formatDuration(currentOp.totalDurationSeconds)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frotas Movimentadas:</span>
                <strong>{completedCount} de {currentOp.plannedCargosCount} planejadas</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tempo em Pausas:</span>
                <strong className="font-mono text-amber-700">{formatDuration(currentOp.pausedSeconds)}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsFinishModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 text-xs cursor-pointer"
              >
                Voltar à Operação
              </button>
              <button
                onClick={handleConfirmFinish}
                className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
              >
                Sim, Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUCESSO DE CONCLUSÃO COM GERAÇÃO EXCLUSIVA DESTA OPERAÇÃO */}
      {isCompletedSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-slate-300 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Operação Concluída com Sucesso!</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Os dados de <strong>{currentOp.operationCode}</strong> foram registrados. Baixe os arquivos analíticos exclusivos desta operação abaixo:
            </p>

            {/* BOTÕES DE EXPORTAÇÃO EXCLUSIVA DESTA OPERAÇÃO */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-5 text-left">
              <span className="block text-[11px] font-bold uppercase text-slate-700 mb-2">
                Arquivos Desta Operação ({currentOp.operationCode}):
              </span>
              <div className="space-y-2">
                <button
                  onClick={handleExportIndividualExcel}
                  className="w-full py-2.5 px-3 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Baixar Planilha Excel Desta Operação</span>
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  * Contém cada frota movimentada, horários, tempos por motorista e pausas desta manobra.
                </p>

                <button
                  onClick={handleExportPdf}
                  className="w-full py-2 px-3 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Baixar Relatório em PDF</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => onFinishAndNavigateHistory(currentOp)}
                className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
              >
                Ir para o Histórico
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 rounded border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Voltar à Fila
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
