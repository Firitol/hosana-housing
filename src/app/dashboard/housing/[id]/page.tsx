'use client';

import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pen } from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, collectionGroup } from "firebase/firestore";
import { House } from "@/lib/definitions";

export default function HouseDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const houseRef = useMemoFirebase(() => firestore ? doc(firestore, 'houses', params.id) : null, [firestore, params.id]);
  const { data: house, isLoading: isLoadingHouse } = useDoc<House>(houseRef);

  const subCitiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subCities') : null, [firestore]);
  const { data: subCities, isLoading: isLoadingSubCities } = useCollection(subCitiesQuery);

  const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
  const { data: kebeles, isLoading: isLoadingKebeles } = useCollection(kebelesQuery);

  const ketenasQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'ketenas') : null, [firestore]);
  const { data: ketenas, isLoading: isLoadingKetenas } = useCollection(ketenasQuery);

  const isLoading = isLoadingHouse || isLoadingSubCities || isLoadingKebeles || isLoadingKetenas;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!house) {
    notFound();
  }

  const subCity = subCities?.find(sc => sc.id === house.subCityId)?.name || 'N/A';
  const kebele = kebeles?.find(k => k.id === house.kebeleId)?.name || 'N/A';
  const ketena = ketenas?.find(kt => kt.id === house.ketenaId)?.name || 'N/A';
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Google Maps API key is missing. Please configure it in your environment variables.</p>
      </div>
    );
  }

  const gps = { lat: house.latitude, lng: house.longitude };

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
            <div><strong>Kebele:</strong> {kebele}</div>
            <div><strong>Ketena:</strong> {ketena}</div>
            <div className="md:col-span-2"><strong>Address:</strong> {house.addressDescription}</div>
            <div className="md:col-span-2"><strong>Registered:</strong> {house.createdAt?.toDate().toLocaleDateString() || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full p-0">
             <APIProvider apiKey={googleMapsApiKey}>
                <Map
                  defaultCenter={gps}
                  defaultZoom={15}
                  mapId="house-detail-map"
                  className="rounded-b-lg"
                >
                  <Marker position={gps} />
                </Map>
              </APIProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
