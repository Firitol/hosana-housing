'use client';

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { Card, CardContent } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function MapPage() {
    const firestore = useFirestore();
    const housesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'houses') : null, [firestore]);
    const { data: houses, isLoading } = useCollection(housesQuery);
    
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">Google Maps API key is missing. Please configure it in your environment variables.</p>
          </div>
        );
    }

    const defaultCenter = { lat: 9.005401, lng: 38.763611 };

    return (
        <div className="space-y-4 h-[calc(100vh-10rem)] flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Map View</h1>
            <p className="text-muted-foreground">Showing all registered housing locations.</p>
            <Card className="flex-1">
                <CardContent className="p-0 h-full w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">Loading map data...</div>
                ) : (
                    <APIProvider apiKey={googleMapsApiKey}>
                        <Map
                            defaultCenter={defaultCenter}
                            defaultZoom={12}
                            mapId="full-map-view"
                            className="rounded-lg h-full"
                            gestureHandling="greedy"
                        >
                            {houses?.map(house => (
                                <Marker key={house.id} position={{lat: house.latitude, lng: house.longitude}} title={house.houseNumber} />
                            ))}
                        </Map>
                    </APIProvider>
                )}
                </CardContent>
            </Card>
        </div>
    );
}

    