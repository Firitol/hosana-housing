import { HousingForm } from "@/components/housing/housing-form";
import { subCities, woredas, kebeles } from "@/lib/data";

export default function NewHousingPage() {
  return (
    <div className="space-y-6">
       <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Register New House</h1>
       <HousingForm 
        subCities={subCities}
        woredas={woredas}
        kebeles={kebeles}
       />
    </div>
  );
}
