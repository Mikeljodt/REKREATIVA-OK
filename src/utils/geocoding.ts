import type { Address, Coordinates, PlaceDetails } from '../types';

export async function searchBusiness(query: string): Promise<PlaceDetails[]> {
  try {
    // Usar Nominatim para búsqueda de establecimientos
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=es&limit=5&addressdetails=1&namedetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'Rekreativa/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Error al buscar el negocio');
    }

    const results = await response.json();

    return results.map((result: any) => ({
      placeId: result.osm_id.toString(),
      name: result.namedetails?.name || result.display_name.split(',')[0],
      formattedAddress: result.display_name,
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      },
      businessStatus: 'OPERATIONAL',
      types: result.type ? [result.type] : [],
      address: {
        street: result.address.road || '',
        number: result.address.house_number || '',
        postalCode: result.address.postcode || '',
        city: result.address.city || result.address.town || '',
        province: result.address.state || '',
        country: result.address.country || 'España'
      }
    }));
  } catch (error) {
    console.error('Error en la búsqueda de negocios:', error);
    throw new Error('No se pudo buscar el negocio');
  }
}

interface AddressValidationResult {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  components: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
  };
}

export async function validateAndEnrichAddress(address: string): Promise<AddressValidationResult> {
  try {
    // Usar Nominatim para validar y enriquecer la dirección
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&countrycodes=es&limit=1&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'Rekreativa/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Error al validar la dirección');
    }

    const results = await response.json();
    
    if (results.length === 0) {
      throw new Error('No se pudo encontrar la dirección especificada');
    }

    const result = results[0];

    return {
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      },
      components: {
        street: result.address.road || '',
        number: result.address.house_number || '',
        postalCode: result.address.postcode || '',
        city: result.address.city || result.address.town || '',
        province: result.address.state || '',
        country: result.address.country || 'España'
      }
    };
  } catch (error) {
    console.error('Error validando dirección:', error);
    throw new Error('No se pudo validar la dirección. Por favor, verifica que sea correcta.');
  }
}

export async function calculateRoute(stops: { latitude: number; longitude: number }[]): Promise<{
  coordinates: { latitude: number; longitude: number }[];
  distance: number;
  duration: number;
}> {
  try {
    // Usar OSRM para calcular la ruta
    const coordinates = stops.map(stop => `${stop.longitude},${stop.latitude}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

    const response = await fetch(osrmUrl);
    if (!response.ok) {
      throw new Error('Error al calcular la ruta');
    }

    const data = await response.json();
    const route = data.routes[0];

    return {
      coordinates: route.geometry.coordinates.map((coord: [number, number]) => ({
        latitude: coord[1],
        longitude: coord[0]
      })),
      distance: route.distance,
      duration: route.duration
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    throw new Error('No se pudo calcular la ruta');
  }
}

export function optimizeRoute(stops: { latitude: number; longitude: number }[]): { latitude: number; longitude: number }[] {
  // Implementar algoritmo de optimización de ruta (TSP)
  // Por ahora, simplemente devolver el orden original
  return stops;
}

export async function optimizeRouteWithMaintenance(
  clientLocations: { latitude: number; longitude: number; clientId: string }[],
  maintenanceTasks: { latitude: number; longitude: number; machineId: string }[]
): Promise<{ latitude: number; longitude: number; type: 'collection' | 'maintenance'; id: string }[]> {
  // Combine collection points and maintenance locations
  const allPoints = [
    ...clientLocations.map(c => ({ ...c, type: 'collection', id: c.clientId })),
    ...maintenanceTasks.map(m => ({
      latitude: m.latitude,
      longitude: m.longitude,
      type: 'maintenance',
      id: m.machineId
    }))
  ];

  // Basic optimization (for now, just combine and return)
  return allPoints;
}
