'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/housing/data-table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
import { CsvImporter } from '@/components/housing/csv-importer';
import type { Kebele, Ketena } from '@/lib/definitions';

// Debounce hook to delay search query execution
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function HousingPage() {
    const firestore = useFirestore();

    const housesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'houses') : null, [firestore]);
    const { data: houses, isLoading: isLoadingHouses } = useCollection(housesQuery);

    const subCitiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subCities') : null, [firestore]);
    const { data: subCities, isLoading: isLoadingSubCities } = useCollection(subCitiesQuery);

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

    // Derived State for dependent filters
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

    const filteredHouses = useMemo(() => {
        if (!houses) return [];
        return houses.filter(house => {
            const searchMatch = debouncedSearchQuery.length > 0 ? 
                house.householderName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
                house.houseNumber.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                : true;
            const subCityMatch = selectedSubCity ? house.subCityId === selectedSubCity : true;
            const kebeleMatch = selectedKebele ? house.kebeleId === selectedKebele : true;
            const ketenaMatch = selectedKetena ? house.ketenaId === selectedKetena : true;

            return searchMatch && subCityMatch && kebeleMatch && ketenaMatch;
        });
    }, [houses, debouncedSearchQuery, selectedSubCity, selectedKebele, selectedKetena]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Housing Records</h1>
                <div className="flex items-center gap-2">
                    <CsvImporter
                        subCities={subCities || []}
                        kebeles={kebeles || []}
                        ketenas={ketenas || []}
                    />
                    <Link href="/dashboard/housing/new">
                        <Button>Add New House</Button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <Input 
                    placeholder="Search by House # or Name..." 
                    className="max-w-sm" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <Select value={selectedSubCity || 'all'} onValueChange={v => setSelectedSubCity(v === 'all' ? null : v)}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Sub-City" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sub-Cities</SelectItem>
                        {subCities?.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={selectedKebele || 'all'} onValueChange={v => setSelectedKebele(v === 'all' ? null : v)} disabled={!selectedSubCity}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Kebele" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="all">All Kebeles</SelectItem>
                        {filteredKebeles.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={selectedKetena || 'all'} onValueChange={v => setSelectedKetena(v === 'all' ? null : v)} disabled={!selectedKebele}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Ketena" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="all">All Ketenas</SelectItem>
                        {filteredKetenas.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            {isLoading ? (
                <div className="text-center p-8">Loading data...</div>
            ) : (
                <DataTable data={filteredHouses || []} subCities={subCities || []} kebeles={kebeles || []} ketenas={ketenas || []} />
            )}
        </div>
    );
}
