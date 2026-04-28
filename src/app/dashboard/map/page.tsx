import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { houses } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";

export default function MapPage() {
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
                <APIProvider apiKey={googleMapsApiKey}>
                    <Map
                        defaultCenter={defaultCenter}
                        defaultZoom={12}
                        mapId="full-map-view"
                        className="rounded-lg h-full"
                        gestureHandling="greedy"
                    >
                        {houses.map(house => (
                            <Marker key={house.id} position={house.gps} title={house.houseNumber} />
                        ))}
                    </Map>
                </APIProvider>
                </CardContent>
            </Card>
        </div>
    );
}
