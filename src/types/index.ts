export type OperationType = 'EMBARQUE' | 'DESEMBARQUE' | 'MISTO (EMBARQUE & DESEMBARQUE)';

export type OperationStatus = 'AGUARDANDO_INICIO' | 'EM_ANDAMENTO' | 'PAUSADA' | 'CONCLUIDA';

export type ShiftType = 'Dia' | 'Noite';

export type CargoType = 
  | 'Baú 28 pés'
  | 'Baú 30 pés'
  | 'Carreta Sider'
  | 'Carreta Graneleira'
  | 'Container 20ft/40ft'
  | 'Veículo Leve / Utilitário'
  | 'Carga Geral / Paletizada'
  | 'Carga Crítica (Sem borda)';

export interface Driver {
  id: string;
  name: string;
  badgeNumber?: string;
  isExternal?: boolean; // Caso seja motorista rotativo/avulso
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Vistoriador' | 'Auxiliar de Rampa' | 'Conferente' | 'Segurança Operacional';
}

export interface LeaderProfile {
  id: string;
  name: string;
  registrationNumber: string; // Matrícula
  basePort: string; // Ex: Porto Chibatão, Porto das Lajes, Terminal Fluvial
  defaultBarge?: string;
  defaultShift?: ShiftType;
  drivers: Driver[];
  teamMembers: TeamMember[];
  createdAt: string;
}

export interface MovementCycle {
  id: string;
  driverId: string;
  driverName: string;
  cargoType: CargoType;
  unitIdentifier: string; // Placa da carreta, número do baú ou container
  startTime: string; // ISO string ou HH:mm:ss
  endTime: string; // ISO string ou HH:mm:ss
  durationSeconds: number;
  notes?: string;
}

export interface ActiveDriverMovement {
  driverId: string;
  driverName: string;
  cargoType: CargoType;
  unitIdentifier: string;
  startTime: string; // ISO string
  elapsedSeconds: number;
}

export interface PauseRecord {
  id: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  reason: string;
  category: 'Condições Climáticas / Maré' | 'Manobra de Balsa' | 'Aguardando Rampa / Trânsito' | 'Avaria Mecânica' | 'Vistoria / Documentação' | 'Almoço / Troca de Turno' | 'Outro';
}

export interface Operation {
  id: string;
  operationCode: string; // Ex: "OP-76", "OP-81", "OP-102"
  type: OperationType;
  bargeName: string; // Nome da balsa (ex: Balsa Solimões IV ou TBL 82)
  date: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  leaderId: string;
  leaderName: string; // Ex: Willison, Samuel, Erick, Rafael, Emmili
  status: OperationStatus;
  
  // Dados Específicos do CONTROLE DIÁRIO (Planilha de Operação)
  shift: ShiftType; // Turno: "Dia" ou "Noite"
  tugboat: string; // Empurrador fluvial (ex: "82", "74 / 68", "92/ 72", "90/76")
  dockingTime?: string; // Horário de Atracação (ex: "07:30:00")
  undockingTime?: string; // Horário de Desatracação (ex: "15:25:00")
  
  embarkedCount: number; // Frotas embarcadas
  disembarkedCount: number; // Frotas desembarcadas
  inspectionsCount: number; // Vistorias (com avarias/inspeção detalhada)
  noShowCount: number; // No Show (não compareceu)
  withoutDocsCount: number; // Sem documentos
  withoutManifestCount: number; // Sem manifesto
  
  closedListBefore: 'SIM' | 'NÃO' | 'SEM OPERAÇÃO'; // Lista fechada antes?
  hadOperation: 'SIM' | 'NÃO'; // Houve operação?
  hadDirection: 'SIM' | 'NÃO'; // Houve direcionamento?
  
  waitingPrainhaCount: number; // Frotas aguardando Prainha
  teamAbsencesCount: number; // Ausências
  teamAbsencesNote?: string; // Ex: "Faltas: 1/7 férias", "Faltas: 2/7 atestado", "Sem faltas"
  incidentNotes?: string; // Observações / placas (ex: "CT 5910 danificado", "Avaria na frota B001")

  // Planejamento
  estimatedTimeMinutes: number;
  plannedCargosCount: number;
  cargoBreakdownNote?: string;
  hasCriticalCargos: boolean;
  criticalCargoRules?: string; // Cuidados de balanceamento e restrições de borda
  
  // Equipe designada para a operação
  assignedDrivers: Driver[];
  assignedTeamMembers: TeamMember[];

  // Execução
  actualStartTime?: string; // Início
  actualEndTime?: string; // Fim
  totalDurationSeconds: number;
  activeOperatingSeconds: number;
  pausedSeconds: number;

  // Logs
  movements: MovementCycle[];
  pauses: PauseRecord[];
  
  generalObservations?: string;
  createdAt: string;
  updatedAt: string;
}
