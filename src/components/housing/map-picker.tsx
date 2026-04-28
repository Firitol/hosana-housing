"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";

interface MapPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  initialPosition?: { lat: number; lng: number };
}

export function MapPicker({ onLocationSelect, initialPosition }: MapPickerProps) {
  const defaultPosition = { lat: 9.005401, lng: 38.763611 }; // Default to Hosana center
  const [position, setPosition] = useState(initialPosition || defaultPosition);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setPosition(newPos);
      onLocationSelect(newPos);
    }
  };
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-full rounded-md border bg-muted">
        <p className="text-center text-sm text-destructive p-4">
            Google Maps API key is missing.
            <br />
            Map functionality is disabled.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-md overflow-hidden border">
      <APIProvider apiKey={googleMapsApiKey}>
        <Map
          defaultCenter={position}
          defaultZoom={13}
          onClick={handleMapClick}
          mapId="map-picker"
          gestureHandling={'greedy'}
        >
          <Marker position={position} />
        </Map>
      </APIProvider>
    </div>
  );
}
