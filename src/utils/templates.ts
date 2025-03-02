import { utils, WorkBook, WorkSheet } from 'xlsx';

export const generateClientTemplate = (): WorkBook => {
  const ws: WorkSheet = utils.aoa_to_sheet([
    ['Plantilla de Importación de Clientes - Rekreativ@'],
    ['Instrucciones:'],
    ['1. No modifique la estructura de las columnas'],
    ['2. Los campos marcados con (*) son obligatorios'],
    ['3. Use el formato de horas 24h (ejemplo: 09:00)'],
    ['4. Para el día de cierre, use: lunes, martes, miércoles, jueves, viernes, sábado, domingo'],
    [''],
    [
      'Nombre Establecimiento (*)',
      'Dirección Completa (*)',
      'Propietario (*)',
      'Tipo Documento (*)',
      'Número Documento (*)',
      'Teléfono (*)',
      'Email (*)',
      'Hora Apertura (*)',
      'Hora Cierre (*)',
      'Día de Cierre',
      'Motivo Cierre'
    ],
    [
      'Bar Example',
      'Calle Mayor 1, 28001 Madrid',
      'John Doe',
      'nif',
      '12345678Z',
      '+34600000000',
      'example@email.com',
      '09:00',
      '23:00',
      'lunes',
      'Descanso semanal'
    ]
  ]);

  // Configurar validaciones
  ws['!validations'] = [
    {
      sqref: 'D2:D1000',
      type: 'list',
      formula1: '"nif,cif,nie,passport,other"'
    },
    {
      sqref: 'J2:J1000',
      type: 'list',
      formula1: '"lunes,martes,miércoles,jueves,viernes,sábado,domingo"'
    }
  ];

  const wb: WorkBook = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Clientes');
  
  return wb;
};
