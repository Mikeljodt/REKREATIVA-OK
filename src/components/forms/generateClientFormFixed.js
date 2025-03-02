#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fileContent = `import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store';
import { validateClient } from '../../utils/validation';
import { Search, MapPin } from 'lucide-react';
import type { Client } from '../../types';

interface ClientFormProps {
  onClose: () => void;
  initialData?: Client | null;
  isEditing?: boolean;
}

interface FiscalAddress {
  street: string;
  number: string;
  city: string;
  postalCode: string;
}

export function ClientForm({ onClose, initialData, isEditing = false }: ClientFormProps) {
  const { addClient, updateClient } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [fiscalAddress, setFiscalAddress] = useState<FiscalAddress>({
    street: '',
    number: '',
    city: '',
    postalCode: ''
  });
  
  const [formData, setFormData] = useState<Partial<Client>>(initialData || {
    establishmentName: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerFiscalAddress: '',
    documentType: 'nif',
    documentNumber: '',
    documentCountry: 'España',
    fullAddress: '',
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    formattedAddress: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      province: '',
      country: 'España'
    },
    phone: '+34',
    email: '',
    businessHours: {
      standardHours: { open: '09:00', close: '20:00' },
      closedDay: null,
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: false
  });

  // Parse initial fiscal address if exists
  useEffect(() => {
    if (initialData?.ownerFiscalAddress) {
      try {
        const parts = initialData.ownerFiscalAddress.split(',').map(p => p.trim());
        setFiscalAddress({
          street: parts[0] || '',
          number: parts[1] || '',
          city: parts[2] || '',
          postalCode: parts[3] || ''
        });
      } catch (e) {
        console.error('Error parsing fiscal address:', e);
      }
    }
  }, [initialData]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        \`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(
          searchQuery
        )}&countrycodes=es&addressdetails=1&limit=5\`,
        {
          headers: {
            'Accept-Language': 'es'
          }
        }
      );

      if (!response.ok) throw new Error('Error en la búsqueda');
      
      const results = await response.json();
      setSearchResults(results.map((result: any) => ({
        name: result.display_name.split(',')[0],
        fullAddress: result.display_name,
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        },
        details: {
          street: result.address.road || '',
          number: result.address.house_number || '',
          postalCode: result.address.postcode || '',
          city: result.address.city || result.address.town || '',
          province: result.address.state || '',
          country: 'España'
        }
      })));
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    }
  };

  const handleSelectLocation = (location: any) => {
    setFormData(prev => ({
      ...prev,
      establishmentName: location.name,
      fullAddress: location.fullAddress,
      coordinates: location.coordinates,
      formattedAddress: location.details
    }));
    setSearchResults([]);
    setSearchQuery(location.fullAddress);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+34')) {
      value = '+34' + value;
    }
    value = value.replace(/[^\d+]/g, '');
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleFiscalAddressChange = (field: keyof FiscalAddress, value: string) => {
    setFiscalAddress(prev => {
      const updated = { ...prev, [field]: value };
      const fullAddress = \`\${updated.street}, \${updated.number}, \${updated.city}, \${updated.postalCode}\`;
      setFormData(prev => ({ ...prev, ownerFiscalAddress: fullAddress }));
      return updated;
    });
  };

  const handleCopyLocationToFiscal = () => {
    if (formData.formattedAddress) {
      const newFiscalAddress = {
        street: formData.formattedAddress.street,
        number: formData.formattedAddress.number,
        city: formData.formattedAddress.city,
        postalCode: formData.formattedAddress.postalCode
      };
      
      setFiscalAddress(newFiscalAddress);
      
      const fullAddress = \`\${newFiscalAddress.street}, \${newFiscalAddress.number}, \${newFiscalAddress.city}, \${newFiscalAddress.postalCode}\`;
      setFormData(prev => ({ ...prev, ownerFiscalAddress: fullAddress }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateClient(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isEditing && initialData?.id) {
      updateClient(initialData.id, formData);
    } else {
      addClient(formData as Omit<Client, 'id' | 'clientCode' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Campo para Nombre Comercial (establishmentName) */}
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Nombre Comercial
          </label>
          <input
            type="text"
            value={formData.establishmentName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, establishmentName: e.target.value }))}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.establishmentName && (
            <p className="mt-1 text-sm text-pink-500">{errors.establishmentName}</p>
          )}
        </div>

        {/* Aquí irían los demás campos existentes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Nombre
            </label>
            <input
              type="text"
              value={formData.ownerFirstName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerFirstName: e.target.value }))}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.ownerFirstName && (
              <p className="mt-1 text-sm text-pink-500">{errors.ownerFirstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Apellidos
            </label>
            <input
              type="text"
              value={formData.ownerLastName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerLastName: e.target.value }))}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.ownerLastName && (
              <p className="mt-1 text-sm text-pink-500">{errors.ownerLastName}</p>
            )}
          </div>
        </div>

        {/* Puedes continuar con el resto de tu formulario... */}
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Actualizar' : 'Crear'} Cliente
        </Button>
      </div>
    </form>
  );
}
`;

const outputPath = path.join(__dirname, 'ClientFormFixed.tsx');

fs.writeFile(outputPath, fileContent, (err) => {
  if (err) {
    console.error('Error al crear el archivo:', err);
  } else {
    console.log('Archivo ClientFormFixed.tsx creado exitosamente en:', outputPath);
  }
});
