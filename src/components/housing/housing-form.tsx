'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { House, SubCity, Kebele, Ketena } from '@/lib/definitions';
import { MapPicker } from './map-picker';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  householderName: z.string().min(2, 'Name is too short'),
  phoneNumber: z.string().regex(/^(09)\d{8}$/, 'Invalid phone number format (must be 09XXXXXXXX)'),
  nationalId: z.string().optional(),
  familySize: z.coerce.number().int().min(1, 'Family size must be at least 1'),
  houseType: z.enum(['Owned', 'Rented', 'Government']),
  addressDescription: z.string().min(5, 'Address is too short'),
  subCityId: z.string().nonempty('Sub-City is required'),
  kebeleId: z.string().nonempty('Kebele is required'),
  ketenaId: z.string().nonempty('Ketena is required'),
  houseNumber: z.string().nonempty('House number is required'),
  latitude: z.number(),
  longitude: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface HousingFormProps {
  subCities: SubCity[];
  kebeles: Kebele[];
  ketenas: Ketena[];
  defaultValues?: House;
}

export function HousingForm({ subCities, kebeles, ketenas, defaultValues }: HousingFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      familySize: Number(defaultValues.familySize)
    } : {
      latitude: 7.56, // Default to Hosana center
      longitude: 37.85
    }
  });

  const [filteredKebeles, setFilteredKebeles] = useState<Kebele[]>([]);
  const [filteredKetenas, setFilteredKetenas] = useState<Ketena[]>([]);
  
  const selectedSubCityId = form.watch('subCityId');
  const selectedKebeleId = form.watch('kebeleId');

  useEffect(() => {
    if (selectedSubCityId) {
      setFilteredKebeles(kebeles.filter(k => k.subCityId === selectedSubCityId));
      form.setValue('kebeleId', '');
      form.setValue('ketenaId', '');
    } else {
      setFilteredKebeles([]);
    }
  }, [selectedSubCityId, kebeles, form]);

  useEffect(() => {
    if (selectedKebeleId) {
      setFilteredKetenas(ketenas.filter(kt => kt.kebeleId === selectedKebeleId));
      form.setValue('ketenaId', '');
    } else {
      setFilteredKetenas([]);
    }
  }, [selectedKebeleId, ketenas, form]);
  
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.subCityId) {
        setFilteredKebeles(kebeles.filter(k => k.subCityId === defaultValues.subCityId));
      }
      if (defaultValues.kebeleId) {
        setFilteredKetenas(ketenas.filter(kt => kt.kebeleId === defaultValues.kebeleId));
      }
    }
  }, [defaultValues, kebeles, ketenas]);

  function onSubmit(values: FormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save a house.' });
        return;
    }
    
    if (defaultValues?.id) {
      // Update existing document
      const houseRef = doc(firestore, 'houses', defaultValues.id);
      updateDocumentNonBlocking(houseRef, {
        ...values,
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'House updated successfully.' });
    } else {
      // Create new document
      const housesCollection = collection(firestore, 'houses');
      addDocumentNonBlocking(housesCollection, {
        ...values,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'House created successfully.' });
    }
    
    router.push('/dashboard/housing');
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Householder Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="householderName">Full Name</Label>
                <Input id="householderName" {...form.register('householderName')} />
                {form.formState.errors.householderName && <p className="text-sm text-destructive">{form.formState.errors.householderName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" {...form.register('phoneNumber')} />
                {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID (Optional)</Label>
                <Input id="nationalId" {...form.register('nationalId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familySize">Family Size</Label>
                <Input id="familySize" type="number" {...form.register('familySize')} />
                {form.formState.errors.familySize && <p className="text-sm text-destructive">{form.formState.errors.familySize.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="houseNumber">House Number</Label>
                <Input id="houseNumber" {...form.register('houseNumber')} />
                {form.formState.errors.houseNumber && <p className="text-sm text-destructive">{form.formState.errors.houseNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>House Type</Label>
                <Controller
                  control={form.control}
                  name="houseType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owned">Owned</SelectItem>
                        <SelectItem value="Rented">Rented</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.houseType && <p className="text-sm text-destructive">{form.formState.errors.houseType.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressDescription">Full Address Description</Label>
                <Textarea id="addressDescription" {...form.register('addressDescription')} />
                {form.formState.errors.addressDescription && <p className="text-sm text-destructive">{form.formState.errors.addressDescription.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sub-City</Label>
                <Controller
                  control={form.control}
                  name="subCityId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select Sub-City" /></SelectTrigger>
                      <SelectContent>
                        {subCities.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.subCityId && <p className="text-sm text-destructive">{form.formState.errors.subCityId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Kebele</Label>
                <Controller
                  control={form.control}
                  name="kebeleId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSubCityId}>
                      <SelectTrigger><SelectValue placeholder="Select Kebele" /></SelectTrigger>
                      <SelectContent>
                        {filteredKebeles.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.kebeleId && <p className="text-sm text-destructive">{form.formState.errors.kebeleId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Ketena</Label>
                <Controller
                  control={form.control}
                  name="ketenaId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedKebeleId}>
                      <SelectTrigger><SelectValue placeholder="Select Ketena" /></SelectTrigger>
                      <SelectContent>
                        {filteredKetenas.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.ketenaId && <p className="text-sm text-destructive">{form.formState.errors.ketenaId.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GPS Coordinates</CardTitle>
              <CardDescription>Click on the map to set location.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 p-0">
              <MapPicker
                initialPosition={form.getValues()}
                onLocationSelect={(coords) => {
                  form.setValue('latitude', coords.lat);
                  form.setValue('longitude', coords.lng);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit">Save House</Button>
      </div>
    </form>
  );
}
