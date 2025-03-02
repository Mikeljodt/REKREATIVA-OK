import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store';
import { InstallationProtocolForm } from '../InstallationProtocolForm';
import { AlertTriangle } from 'lucide-react';
import type { Client, Machine } from '../../types';

interface InstallationFormProps {
  onClose: () => void;
  initialData?: {
    machineId?: string;
    clientId?: string;
  };
  isTransfer?: boolean;
}

export function InstallationForm({ onClose, initialData, isTransfer = false }: InstallationFormProps) {
  const { clients, machines, assignMachine } = useStore();
  const [selectedClient, setSelectedClient] = useState(initialData?.clientId || '');
  const [selectedMachine, setSelectedMachine] = useState(initialData?.machineId || '');
  const [showProtocolForm, setShowProtocolForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available machines (unassigned or the currently selected machine if transferring)
  const availableMachines = machines.filter(m => 
    !m.clientId || (isTransfer && m.id === selectedMachine)
  );

  // Get current location for selected machine if transferring
  const selectedMachineData = machines.find(m => m.id === selectedMachine);
  const currentLocation = selectedMachineData?.clientId 
    ? clients.find(c => c.id === selectedMachineData.clientId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedClient) {
      newErrors.client = 'Debes seleccionar un cliente';
    }
    if (!selectedMachine) {
      newErrors.machine = 'Debes seleccionar una máquina';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Assign machine to client
    assignMachine(selectedMachine, selectedClient);
    
    // Show protocol form
    setShowProtocolForm(true);
  };

  if (showProtocolForm) {
    return (
      <InstallationProtocolForm
        machineId={selectedMachine}
        onComplete={() => {
          setShowProtocolForm(false);
          onClose();
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isTransfer && currentLocation && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-yellow-500 font-medium">Traslado de Máquina</p>
            <p className="text-sm text-gray-400 mt-1">
              Esta máquina está actualmente instalada en{' '}
              <span className="text-white">{currentLocation.establishmentName}</span>
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Máquina
          </label>
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="">Selecciona una máquina</option>
            {availableMachines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.code} - {machine.model} ({machine.type})
              </option>
            ))}
          </select>
          {errors.machine && (
            <p className="mt-1 text-sm text-pink-500">{errors.machine}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Cliente Destino
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="">Selecciona un cliente</option>
            {clients
              .filter(c => !isTransfer || c.id !== currentLocation?.id) // Exclude current location if transferring
              .map((client) => (
                <option key={client.id} value={client.id}>
                  {client.establishmentName}
                </option>
            ))}
          </select>
          {errors.client && (
            <p className="mt-1 text-sm text-pink-500">{errors.client}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isTransfer ? 'Continuar con el Traslado' : 'Continuar con la Instalación'}
        </Button>
      </div>
    </form>
  );
}
