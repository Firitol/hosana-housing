'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [authFailed, setAuthFailed] = useState(false);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const originalAuthFailure = window.gm_authFailure;
    // The Google Maps script will call this function if it fails to load due to auth or billing issues.
    window.gm_authFailure = () => {
      console.error("Google Maps API authentication/billing error.");
      setAuthFailed(true);
      // It's good practice to call any previously existing handler.
      if (originalAuthFailure) {
        originalAuthFailure();
      }
    };
    return () => {
      window.gm_authFailure = originalAuthFailure;
    };
  }, []);

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-full w-full rounded-md border bg-muted">
        <p className="text-center text-sm text-destructive p-4">
          Google Maps API key is missing.
          <br />
          Map functionality is disabled.
        </p>
      </div>
    );
  }

  if (authFailed) {
    return (
       <div className="flex items-center justify-center h-full w-full rounded-md border bg-muted">
        <p className="text-center text-sm text-destructive p-4">
          Google Maps API key may be invalid or billing is not enabled for your project.
          <br />
          Please check your API key and billing status in the Google Cloud Console.
        </p>
      </div>
    );
  }

  return <APIProvider apiKey={googleMapsApiKey}>{children}</APIProvider>;
}
