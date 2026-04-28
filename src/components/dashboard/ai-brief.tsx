'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { WandSparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAiBrief } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query, orderBy, limit } from 'firebase/firestore';
import type { AdministrativeBriefsInput } from '@/ai/flows/ai-administrative-briefs-flow';
import type { House, SubCity, Kebele, AuditLog } from '@/lib/definitions';

export function AiBrief() {
  const [brief, setBrief] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const firestore = useFirestore();

  // 1. Fetch all necessary data
  const housesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'houses') : null, [firestore]);
  const { data: houses, isLoading: isLoadingHouses } = useCollection<House>(housesQuery);

  const subCitiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subCities') : null, [firestore]);
  const { data: subCities, isLoading: isLoadingSubCities } = useCollection<SubCity>(subCitiesQuery);

  const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
  const { data: kebeles, isLoading: isLoadingKebeles } = useCollection<Kebele>(kebelesQuery);

  const auditLogsQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'auditLogs'), orderBy('timestamp', 'desc'), limit(10)) : null), [firestore]);
  const { data: auditLogs, isLoading: isLoadingAuditLogs } = useCollection<AuditLog>(auditLogsQuery);
  
  const areAllDataLoaded = !isLoadingHouses && !isLoadingSubCities && !isLoadingKebeles && !isLoadingAuditLogs;

  // 2. Compute stats from the fetched data
  const aiInput = useMemo((): AdministrativeBriefsInput | null => {
    if (!areAllDataLoaded || !houses || !subCities || !kebeles || !auditLogs) return null;

    const housesBySubcity = houses.reduce((acc, house) => {
      const subCityName = subCities.find(sc => sc.id === house.subCityId)?.name || 'Unknown';
      acc[subCityName] = (acc[subCityName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const housesByKebele = houses.reduce((acc, house) => {
        const kebeleName = kebeles.find(k => k.id === house.kebeleId)?.name || 'Unknown';
        acc[kebeleName] = (acc[kebeleName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedHouses = [...houses].sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    const recentlyAddedHouses = sortedHouses.slice(0, 5).map(h => ({
      houseNumber: h.houseNumber,
      householderName: h.householderName,
      createdAt: h.createdAt.toDate().toISOString(),
    }));

    const recentlyUpdatedHouses = [...houses].sort((a,b) => b.updatedAt.toMillis() - a.updatedAt.toMillis()).slice(0, 5).map(h => ({
        houseNumber: h.houseNumber,
        householderName: h.householderName,
        updatedAt: h.updatedAt.toDate().toISOString(),
      }));

    const formattedAuditLogs = auditLogs.map(log => ({
        timestamp: log.timestamp.toDate().toISOString(),
        user: log.userEmail || log.userId,
        action: log.action,
        entityType: log.tableName,
        entityId: log.recordId,
        description: log.description
    }));

    return {
      dashboardStatistics: {
        totalHouses: houses.length,
        housesBySubcity,
        housesByWoreda: {}, // Schema requires it, but we use kebeles
        housesByKebele,
        recentlyAddedHouses,
        recentlyUpdatedHouses,
      },
      auditLogs: formattedAuditLogs,
    };
  }, [areAllDataLoaded, houses, subCities, kebeles, auditLogs]);

  // 3. Call the server action
  const generateBrief = useCallback(async () => {
    if (!aiInput) return;

    setIsLoading(true);
    setError('');
    const result = await getAiBrief(aiInput);
    if (result.success && result.brief) {
      setBrief(result.brief);
      setGeneratedAt(new Date());
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
    setIsLoading(false);
  }, [aiInput]);

  useEffect(() => {
    if (aiInput) {
        generateBrief();
    }
  }, [aiInput, generateBrief]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <WandSparkles className="h-5 w-5 text-primary" />
                    AI Administrative Brief
                </CardTitle>
                <CardDescription>
                    A summary of housing trends and system activity.
                </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={generateBrief} disabled={isLoading || !areAllDataLoaded}>
                Regenerate
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || !areAllDataLoaded ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {brief}
          </p>
        )}
      </CardContent>
      {generatedAt && (
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Generated at {generatedAt.toLocaleTimeString()}
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
