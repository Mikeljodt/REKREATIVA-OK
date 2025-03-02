import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store';
import type { Vehicle } from '../../types';

interface VehicleFormProps {
  onClose: () => void;
  initialData?: Vehicle | null;
  isEditing?: boolean;
}

export function VehicleForm({ onClose, initialData, isEditing = false }: VehicleFormProps) {
  const { addVehicle, updateVehicle } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<Vehicle>>(initialData || {
    brand: '',
    model: '',
    plate: '',
    year: new Date().getFullYear(),
    fuelType: 'diesel',
    currentKm: 0,
    lastMaintenanceKm: 0,
    maintenanceIntervals: {
      oil: 10000,
      filters: 15000,
      brakes: 30000,
      tires: 40000,
      generalRevision: 20000
    },
    fuelEfficiency: 0,
    tankCapacity: 0,
    lastFuelPrice: 0,
    notes: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: Number(value)
        }
      }));
    } else {
      const newValue = e.target.type === 'number' ? Number(value) : value;
      setFormData(prev => ({ ...prev, [name]: newValue }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!formData.brand?.trim()) {
      validationErrors.brand = 'La marca es obligatoria';
    }
    if (!formData.model?.trim()) {
      validationErrors.model = 'El modelo es obligatorio';
    }
    if (!formData.plate?.trim()) {
      validationErrors.plate = 'La matrícula es obligatoria';
    }
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear()) {
      validationErrors.year = 'El año no es válido';
    }
    if (formData.currentKm < 0) {
      validationErrors.currentKm = 'Los kilómetros deben ser positivos';
    }
    if (formData.fuelEfficiency <= 0) {
      validationErrors.fuelEfficiency = 'El consumo debe ser mayor que 0';
    }
    if (formData.tankCapacity <= 0) {
      validationErrors.tankCapacity = 'La capacidad del depósito debe ser mayor que 0';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isEditing && initialData?.id) {
      updateVehicle(initialData.id, formData);
    } else {
      addVehicle(formData as Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Marca
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand || ''}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-pink-500">{errors.brand}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Modelo
          </label>
          <input
            type="text"
            name="model"
            value={formData.model || ''}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.model && (
            <p className="mt-1 text-sm text-pink-500">{errors.model}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Matrícula
          </label>
          <input
            type="text"
            name="plate"
            value={formData.plate || ''}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.plate && (
            <p className="mt-1 text-sm text-pink-500">{errors.plate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Año
          </label>
          <input
            type="number"
            name="year"
            value={formData.year || ''}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.year && (
            <p className="mt-1 text-sm text-pink-500">{errors.year}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Tipo de Combustible
          </label>
          <select
            name="fuelType"
            value={formData.fuelType || 'diesel'}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="diesel">Diésel</option>
            <option value="gasoline">Gasolina</option>
            <option value="electric">Eléctrico</option>
            <option value="hybrid">Híbrido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Kilómetros Actuales
          </label>
          <input
            type="number"
            name="currentKm"
            value={formData.currentKm || ''}
            onChange={handleChange}
            min="0"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.currentKm && (
            <p className="mt-1 text-sm text-pink-500">{errors.currentKm}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Consumo (km/L)
          </label>
          <input
            type="number"
            name="fuelEfficiency"
            value={formData.fuelEfficiency || ''}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.fuelEfficiency && (
            <p className="mt-1 text-sm text-pink-500">{errors.fuelEfficiency}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Capacidad Depósito (L)
          </label>
          <input
            type="number"
            name="tankCapacity"
            value={formData.tankCapacity || ''}
            onChange={handleChange}
            min="0"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.tankCapacity && (
            <p className="mt-1 text-sm text-pink-500">{errors.tankCapacity}</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-4">Intervalos de Mantenimiento (km)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Cambio de Aceite
            </label>
            <input
              type="number"
              name="maintenanceIntervals.oil"
              value={formData.maintenanceIntervals?.oil || ''}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Cambio de Filtros
            </label>
            <input
              type="number"
              name="maintenanceIntervals.filters"
              value={formData.maintenanceIntervals?.filters || ''}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Revisión de Frenos
            </label>
            <input
              type="number"
              name="maintenanceIntervals.brakes"
              value={formData.maintenanceIntervals?.brakes || ''}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Cambio de Neumáticos
            </label>
            <input
              type="number"
              name="maintenanceIntervals.tires"
              value={formData.maintenanceIntervals?.tires || ''}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Revisión General
            </label>
            <input
              type="number"
              name="maintenanceIntervals.generalRevision"
              value={formData.maintenanceIntervals?.generalRevision || ''}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Notas Adicionales
        </label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={3}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Actualizar' : 'Crear'} Vehículo
        </Button>
      </div>
    </form>
  );
}
