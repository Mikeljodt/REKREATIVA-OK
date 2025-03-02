import { jsPDF } from 'jspdf';
import type { CollectionDocument, Client, Machine, InstallationProtocol } from '../types';
import { formatCurrency, formatDate } from './formatters';

interface DocumentData {
  document: CollectionDocument;
  client: Client;
  machine: Machine;
}

export const generateCollectionPDF = async ({ document, client, machine }: DocumentData): Promise<jsPDF> => {
  const { companyProfile } = useStore.getState();
  
  // Create new document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let y = margin;

  // Helper functions
  const addLine = (text: string, indent = 0) => {
    doc.text(text, margin + indent, y);
    y += 6;
  };

  const addSection = (title: string) => {
    y += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
  };

  // Common header with logo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyProfile.name, pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.text(
    document.type === 'invoice' ? 'FACTURA' : 'TICKET DE RECAUDACIÓN',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 15;

  // Document information
  doc.setFontSize(10);
  addLine(`Nº ${document.number}`);
  addLine(`Fecha: ${formatDate(document.date)}`);
  
  if (document.type === 'invoice') {
    // Company information
    addSection('DATOS EMISOR');
    addLine(companyProfile.name);
    addLine(`NIF: ${companyProfile.nif}`);
    addLine(companyProfile.address);
    addLine(`${companyProfile.postalCode} ${companyProfile.city}`);
    addLine(`Tel: ${companyProfile.phone}`);
    addLine(`Email: ${companyProfile.email}`);

    addSection('DATOS CLIENTE');
    addLine(client.establishmentName);
    addLine(`NIF: ${client.nif}`);
    addLine(`${client.address.street}, ${client.address.number}`);
    addLine(`${client.address.postalCode} ${client.address.city}`);
    addLine(`${client.address.province}`);
  }

  // Machine and collection details
  addSection('DETALLES DE LA RECAUDACIÓN');
  addLine(`Máquina: ${machine.name} (${machine.model})`);
  addLine(`Tipo: ${machine.type}`);
  addLine(`Serie: ${machine.serialNumber || 'N/A'}`);

  // Counters
  addSection('CONTADORES');
  addLine(`Anterior: ${document.previousCollection.counter}`);
  addLine(`Actual: ${document.currentCollection.counter}`);
  addLine(`Total partidas: ${document.currentCollection.counter - document.previousCollection.counter}`);

  // Economic breakdown
  addSection('DESGLOSE ECONÓMICO');
  
  if (document.type === 'invoice') {
    addLine(`Base Imponible: ${formatCurrency(document.breakdown.subtotal)}`);
    addLine(`IVA (21%): ${formatCurrency(document.breakdown.vat || 0)}`);
    doc.setFont('helvetica', 'bold');
    addLine(`Total: ${formatCurrency(document.totalAmount)}`);
    doc.setFont('helvetica', 'normal');
  } else {
    doc.setFont('helvetica', 'bold');
    addLine(`Total Recaudado: ${formatCurrency(document.totalAmount)}`);
    doc.setFont('helvetica', 'normal');
  }

  addSection('REPARTO');
  addLine(`Parte Cliente (${(document.breakdown.clientShare / document.totalAmount * 100).toFixed(1)}%): ${formatCurrency(document.breakdown.clientShare)}`);
  addLine(`Parte Operador: ${formatCurrency(document.breakdown.operatorShare)}`);

  // Footer
  y = doc.internal.pageSize.height - 30;
  doc.setFontSize(8);
  if (document.type === 'invoice') {
    doc.text(
      'Este documento es una factura oficial según el Real Decreto 1619/2012',
      pageWidth / 2,
      y,
      { align: 'center' }
    );
  } else {
    doc.text(
      'Este documento es un comprobante de recaudación y no tiene validez fiscal',
      pageWidth / 2,
      y,
      { align: 'center' }
    );
  }

  // Sequential number and date in footer
  y += 5;
  doc.text(
    `${document.number} - ${formatDate(document.date)}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  return doc;
};

export const generateInstallationSheetPDF = async (protocol: InstallationProtocol, machine: Machine, client: Client): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let y = margin;

  // Helper functions
  const addLine = (text: string, indent = 0) => {
    doc.text(text, margin + indent, y);
    y += 6;
  };

  const addSection = (title: string) => {
    y += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
  };

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HOJA DE INSTALACIÓN', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Basic information
  doc.setFontSize(10);
  addLine(`Fecha: ${formatDate(protocol.date)}`);
  addLine(`Técnico: ${protocol.installedBy}`);

  // Client information
  addSection('DATOS DEL CLIENTE');
  addLine(client.establishmentName);
  addLine(`${client.address.street}, ${client.address.number}`);
  addLine(`${client.address.postalCode} ${client.address.city}`);
  addLine(`${client.address.province}`);
  addLine(`Tel: ${client.phone}`);

  // Machine information
  addSection('DATOS DE LA MÁQUINA');
  addLine(`Nombre: ${machine.name}`);
  addLine(`Modelo: ${machine.model}`);
  addLine(`Tipo: ${machine.type}`);
  addLine(`Serie: ${machine.serialNumber || 'N/A'}`);

  // Installation checks
  addSection('VERIFICACIONES PRE-INSTALACIÓN');
  protocol.preInstallationChecks.forEach(check => {
    addLine(`□ ${check.item}: ${check.status === 'passed' ? '✓' : '✗'}`, 5);
  });

  // Initial counters
  addSection('CONTADORES INICIALES');
  addLine(`Mecánico: ${protocol.initialCounters.mechanical}`);
  addLine(`Electrónico: ${protocol.initialCounters.electronic}`);

  // Test results
  addSection('PRUEBAS DE INSTALACIÓN');
  protocol.testResults.forEach(test => {
    addLine(`□ ${test.test}: ${test.result === 'passed' ? '✓' : '✗'}`, 5);
  });

  // Location
  addSection('UBICACIÓN');
  addLine(`Latitud: ${protocol.location.coordinates.lat}`);
  addLine(`Longitud: ${protocol.location.coordinates.lng}`);
  if (protocol.location.notes) {
    addLine(`Notas: ${protocol.location.notes}`);
  }

  // Signatures
  addSection('FIRMAS');
  y += 20;

  // Add client signature if available
  if (protocol.clientSignature.signature) {
    const signatureImg = protocol.clientSignature.signature;
    doc.addImage(signatureImg, 'PNG', margin, y, 50, 20);
  }

  y += 25;
  doc.setFontSize(8);
  addLine(`${protocol.clientSignature.name}`);
  addLine(`${protocol.clientSignature.position}`);
  addLine(`Fecha: ${formatDate(protocol.clientSignature.date)}`);

  // Footer
  y = doc.internal.pageSize.height - 30;
  doc.setFontSize(8);
  doc.text(
    'Este documento certifica la correcta instalación del equipo según las normativas vigentes',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  return doc;
};
