import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { formatDate } from '../utils/formatters';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import QRCode from 'qrcode.react';

interface AssetDetailsProps {
  assetId: string;
}

export function AssetDetails({ assetId }: AssetDetailsProps) {
  const { assets, machines } = useStore();
  const asset = assets.find(a => a.id === assetId);
  const machine = machines.find(m => m.id === asset?.machineId);

  if (!asset || !machine) return null;

  const getComponentStatusIcon = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-pink-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Identificación</h3>
          <div className="flex items-start space-x-6">
            <div className="bg-white p-4 rounded-lg">
              <QRCode value={asset.qrCode} size={128} />
            </div>
            <div>
              <p className="text-sm text-gray-400">ID de Activo</p>
              <p className="font-mono">{asset.qrCode}</p>
              {asset.rfidTag && (
                <>
                  <p className="text-sm text-gray-400 mt-4">RFID Tag</p>
                  <p className="font-mono">{asset.rfidTag}</p>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Garantía</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Proveedor</p>
              <p>{asset.warranty.provider}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Inicio</p>
                <p>{formatDate(asset.warranty.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Fin</p>
                <p>{formatDate(asset.warranty.endDate)}</p>
              </div>
            </div>
            <div>
              <Button variant="secondary" size="sm">
                Ver Términos
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Estado de Componentes</h3>
        <div className="space-y-4">
          {asset.components.map((component) => (
            <div 
              key={component.id}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {getComponentStatusIcon(component.status)}
                <div>
                  <p className="font-medium">{component.name}</p>
                  <p className="text-sm text-gray-400">
                    Instalado: {formatDate(component.installDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {Math.round((component.currentLifespan / component.expectedLifespan) * 100)}%
                </p>
                <p className="text-sm text-gray-400">
                  de vida útil
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Documentación Técnica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Manuales</h4>
            <div className="space-y-2">
              {asset.technicalDocumentation.manuals.map((manual, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                >
                  Manual {index + 1}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Esquemas</h4>
            <div className="space-y-2">
              {asset.technicalDocumentation.schematics.map((schematic, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                >
                  Esquema {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
