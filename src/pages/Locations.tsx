import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { optimizeRouteWithMaintenance } from '../utils/geocoding';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function Locations() {
  const { locations, machines, clients, maintenance } = useStore();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter] = useState([43.3047, -2.9115]); // Default center on Bilbao
  const [optimizedRoute, setOptimizedRoute] = useState<any[]>([]);

  useEffect(() => {
    // Extract client locations
    const clientLocations = locations?.map(location => ({
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
      clientId: location.clientId
    })) || [];

    // Extract maintenance tasks locations
    const maintenanceTasks = maintenance?.map(task => {
      const machine = machines?.find(m => m.id === task.machineId);
      const locationHistory = machine?.locationHistory?.find(h => !h.endDate);
      return {
        latitude: locationHistory?.coordinates.lat,
        longitude: locationHistory?.coordinates.lng,
        machineId: task.machineId
      };
    }).filter(task => task?.latitude && task?.longitude) || [];

    // Optimize route
    optimizeRouteWithMaintenance(clientLocations, maintenanceTasks)
      .then(optimized => {
        setOptimizedRoute(optimized);
      })
      .catch(error => {
        console.error("Error optimizing route:", error);
      });
  }, [locations, machines, maintenance]);

  const getMachinesForLocation = (locationId) => {
    return machines?.filter(machine => 
      machine.locationHistory?.some(history => 
        history.coordinates?.lat === locations?.find(l => l.id === locationId)?.coordinates.lat &&
        history.coordinates?.lng === locations?.find(l => l.id === locationId)?.coordinates.lng &&
        !history.endDate
      )
    );
  };

  const getClientForLocation = (locationId) => {
    const location = locations?.find(l => l.id === locationId);
    return clients?.find(c => c.id === location?.clientId);
  };

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-glow text-blue-500">Mapa de Ubicaciones</h2>
        <p className="text-gray-400 mt-2">Visualiza y gestiona las ubicaciones de tus máquinas.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] relative">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {locations?.map((location) => (
                <Marker
                  key={location.id}
                  position={[location.coordinates.lat, location.coordinates.lng]}
                  icon={defaultIcon}
                  eventHandlers={{
                    click: () => setSelectedLocation(location.id),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{getClientForLocation(location.id)?.establishmentName}</h3>
                      <p className="text-sm">{location.address}</p>
                      <p className="text-sm mt-2">
                        Máquinas activas: {getMachinesForLocation(location.id)?.length}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedLocation 
                ? 'Detalles de la Ubicación'
                : 'Selecciona una ubicación'}
            </h3>
            
            {selectedLocation && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-400">Establecimiento</h4>
                  <p>{getClientForLocation(selectedLocation)?.establishmentName}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-400">Máquinas Instaladas</h4>
                  <div className="space-y-2 mt-2">
                    {getMachinesForLocation(selectedLocation)?.map((machine) => (
                      <div
                        key={machine.id}
                        className="p-3 bg-gray-800/50 rounded-lg"
                      >
                        <p className="font-medium">{machine.name}</p>
                        <p className="text-sm text-gray-400">
                          {machine.type} - {machine.model}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    Ver Recaudaciones
                  </Button>
                  <Button variant="secondary" size="sm">
                    Programar Mantenimiento
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      <div>
        <h3>Optimized Route</h3>
        <ul>
          {optimizedRoute.map((point, index) => (
            <li key={index}>
              {point.type}: {point.id} ({point.latitude}, {point.longitude})
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
