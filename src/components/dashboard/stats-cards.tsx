'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
import { Home, Users, MapPin, Building2 } from 'lucide-react';

function StatCard({ title, value, icon: Icon, description, isLoading }: { title: string, value: string | number, icon: React.ElementType, description?: string, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-1/2" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
                {description && !isLoading && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}


export function StatsCards() {
    const firestore = useFirestore();

    const housesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'houses') : null, [firestore]);
    const { data: houses, isLoading: isLoadingHouses } = useCollection(housesQuery);

    const subCitiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subCities') : null, [firestore]);
    const { data: subCities, isLoading: isLoadingSubCities } = useCollection(subCitiesQuery);

    const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
    const { data: kebeles, isLoading: isLoadingKebeles } = useCollection(kebelesQuery);
    
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: users, isLoading: isLoadingUsers } = useCollection(usersQuery);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Houses"
            value={houses?.length || 0}
            icon={Home}
            isLoading={isLoadingHouses}
            description="Total registered houses in the system"
        />
        <StatCard 
            title="Sub-Cities"
            value={subCities?.length || 0}
            icon={Building2}
            isLoading={isLoadingSubCities}
            description="Total administrative sub-cities"
        />
        <StatCard 
            title="Kebeles"
            value={kebeles?.length || 0}
            icon={MapPin}
            isLoading={isLoadingKebeles}
            description="Across all sub-cities"
        />
        <StatCard 
            title="Registered Users"
            value={users?.length || 0}
            icon={Users}
            isLoading={isLoadingUsers}
            description="Total users with system access"
        />
    </div>
  );
}
