'use client';

import { useState, useMemo, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
import type { House, SubCity, Kebele, Ketena } from '@/lib/definitions';
import useSupercluster from 'use-supercluster';
import { ExternalLink, Home } from 'lucide-react';
import { cn } from '@/lib/utils';


function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}
  

export default function GeoMapDashboardPage() {
    const firestore = useFirestore();
    const map = useMap();

    // Data Fetching
    const housesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'houses') : null, [firestore]);
    const { data: houses, isLoading: isLoadingHouses } = useCollection<House>(housesQuery);

    const subCitiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subCities') : null, [firestore]);
    const { data: subCities, isLoading: isLoadingSubCities } = useCollection<SubCity>(subCitiesQuery);

    const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
    const { data: kebeles, isLoading: isLoadingKebeles } = useCollection<Kebele>(kebelesQuery);
    
    const ketenasQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'ketenas') : null, [firestore]);
    const { data: ketenas, isLoading: isLoadingKetenas } = useCollection<Ketena>(ketenasQuery);

    const isLoading = isLoadingHouses || isLoadingSubCities || isLoadingKebeles || isLoadingKetenas;

    // Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [selectedSubCity, setSelectedSubCity] = useState<string | null>(null);
    const [selectedKebele, setSelectedKebele] = useState<string | null>(null);
    const [selectedKetena, setSelectedKetena] = useState<string | null>(null);
    const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

    // Derived State for Filters
    const filteredKebeles = useMemo(() => {
        if (!selectedSubCity || !kebeles) return [];
        return kebeles.filter(k => k.subCityId === selectedSubCity);
    }, [selectedSubCity, kebeles]);

    const filteredKetenas = useMemo(() => {
        if (!selectedKebele || !ketenas) return [];
        return ketenas.filter(kt => kt.kebeleId === selectedKebele);
    }, [selectedKebele, ketenas]);
    
    // Reset dependent filters on change
    useEffect(() => {
        setSelectedKebele(null);
        setSelectedKetena(null);
    }, [selectedSubCity]);
    
    useEffect(() => {
        setSelectedKetena(null);
    }, [selectedKebele]);


    // Filtered Data for Map
    const filteredHouses = useMemo(() => {
        if (!houses) return [];
        return houses.filter(house => {
            const searchMatch = debouncedSearchQuery.length > 2 ? 
                house.householderName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
                house.houseNumber.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                : true;
            const subCityMatch = selectedSubCity ? house.subCityId === selectedSubCity : true;
            const kebeleMatch = selectedKebele ? house.kebeleId === selectedKebele : true;
            const ketenaMatch = selectedKetena ? house.ketenaId === selectedKetena : true;

            return searchMatch && subCityMatch && kebeleMatch && ketenaMatch;
        });
    }, [houses, debouncedSearchQuery, selectedSubCity, selectedKebele, selectedKetena]);

    // Format for Clustering
    const points = useMemo(() => filteredHouses.map(house => ({
        type: 'Feature',
        properties: { cluster: false, houseId: house.id, ...house },
        geometry: { type: 'Point', coordinates: [house.longitude, house.latitude] }
    })), [filteredHouses]);

    // Clustering Hook
    const [bounds, setBounds] = useState<number[] | undefined>();
    const [zoom, setZoom] = useState(12);
    
    const { clusters, supercluster } = useSupercluster({
        points: points as any,
        bounds,
        zoom,
        options: { radius: 75, maxZoom: 20 }
    });

    const handleMapChange = (e: { zoom: number; bounds: google.maps.LatLngBounds | undefined; }) => {
        setZoom(e.zoom);
        setBounds(e.bounds ? [
          e.bounds.getSouthWest().lng(),
          e.bounds.getSouthWest().lat(),
          e.bounds.getNorthEast().lng(),
          e.bounds.getNorthEast().lat(),
        ] : undefined);
      };

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const defaultCenter = { lat: 7.54978, lng: 37.85374 };

    if (!googleMapsApiKey) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">Google Maps API key is missing. Please configure it in your environment variables.</p>
          </div>
        );
    }
    
    return (
        <div className="h-[calc(100vh-6rem)] w-full flex relative">
            <APIProvider apiKey={googleMapsApiKey}>
                <Map
                    defaultCenter={defaultCenter}
                    defaultZoom={13}
                    mapId="geo-dashboard-map"
                    className="rounded-lg h-full w-full"
                    gestureHandling="greedy"
                    onCameraChanged={e => handleMapChange({zoom: e.detail.zoom, bounds: e.detail.bounds})}
                >
                    {clusters.map(cluster => {
                        const [longitude, latitude] = cluster.geometry.coordinates;
                        const { cluster: isCluster, point_count: pointCount, houseId } = cluster.properties;

                        if (isCluster) {
                            return (
                                <AdvancedMarker 
                                    key={`cluster-${cluster.id}`} 
                                    position={{ lat: latitude, lng: longitude }}
                                    onClick={() => {
                                        if (map && supercluster) {
                                            const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id as number), 20);
                                            map.moveCamera({ center: {lat: latitude, lng: longitude}, zoom: expansionZoom });
                                        }
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center font-bold text-sm border-2 border-primary-foreground shadow-md">
                                        {pointCount}
                                    </div>
                                </AdvancedMarker>
                            );
                        }
                        
                        const house = filteredHouses.find(h => h.id === houseId);
                        return (
                            <AdvancedMarker 
                                key={`house-${houseId}`} 
                                position={{ lat: latitude, lng: longitude }}
                                onClick={() => setSelectedHouse(house || null)}
                            >
                                <div className="w-5 h-5">
                                    <Home className="w-full h-full text-red-600 drop-shadow-md" />
                                </div>
                            </AdvancedMarker>
                        );
                    })}

                    {selectedHouse && (
                        <InfoWindow
                            position={{lat: selectedHouse.latitude, lng: selectedHouse.longitude}}
                            onCloseClick={() => setSelectedHouse(null)}
                            minWidth={250}
                        >
                            <div className="space-y-2 text-sm">
                                <h4 className="font-bold">{selectedHouse.houseNumber}</h4>
                                <p><strong>Householder:</strong> {selectedHouse.householderName}</p>
                                <p><strong>Phone:</strong> {selectedHouse.phoneNumber}</p>
                                <Button size="sm" asChild>
                                    <a href={`https://www.google.com/maps?q=${selectedHouse.latitude},${selectedHouse.longitude}`} target="_blank" rel="noopener noreferrer">
                                        Open in Google Maps <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </APIProvider>

            <Card className="absolute top-4 left-4 w-full max-w-sm max-h-[calc(100%-2rem)] flex flex-col">
                <CardHeader>
                    <CardTitle>Map Filters</CardTitle>
                    <CardDescription>Search and filter housing records.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <>
                           <Input 
                                placeholder="Search by House # or Name..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <Select value={selectedSubCity || ''} onValueChange={v => setSelectedSubCity(v)}>
                                <SelectTrigger><SelectValue placeholder="Filter by Sub-City" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Sub-Cities</SelectItem>
                                    {subCities?.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Select value={selectedKebele || ''} onValueChange={v => setSelectedKebele(v)} disabled={!selectedSubCity}>
                                <SelectTrigger><SelectValue placeholder="Filter by Kebele" /></SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="">All Kebeles</SelectItem>
                                    {filteredKebeles.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Select value={selectedKetena || ''} onValueChange={v => setSelectedKetena(v)} disabled={!selectedKebele}>
                                <SelectTrigger><SelectValue placeholder="Filter by Ketena" /></SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="">All Ketenas</SelectItem>
                                    {filteredKetenas.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}