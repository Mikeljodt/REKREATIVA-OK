import React, { useState } from 'react';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { formatCurrency } from '../utils/formatters';
import type { VehicleExpense } from '../types';

interface VehicleExpenseFormProps {
  vehicleId: string;
  onClose: () => void;
  initialData?: VehicleExpense | null;
  isEditing?: boolean;
}

export function VehicleExpenseForm({ 
  vehicleId, 
  onClose, 
  initialData, 
  isEditing = false 
}: VehicleExpenseFormProps) {
  const { addVehicleExpense, updateVehicleExpense, vehicles } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) return null;

  const [formData, setFormData] = useState<Partial<VehicleExpense>>(initialData || {
    vehicleId,
    date: new Date().toISOString().split('T')[0],
    type: 'fuel',
    description: '',
    amount: 0,
    kilometers: vehicle.currentKm,
    liters: 0,
    pricePerLiter: vehicle.lastFuelPrice || 0,
    maintenanceType: undefined,
    notes: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Actualizar automáticamente el importe total para gastos de combustible
      if (name === 'liters' || name === 'pricePerLiter') {
        if (updated.type === 'fuel' && updated.liters && updated.pricePerLiter) {
          updated.amount = updated.liters * updated.pricePerLiter;
        }
      }
      
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!formData.type) {
      validationErrors.type = 'El tipo de gasto es obligatorio';
    }
    if (!formData.description?.trim()) {
      validationErrors.description = 'La descripción es obligatoria';
    }
    if (!formData.amount || formData.amount <= 0) {
      validationErrors.amount = 'El importe debe ser mayor que 0';
    }
    if (!formData.kilometers || formData.kilometers < vehicle.currentKm) {
      validationErrors.kilometers = 'Los kilómetros no pueden ser menores que los actuales';
    }
    if (formData.type === 'fuel') {
      if (!formData.liters || formData.liters <= 0) {
        validationErrors.liters = 'Los litros deben ser mayor que 0';
      }
      if (!formData.pricePerLiter || formData.pricePerLiter <= 0) {
        validationErrors.pricePerLiter = 'El precio por litro debe ser mayor que 0';
      }
    }
    if (formData.type === 'maintenance' && !formData.maintenanceType) {
      validationErrors.maintenanceType = 'El tipo de mantenimiento es obligatorio';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isEditing && initialData?.id) {
      updateVehicleExpense(initialData.id, formData);
    } else {
      addVehicleExpense(formData as Omit<VehicleExpense, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Fecha
          </label>
          <input
            type="date"
            name="date"
            value={formData.date || ''}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Tipo de Gasto
          </label>
          <select
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="fuel">Combustible</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="insurance">Seguro</option>
            <option value="tax">Impuestos</option>
            <option value="other">Otros</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-pink-500">{errors.type}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Descripción
          </label>
          <input
            type="text"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-pink-500">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Kilómetros
          </label>
          <input
            type="number"
            name="kilometers"
            value={formData.kilometers || ''}
            onChange={handleChange}
            min={vehicle.currentKm}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.kilometers && (
            <p className="mt-1 text-sm text-pink-500">{errors.kilometers}</p>
          )}
        </div>

        {formData.type === 'fuel' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Litros
              </label>
              <input
                type="number"
                name="liters"
                value={formData.liters || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.liters && (
                <p className="mt-1 text-sm text-pink-500">{errors.liters}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Precio por Litro
              </label>
              <input
                type="number"
                name="pricePerLiter"
                value={formData.pricePerLiter || ''}
                onChange={handleChange}
                min="0"
                step="0.001"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.pricePerLiter && (
                <p className="mt-1 text-sm text-pink-500">{errors.pricePerLiter}</p>
              )}
            </div>
          </>
        )}

        {formData.type === 'maintenance' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tipo de Mantenimiento
            </label>
            <select
              name="maintenanceType"
              value={formData.maintenanceType || ''}
              onChange={handleChange}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="">Selecciona un tipo</option>
              <option value="oil">Cambio de Aceite</option>
              <option value="filters">Cambio de Filtros</option>
              <option value="brakes">Frenos</option>
              <option value="tires">Neumáticos</option>
              <option value="general">Revisión General</option>
              <option value="other">Otros</option>
            </select>
            {errors.maintenanceType && (
              <p className="mt-1 text-sm text-pink-500">{errors.maintenanceType}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Importe Total
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            readOnly={formData.type === 'fuel'}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-pink-500">{errors.amount}</p>
          )}
          {formData.amount > 0 && (
            <p className="mt-1 text-sm text-gray-400">
              {formatCurrency(formData.amount)}
            </p>
          )}
        </div>

         Continuing directly from the previous VehicleExpenseForm component...

```tsx
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Notas
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Actualizar' : 'Registrar'} Gasto
        </Button>
      </div>
    </form>
  );
}
