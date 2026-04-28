import { houses, subCities, woredas, kebeles } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pen } from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export default function HouseDetailPage({ params }: { params: { id: string } }) {
  const house = houses.find(h => h.id === params.id);

  if (!house) {
    notFound();
  }

  const subCity = subCities.find(sc => sc.id === house.subCityId)?.name || 'N/A';
  const woreda = woredas.find(w => w.id === house.woredaId)?.name || 'N/A';
  const kebele = kebeles.find(k => k.id === house.kebeleId)?.name || 'N/A';
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Google Maps API key is missing. Please configure it in your environment variables.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">House Details: {house.houseNumber}</h1>
        <Link href={`/dashboard/housing/${house.id}/edit`}>
          <Button variant="outline"><Pen className="mr-2 h-4 w-4" />Edit</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Householder:</strong> {house.householderName}</div>
            <div><strong>Phone:</strong> {house.phoneNumber}</div>
            <div><strong>National ID:</strong> {house.nationalId || 'N/A'}</div>
            <div><strong>Family Size:</strong> {house.familySize}</div>
            <div><strong>House Type:</strong> {house.houseType}</div>
            <div><strong>Sub-City:</strong> {subCity}</div>
            <div><strong>Woreda:</strong> {woreda}</div>
            <div><strong>Kebele:</strong> {kebele}</div>
            <div className="md:col-span-2"><strong>Address:</strong> {house.addressDescription}</div>
            <div className="md:col-span-2"><strong>Registered:</strong> {new Date(house.createdAt).toLocaleDateString()}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full p-0">
             <APIProvider apiKey={googleMapsApiKey}>
                <Map
                  defaultCenter={house.gps}
                  defaultZoom={15}
                  mapId="house-detail-map"
                  className="rounded-b-lg"
                >
                  <Marker position={house.gps} />
                </Map>
              </APIProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
