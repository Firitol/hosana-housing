'use client';

import { HousingForm } from "@/components/housing/housing-form";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup } from "firebase/firestore";

export default function NewHousingPage() {
  const firestore = useFirestore();

  const subCitiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subCities') : null, [firestore]);
  const { data: subCities, isLoading: isLoadingSubCities } = useCollection(subCitiesQuery);

  const woredasQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'woredas') : null, [firestore]);
  const { data: woredas, isLoading: isLoadingWoredas } = useCollection(woredasQuery);

  const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
  const { data: kebeles, isLoading: isLoadingKebeles } = useCollection(kebelesQuery);

  const isLoading = isLoadingSubCities || isLoadingWoredas || isLoadingKebeles;

  return (
    <div className="space-y-6">
       <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Register New House</h1>
       {isLoading ? (
          <div>Loading administrative data...</div>
        ) : (
          <HousingForm 
            subCities={subCities || []}
            woredas={woredas || []}
            kebeles={kebeles || []}
          />
        )}
    </div>
  );
}

    