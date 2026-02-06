# Integración de Google Maps - Jardines del Renacer

## 📍 Guía para agregar el mapa interactivo con marcadores

### Paso 1: Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita estas APIs:
   - Maps JavaScript API
   - Places API (opcional, para búsqueda)
4. Ve a "Credenciales" y crea una API Key
5. **Importante:** Restringe tu API Key por dominio para seguridad

### Paso 2: Instalar la librería

```bash
npm install @vis.gl/react-google-maps
```

O también puedes usar la librería oficial:

```bash
npm install @react-google-maps/api
```

### Paso 3: Agregar la API Key al proyecto

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### Paso 4: Crear el componente del Mapa

Crea el archivo `src/components/maps/GoogleMapWithMarkers.tsx`:

```tsx
'use client';

import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

interface Ubicacion {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  lat: number;
  lng: number;
  tipo: 'cementerio' | 'agencia' | 'mausoleo';
}

interface Props {
  ubicaciones: Ubicacion[];
  selectedUbicacion: Ubicacion | null;
  onSelectUbicacion: (ubicacion: Ubicacion) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 23.6345, // Centro de México
  lng: -102.5528,
};

const mapOptions = {
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#ebe3cd' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#a5d6f0' }]
    },
    // Agrega más estilos personalizados aquí
  ],
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

export default function GoogleMapWithMarkers({ 
  ubicaciones, 
  selectedUbicacion,
  onSelectUbicacion 
}: Props) {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const handleMarkerClick = (ubicacion: Ubicacion) => {
    setActiveMarker(ubicacion.id);
    onSelectUbicacion(ubicacion);
  };

  // Iconos personalizados por tipo
  const getMarkerIcon = (tipo: string) => {
    const icons = {
      cementerio: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      agencia: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      mausoleo: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    };
    return icons[tipo as keyof typeof icons] || icons.cementerio;
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedUbicacion ? { lat: selectedUbicacion.lat, lng: selectedUbicacion.lng } : center}
        zoom={selectedUbicacion ? 12 : 5}
        options={mapOptions}
      >
        {ubicaciones.map((ubicacion) => (
          <Marker
            key={ubicacion.id}
            position={{ lat: ubicacion.lat, lng: ubicacion.lng }}
            onClick={() => handleMarkerClick(ubicacion)}
            icon={{
              url: getMarkerIcon(ubicacion.tipo),
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            animation={selectedUbicacion?.id === ubicacion.id ? window.google.maps.Animation.BOUNCE : undefined}
          />
        ))}

        {activeMarker && (
          <InfoWindow
            position={{
              lat: ubicaciones.find(u => u.id === activeMarker)!.lat,
              lng: ubicaciones.find(u => u.id === activeMarker)!.lng,
            }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-3 max-w-xs">
              <h3 className="font-bold text-base mb-1">
                {ubicaciones.find(u => u.id === activeMarker)!.nombre}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {ubicaciones.find(u => u.id === activeMarker)!.direccion}
              </p>
              <a 
                href={`tel:${ubicaciones.find(u => u.id === activeMarker)!.telefono}`}
                className="text-sm text-blue-600 hover:underline"
              >
                📞 {ubicaciones.find(u => u.id === activeMarker)!.telefono}
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
```

### Paso 5: Integrar en la página de Ubicaciones

Reemplaza el div del placeholder del mapa en `src/app/ubicaciones/page.tsx`:

```tsx
// Importar el componente
import GoogleMapWithMarkers from '@/components/maps/GoogleMapWithMarkers';

// Reemplazar el div del mapa (línea ~240) con:
<div className="glass p-4 rounded-2xl border border-border h-full">
  <div className="relative w-full h-full rounded-xl overflow-hidden">
    <GoogleMapWithMarkers
      ubicaciones={filteredUbicaciones}
      selectedUbicacion={selectedUbicacion}
      onSelectUbicacion={setSelectedUbicacion}
    />
  </div>
</div>
```

### Paso 6: Estilos personalizados (opcional)

Para un mapa con estilo glass/cristal que combine con tu diseño, agrega estos estilos al `mapOptions`:

```javascript
const glassMapStyles = [
  {
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [{ "color": "#e8e4f3" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c8b6ff" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      { "color": "#ffffff" },
      { "lightness": 20 }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#d4efd0" }]
  }
];
```

### Coordenadas de las ubicaciones actuales:

Las ubicaciones en el código ya tienen coordenadas aproximadas. Puedes ajustarlas con las direcciones reales:

```javascript
// Ejemplo de coordenadas reales:
{
  nombre: 'Cementerio Jardines del Tiempo',
  lat: 19.4326, // Latitud
  lng: -99.1332, // Longitud
}
```

### Obtener coordenadas de una dirección:

1. Ve a [Google Maps](https://maps.google.com)
2. Busca la dirección
3. Click derecho en el marcador
4. Selecciona las coordenadas (primer elemento del menú)

### Alternativa: Geocoding API

Si quieres convertir direcciones a coordenadas automáticamente:

```bash
npm install @googlemaps/google-maps-services-js
```

```typescript
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

async function getCoordinates(address: string) {
  const response = await client.geocode({
    params: {
      address: address,
      key: process.env.GOOGLE_MAPS_API_KEY!,
    },
  });
  
  if (response.data.results.length > 0) {
    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  }
  return null;
}
```

## 💰 Costos de Google Maps API

- **Primeros $200 USD/mes:** GRATIS (crédito mensual)
- **Map Loads:** $7 por 1,000 cargas adicionales
- **Geocoding:** $5 por 1,000 solicitudes

Para un sitio pequeño/mediano, el crédito gratuito es suficiente.

## 🔒 Seguridad

**Importante:** Restringe tu API Key en Google Cloud Console:

1. Ve a Credenciales → tu API Key
2. Restricciones de aplicación → Sitios web
3. Agrega tu dominio: `tudominio.com/*`, `localhost/*`
4. Restricciones de API → Selecciona solo las APIs que uses

## ✅ Checklist de implementación

- [ ] Obtener API Key de Google Maps
- [ ] Agregar API Key a `.env.local`
- [ ] Instalar `@react-google-maps/api`
- [ ] Crear componente `GoogleMapWithMarkers.tsx`
- [ ] Reemplazar placeholder en página de ubicaciones
- [ ] Verificar coordenadas de todas las ubicaciones
- [ ] Probar marcadores y ventanas de información
- [ ] Configurar restricciones de seguridad
- [ ] Agregar estilos personalizados al mapa

## 📱 Características adicionales (opcional)

- **Direcciones:** Botón "Cómo llegar" que abre Google Maps
- **Clustering:** Agrupar marcadores cercanos cuando hay zoom out
- **Búsqueda:** Buscador de ubicaciones en el mapa
- **Street View:** Vista de calle integrada
- **Filtros en mapa:** Mostrar/ocultar por tipo de ubicación

¡Tu página de ubicaciones estará lista con mapa interactivo! 🗺️
