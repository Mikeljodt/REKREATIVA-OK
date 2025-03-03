import { read, utils, writeFileXLSX } from 'xlsx';
import type { Client, Machine, Collection, MaintenanceRecord } from '../types';

interface ImportResult<T> {
  data: T[];
  errors: string[];
}

export const importExcel = async <T>(file: File, type: 'clients' | 'machines' | 'collections' | 'maintenance'): Promise<ImportResult<T>> => {
  const errors: string[] = [];
  const data: T[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

    switch (type) {
      case 'clients':
        jsonData.forEach((row: any, index) => {
          try {
            const client: Client = {
              id: crypto.randomUUID(),
              clientCode: '', // Will be generated by the store
              establishmentName: row['Nombre Comercial'],
              ownerFirstName: row['Nombre'],
              ownerLastName: row['Apellidos'],
              ownerFiscalAddress: row['Dirección Fiscal'],
              documentType: row['Tipo Documento']?.toLowerCase() || 'nif',
              documentNumber: row['Número Documento'],
              documentCountry: 'España',
              fullAddress: row['Dirección Comercial'],
              coordinates: { latitude: 0, longitude: 0 },
              formattedAddress: {
                street: '',
                number: '',
                postalCode: '',
                city: '',
                province: '',
                country: 'España'
              },
              phone: row['Teléfono'],
              email: row['Email'],
              businessHours: {
                standardHours: {
                  open: row['Hora Apertura'] || '09:00',
                  close: row['Hora Cierre'] || '20:00'
                },
                closedDay: null,
                closedDayReason: ''
              },
              contractSigned: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Validaciones básicas
            if (!client.establishmentName) throw new Error('Nombre comercial es obligatorio');
            if (!client.documentNumber) throw new Error('Número de documento es obligatorio');
            if (!client.phone) throw new Error('Teléfono es obligatorio');
            if (!client.email) throw new Error('Email es obligatorio');

            data.push(client as T);
          } catch (e) {
            errors.push(`Error en la fila ${index + 2}: ${e instanceof Error ? e.message : 'Error desconocido'}`);
          }
        });
        break;

      case 'machines':
        jsonData.forEach((row: any, index) => {
          try {
            const machine: Machine = {
              id: crypto.randomUUID(),
              type: row['Tipo'],
              model: row['Modelo'],
              brand: row['Marca'],
              counter: parseInt(row['Contador'] || '0'),
              amortizationValue: parseFloat(row['Valor Amortización'] || '0'),
              amortizationProgress: 0,
              registrationDate: row['Fecha Registro'] || new Date().toISOString(),
              status: 'active',
              clientId: null,
              locationHistory: [],
              maintenanceHistory: [],
              collectionHistory: [],
              serialNumber: row['Número Serie']?.toString().toUpperCase() || '',
              qrCode: '',
              clientSharePercentage: 50
            };

            if (!machine.type) throw new Error('Tipo es obligatorio');
            if (!machine.model) throw new Error('Modelo es obligatorio');
            if (!machine.brand) throw new Error('Marca es obligatoria');

            data.push(machine as T);
          } catch (e) {
            errors.push(`Error en la fila ${index + 2}: ${e instanceof Error ? e.message : 'Error desconocido'}`);
          }
        });
        break;

      case 'collections':
        jsonData.forEach((row: any, index) => {
          try {
            const collection: Collection = {
              id: crypto.randomUUID(),
              machineId: row['ID Máquina'],
              clientId: row['ID Cliente'],
              date: row['Fecha'],
              previousCounter: parseInt(row['Contador Anterior'] || '0'),
              currentCounter: parseInt(row['Contador Actual'] || '0'),
              totalRevenue: parseFloat(row['Ingresos Totales'] || '0'),
              clientShare: parseFloat(row['Parte Cliente'] || '0'),
              operatorShare: parseFloat(row['Parte Operador'] || '0'),
              clientPercentage: parseInt(row['Porcentaje Cliente'] || '50'),
              adjustment: parseFloat(row['Ajuste'] || '0'),
              invoiceNumber: row['Número Factura'] || '',
              invoiceGenerated: false
            };

            if (!collection.machineId) throw new Error('ID de máquina es obligatorio');
            if (!collection.date) throw new Error('Fecha es obligatoria');
            if (collection.currentCounter <= collection.previousCounter) {
              throw new Error('El contador actual debe ser mayor que el anterior');
            }

            data.push(collection as T);
          } catch (e) {
            errors.push(`Error en la fila ${index + 2}: ${e instanceof Error ? e.message : 'Error desconocido'}`);
          }
        });
        break;
    }

  } catch (e) {
    errors.push(`Error al procesar el archivo: ${e instanceof Error ? e.message : 'Error desconocido'}`);
  }

  return { data, errors };
};

export const exportToExcel = <T>(data: T[], type: 'clients' | 'machines' | 'collections' | 'maintenance'): void => {
  let worksheet;

  switch (type) {
    case 'clients':
      const clientsData = (data as unknown as Client[]).map(client => ({
        'Código': client.clientCode,
        'Nombre Comercial': client.establishmentName,
        'Nombre': client.ownerFirstName,
        'Apellidos': client.ownerLastName,
        'Dirección Comercial': client.formattedAddress ? 
          `${client.formattedAddress.street}, ${client.formattedAddress.number}, ${client.formattedAddress.city}, ${client.formattedAddress.postalCode}` :
          client.fullAddress,
        'Dirección Fiscal': client.ownerFiscalAddress,
        'Tipo Documento': client.documentType.toUpperCase(),
        'Número Documento': client.documentNumber,
        'Teléfono': client.phone,
        'Email': client.email,
        'Hora Apertura': client.businessHours?.standardHours?.open || '',
        'Hora Cierre': client.businessHours?.standardHours?.close || '',
        'Día Cierre': client.businessHours?.closedDay || '',
        'Fecha Alta': new Date(client.createdAt).toLocaleDateString()
      }));
      worksheet = utils.json_to_sheet(clientsData);
      break;

    case 'machines':
      const machinesData = (data as unknown as Machine[]).map(machine => ({
        'Tipo': machine.type,
        'Modelo': machine.model,
        'Marca': machine.brand,
        'Contador': machine.counter,
        'Valor Amortización': machine.amortizationValue,
        'Progreso Amortización': `${machine.amortizationProgress}%`,
        'Estado': machine.status,
        'Número Serie': machine.serialNumber,
        'QR Code': machine.qrCode,
        'Fecha Registro': new Date(machine.registrationDate).toLocaleDateString()
      }));
      worksheet = utils.json_to_sheet(machinesData);
      break;

    case 'collections':
      const collectionsData = (data as unknown as Collection[]).map(collection => ({
        'ID Máquina': collection.machineId,
        'ID Cliente': collection.clientId,
        'Fecha': new Date(collection.date).toLocaleDateString(),
        'Contador Anterior': collection.previousCounter,
        'Contador Actual': collection.currentCounter,
        'Ingresos Totales': collection.totalRevenue,
        'Parte Cliente': collection.clientShare,
        'Parte Operador': collection.operatorShare,
        'Porcentaje Cliente': collection.clientPercentage,
        'Ajuste': collection.adjustment,
        'Número Factura': collection.invoiceNumber
      }));
      worksheet = utils.json_to_sheet(collectionsData);
      break;
  }

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Data');

  // Generate filename with current date
  const fileName = `${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Use writeFileXLSX from xlsx package
  writeFileXLSX(workbook, fileName);
};
