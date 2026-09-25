import React, { useState } from 'react';
import { LeaderProfile, Operation, OperationType, Driver, ShiftType } from '../types';
import { saveSingleOperation } from '../utils/storage';
import { 
  PlusCircle, 
  Ship, 
  Clock, 
  Truck, 
  ShieldAlert, 
  Scale, 
  Calendar, 
  Check, 
  ArrowLeft, 
  AlertTriangle,
  FileCheck,
  Anchor,
  Compass,
  FileSpreadsheet,
  AlertOctagon,
  Users
} from 'lucide-react';

interface NewOperationScreenProps {
  currentLeader: LeaderProfile;
  existingOperations: Operation[];
  onOperationCreated: (newOp: Operation) => void;
  onCancel: () => void;
}

export const NewOperationScreen: React.FC<NewOperationScreenProps> = ({
  currentLeader,
  existingOperations,
  onOperationCreated,
  onCancel,
}) => {
  const getNextOpCode = (): string => {
    const nums = existingOperations
      .map(o => {
        const match = o.operationCode.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => n > 0);
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return `OPERAÇÃO ${String(maxNum + 1).padStart(2, '0')}`;
  };

  const [operationCode, setOperationCode] = useState(getNextOpCode());
  const [type, setType] = useState<OperationType>('EMBARQUE');
  const [bargeName, setBargeName] = useState(currentLeader.defaultBarge || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  // CAMPOS OFICIAIS DO CONTROLE DIÁRIO (Planilha Operacional)
  const [shift, setShift] = useState<ShiftType>(currentLeader.defaultShift || 'Dia');
  const [tugboat, setTugboat] = useState('');
  const [dockingTime, setDockingTime] = useState('');
  const [undockingTime, setUndockingTime] = useState('');
  const [embarkedCount, setEmbarkedCount] = useState<number>(0);
  const [disembarkedCount, setDisembarkedCount] = useState<number>(0);
  const [inspectionsCount, setInspectionsCount] = useState<number>(0);
  const [noShowCount, setNoShowCount] = useState<number>(0);
  const [withoutDocsCount, setWithoutDocsCount] = useState<number>(0);
  const [withoutManifestCount, setWithoutManifestCount] = useState<number>(0);
  const [closedListBefore, setClosedListBefore] = useState<'SIM' | 'NÃO' | 'SEM OPERAÇÃO'>('SIM');
  const [hadOperation, setHadOperation] = useState<'SIM' | 'NÃO'>('SIM');
  const [hadDirection, setHadDirection] = useState<'SIM' | 'NÃO'>('SIM');
  const [waitingPrainhaCount, setWaitingPrainhaCount] = useState<number>(0);
  const [teamAbsencesCount, setTeamAbsencesCount] = useState<number>(0);
  const [teamAbsencesNote, setTeamAbsencesNote] = useState('');
  const [incidentNotes, setIncidentNotes] = useState('');

  // Planejamento
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState<number>(60);
  const [cargoBreakdownNote, setCargoBreakdownNote] = useState('');
  
  // Critical loads & Balance considerations
  const [hasCriticalCargos, setHasCriticalCargos] = useState(false);
  const [criticalCargoRules, setCriticalCargoRules] = useState('');

  // Drivers selection
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([...currentLeader.drivers]);
  const [extraDriverName, setExtraDriverName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggleDriver = (driver: Driver) => {
    if (selectedDrivers.some(d => d.id === driver.id)) {
      if (selectedDrivers.length === 1) {
        setErrorMessage('Selecione pelo menos um motorista para operar as manobras.');
        return;
      }
      setSelectedDrivers(prev => prev.filter(d => d.id !== driver.id));
    } else {
      setSelectedDrivers(prev => [...prev, driver]);
      setErrorMessage(null);
    }
  };

  const handleAddExtraDriver = () => {
    if (!extraDriverName.trim()) return;
    const newDriver: Driver = {
      id: `drv-ext-${Date.now()}`,
      name: `${extraDriverName.trim()} (Rotativo/Avulso)`,
      badgeNumber: 'ROT',
      isExternal: true,
    };
    setSelectedDrivers(prev => [...prev, newDriver]);
    setExtraDriverName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!operationCode.trim()) {
      setErrorMessage('Informe a identificação da operação.');
      return;
    }
    if (!bargeName.trim()) {
      setErrorMessage('Informe o nome da balsa ou embarcação.');
      return;
    }
    if (selectedDrivers.length === 0) {
      setErrorMessage('Selecione ao menos um motorista de manobra.');
      return;
    }

    const plannedTotal = (Number(embarkedCount) || 0) + (Number(disembarkedCount) || 0);

    const newOp: Operation = {
      id: `op-${Date.now()}`,
      operationCode: operationCode.trim().toUpperCase(),
      type,
      bargeName: bargeName.trim(),
      date,
      scheduledTime,
      leaderId: currentLeader.id,
      leaderName: currentLeader.name,
      status: 'AGUARDANDO_INICIO',
      
      // Controle Diário
      shift,
      tugboat: tugboat.trim() || '82',
      dockingTime: dockingTime.trim() || undefined,
      undockingTime: undockingTime.trim() || undefined,
      embarkedCount: Number(embarkedCount) || 0,
      disembarkedCount: Number(disembarkedCount) || 0,
      inspectionsCount: Number(inspectionsCount) || 0,
      noShowCount: Number(noShowCount) || 0,
      withoutDocsCount: Number(withoutDocsCount) || 0,
      withoutManifestCount: Number(withoutManifestCount) || 0,
      closedListBefore,
      hadOperation,
      hadDirection,
      waitingPrainhaCount: Number(waitingPrainhaCount) || 0,
      teamAbsencesCount: Number(teamAbsencesCount) || 0,
      teamAbsencesNote: teamAbsencesNote.trim() || 'Sem faltas',
      incidentNotes: incidentNotes.trim() || undefined,

      estimatedTimeMinutes: Number(estimatedTimeMinutes) || 90,
      plannedCargosCount: plannedTotal > 0 ? plannedTotal : 15,
      cargoBreakdownNote: cargoBreakdownNote.trim(),
      hasCriticalCargos,
      criticalCargoRules: hasCriticalCargos ? criticalCargoRules.trim() : undefined,
      assignedDrivers: selectedDrivers,
      assignedTeamMembers: currentLeader.teamMembers,
      totalDurationSeconds: 0,
      activeOperatingSeconds: 0,
      pausedSeconds: 0,
      movements: [],
      pauses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSingleOperation(newOp);
    onOperationCreated(newOp);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-[#004b87] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
            <span>Voltar ao Menu Principal</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-[#004b87] uppercase tracking-wider mb-0.5">
            <span>TBL Fluvial</span>
            <span>•</span>
            <span>Planejamento Operacional</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-7 h-7 text-[#0284c7]" />
            <span>Cadastro das Informações de Operação</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Preencha os dados de pré-planejamento e os campos oficiais do Controle Diário (Turno, Empurrador, Atracação, Prainha, Faltas e Vistorias).
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 border border-sky-100 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* SEÇÃO 1: TURNO, TIPO & EMBARCAÇÃO (Conforme Planilha de Controle Diário) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#001c38] via-[#002f5e] to-[#001f3f] text-white shadow-md border border-sky-400/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-widest flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                Dados Principais da Escala de Turno TBL
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-200 border border-sky-500/30 font-semibold">
                Líder: {currentLeader.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Turno Operacional *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShift('Dia')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      shift === 'Dia'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    ☀️ Dia
                  </button>
                  <button
                    type="button"
                    onClick={() => setShift('Noite')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      shift === 'Noite'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    🌙 Noite
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Empurrador Fluvial *
                </label>
                <input
                  type="text"
                  required
                  value={tugboat}
                  onChange={(e) => setTugboat(e.target.value)}
                  placeholder="Ex: 82, 74 / 68, 92 / 72, 90/76"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Balsa / Embarcação *
                </label>
                <input
                  type="text"
                  required
                  value={bargeName}
                  onChange={(e) => setBargeName(e.target.value)}
                  placeholder="Ex: TBL 82, TBL 74 / 68"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Tipo de Operação */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                Tipo da Manobra
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('EMBARQUE')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    type === 'EMBARQUE'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Embarque
                </button>
                <button
                  type="button"
                  onClick={() => setType('DESEMBARQUE')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    type === 'DESEMBARQUE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Desembarque
                </button>
                <button
                  type="button"
                  onClick={() => setType('MISTO (EMBARQUE & DESEMBARQUE)')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    type === 'MISTO (EMBARQUE & DESEMBARQUE)'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Misto (Ambos)
                </button>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: CRONOGRAMA DE ATRACAÇÃO, HORÁRIOS & QUANTITATIVOS DE CARGA */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Atracação *
              </label>
              <input
                type="text"
                value={dockingTime}
                onChange={(e) => setDockingTime(e.target.value)}
                placeholder="Ex: 07:30:00"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Início Previsto *
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Desatracação Prevista
              </label>
              <input
                type="text"
                value={undockingTime}
                onChange={(e) => setUndockingTime(e.target.value)}
                placeholder="Ex: 15:25:00"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* SEÇÃO 3: CONTROLE DIÁRIO - FROTAS EMBARCADAS, DESEMBARCADAS, PRAINHA E VISTORIAS */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
              <span>Quantitativos do Controle Diário (KPIs da Planilha)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Frotas Embarcadas
                </label>
                <input
                  type="number"
                  min="0"
                  value={embarkedCount}
                  onChange={(e) => setEmbarkedCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Frotas Desembarcadas
                </label>
                <input
                  type="number"
                  min="0"
                  value={disembarkedCount}
                  onChange={(e) => setDisembarkedCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vistorias com Avaria
                </label>
                <input
                  type="number"
                  min="0"
                  value={inspectionsCount}
                  onChange={(e) => setInspectionsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Frotas Aguardando Prainha
                </label>
                <input
                  type="number"
                  min="0"
                  value={waitingPrainhaCount}
                  onChange={(e) => setWaitingPrainhaCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Checklist de Status da Planilha */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-blue-200/60">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Lista Fechada Antes?
                </label>
                <select
                  value={closedListBefore}
                  onChange={(e) => setClosedListBefore(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
                >
                  <option value="SIM">SIM</option>
                  <option value="NÃO">NÃO</option>
                  <option value="SEM OPERAÇÃO">SEM OPERAÇÃO</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Houve Operação?
                </label>
                <select
                  value={hadOperation}
                  onChange={(e) => setHadOperation(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
                >
                  <option value="SIM">SIM</option>
                  <option value="NÃO">NÃO</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Houve Direcionamento?
                </label>
                <select
                  value={hadDirection}
                  onChange={(e) => setHadDirection(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
                >
                  <option value="SIM">SIM</option>
                  <option value="NÃO">NÃO</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: AUSÊNCIAS DA EQUIPE & OCORRÊNCIAS / PLACAS (Planilha) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              <span>Controle de Ausências da Equipe & Ocorrências de Rampa</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Qtd de Ausências / Faltas
                </label>
                <input
                  type="number"
                  min="0"
                  value={teamAbsencesCount}
                  onChange={(e) => setTeamAbsencesCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Detalhes das Ausências (Ex: Faltas 1/7 férias, atestado)
                </label>
                <input
                  type="text"
                  value={teamAbsencesNote}
                  onChange={(e) => setTeamAbsencesNote(e.target.value)}
                  placeholder="Ex: Faltas: 1/7 férias, Faltas: 2/7 atestado ou Sem faltas"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Observações / Placas / Avarias na Manobra
              </label>
              <input
                type="text"
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                placeholder="Ex: CT 5910 danificado na rampa, Frota B001 com avaria, Atraso por ter só um motorista..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* SEÇÃO 5: CARGAS CRÍTICAS & BALANCEAMENTO */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="criticalCheck"
                checked={hasCriticalCargos}
                onChange={(e) => setHasCriticalCargos(e.target.checked)}
                className="mt-1 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="criticalCheck" className="text-xs font-bold text-amber-900 uppercase tracking-wider cursor-pointer flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>Cargas Críticas / Regras de Balanceamento de Balsa</span>
                </label>
                <p className="text-xs text-amber-800/80 mt-1">
                  Cargas pesadas posicionadas para equilibrar o calado. Cargas críticas proibidas na borda externa.
                </p>

                {hasCriticalCargos && (
                  <div className="mt-2.5">
                    <textarea
                      rows={2}
                      value={criticalCargoRules}
                      onChange={(e) => setCriticalCargoRules(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO 6: MOTORISTAS DA MANOBRA */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Motoristas Escalados para o Cronômetro *</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecione os motoristas que vão operar as manobras simultâneas.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full self-start">
                {selectedDrivers.length} motorista(s) ativo(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {currentLeader.drivers.map((drv) => {
                const isSelected = selectedDrivers.some(d => d.id === drv.id);
                return (
                  <div
                    key={drv.id}
                    onClick={() => handleToggleDriver(drv)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{drv.name}</span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}

              {selectedDrivers
                .filter(d => d.isExternal)
                .map(drv => (
                  <div
                    key={drv.id}
                    onClick={() => handleToggleDriver(drv)}
                    className="p-2.5 rounded-lg border bg-purple-50 border-purple-400 text-purple-900 font-semibold text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span>{drv.name}</span>
                    <span className="text-red-500 font-bold ml-2 hover:text-red-700">×</span>
                  </div>
                ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={extraDriverName}
                onChange={(e) => setExtraDriverName(e.target.value)}
                placeholder="Adicionar motorista avulso/rotativo para esta operação..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddExtraDriver}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                + Adicionar Avulso
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-center"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#004b87] via-[#0284c7] to-[#0ea5e9] hover:from-[#003865] hover:to-[#0274ae] text-white text-xs font-bold shadow-md shadow-sky-900/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>Salvar e Ir para Operações em Aguardo</span>
          </button>
        </div>
      </form>
    </div>
  );
};
