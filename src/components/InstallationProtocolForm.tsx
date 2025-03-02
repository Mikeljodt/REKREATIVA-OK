import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { Camera, MapPin, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import SignaturePad from 'react-signature-canvas';
import { generateInstallationSheetPDF } from '../utils/pdf';
import type { InstallationProtocol } from '../types';

interface InstallationProtocolFormProps {
  machineId: string;
  onComplete: () => void;
}

// Installation test constants
const INSTALLATION_TESTS = [
  'Encendido y arranque',
  'Funcionamiento de pantalla/display',
  'Sistema de audio',
  'Controles y botones',
  'Sistema de monedas/billetes',
  'Iluminación de la máquina',
  'Sensores y switches',
  'Calibración general',
  'Prueba de juego completa'
];

// Company information
const COMPANY_INFO = {
  name: 'Rekreativ@',
  nif: '446795034X',
  address: 'Calle Principal 123',
  city: '48001 Bilbao',
  phone: '+34 944 123 456',
  email: 'info@rekreativa.com'
};

// Legal terms and conditions
const LEGAL_TERMS = `
El titular del establecimiento, cuyos datos se detallan en este documento, reconoce a ${COMPANY_INFO.name} con NIF ${COMPANY_INFO.nif} como única propietaria de los materiales instalados que igualmente figuran, debiendo atenderlos diligentemente conforme a las instrucciones de esta empresa operadora.

RESPONSABILIDADES DEL TITULAR:

1. Custodia y Buen Uso:
   - El titular es responsable de la custodia y el buen uso de la máquina.
   - Debe mantener la máquina en un lugar seguro y visible dentro del establecimiento.
   - Se compromete a no realizar ni permitir manipulaciones no autorizadas.

2. Daños y Responsabilidad:
   - Si la máquina sufre desperfectos por agresiones, maltrato, o uso indebido, el titular será jurídicamente responsable.
   - En caso de robo o desaparición de la máquina, el titular deberá responder por los daños ocasionados.
   - El titular se compromete a cubrir los daños a través de su seguro de responsabilidad civil.

3. Obligaciones Adicionales:
   - Notificar inmediatamente cualquier incidente o avería.
   - Permitir el acceso al personal autorizado para mantenimiento y recaudación.
   - No trasladar la máquina de su ubicación sin autorización previa.

4. Consecuencias del Incumplimiento:
   - El incumplimiento facultará a ${COMPANY_INFO.name} para retirar inmediatamente la máquina.
   - Se reserva el derecho a emprender acciones legales para la recuperación de daños y perjuicios.`;

export function InstallationProtocolForm({ machineId, onComplete }: InstallationProtocolFormProps) {
  const { machines, clients, collections, createInstallationProtocol } = useStore(state => ({
    machines: state.machines,
    clients: state.clients,
    collections: state.collections,
    createInstallationProtocol: state.createInstallationProtocol
  }));

  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<{ before: string[]; after: string[] }>({
    before: [],
    after: []
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tests, setTests] = useState<Record<string, boolean>>({});
  const [counters, setCounters] = useState({ installation: 0, electronic: 0 });
  const [clientInfo, setClientInfo] = useState({
    name: '',
    position: '',
    establishmentName: '',
    documentNumber: '',
    installationDate: new Date().toISOString().split('T')[0],
    termsAccepted: false
  });
  const [error, setError] = useState<string | null>(null);
  const signaturePadRef = useRef<SignaturePad>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);

  const machine = machines.find(m => m.id === machineId);
  const client = machine ? clients.find(c => c.id === machine.clientId) : null;

  useEffect(() => {
    if (machine && collections) {
      const lastCollection = collections
        .filter(c => c.machineId === machine.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (lastCollection) {
        setCounters(prev => ({
          ...prev,
          installation: lastCollection.currentCounter
        }));
      }
    }
  }, [machine, collections]);

  const handlePhotoCapture = async (type: 'before' | 'after') => {
    try {
      setCameraError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraSupported(false);
        throw new Error('La cámara no está soportada en este dispositivo o navegador');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = 'block';
        await videoRef.current.play();
      }

      setCameraStream(stream);

    } catch (error) {
      console.error('Error accessing camera:', error);
      if (error instanceof Error) {
        setCameraError(error.message);
      } else {
        setCameraError('Error desconocido al acceder a la cámara');
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.style.display = 'none';
    }
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const handleTakePhoto = useCallback((type: 'before' | 'after') => {
    const photoUrl = capturePhoto();
    if (photoUrl) {
      setPhotos(prev => ({
        ...prev,
        [type]: [...prev[type], photoUrl]
      }));
      stopCamera();
    }
  }, [capturePhoto, stopCamera]);

  const handleRemovePhoto = useCallback((type: 'before' | 'after', index: number) => {
    setPhotos(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  }, []);

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.error('Error getting location:', error);
          setCameraError('Error al obtener la ubicación');
        }
      );
    } else {
      setCameraError('La geolocalización no está soportada en este dispositivo o navegador');
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validate required fields
      if (!signaturePadRef.current || !machine || !client) {
        setError('Faltan datos requeridos para completar la instalación');
        return;
      }

      if (signaturePadRef.current.isEmpty()) {
        setError('Se requiere la firma del cliente');
        return;
      }

      if (!clientInfo.name || !clientInfo.position || !clientInfo.termsAccepted) {
        setError('Por favor complete todos los campos y acepte los términos');
        return;
      }

      if (photos.before.length === 0 || photos.after.length === 0) {
        setError('Se requieren fotos antes y después de la instalación');
        return;
      }

      if (!location) {
        setError('Se requiere la ubicación de la instalación');
        return;
      }

      const protocol: Omit<InstallationProtocol, 'id'> = {
        machineId,
        date: clientInfo.installationDate,
        location: {
          coordinates: location,
          address: client.formattedAddress 
            ? `${client.formattedAddress.street}, ${client.formattedAddress.number}`
            : client.fullAddress,
          notes: ''
        },
        photos,
        initialCounters: counters,
        clientSignature: {
          name: clientInfo.name,
          position: clientInfo.position,
          date: new Date().toISOString(),
          signature: signaturePadRef.current.toDataURL()
        },
        termsAccepted: clientInfo.termsAccepted,
        legalTermsAccepted: true,
        testResults: Object.entries(tests).map(([test, result]) => ({
          test,
          result: result ? 'passed' : 'failed'
        })),
        installedBy: 'Técnico'
      };

      await createInstallationProtocol(protocol);
      const pdf = await generateInstallationSheetPDF(protocol, machine, client);
      pdf.save(`instalacion_${machine.code}_${new Date().toISOString().split('T')[0]}.pdf`);

      onComplete();
    } catch (error) {
      console.error('Error finalizing installation:', error);
      setError('Error al finalizar la instalación. Por favor, inténtelo de nuevo.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Documentación Fotográfica</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Fotos Previas</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {photos.before.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Before ${index + 1}`}
                        className="rounded-lg w-full"
                      />
                      <button
                        onClick={() => handleRemovePhoto('before', index)}
                        className="absolute -top-2 -right-2 p-1 bg-gray-900 rounded-full text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {cameraStream ? (
                  <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          stopCamera();
                          setCameraError(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleTakePhoto('before')}
                      >
                        Capturar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => handlePhotoCapture('before')}
                    disabled={!isCameraSupported}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capturar Foto
                  </Button>
                )}
                {cameraError && (
                  <div className="mt-2 p-2 bg-pink-500/10 border border-pink-500 rounded-lg">
                    <p className="text-sm text-pink-500">{cameraError}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Ubicación</h4>
                {location ? (
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="font-mono text-sm">
                      Lat: {location.lat.toFixed(6)}
                      <br />
                      Lng: {location.lng.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={getLocation}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Obtener Ubicación
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contadores Iniciales</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Contador de Instalación
                </label>
                <input
                  type="number"
                  value={counters.installation}
                  onChange={e => setCounters(prev => ({
                    ...prev,
                    installation: parseInt(e.target.value)
                  }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                  readOnly
                />
                <p className="mt-1 text-sm text-gray-400">
                  Obtenido de la última recaudación
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Contador Electrónico
                </label>
                <input
                  type="number"
                  value={counters.electronic}
                  onChange={e => setCounters(prev => ({
                    ...prev,
                    electronic: parseInt(e.target.value)
                  }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pruebas de Instalación</h3>
            <div className="space-y-4">
              {INSTALLATION_TESTS.map((test) => (
                <div
                  key={test}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <span>{test}</span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={tests[test] === true ? 'primary' : 'secondary'}
                      onClick={() => setTests(prev => ({ ...prev, [test]: true }))}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={tests[test] === false ? 'danger' : 'secondary'}
                      onClick={() => setTests(prev => ({ ...prev, [test]: false }))}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );

      case 4:
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Documentación Final</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Fotos Finales</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {photos.after.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`After ${index + 1}`}
                        className="rounded-lg w-full"
                      />
                      <button
                        onClick={() => handleRemovePhoto('after', index)}
                        className="absolute -top-2 -right-2 p-1 bg-gray-900 rounded-full text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {cameraStream ? (
                  <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          stopCamera();
                          setCameraError(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleTakePhoto('after')}
                      >
                        Capturar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => handlePhotoCapture('after')}
                    disabled={!isCameraSupported}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capturar Foto
                  </Button>
                )}
                {cameraError && (
                  <div className="mt-2 p-2 bg-pink-500/10 border border-pink-500 rounded-lg">
                    <p className="text-sm text-pink-500">{cameraError}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Datos del Firmante</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre y Apellidos"
                    value={clientInfo.name}
                    onChange={e => setClientInfo(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Cargo"
                    value={clientInfo.position}
                    onChange={e => setClientInfo(prev => ({
                      ...prev,
                      position: e.target.value
                    }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                  />
                  <div className="bg-white p-4 rounded-lg">
                    <SignaturePad
                      ref={signaturePadRef}
                      canvasProps={{
                        className: 'w-full h-40'
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg text-sm">
                      <div className="max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans">
                          {LEGAL_TERMS}
                        </pre>
                      </div>
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={clientInfo.termsAccepted}
                        onChange={e => setClientInfo(prev => ({
                          ...prev,
                          termsAccepted: e.target.checked
                        }))}
                        className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-400">
                        He leído y acepto los términos y condiciones
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-pink-500/10 border border-pink-500 rounded-lg">
          <p className="text-pink-500">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-3 h-3 rounded-full ${
                stepNumber === step
                  ? 'bg-blue-500'
                  : stepNumber < step
                  ? 'bg-green-500'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-400">
          Paso {step} de 4
        </p>
      </div>

      {renderStep()}

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setStep(prev => Math.max(1, prev - 1))}
          disabled={step === 1}
        >
          Anterior
        </Button>
        {step === 4 ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              !location ||
              photos.before.length === 0 ||
              photos.after.length === 0 ||
              !clientInfo.name ||
              !clientInfo.position ||
              !clientInfo.termsAccepted ||
              (signaturePadRef.current?.isEmpty() ?? true)
            }
          >
            Finalizar Instalación
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => setStep(prev => Math.min(4, prev + 1))}
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
