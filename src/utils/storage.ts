import { LeaderProfile, Operation, MovementCycle, PauseRecord } from '../types';

const STORAGE_KEYS = {
  CURRENT_LEADER_ID: 'portobalsa_current_leader_id_clean_v1',
  LEADERS: 'portobalsa_leaders_clean_v1',
  OPERATIONS: 'portobalsa_operations_clean_v1',
};

// Limpa chaves legadas com dados de demonstração
try {
  const legacyKeys = [
    'portobalsa_current_leader_id',
    'portobalsa_leaders_v2',
    'portobalsa_operations_v2',
    'portobalsa_leaders',
    'portobalsa_operations',
    'portobalsa_current_leader_id_v2',
  ];
  legacyKeys.forEach(k => {
    localStorage.removeItem(k);
  });
} catch {
  // Ignora se localStorage não estiver disponível
}

// Inicializadores limpos sem dados pré-definidos
const INITIAL_LEADERS: LeaderProfile[] = [];
const INITIAL_OPERATIONS: Operation[] = [];

export function getStoredLeaders(): LeaderProfile[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERS);
    if (!data) {
      saveStoredLeaders(INITIAL_LEADERS);
      return INITIAL_LEADERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_LEADERS;
  }
}

export function saveStoredLeaders(leaders: LeaderProfile[]): void {
  localStorage.setItem(STORAGE_KEYS.LEADERS, JSON.stringify(leaders));
}

export function getCurrentLeader(): LeaderProfile | null {
  const leaders = getStoredLeaders();
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_LEADER_ID);
  if (!currentId || leaders.length === 0) {
    return null;
  }
  return leaders.find(l => l.id === currentId) || null;
}

export function setCurrentLeaderId(leaderId: string | null): void {
  if (!leaderId) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LEADER_ID);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LEADER_ID, leaderId);
  }
}

export function getStoredOperations(): Operation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    if (!data) {
      saveStoredOperations(INITIAL_OPERATIONS);
      return INITIAL_OPERATIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_OPERATIONS;
  }
}

export function saveStoredOperations(operations: Operation[]): void {
  localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(operations));
}

export function saveSingleOperation(operation: Operation): void {
  const ops = getStoredOperations();
  const existingIdx = ops.findIndex(o => o.id === operation.id);
  if (existingIdx >= 0) {
    ops[existingIdx] = { ...operation, updatedAt: new Date().toISOString() };
  } else {
    ops.unshift({ ...operation, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveStoredOperations(ops);
}

export function deleteOperation(operationId: string): void {
  const ops = getStoredOperations().filter(o => o.id !== operationId);
  saveStoredOperations(ops);
}

export function createLeaderProfile(profile: Omit<LeaderProfile, 'id' | 'createdAt'>): LeaderProfile {
  const leaders = getStoredLeaders();
  const newLeader: LeaderProfile = {
    ...profile,
    id: `leader-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  leaders.push(newLeader);
  saveStoredLeaders(leaders);
  return newLeader;
}

export function deleteLeaderProfile(leaderId: string): void {
  const leaders = getStoredLeaders().filter(l => l.id !== leaderId);
  saveStoredLeaders(leaders);
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_LEADER_ID);
  if (currentId === leaderId) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LEADER_ID);
  }
}

export function resetAllAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LEADER_ID);
    localStorage.removeItem(STORAGE_KEYS.LEADERS);
    localStorage.removeItem(STORAGE_KEYS.OPERATIONS);
    localStorage.clear();
  } catch {
    // Ignora
  }
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
