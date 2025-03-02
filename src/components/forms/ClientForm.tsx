import React, { useState, useEffect } from 'react';
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=es&addressdetails=1&limit=5`,
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
      const fullAddress = `${updated.street}, ${updated.number}, ${updated.city}, ${updated.postalCode}`;
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
      
      // Update formData with the new fiscal address string
      const fullAddress = `${newFiscalAddress.street}, ${newFiscalAddress.number}, ${newFiscalAddress.city}, ${newFiscalAddress.postalCode}`;
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
        {/* Location Search */}
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Ubicación y Datos Obtenidos de la Búsqueda
          </label>
          <div className="mt-1 space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar negocio o dirección..."
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectLocation(result)}
                    className="w-full p-4 text-left hover:bg-gray-700/50 flex items-start space-x-3"
                  >
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-400">{result.fullAddress}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {formData.formattedAddress?.street && (
              <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Ubicación Seleccionada</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">Calle:</span> {formData.formattedAddress.street}</p>
                  <p><span className="text-gray-400">Número:</span> {formData.formattedAddress.number}</p>
                  <p><span className="text-gray-400">Ciudad:</span> {formData.formattedAddress.city}</p>
                  <p><span className="text-gray-400">Código Postal:</span> {formData.formattedAddress.postalCode}</p>
                  <p><span className="text-gray-400">Provincia:</span> {formData.formattedAddress.province}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Information */}
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

        {/* Fiscal Address */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-300">Dirección Fiscal</h4>
            {formData.formattedAddress?.street && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyLocationToFiscal}
                className="text-sm"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Copiar Dirección Comercial
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Calle
              </label>
              <input
                type="text"
                value={fiscalAddress.street}
                onChange={(e) => handleFiscalAddressChange('street', e.target.value)}
                className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Número
              </label>
              <input
                type="text"
                value={fiscalAddress.number}
                onChange={(e) => handleFiscalAddressChange('number', e.target.value)}
                className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Localidad
              </label>
              <input
                type="text"
                value={fiscalAddress.city}
                onChange={(e) => handleFiscalAddressChange('city', e.target.value)}
                className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Código Postal
              </label>
              <input
                type="text"
                value={fiscalAddress.postalCode}
                onChange={(e) => handleFiscalAddressChange('postalCode', e.target.value)}
                className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Tipo de Documento
            </label>
            <select
              value={formData.documentType || 'nif'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                documentType: e.target.value as Client['documentType']
              }))}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="nif">NIF</option>
              <option value="cif">CIF</option>
              <option value="nie">NIE</option>
              <option value="passport">Pasaporte</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Número de Documento
            </label>
            <input
              type="text"
              value={formData.documentNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.documentNumber && (
              <p className="mt-1 text-sm text-pink-500">{errors.documentNumber}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || '+34'}
              onChange={handlePhoneChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-pink-500">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-pink-500">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Horario de Apertura
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input
                type="time"
                value={formData.businessHours?.standardHours?.open || '09:00'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  businessHours: {
                    ...prev.businessHours,
                    standardHours: {
                      ...prev.businessHours?.standardHours,
                      open: e.target.value
                    }
                  }
                }))}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              <input
                type="time"
                value={formData.businessHours?.standardHours?.close || '20:00'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  businessHours: {
                    ...prev.businessHours,
                    standardHours: {
                      ...prev.businessHours?.standardHours,
                      close: e.target.value
                    }
                  }
                }))}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Día de Cierre
            </label>
            <select
              value={formData.businessHours?.closedDay || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                businessHours: {
                  ...prev.businessHours,
                  closedDay: e.target.value || null,
                  closedDayReason: e.target.value ? 'Descanso semanal' : ''
                }
              }))}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="">Sin día de cierre</option>
              <option value="monday">Lunes</option>
              <option value="tuesday">Martes</option>
              <option value="wednesday">Miércoles</option>
              <option value="thursday">Jueves</option>
              <option value="friday">Viernes</option>
              <option value="saturday">Sábado</option>
              <option value="sunday">Domingo</option>
            </select>
          </div>
        </div>
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
