'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Upload } from 'lucide-react';
import type { SubCity, Woreda, Kebele } from '@/lib/definitions';

// Define expected CSV headers
const EXPECTED_HEADERS = [
  'houseNumber', 'householderName', 'phoneNumber', 'nationalId',
  'familySize', 'houseType', 'addressDescription', 'latitude', 'longitude',
  'subCityName', 'woredaName', 'kebeleName'
];

interface CsvImporterProps {
  subCities: SubCity[];
  woredas: Woreda[];
  kebeles: Kebele[];
}

export function CsvImporter({ subCities, woredas, kebeles }: CsvImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a CSV file to import.' });
      return;
    }
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to import data.' });
      return;
    }

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const headers = results.meta.fields || [];
        const missingHeaders = EXPECTED_HEADERS.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          toast({
            variant: 'destructive',
            title: 'Invalid CSV format',
            description: `Missing required columns: ${missingHeaders.join(', ')}`,
          });
          setIsImporting(false);
          return;
        }

        const housesCollection = collection(firestore, 'houses');
        let successCount = 0;
        let errorCount = 0;

        for (const row of results.data as any[]) {
          try {
            const subCity = subCities.find(sc => sc.name === row.subCityName);
            const woreda = woredas.find(w => w.name === row.woredaName && w.subCityId === subCity?.id);
            const kebele = kebeles.find(k => k.name === row.kebeleName && k.woredaId === woreda?.id);

            if (!subCity || !woreda || !kebele) {
                errorCount++;
                console.warn('Could not find matching administrative division for row:', row);
                continue;
            }

            addDocumentNonBlocking(housesCollection, {
              houseNumber: row.houseNumber,
              householderName: row.householderName,
              phoneNumber: row.phoneNumber,
              nationalId: row.nationalId || '',
              familySize: parseInt(row.familySize, 10),
              houseType: row.houseType,
              addressDescription: row.addressDescription,
              latitude: parseFloat(row.latitude),
              longitude: parseFloat(row.longitude),
              subCityId: subCity.id,
              woredaId: woreda.id,
              kebeleId: kebele.id,
              createdBy: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            successCount++;
          } catch (e) {
            errorCount++;
            console.error('Error importing row:', row, e);
          }
        }
        
        toast({
          title: 'Import Complete',
          description: `${successCount} records imported successfully. ${errorCount} records failed.`,
        });

        setIsImporting(false);
        setIsOpen(false);
        setFile(null);
      },
      error: (error) => {
        toast({ variant: 'destructive', title: 'CSV Parsing Error', description: error.message });
        setIsImporting(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import from CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Housing Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with housing records. Make sure the file has the correct columns.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="csv-file" className="text-right">
              CSV File
            </Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="col-span-3" />
          </div>
          <p className="text-xs text-muted-foreground px-1">
            Required columns: houseNumber, householderName, phoneNumber, nationalId, familySize, houseType, addressDescription, latitude, longitude, subCityName, woredaName, kebeleName.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isImporting || !file}>
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
