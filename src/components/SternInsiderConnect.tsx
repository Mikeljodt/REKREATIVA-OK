import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { SternInsiderAPI } from '../utils/sternApi';
import { Wifi, WifiOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SternMachineStatus {
  serialNumber: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastSync: string;
  earnings: number;
  totalGames: number;
}

export function SternInsiderConnect() {
  const { machines, updateMachine } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [machineStatuses, setMachineStatuses] = useState<SternMachineStatus[]>([]);
  
  const sternApi = new SternInsiderAPI(import.meta.env.VITE_STERN_API_KEY || '');

  const syncMachines = async () => {
    setIsConnecting(true);
    const sternMachines = machines.filter(m => 
      m.type === 'pinball' && 
      m.brand.toLowerCase() === 'stern' && 
      m.serialNumber
    );

    try {
      const statuses = await Promise.all(
        sternMachines.map(async (machine) => {
          try {
            const sternData = await sternApi.getMachineData(machine.serialNumber!);
            
            // Update machine data in store
            const updates = await sternApi.syncMachineData(machine);
            updateMachine(machine.id, updates);

            return {
              serialNumber: machine.serialNumber!,
              name: machine.name,
              status: sternData.health.status,
              lastSync: new Date().toISOString(),
              earnings: sternData.earnings.total,
              totalGames: sternData.gameStats.totalGames
            };
          } catch (error) {
            console.error(`Error syncing machine ${machine.name}:`, error);
            return {
              serialNumber: machine.serialNumber!,
              name: machine.name,
              status: 'error' as const,
              lastSync: new Date().toISOString(),
              earnings: 0,
              totalGames: 0
            };
          }
        })
      );

      setMachineStatuses(statuses);
    } catch (error) {
      console.error('Error syncing with Stern Insider:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-5 w-5 text-gray-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-pink-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    }
  };

  if (!import.meta.env.VITE_STERN_API_KEY) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-400">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <p>Se requiere configurar la API key de Stern Insider Connect</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Stern Insider Connect</h3>
          <p className="text-sm text-gray-400">
            Sincroniza datos con tus máquinas Stern
          </p>
        </div>
        <Button
          variant="primary"
          onClick={syncMachines}
          disabled={isConnecting}
        >
          {isConnecting ? 'Sincronizando...' : 'Sincronizar Ahora'}
        </Button>
      </div>

      <div className="space-y-4">
        {machineStatuses.map((machine) => (
          <div
            key={machine.serialNumber}
            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
          >
            <div className="flex items-center">
              {getStatusIcon(machine.status)}
              <div className="ml-3">
                <p className="font-medium">{machine.name}</p>
                <p className="text-sm text-gray-400">
                  S/N: {machine.serialNumber}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {machine.totalGames} partidas
              </p>
              <p className="text-sm text-gray-400">
                Última sync: {new Date(machine.lastSync).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {machineStatuses.length === 0 && (
          <p className="text-center text-gray-400 py-4">
            No hay máquinas Stern configuradas o la última sincronización falló
          </p>
        )}
      </div>
    </Card>
  );
}
