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

  const kebelesQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'kebeles') : null, [firestore]);
  const { data: kebeles, isLoading: isLoadingKebeles } = useCollection(kebelesQuery);
  
  const ketenasQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'ketenas') : null, [firestore]);
  const { data: ketenas, isLoading: isLoadingKetenas } = useCollection(ketenasQuery);

  const isLoading = isLoadingHouse || isLoadingSubCities || isLoadingKebeles || isLoadingKetenas;

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
        kebeles={kebeles || []}
        ketenas={ketenas || []}
        defaultValues={house}
       />
    </div>
  );
}
