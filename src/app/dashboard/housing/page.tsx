'use client';

import Link from 'next/link';
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

export default function HousingPage() {
    const firestore = useFirestore();

    const housesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'houses') : null, [firestore]);
    const { data: houses, isLoading: isLoadingHouses } = useCollection(housesQuery);

    const subCitiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subCities') : null, [firestore]);
    const { data: subCities, isLoading: isLoadingSubCities } = useCollection(subCitiesQuery);

    const woredasQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'woredas') : null, [firestore]);
    const { data: woredas, isLoading: isLoadingWoredas } = useCollection(woredasQuery);
    
    const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
    const { data: kebeles, isLoading: isLoadingKebeles } = useCollection(kebelesQuery);

    const isLoading = isLoadingHouses || isLoadingSubCities || isLoadingWoredas || isLoadingKebeles;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Housing Records</h1>
                <div className="flex items-center gap-2">
                    <CsvImporter
                        subCities={subCities || []}
                        woredas={woredas || []}
                        kebeles={kebeles || []}
                    />
                    <Link href="/dashboard/housing/new">
                        <Button>Add New House</Button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <Input placeholder="Search by House # or Name..." className="max-w-sm" />
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Sub-City" />
                    </SelectTrigger>
                    <SelectContent>
                        {subCities?.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Woreda" />
                    </SelectTrigger>
                    <SelectContent>
                        {woredas?.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Kebele" />
                    </SelectTrigger>
                    <SelectContent>
                        {kebeles?.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            {isLoading ? (
                <div className="text-center p-8">Loading data...</div>
            ) : (
                <DataTable data={houses || []} subCities={subCities || []} woredas={woredas || []} kebeles={kebeles || []} />
            )}
        </div>
    );
}
