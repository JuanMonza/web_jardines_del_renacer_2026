'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface Location {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  tipo?: string;
}

interface Props {
  locations: readonly Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  zoom?: number;
}

const defaultCenter = {
  lat: 4.8133, // Centro de Colombia
  lng: -75.6961,
};

const mapOptions = {
  mapId: 'a2d8b3b6c1f0e4d', // ID de estilo personalizado de Google Cloud
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

export default function GoogleMapWithMarkers({
  locations = [],
  selectedLocation,
  onSelectLocation,
  zoom = 5,
}: Props) {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLocation) {
      setActiveMarkerId(selectedLocation.id);
    } else {
      setActiveMarkerId(null);
    }
  }, [selectedLocation]);

  const handleMarkerClick = (location: Location) => {
    onSelectLocation(location);
    setActiveMarkerId(location.id);
  };

  const center = selectedLocation
    ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
    : defaultCenter;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <Map
        center={center}
        zoom={selectedLocation ? 14 : zoom}
        options={mapOptions}
        className="h-full w-full"
      >
        {locations.map((location) => (
          <AdvancedMarker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => handleMarkerClick(location)}
          >
            <div
              className={cn(
                'w-3 h-3 rounded-full bg-primary ring-4 ring-primary/30 transition-all duration-300',
                {
                  'scale-150 bg-white ring-8 ring-primary':
                    activeMarkerId === location.id,
                },
              )}
            />
          </AdvancedMarker>
        ))}

        {activeMarkerId && selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setActiveMarkerId(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -30),
            }}
          >
            <div className="p-1 max-w-xs">
              <h3 className="font-display text-base font-bold text-text mb-1">
                {selectedLocation.nombre}
              </h3>
              <p className="text-sm text-textLight">
                {selectedLocation.direccion}
              </p>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}