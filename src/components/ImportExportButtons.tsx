import React, { useRef } from 'react';
import { Button } from './ui/Button';
import { Upload, Download, FileText } from 'lucide-react';
import { generateClientTemplate } from '../utils/templates';
import { importExcel, exportToExcel } from '../utils/importExport';
import { useStore } from '../store';
import { utils, writeFile } from 'xlsx';

interface ImportExportButtonsProps {
  type: 'clients' | 'machines' | 'collections' | 'maintenance';
  onImportSuccess?: () => void;
}

export function ImportExportButtons({ type, onImportSuccess }: ImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    addClient, addMachine, addCollection, addMaintenance,
    clients, machines, collections, maintenances
  } = useStore();

  const handleDownloadTemplate = () => {
    let workbook;
    let filename;

    switch (type) {
      case 'clients':
        workbook = generateClientTemplate();
        filename = 'plantilla_clientes.xlsx';
        break;
      // Añadir otros casos según sea necesario
    }

    if (workbook) {
      writeFile(workbook, filename);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importExcel(file, type);
      
      if (result.errors.length > 0) {
        alert(`Se encontraron algunos errores:\n${result.errors.join('\n')}`);
      }

      if (result.data.length > 0) {
        result.data.forEach(item => {
          switch (type) {
            case 'clients':
              addClient(item);
              break;
            case 'machines':
              addMachine(item);
              break;
            case 'collections':
              addCollection(item);
              break;
            case 'maintenance':
              addMaintenance(item);
              break;
          }
        });

        alert(`Se importaron ${result.data.length} registros correctamente.`);
        if (onImportSuccess) onImportSuccess();
      }
    } catch (error) {
      alert(`Error al importar el archivo: ${error.message}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    let data;
    switch (type) {
      case 'clients':
        data = clients;
        break;
      case 'machines':
        data = machines;
        break;
      case 'collections':
        data = collections;
        break;
      case 'maintenance':
        data = maintenances;
        break;
    }

    exportToExcel(data, type);
  };

  return (
    <div className="flex space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />
      
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownloadTemplate}
      >
        <FileText className="h-4 w-4 mr-2" />
        Plantilla
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Importar
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </div>
  );
}
