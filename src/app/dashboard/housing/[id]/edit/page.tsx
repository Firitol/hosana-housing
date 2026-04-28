'use client';

import { HousingForm } from "@/components/housing/housing-form";
import { notFound } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, collectionGroup } from "firebase/firestore";

export default function EditHousingPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  
  const houseRef = useMemoFirebase(() => firestore ? doc(firestore, 'houses', params.id) : null, [firestore, params.id]);
  const { data: house, isLoading: isLoadingHouse } = useDoc(houseRef);

  const subCitiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subCities') : null, [firestore]);
  const { data: subCities, isLoading: isLoadingSubCities } = useCollection(subCitiesQuery);

  const woredasQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'woredas') : null, [firestore]);
  const { data: woredas, isLoading: isLoadingWoredas } = useCollection(woredasQuery);

  const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
  const { data: kebeles, isLoading: isLoadingKebeles } = useCollection(kebelesQuery);

  const isLoading = isLoadingHouse || isLoadingSubCities || isLoadingWoredas || isLoadingKebeles;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!house) {
    notFound();
  }

  return (
    <div className="space-y-6">
       <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit House: {house.houseNumber}</h1>
       <HousingForm 
        subCities={subCities || []}
        woredas={woredas || []}
        kebeles={kebeles || []}
        defaultValues={house}
       />
    </div>
  );
}

    