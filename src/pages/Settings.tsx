import React, { useState, useRef, useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Image, Upload, X } from 'lucide-react';

interface CompanyProfile {
  name: string;
  nif: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CompanyProfile>({
    name: '',
    nif: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    logo: ''
  });
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('companyProfile');
    if (storedProfile) {
      setCompanyProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log(`handleChange - name: ${name}, value: ${value}, formData:`, formData);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'El archivo no debe superar los 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setFormData(prev => ({ ...prev, logo: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    console.log('Form values:', {
      name: formData.name,
      nif: formData.nif,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      logo: formData.logo
    });
    console.log('Form data:', formData);

    const validationErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      validationErrors.name = 'El nombre es obligatorio';
    }
    if (!formData.nif.trim()) {
      validationErrors.nif = 'El NIF es obligatorio';
    }
    if (!formData.address.trim()) {
      validationErrors.address = 'La dirección es obligatoria';
    }
    if (!formData.city.trim()) {
      validationErrors.city = 'La ciudad es obligatoria';
    }
    if (!formData.postalCode.trim()) {
      validationErrors.postalCode = 'El código postal es obligatorio';
    }
    if (!formData.phone.trim()) {
      validationErrors.phone = 'El teléfono es obligatorio';
    }
    if (!formData.email.trim()) {
      validationErrors.email = 'El email es obligatorio';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Save data to local storage
    localStorage.setItem('companyProfile', JSON.stringify(formData));
    setCompanyProfile(formData);
  };

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-glow text-blue-500">Ajustes</h2>
        <p className="text-gray-400 mt-2">Configura el perfil de tu empresa</p>
      </header>

      {/* Display Company Logo and Name */}
      {companyProfile && (
        <div className="mb-8 flex items-center space-x-4">
          {companyProfile.logo && (
            <img
              src={companyProfile.logo}
              alt="Company Logo"
              className="h-16 w-16 rounded-lg border border-gray-600"
            />
          )}
          <h2 className="text-2xl font-bold text-gray-200">{companyProfile.name}</h2>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-pink-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                NIF/CIF
              </label>
              <input
                type="text"
                name="nif"
                value={formData.nif}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.nif && (
                <p className="mt-1 text-sm text-pink-500">{errors.nif}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-pink-500">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-pink-500">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-pink-500">{errors.postalCode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-pink-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-pink-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>

            <div className="col-span-2">
              <div className="bg-gray-800/50 p-6 rounded-lg border-2 border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Image className="h-5 w-5 text-blue-500" />
                  <h4 className="text-lg font-semibold text-gray-200">Logo de la Empresa</h4>
                </div>

                <div className="space-y-6">
                  {/* URL del logo */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      URL del Logo
                    </label>
                    <input
                      type="url"
                      name="logo"
                      value={formData.logo}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/logo.png"
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>

                  {/* Separador */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-800 text-gray-400">O</span>
                    </div>
                  </div>

                  {/* Subir archivo */}
                  <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-200 mb-1">
                          Subir Imagen del Logo
                        </h5>
                        <p className="text-xs text-gray-400">
                          Formatos soportados: PNG, JPG, GIF (máx. 2MB)
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Seleccionar Archivo
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {/* Preview del logo */}
                    {logoPreview && (
                      <div className="mt-4">
                        <div className="relative inline-block">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="max-w-xs rounded-lg border border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 p-1 bg-gray-700 rounded-full text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {errors.logo && (
                  <p className="mt-4 text-sm text-pink-500">{errors.logo}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </div>
        </Card>
      </form>

      {/* Display Company Profile */}
      {companyProfile && (
        <Card className="mt-8 p-6">
          <h3 className="text-xl font-bold text-gray-200 mb-4">Perfil de la Empresa</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Nombre:</p>
              <p className="text-gray-200">{companyProfile.name}</p>
            </div>
            <div>
              <p className="text-gray-400">NIF/CIF:</p>
              <p className="text-gray-200">{companyProfile.nif}</p>
            </div>
            <div>
              <p className="text-gray-400">Dirección:</p>
              <p className="text-gray-200">{companyProfile.address}</p>
            </div>
            <div>
              <p className="text-gray-400">Ciudad:</p>
              <p className="text-gray-200">{companyProfile.city}</p>
            </div>
            <div>
              <p className="text-gray-400">Código Postal:</p>
              <p className="text-gray-200">{companyProfile.postalCode}</p>
            </div>
            <div>
              <p className="text-gray-400">Teléfono:</p>
              <p className="text-gray-200">{companyProfile.phone}</p>
            </div>
            <div>
              <p className="text-gray-400">Email:</p>
              <p className="text-gray-200">{companyProfile.email}</p>
            </div>
            <div>
              <p className="text-gray-400">Sitio Web:</p>
              <p className="text-gray-200">{companyProfile.website}</p>
            </div>
            {companyProfile.logo && (
              <div className="col-span-2">
                <p className="text-gray-400">Logo:</p>
                <img
                  src={companyProfile.logo}
                  alt="Company Logo"
                  className="max-w-xs rounded-lg border border-gray-600"
                />
              </div>
            )}
          </div>
        </Card>
      )}
    </Container>
  );
}
