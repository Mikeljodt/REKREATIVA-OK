import React from 'react';
import type { BusinessHours } from '../types';

interface BusinessHoursInputProps {
  value: BusinessHours;
  onChange: (hours: BusinessHours) => void;
  className?: string;
}

export function BusinessHoursInput({ value, onChange, className = '' }: BusinessHoursInputProps) {
  const handleTimeChange = (period: keyof BusinessHours, type: 'open' | 'close', timeValue: string) => {
    if (period === 'holidays') return;

    onChange({
      ...value,
      [period]: period === 'weekdays' 
        ? { ...value[period], [type]: timeValue }
        : timeValue ? { open: type === 'open' ? timeValue : value[period]?.open || '', 
                       close: type === 'close' ? timeValue : value[period]?.close || '' }
                   : null
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Horario Estándar (L-V)
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <input
              type="time"
              value={value.weekdays?.open || ''}
              onChange={(e) => handleTimeChange('weekdays', 'open', e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            <input
              type="time"
              value={value.weekdays?.close || ''}
              onChange={(e) => handleTimeChange('weekdays', 'close', e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Sábado (opcional)
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <input
              type="time"
              value={value.saturday?.open || ''}
              onChange={(e) => handleTimeChange('saturday', 'open', e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            <input
              type="time"
              value={value.saturday?.close || ''}
              onChange={(e) => handleTimeChange('saturday', 'close', e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Domingo (opcional)
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <input
              type="time"
              value={value.sunday?.open || ''}
              onChange={(e) => handleTimeChange('sunday', 'open', e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            <input
              type="time"
              value={value.sunday?.close || ''}
              onChange={(e) => handleTimeChange('sunday', 'close', e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Días Festivos
          </label>
          <input
            type="text"
            placeholder="01/01/2024, 25/12/2024"
            value={value.holidays?.join(', ') || ''}
            onChange={(e) => onChange({
              ...value,
              holidays: e.target.value.split(',').map(d => d.trim())
            })}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
}
