import * as XLSX from 'xlsx';
import { Operation } from '../types';
import { formatDuration } from './storage';

/**
 * EXPORTAÇÃO EXCLUSIVA DE UMA ÚNICA OPERAÇÃO
 * Gera uma pasta de trabalho detalhada contendo:
 * 1. Cada frota movimentada com tempo individual exato, motorista e horário
 * 2. Cada pausa/espera detalhada com justificativa e duração
 * 3. Consolidado analítico de produtividade por motorista
 * 4. Ficha técnica de tempos totais, atracação, desatracação e frotas
 */
export function exportOperationExcel(operation: Operation): void {
  const wb = XLSX.utils.book_new();

  // ABA 1 (PRINCIPAL): DETALHAMENTO DE CADA FROTA / CARGA MOVIMENTADA
  const frotasDetalhadas = operation.movements.length > 0 
    ? operation.movements.map((mov, idx) => {
        const duracaoMin = (mov.durationSeconds / 60).toFixed(2);
        return {
          'Nº da Frota': idx + 1,
          'Identificação da Carga / Placa / Baú': mov.unitIdentifier,
          'Tipo de Carga': mov.cargoType,
          'Operação': operation.type,
          'Motorista da Manobra': mov.driverName,
          'Horário Início da Movimentação': mov.startTime.includes('T') 
            ? new Date(mov.startTime).toLocaleTimeString('pt-BR') 
            : mov.startTime,
          'Horário Fim da Movimentação': mov.endTime.includes('T') 
            ? new Date(mov.endTime).toLocaleTimeString('pt-BR') 
            : mov.endTime,
          'Tempo de Operação (mm:ss)': formatDuration(mov.durationSeconds),
          'Tempo em Minutos': Number(duracaoMin),
          'Tempo em Segundos': mov.durationSeconds,
          'Observações da Manobra': mov.notes || '-',
          'Balsa': operation.bargeName,
          'Empurrador': operation.tugboat || '82',
        };
      })
    : [
        {
          'Aviso': 'Nenhuma frota individual foi cronometrada nesta operação ainda.',
          'Frotas Totais Declaradas': operation.embarkedCount + operation.disembarkedCount,
        }
      ];

  const wsFrotas = XLSX.utils.json_to_sheet(frotasDetalhadas);
  // Ajuste de largura das colunas da aba de frotas
  wsFrotas['!cols'] = [
    { wch: 12 }, // Nº Frota
    { wch: 32 }, // Identificação
    { wch: 24 }, // Tipo Carga
    { wch: 18 }, // Operação
    { wch: 30 }, // Motorista
    { wch: 22 }, // Início
    { wch: 22 }, // Fim
    { wch: 20 }, // Tempo mm:ss
    { wch: 18 }, // Tempo Min
    { wch: 18 }, // Tempo Seg
    { wch: 28 }, // Obs
    { wch: 22 }, // Balsa
    { wch: 18 }, // Empurrador
  ];
  XLSX.utils.book_append_sheet(wb, wsFrotas, '1. DETALHE_DAS_FROTAS');

  // ABA 2: REGISTRO DETALHADO DE PAUSAS E ESPERAS
  const pausasDetalhadas = operation.pauses.length > 0
    ? operation.pauses.map((p, idx) => ({
        'Nº da Pausa': idx + 1,
        'Categoria / Motivo': p.category,
        'Justificativa Operacional': p.reason,
        'Horário Início da Parada': p.startTime,
        'Horário Fim da Parada': p.endTime || '-',
        'Tempo de Pausa (mm:ss)': formatDuration(p.durationSeconds),
        'Tempo de Pausa (Minutos)': Number((p.durationSeconds / 60).toFixed(2)),
        'Tempo de Pausa (Segundos)': p.durationSeconds,
        'Operação': operation.operationCode,
      }))
    : [
        {
          'Status': 'Operação sem registros de pausas ou paradas.',
          'Tempo Total em Pausa': '00:00',
        }
      ];

  const wsPausas = XLSX.utils.json_to_sheet(pausasDetalhadas);
  wsPausas['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 45 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPausas, '2. TEMPOS_DE_PAUSA');

  // ABA 3: DESEMPENHO E TEMPOS POR MOTORISTA DESTA OPERAÇÃO
  const driverStats: Record<string, { name: string; count: number; totalTime: number }> = {};
  operation.movements.forEach(m => {
    if (!driverStats[m.driverId]) {
      driverStats[m.driverId] = { name: m.driverName, count: 0, totalTime: 0 };
    }
    driverStats[m.driverId].count += 1;
    driverStats[m.driverId].totalTime += m.durationSeconds;
  });

  const motoristasData = Object.values(driverStats).map(ds => {
    const avgSec = Math.round(ds.totalTime / ds.count);
    return {
      'Motorista': ds.name,
      'Frotas Movimentadas': ds.count,
      '% do Total da Operação': `${Math.round((ds.count / (operation.movements.length || 1)) * 100)}%`,
      'Tempo Total em Ação (mm:ss)': formatDuration(ds.totalTime),
      'Tempo Total (Minutos)': Number((ds.totalTime / 60).toFixed(2)),
      'Tempo Médio por Frota (mm:ss)': formatDuration(avgSec),
      'Tempo Médio por Frota (Minutos)': Number((avgSec / 60).toFixed(2)),
    };
  });

  const wsMotoristas = XLSX.utils.json_to_sheet(
    motoristasData.length > 0 ? motoristasData : [{ 'Aviso': 'Sem manobras registradas por motorista' }]
  );
  wsMotoristas['!cols'] = [
    { wch: 32 },
    { wch: 20 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 24 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMotoristas, '3. DESEMPENHO_MOTORISTAS');

  // ABA 4: FICHA TÉCNICA E CABEÇALHO DO CONTROLE DIÁRIO
  const avgMov = operation.movements.length > 0
    ? Math.round(operation.activeOperatingSeconds / operation.movements.length)
    : 0;

  const fichaGeral = [
    { 'Campo': 'Código da Operação', 'Valor': operation.operationCode },
    { 'Campo': 'Data da Manobra', 'Valor': operation.date },
    { 'Campo': 'Turno', 'Valor': operation.shift || 'Dia' },
    { 'Campo': 'Líder Responsável', 'Valor': operation.leaderName },
    { 'Campo': 'Tipo de Operação', 'Valor': operation.type },
    { 'Campo': 'Balsa / Embarcação', 'Valor': operation.bargeName },
    { 'Campo': 'Empurrador Fluvial', 'Valor': operation.tugboat || '82' },
    { 'Campo': 'Horário de Atracação', 'Valor': operation.dockingTime || '-' },
    { 'Campo': 'Início Efetivo da Operação', 'Valor': operation.actualStartTime || operation.scheduledTime },
    { 'Campo': 'Fim Efetivo da Operação', 'Valor': operation.actualEndTime || '-' },
    { 'Campo': 'Horário de Desatracação', 'Valor': operation.undockingTime || '-' },
    { 'Campo': 'TEMPO TOTAL DA OPERAÇÃO', 'Valor': formatDuration(operation.totalDurationSeconds) },
    { 'Campo': 'TEMPO LÍQUIDO EM MOVIMENTAÇÃO', 'Valor': formatDuration(operation.activeOperatingSeconds) },
    { 'Campo': 'TEMPO TOTAL EM PAUSAS / ESPERAS', 'Valor': formatDuration(operation.pausedSeconds) },
    { 'Campo': 'Quantidade de Pausas Registradas', 'Valor': operation.pauses.length },
    { 'Campo': 'Total de Frotas Embarcadas', 'Valor': operation.embarkedCount ?? (operation.type === 'EMBARQUE' ? operation.movements.length : 0) },
    { 'Campo': 'Total de Frotas Desembarcadas', 'Valor': operation.disembarkedCount ?? (operation.type === 'DESEMBARQUE' ? operation.movements.length : 0) },
    { 'Campo': 'Total de Frotas no Cronômetro Individual', 'Valor': operation.movements.length },
    { 'Campo': 'Tempo Médio por Frota (mm:ss)', 'Valor': formatDuration(avgMov) },
    { 'Campo': 'Vistorias Técnicas Realizadas', 'Valor': operation.inspectionsCount || 0 },
    { 'Campo': 'Frotas Aguardando Prainha', 'Valor': operation.waitingPrainhaCount || 0 },
    { 'Campo': 'Ausências / Faltas da Equipe', 'Valor': `${operation.teamAbsencesCount || 0} (${operation.teamAbsencesNote || 'Sem faltas'})` },
    { 'Campo': 'Lista Fechada Antes?', 'Valor': operation.closedListBefore || 'SIM' },
    { 'Campo': 'Houve Direcionamento?', 'Valor': operation.hadDirection || 'SIM' },
    { 'Campo': 'Observações / Placas / Avarias', 'Valor': operation.incidentNotes || operation.generalObservations || 'Sem avarias' },
  ];

  const wsFicha = XLSX.utils.json_to_sheet(fichaGeral);
  wsFicha['!cols'] = [
    { wch: 38 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsFicha, '4. RESUMO_OPERACIONAL');

  // Nome do arquivo exclusivo da operação
  const filename = `Operacao_${operation.operationCode.replace(/[^a-zA-Z0-9]/g, '_')}_${operation.date}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * EXPORTAÇÃO DO BANCO GERAL CONSOLIDADO (TODAS AS OPERAÇÕES JUNTAS)
 * Chamada apenas a partir da tela de Histórico ou de Controle Diário
 */
export function exportAllOperationsExcel(operations: Operation[]): void {
  const wb = XLSX.utils.book_new();

  // 1. Tabela Matriz Consolidada de Todas as Operações
  const dailyControlRows = operations.map((op, idx) => ({
    'Data': op.date,
    'Turno': op.shift || 'Dia',
    'Equipe': op.leaderName.split(' ')[0] || op.leaderName,
    'Operação': op.operationCode,
    'Empurrador': op.tugboat || '82',
    'Atracação': op.dockingTime || '-',
    'Início': op.actualStartTime || op.scheduledTime,
    'Fim': op.actualEndTime || '-',
    'Desatracação': op.undockingTime || '-',
    'Frotas embarcadas': op.embarkedCount ?? (op.type === 'EMBARQUE' ? op.movements.length : 0),
    'Frotas desembarcadas': op.disembarkedCount ?? (op.type === 'DESEMBARQUE' ? op.movements.length : 0),
    'Vistorias': op.inspectionsCount || 0,
    'No Show': op.noShowCount || 0,
    'Sem documentos': op.withoutDocsCount || 0,
    'Sem manifesto': op.withoutManifestCount || 0,
    'Lista fechada antes?': op.closedListBefore || 'SIM',
    'Houve operação?': op.hadOperation || 'SIM',
    'Houve direcionamento?': op.hadDirection || 'SIM',
    'Frotas aguardando Prainha': op.waitingPrainhaCount || 0,
    'Tempo Total': formatDuration(op.totalDurationSeconds),
    'Tempo Líquido': formatDuration(op.activeOperatingSeconds),
    'Tempo em Pausa': formatDuration(op.pausedSeconds),
    'Observações / placas': op.incidentNotes || op.generalObservations || '',
    'Ausências': op.teamAbsencesCount || 0,
    'Detalhes Faltas': op.teamAbsencesNote || 'Sem faltas',
  }));

  const wsDaily = XLSX.utils.json_to_sheet(dailyControlRows);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'BASE_GERAL_OPERACOES');

  // 2. Histórico de Todas as Frotas de Todas as Operações
  const allMovements: any[] = [];
  operations.forEach(op => {
    op.movements.forEach((mov, mIdx) => {
      allMovements.push({
        'Data': op.date,
        'Operação': op.operationCode,
        'Turno': op.shift,
        'Líder': op.leaderName,
        'Empurrador': op.tugboat,
        'Balsa': op.bargeName,
        'Nº': mIdx + 1,
        'Identificação Unidade': mov.unitIdentifier,
        'Tipo Carga': mov.cargoType,
        'Motorista': mov.driverName,
        'Início': mov.startTime,
        'Fim': mov.endTime,
        'Tempo (mm:ss)': formatDuration(mov.durationSeconds),
        'Tempo (Minutos)': Number((mov.durationSeconds / 60).toFixed(2)),
      });
    });
  });

  const wsMovements = XLSX.utils.json_to_sheet(
    allMovements.length > 0 ? allMovements : [{ 'Aviso': 'Sem frotas registradas' }]
  );
  XLSX.utils.book_append_sheet(wb, wsMovements, 'BASE_TODAS_AS_FROTAS');

  const filename = `PortoBalsa_BANCO_CONSOLIDADO_GERAL_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
