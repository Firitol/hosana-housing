import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/housing/data-table';
import { houses, subCities, woredas, kebeles } from '@/lib/data';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

export default async function HousingPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Housing Records</h1>
                <Link href="/dashboard/housing/new">
                    <Button>Add New House</Button>
                </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <Input placeholder="Search by House # or Name..." className="max-w-sm" />
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Sub-City" />
                    </SelectTrigger>
                    <SelectContent>
                        {subCities.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Woreda" />
                    </SelectTrigger>
                    <SelectContent>
                        {woredas.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Kebele" />
                    </SelectTrigger>
                    <SelectContent>
                        {kebeles.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <DataTable data={houses} subCities={subCities} woredas={woredas} kebeles={kebeles} />
        </div>
    );
}
