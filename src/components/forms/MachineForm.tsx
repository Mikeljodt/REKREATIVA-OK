import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store';
import { validateMachine } from '../../utils/validation';
import { formatCurrency } from '../../utils/formatters';
import { HelpCircle } from 'lucide-react';
import type { Machine } from '../../types';

interface MachineFormProps {
  onClose: () => void;
  initialData?: Machine | null;
  isEditing?: boolean;
}

export function MachineForm({ onClose, initialData, isEditing = false }: MachineFormProps) {
  const addMachine = useStore((state) => state.addMachine);
  const updateMachine = useStore((state) => state.updateMachine);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<Machine>>(initialData || {
    type: 'pinball',
    model: '',
    brand: '',
    counter: 0,
    amortizationValue: 0,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: '',
    clientSharePercentage: 50
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateMachine(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isEditing && initialData?.id) {
        updateMachine(initialData.id, formData);
      } else {
        addMachine(formData as Omit<Machine, 'id' | 'locationHistory' | 'maintenanceHistory' | 'collectionHistory'>);
      }
      onClose();
    } catch (error) {
      console.error('Error saving machine:', error);
      setErrors({ submit: 'Error al guardar la máquina' });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Tipo
          </label>
          <select
            name="type"
            value={formData.type || 'pinball'}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="pinball">Pinball</option>
            <option value="darts">Dardos</option>
            <option value="arcade">Arcade</option>
            <option value="foosball">Futbolín</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-pink-500">{errors.type}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Modelo
            </label>
            <input
              type="text"
              name="model"
              value={formData.model || ''}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.model && (
              <p className="mt-1 text-sm text-pink-500">{errors.model}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Marca
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand || ''}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-pink-500">{errors.brand}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Número de Serie
          </label>
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber || ''}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Contador Inicial
            </label>
            <input
              type="number"
              name="counter"
              value={formData.counter || 0}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.counter && (
              <p className="mt-1 text-sm text-pink-500">{errors.counter}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              <div className="flex items-center">
                <span>Precio de Compra</span>
                <div className="group relative ml-2">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 rounded-lg text-xs w-48 hidden group-hover:block">
                    Este valor se utilizará para calcular la amortización de la máquina
                  </div>
                </div>
              </div>
            </label>
            <input
              type="number"
              name="amortizationValue"
              value={formData.amortizationValue || 0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.amortizationValue && (
              <p className="mt-1 text-sm text-pink-500">{errors.amortizationValue}</p>
            )}
            {formData.amortizationValue > 0 && (
              <p className="mt-1 text-sm text-gray-400">
                {formatCurrency(formData.amortizationValue)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Fecha de Registro
            </label>
            <input
              type="date"
              name="registrationDate"
              value={formData.registrationDate?.split('T')[0] || ''}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.registrationDate && (
              <p className="mt-1 text-sm text-pink-500">{errors.registrationDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Estado
            </label>
            <select
              name="status"
              value={formData.status || 'active'}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
              <option value="maintenance">En Mantenimiento</option>
              <option value="retired">Retirada</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Porcentaje para el Cliente
          </label>
          <select
            name="clientSharePercentage"
            value={formData.clientSharePercentage || 50}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value={50}>50% Cliente / 50% Operador</option>
            <option value={40}>40% Cliente / 60% Operador</option>
          </select>
          <p className="mt-1 text-sm text-gray-400">
            Este porcentaje se aplicará automáticamente en las recaudaciones de esta máquina
          </p>
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-pink-500/10 border border-pink-500 rounded-lg">
          <p className="text-pink-500">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Actualizar' : 'Crear'} Máquina
        </Button>
      </div>
    </form>
  );
}
