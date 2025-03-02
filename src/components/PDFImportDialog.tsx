import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { extractClientFromPDF } from '../utils/pdfImport';
import type { Client } from '../types';

interface PDFImportDialogProps {
  onClose: () => void;
  onImport: (clientData: Partial<Client>) => void;
}

export function PDFImportDialog({ onClose, onImport }: PDFImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<Client> | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    setError(null);

    try {
      const file = acceptedFiles[0];
      if (!file) return;

      const clientData = await extractClientFromPDF(file);
      setExtractedData(clientData);
    } catch (err) {
      setError('Error al procesar el PDF. Asegúrate de que es un archivo válido.');
      console.error('PDF processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleImport = () => {
    if (extractedData) {
      onImport(extractedData);
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      {!extractedData && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300">
            {isDragActive
              ? 'Suelta el archivo aquí...'
              : 'Arrastra un PDF o haz clic para seleccionarlo'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Solo archivos PDF
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-400">Procesando PDF...</p>
        </div>
      )}

      {error && (
        <div className="bg-pink-500/10 border border-pink-500 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-pink-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-pink-500">{error}</p>
        </div>
      )}

      {extractedData && (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-green-500">Datos extraídos correctamente</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Datos Extraídos</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Establecimiento
                </label>
                <p className="mt-1">{extractedData.establishmentName || '(No encontrado)'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  NIF/DNI
                </label>
                <p className="mt-1">{extractedData.nif || '(No encontrado)'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Dirección
                </label>
                <p className="mt-1">
                  {extractedData.address?.street} {extractedData.address?.number}
                  <br />
                  {extractedData.address?.postalCode} {extractedData.address?.city}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Contacto
                </label>
                <p className="mt-1">
                  {extractedData.phone && <span>Tel: {extractedData.phone}<br /></span>}
                  {extractedData.email && <span>Email: {extractedData.email}</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleImport}>
              Importar Cliente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
