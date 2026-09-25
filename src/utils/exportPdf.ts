import jsPDF from 'jspdf';
import { Operation } from '../types';
import { formatDuration } from './storage';

export function exportOperationPdf(operation: Operation): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 16;

  // Header Background
  doc.setFillColor(15, 76, 129); // Classic Marine Navy Blue
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PORTOBALSA - RELATÓRIO OFICIAL DE CONTROLE DIÁRIO & DESEMPENHO', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Análise de Tempos, Manobras Fluviais, Vistorias e Produtividade por Turno', 14, 17);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - 14, 17, { align: 'right' });

  y = 32;

  // Operation Summary Card (Integrando Dados da Planilha de Controle Diário)
  doc.setFillColor(244, 247, 251);
  doc.roundedRect(12, y, pageWidth - 24, 46, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, y, pageWidth - 24, 46, 3, 3, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${operation.operationCode} • [TURNO: ${operation.shift?.toUpperCase() || 'DIA'}]`, 18, y + 7);

  // Status badge
  const statusColor = operation.status === 'CONCLUIDA' ? [22, 101, 52] : [180, 83, 9];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFontSize(8.5);
  doc.text(`STATUS: ${operation.status.replace('_', ' ')}`, pageWidth - 18, y + 7, { align: 'right' });

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // Coluna 1: Embarcação e Líder
  doc.text(`Balsa / Embarcação:`, 18, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(operation.bargeName, 52, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Empurrador Fluvial:`, 18, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(operation.tugboat || 'N/I', 52, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.text(`Equipe / Líder:`, 18, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.text(operation.leaderName, 52, y + 26);

  doc.setFont('helvetica', 'normal');
  doc.text(`Data da Operação:`, 18, y + 32);
  doc.setFont('helvetica', 'bold');
  doc.text(operation.date, 52, y + 32);

  // Coluna 2: Tempos Fluviais (Atracação, Início, Fim, Desatracação)
  const col2X = 110;
  doc.setFont('helvetica', 'normal');
  doc.text(`Atracação:`, col2X, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(operation.dockingTime || '--:--', col2X + 28, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Início Manobra:`, col2X, y + 20);
  doc.setFont('helvetica', 'bold');
  const startStr = operation.actualStartTime ? (operation.actualStartTime.includes('T') ? new Date(operation.actualStartTime).toLocaleTimeString('pt-BR') : operation.actualStartTime) : operation.scheduledTime;
  doc.text(startStr, col2X + 28, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.text(`Fim Manobra:`, col2X, y + 26);
  doc.setFont('helvetica', 'bold');
  const endStr = operation.actualEndTime ? (operation.actualEndTime.includes('T') ? new Date(operation.actualEndTime).toLocaleTimeString('pt-BR') : operation.actualEndTime) : '--:--';
  doc.text(endStr, col2X + 28, y + 26);

  doc.setFont('helvetica', 'normal');
  doc.text(`Desatracação:`, col2X, y + 32);
  doc.setFont('helvetica', 'bold');
  doc.text(operation.undockingTime || '--:--', col2X + 28, y + 32);

  // Linha inferior do card: Faltas e Ocorrências
  doc.setFont('helvetica', 'normal');
  doc.text(`Ausências da Equipe:`, 18, y + 39);
  doc.setFont('helvetica', 'bold');
  doc.text(`${operation.teamAbsencesCount || 0} (${operation.teamAbsencesNote || 'Sem faltas'})`, 52, y + 39);

  doc.setFont('helvetica', 'normal');
  doc.text(`Ocorrências / Placas:`, col2X, y + 39);
  doc.setFont('helvetica', 'bold');
  const truncInc = (operation.incidentNotes || 'Nenhuma avaria').substring(0, 38);
  doc.text(truncInc, col2X + 28, y + 39);

  y += 52;

  // KPIS ESPECÍFICOS DO CONTROLE DIÁRIO (6 colunas compactas)
  const kpiCount = 6;
  const kpiWidth = (pageWidth - 24 - (kpiCount - 1) * 2.5) / kpiCount;
  const kpiHeight = 17;
  const kpis = [
    { label: 'EMBARCADAS', value: `${operation.embarkedCount ?? (operation.type === 'EMBARQUE' ? operation.movements.length : 0)}`, sub: 'Frotas' },
    { label: 'DESEMBARCADAS', value: `${operation.disembarkedCount ?? (operation.type === 'DESEMBARQUE' ? operation.movements.length : 0)}`, sub: 'Frotas' },
    { label: 'VISTORIAS', value: `${operation.inspectionsCount || 0}`, sub: 'Com avaria' },
    { label: 'PRAINHA', value: `${operation.waitingPrainhaCount || 0}`, sub: 'Aguardando' },
    { label: 'TEMPO LÍQUIDO', value: formatDuration(operation.activeOperatingSeconds), sub: 'Em manobra' },
    { label: 'PAUSAS', value: formatDuration(operation.pausedSeconds), sub: `${operation.pauses.length} parada(s)` },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = 12 + idx * (kpiWidth + 2.5);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(kpiX, y, kpiWidth, kpiHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kpiX, y, kpiWidth, kpiHeight, 2, 2, 'S');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(kpi.label, kpiX + kpiWidth / 2, y + 4.5, { align: 'center' });

    doc.setTextColor(15, 76, 129);
    doc.setFontSize(10.5);
    doc.text(kpi.value, kpiX + kpiWidth / 2, y + 10.5, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(kpi.sub, kpiX + kpiWidth / 2, y + 14.5, { align: 'center' });
  });

  y += kpiHeight + 8;

  // Section: Movimentações por Motorista
  doc.setTextColor(15, 76, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('REGISTRO CRONOMETRADO DE MOVIMENTAÇÕES INDIVIDUAIS POR MOTORISTA', 12, y);

  y += 4;

  // Table Header
  doc.setFillColor(15, 76, 129);
  doc.rect(12, y, pageWidth - 24, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  doc.text('#', 15, y + 4.2);
  doc.text('Motorista', 22, y + 4.2);
  doc.text('Tipo de Carga', 72, y + 4.2);
  doc.text('Identificação / Placa', 118, y + 4.2);
  doc.text('Início', 156, y + 4.2);
  doc.text('Duração', pageWidth - 16, y + 4.2, { align: 'right' });

  y += 6.5;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  if (operation.movements.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text('Nenhuma manobra cronometrada registrada nesta operação.', 15, y + 6);
    y += 10;
  } else {
    operation.movements.forEach((mov, idx) => {
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 15;
      }

      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(12, y, pageWidth - 24, 6, 'F');
      }

      doc.setTextColor(51, 65, 85);
      doc.text(String(idx + 1).padStart(2, '0'), 15, y + 4.2);
      
      const truncDriver = mov.driverName.length > 28 ? mov.driverName.substring(0, 26) + '..' : mov.driverName;
      doc.text(truncDriver, 22, y + 4.2);

      const truncCargo = mov.cargoType.length > 25 ? mov.cargoType.substring(0, 23) + '..' : mov.cargoType;
      doc.text(truncCargo, 72, y + 4.2);

      const truncUnit = mov.unitIdentifier.length > 20 ? mov.unitIdentifier.substring(0, 18) + '..' : mov.unitIdentifier;
      doc.text(truncUnit, 118, y + 4.2);

      const startFormatted = mov.startTime.includes('T')
        ? new Date(mov.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : mov.startTime;
      doc.text(startFormatted, 156, y + 4.2);

      doc.setFont('helvetica', 'bold');
      doc.text(formatDuration(mov.durationSeconds), pageWidth - 16, y + 4.2, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      y += 6;
    });
  }

  y += 5;

  // Pauses Section
  if (operation.pauses.length > 0) {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 15;
    }

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`REGISTRO DE PARADAS E ESPERAS (${operation.pauses.length})`, 12, y);
    y += 4;

    doc.setFillColor(254, 243, 199);
    doc.rect(12, y, pageWidth - 24, 5.5, 'F');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 15, y + 3.8);
    doc.text('Categoria / Motivo', 25, y + 3.8);
    doc.text('Justificativa Operacional', 75, y + 3.8);
    doc.text('Tempo Parado', pageWidth - 16, y + 3.8, { align: 'right' });
    y += 5.5;

    operation.pauses.forEach((p, idx) => {
      doc.setFillColor(255, 251, 235);
      doc.rect(12, y, pageWidth - 24, 5.5, 'F');
      doc.setTextColor(120, 53, 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(String(idx + 1), 15, y + 3.8);
      doc.text(p.category, 25, y + 3.8);
      
      const truncReason = p.reason.length > 45 ? p.reason.substring(0, 42) + '...' : p.reason;
      doc.text(truncReason, 75, y + 3.8);

      doc.setFont('helvetica', 'bold');
      doc.text(formatDuration(p.durationSeconds), pageWidth - 16, y + 3.8, { align: 'right' });
      y += 5.5;
    });

    y += 5;
  }

  // Signature Block
  if (y > pageHeight - 32) {
    doc.addPage();
    y = 20;
  }

  const sigY = Math.max(y + 8, pageHeight - 26);
  doc.setDrawColor(148, 163, 184);
  doc.line(20, sigY, 90, sigY);
  doc.line(pageWidth - 90, sigY, pageWidth - 20, sigY);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(operation.leaderName, 55, sigY + 4, { align: 'center' });
  doc.text(`Líder de Operação (${operation.shift || 'Dia'})`, 55, sigY + 8, { align: 'center' });

  doc.text('Vistoriador / Coordenação Fluvial', pageWidth - 55, sigY + 4, { align: 'center' });
  doc.text('Conferência de Cargas, Atracação e Rampa', pageWidth - 55, sigY + 8, { align: 'center' });

  const filename = `PortoBalsa_${operation.operationCode.replace(/\s+/g, '_')}_${operation.date}.pdf`;
  doc.save(filename);
}
