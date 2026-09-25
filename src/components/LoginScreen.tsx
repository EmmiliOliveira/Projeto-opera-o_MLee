import React, { useState } from 'react';
import { LeaderProfile, Driver, TeamMember } from '../types';
import { 
  getStoredLeaders, 
  createLeaderProfile, 
  deleteLeaderProfile, 
  setCurrentLeaderId,
  resetAllAppData
} from '../utils/storage';
import { 
  Ship, 
  User, 
  Users, 
  Truck, 
  Plus, 
  Trash2, 
  LogIn, 
  ShieldCheck, 
  BadgeAlert, 
  CheckCircle2, 
  Anchor
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (leader: LeaderProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [leaders, setLeaders] = useState<LeaderProfile[]>(getStoredLeaders());
  const [activeTab, setActiveTab] = useState<'saved' | 'register'>(() => {
    const stored = getStoredLeaders();
    return stored.length > 0 ? 'saved' : 'register';
  });

  // New Leader Form State
  const [newName, setNewName] = useState('');
  const [newReg, setNewReg] = useState('');
  const [newPort, setNewPort] = useState('');
  const [newBarge, setNewBarge] = useState('');

  // Drivers list in registration
  const [driverInput, setDriverInput] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Team members list in registration
  const [teamInput, setTeamInput] = useState('');
  const [teamRole, setTeamRole] = useState<TeamMember['role']>('Vistoriador');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectLeader = (leader: LeaderProfile) => {
    setCurrentLeaderId(leader.id);
    onLoginSuccess(leader);
  };

  const handleDeleteLeader = (e: React.MouseEvent, leaderId: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja apagar este perfil de líder e sua equipe cadastrada?')) {
      deleteLeaderProfile(leaderId);
      const updated = getStoredLeaders();
      setLeaders(updated);
      setSuccessMessage('Perfil de líder removido com sucesso.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleAddDriver = () => {
    if (!driverInput.trim()) return;
    setDrivers(prev => [
      ...prev,
      {
        id: `drv-${Date.now()}`,
        name: driverInput.trim(),
        badgeNumber: `M-${prev.length + 1}`,
      },
    ]);
    setDriverInput('');
  };

  const handleRemoveDriver = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  const handleAddTeamMember = () => {
    if (!teamInput.trim()) return;
    setTeamMembers(prev => [
      ...prev,
      {
        id: `tm-${Date.now()}`,
        name: teamInput.trim(),
        role: teamRole,
      },
    ]);
    setTeamInput('');
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(tm => tm.id !== id));
  };

  const handleCreateLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMessage('Por favor, informe o nome completo do líder de operação.');
      return;
    }
    if (!newReg.trim()) {
      setErrorMessage('Por favor, informe a matrícula ou identificador do líder.');
      return;
    }
    if (drivers.length === 0) {
      setErrorMessage('Cadastre ao menos 1 motorista de manobra para a equipe do líder.');
      return;
    }

    const created = createLeaderProfile({
      name: newName.trim(),
      registrationNumber: newReg.trim(),
      basePort: newPort.trim() || 'Terminal Fluvial',
      defaultBarge: newBarge.trim() || undefined,
      drivers: drivers,
      teamMembers: teamMembers,
    });

    const updated = getStoredLeaders();
    setLeaders(updated);
    setSuccessMessage(`Líder ${created.name} cadastrado com sucesso!`);
    
    // Automatic login
    setCurrentLeaderId(created.id);
    setTimeout(() => {
      onLoginSuccess(created);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Top Banner Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-700 text-white mb-3">
          <Ship className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          PortoBalsa Operações
        </h1>
        <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">
          Controle de Tempos e Movimentação Operacional Fluvial
        </p>

        {/* Security & Access Notice */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-200 text-xs text-slate-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Identificação Obrigatória do Líder de Operação</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
          {/* Tabs Navigation: Logins Salvos vs Cadastrar Novo */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => { setActiveTab('saved'); setErrorMessage(null); }}
              className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'saved'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Logins Salvos ({leaders.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
              className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Líder & Equipe</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <BadgeAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: SAVED LOGINS */}
            {activeTab === 'saved' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Selecione seu Perfil de Líder
                  </h3>
                  <span className="text-xs text-slate-500">
                    Clique no card para acessar o sistema
                  </span>
                </div>

                {leaders.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                    <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Nenhum líder salvo no momento</p>
                    <button
                      onClick={() => setActiveTab('register')}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Cadastrar primeiro líder
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {leaders.map((leader) => (
                      <div
                        key={leader.id}
                        onClick={() => handleSelectLeader(leader)}
                        className="group relative p-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3.5">
                            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-bold text-base transition-colors shrink-0">
                              {leader.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 group-hover:text-blue-900 text-base">
                                  {leader.name}
                                </h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  {leader.registrationNumber}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <Anchor className="w-3 h-3 text-slate-400" />
                                {leader.basePort}
                                {leader.defaultBarge && ` • Balsa habitual: ${leader.defaultBarge}`}
                              </p>

                              {/* Drivers and team badges preview */}
                              <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
                                  <Truck className="w-3 h-3" />
                                  {leader.drivers.length} Motorista{leader.drivers.length > 1 ? 's' : ''} vinculados
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                                  <Users className="w-3 h-3" />
                                  {leader.teamMembers.length} Apoio/Vistoria
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={(e) => handleDeleteLeader(e, leader.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Apagar este perfil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer">
                              <span>Entrar</span>
                              <LogIn className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REGISTER NEW LEADER */}
            {activeTab === 'register' && (
              <form onSubmit={handleCreateLeaderSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Nome do Líder de Operação *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Emmili Oliveira Gonçalves"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Matrícula / ID do Líder *
                    </label>
                    <input
                      type="text"
                      required
                      value={newReg}
                      onChange={(e) => setNewReg(e.target.value)}
                      placeholder="Ex: LID-84920"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Terminal / Porto Base
                    </label>
                    <input
                      type="text"
                      value={newPort}
                      onChange={(e) => setNewPort(e.target.value)}
                      placeholder="Ex: Terminal Fluvial Central"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Balsa Habitual (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newBarge}
                      onChange={(e) => setNewBarge(e.target.value)}
                      placeholder="Ex: Balsa Solimões IV"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Sub-section: Motoristas da Equipe */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase">
                      <Truck className="w-4 h-4 text-blue-700" />
                      <span>Motoristas de Manobra da Equipe (Obrigatório para Cronômetro)</span>
                    </div>
                    <span className="text-[11px] text-blue-700 font-medium">
                      {drivers.length} cadastrado(s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Estes motoristas aparecerão na tela de cronometragem para contagem individual e simultânea de movimentação de cargas.
                  </p>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={driverInput}
                      onChange={(e) => setDriverInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDriver();
                        }
                      }}
                      placeholder="Nome do motorista (Ex: Roberto Silva - Carreta 01)"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddDriver}
                      className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {drivers.map((drv) => (
                      <div
                        key={drv.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs text-slate-800 shadow-2xs"
                      >
                        <span className="font-semibold text-blue-900">{drv.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDriver(drv.id)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Remover motorista"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-section: Integrantes de Vistoria e Rampa */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase">
                      <Users className="w-4 h-4 text-slate-600" />
                      <span>Vistoriadores e Auxiliares de Rampa</span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">
                      {teamMembers.length} integrante(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    <input
                      type="text"
                      value={teamInput}
                      onChange={(e) => setTeamInput(e.target.value)}
                      placeholder="Nome do integrante"
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                    />
                    <div className="flex gap-2">
                      <select
                        value={teamRole}
                        onChange={(e) => setTeamRole(e.target.value as any)}
                        className="flex-1 px-2 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                      >
                        <option value="Vistoriador">Vistoriador</option>
                        <option value="Auxiliar de Rampa">Auxiliar</option>
                        <option value="Conferente">Conferente</option>
                        <option value="Segurança Operacional">Segurança</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((tm) => (
                      <div
                        key={tm.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
                      >
                        <span className="font-semibold text-slate-900">{tm.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({tm.role})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(tm.id)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('saved')}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Salvar e Acessar Painel</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-center text-xs text-slate-500">
            PortoBalsa Operações • Sistema de Cronometragem e Controle Diário
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Atenção: Deseja apagar todas as operações e logins salvos neste navegador e reiniciar o sistema 100% limpo?')) {
                resetAllAppData();
                window.location.reload();
              }
            }}
            className="text-[11px] text-slate-400 hover:text-red-600 underline cursor-pointer"
          >
            Limpar todos os dados locais do navegador
          </button>
        </div>
      </div>
    </div>
  );
};
