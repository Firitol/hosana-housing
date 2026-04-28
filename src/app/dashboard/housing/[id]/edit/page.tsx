import { HousingForm } from "@/components/housing/housing-form";
import { subCities, woredas, kebeles, houses } from "@/lib/data";
import { notFound } from "next/navigation";

export default function EditHousingPage({ params }: { params: { id: string } }) {
  const house = houses.find(h => h.id === params.id);

  if (!house) {
    notFound();
  }

  return (
    <div className="space-y-6">
       <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit House: {house.houseNumber}</h1>
       <HousingForm 
        subCities={subCities}
        woredas={woredas}
        kebeles={kebeles}
        defaultValues={house}
       />
    </div>
  );
}
