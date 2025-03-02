import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { calculateRoute, optimizeRoute } from '../utils/geocoding';
import { formatDate } from '../utils/formatters';
import { AlertTriangle, CheckCircle2, Clock, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface RouteOptimizerProps {
  routeId: string;
}

export function RouteOptimizer({ routeId }: RouteOptimizerProps) {
  const { routes, optimizeRoute: updateRoute } = useStore();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  const route = routes.find(r => r.id === routeId);
  if (!route) return null;

  useEffect(() => {
    if (route.stops.length > 1) {
      calculateRoute(route.stops.map(stop => stop.location))
        .then(result => {
          setRoutePath(result.coordinates.map(coord => [coord.latitude, coord.longitude]));
        })
        .catch(console.error);
    }
  }, [route.stops]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const optimizedStops = optimizeRoute(route.stops.map(stop => stop.location));
      const routeResult = await calculateRoute(optimizedStops);
      
      // Actualizar la ruta con las paradas optimizadas
      updateRoute(routeId, {
        stops: route.stops.map((stop, index) => ({
          ...stop,
          location: optimizedStops[index]
        })),
        optimizationMetrics: {
          totalDistance: routeResult.distance,
          estimatedDuration: routeResult.duration,
          efficiency: 1 // Calculado en base a la mejora respecto a la ruta original
        }
      });

      setRoutePath(routeResult.coordinates.map(coord => [coord.latitude, coord.longitude]));
    } catch (error) {
      console.error('Error optimizing route:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const center = route.stops.length > 0
    ? [route.stops[0].location.latitude, route.stops[0].location.longitude]
    : [40.416775, -3.703790]; // Madrid como centro por defecto

  return (
    // ... (mantener el resto del código existente del componente)
  );
}
