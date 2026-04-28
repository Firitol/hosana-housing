'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

export function OverviewCharts() {
    const firestore = useFirestore();

    const housesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'houses') : null, [firestore]);
    const { data: houses, isLoading: isLoadingHouses } = useCollection(housesQuery);

    const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
    const { data: kebeles, isLoading: isLoadingKebeles } = useCollection(kebelesQuery);
    
    const isLoading = isLoadingHouses || isLoadingKebeles;

    const chartData = useMemo(() => {
        if (!houses || !kebeles) return [];

        const housesByKebele = houses.reduce((acc, house) => {
            acc[house.kebeleId] = (acc[house.kebeleId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(housesByKebele)
            .map(([kebeleId, total]) => {
                const kebele = kebeles.find(k => k.id === kebeleId);
                return {
                    name: kebele ? kebele.name : 'Unknown',
                    total: total,
                };
            })
            .sort((a, b) => b.total - a.total); // Sort for better visualization

    }, [houses, kebeles]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Housing distribution by Kebele.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
            <div className="w-full h-[350px] flex items-center justify-center">
                <Skeleton className="w-full h-full" />
            </div>
        ) : (
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                />
                <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))'
                }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
