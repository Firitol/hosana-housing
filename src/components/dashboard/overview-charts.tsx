'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { House } from '@/lib/definitions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function OverviewCharts() {
    const firestore = useFirestore();

    const housesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'houses') : null, [firestore]);
    const { data: houses, isLoading, error } = useCollection<House>(housesQuery);

    const chartData = useMemo(() => {
        if (!houses) return [];

        const housesByMonth = houses.reduce((acc, house) => {
            if (house.createdAt?.toDate) {
                const month = format(house.createdAt.toDate(), 'yyyy-MM');
                acc[month] = (acc[month] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(housesByMonth)
            .sort()
            .slice(-12) // Show last 12 months of activity
            .map(monthKey => {
                const [year, month] = monthKey.split('-').map(Number);
                return {
                    name: format(new Date(year, month - 1), 'MMM yy'),
                    total: housesByMonth[monthKey],
                };
            });
    }, [houses]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="w-full h-[350px] flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="w-full h-[350px] flex items-center justify-center p-4">
                    <Alert variant="destructive" className="w-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Chart</AlertTitle>
                        <AlertDescription>
                            There was a problem fetching data for the overview chart. Please try again later.
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        if (chartData.length === 0) {
            return (
                <div className="w-full h-[350px] flex items-center justify-center">
                    <p className="text-muted-foreground">No registration data available to display.</p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                />
                <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
                />
                <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))'
                }}
                />
                <Bar dataKey="total" name="Houses Registered" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        );
    }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Registrations Overview</CardTitle>
        <CardDescription>Houses registered per month (last 12 months).</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
