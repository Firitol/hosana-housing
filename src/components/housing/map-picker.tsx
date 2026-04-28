"use client";

import { Map, Marker } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { GoogleMapsProvider } from "@/components/google-maps-provider";

interface MapPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  initialPosition?: { lat: number; lng: number };
}

export function MapPicker({ onLocationSelect, initialPosition }: MapPickerProps) {
  const defaultPosition = { lat: 7.56, lng: 37.85 }; // Default to Hosana center
  const [position, setPosition] = useState(initialPosition?.latitude && initialPosition?.longitude ? {lat: initialPosition.latitude, lng: initialPosition.longitude} : defaultPosition);

  useEffect(() => {
    if (initialPosition?.latitude && initialPosition?.longitude) {
      setPosition({lat: initialPosition.latitude, lng: initialPosition.longitude});
    }
  }, [initialPosition]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setPosition(newPos);
      onLocationSelect(newPos);
    }
  };
  
  return (
    <div className="h-full w-full rounded-md overflow-hidden border">
      <GoogleMapsProvider>
        <Map
          center={position}
          zoom={13}
          onClick={handleMapClick}
          mapId="map-picker"
          gestureHandling={'greedy'}
        >
          <Marker position={position} />
        </Map>
      </GoogleMapsProvider>
    </div>
  );
}
