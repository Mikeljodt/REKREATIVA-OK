import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Mail, Share2, Download, X } from 'lucide-react';
import type { CollectionDocument } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DocumentPreviewProps {
  document: CollectionDocument;
  onClose: () => void;
  onShare: (method: 'email' | 'whatsapp' | 'telegram') => void;
  onDownload: () => void;
}

export function DocumentPreview({ document, onClose, onShare, onDownload }: DocumentPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {document.type === 'invoice' ? 'Factura' : 'Ticket'} #{document.number}
          </h3>
          <p className="text-sm text-gray-400">
            {formatDate(document.date)}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <Card className="p-6 bg-white text-gray-900">
        <div className="space-y-6">
          <div className="text-center border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold">Rekreativ@</h2>
            <p className="text-sm text-gray-600">
              {document.type === 'invoice' ? 'Factura de Recaudación' : 'Ticket de Recaudación'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Recaudación</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">Contador Anterior</p>
                  <p className="font-medium">{document.previousCollection.counter}</p>
                </div>
                <div>
                  <p className="text-sm">Contador Actual</p>
                  <p className="font-medium">{document.currentCollection.counter}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Desglose</p>
              {document.type === 'invoice' && (
                <>
                  <div className="flex justify-between">
                    <p>Base Imponible</p>
                    <p>{formatCurrency(document.breakdown.subtotal)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>IVA (21%)</p>
                    <p>{formatCurrency(document.breakdown.vat || 0)}</p>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold border-t border-gray-200 mt-2 pt-2">
                <p>Total</p>
                <p>{formatCurrency(document.totalAmount)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Reparto</p>
              <div className="flex justify-between">
                <p>Parte Cliente</p>
                <p>{formatCurrency(document.breakdown.clientShare)}</p>
              </div>
              <div className="flex justify-between">
                <p>Parte Operador</p>
                <p>{formatCurrency(document.breakdown.operatorShare)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onShare('email')}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onShare('whatsapp')}
          >
            <Share2 className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onShare('telegram')}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Telegram
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
      </div>
    </div>
  );
}
