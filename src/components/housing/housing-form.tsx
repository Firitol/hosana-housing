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
import type { House, SubCity, Woreda, Kebele } from '@/lib/definitions';
import { MapPicker } from './map-picker';

const formSchema = z.object({
  householderName: z.string().min(2, 'Name is too short'),
  phoneNumber: z.string().regex(/^09\d{8}$/, 'Invalid phone number'),
  nationalId: z.string().optional(),
  familySize: z.coerce.number().int().min(1, 'Family size must be at least 1'),
  houseType: z.enum(['Owned', 'Rented', 'Government']),
  addressDescription: z.string().min(5, 'Address is too short'),
  subCityId: z.string().nonempty('Sub-City is required'),
  woredaId: z.string().nonempty('Woreda is required'),
  kebeleId: z.string().nonempty('Kebele is required'),
  houseNumber: z.string().nonempty('House number is required'),
  gps: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface HousingFormProps {
  subCities: SubCity[];
  woredas: Woreda[];
  kebeles: Kebele[];
  defaultValues?: House;
}

export function HousingForm({ subCities, woredas, kebeles, defaultValues }: HousingFormProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      familySize: Number(defaultValues.familySize)
    } : {
      gps: { lat: 9.005401, lng: 38.763611 }
    }
  });

  const [filteredWoredas, setFilteredWoredas] = useState<Woreda[]>([]);
  const [filteredKebeles, setFilteredKebeles] = useState<Kebele[]>([]);
  
  const selectedSubCityId = form.watch('subCityId');
  const selectedWoredaId = form.watch('woredaId');

  useEffect(() => {
    if (selectedSubCityId) {
      setFilteredWoredas(woredas.filter(w => w.subCityId === selectedSubCityId));
      form.setValue('woredaId', '');
      form.setValue('kebeleId', '');
    } else {
      setFilteredWoredas([]);
    }
  }, [selectedSubCityId, woredas, form]);

  useEffect(() => {
    if (selectedWoredaId) {
      setFilteredKebeles(kebeles.filter(k => k.woredaId === selectedWoredaId));
      form.setValue('kebeleId', '');
    } else {
      setFilteredKebeles([]);
    }
  }, [selectedWoredaId, kebeles, form]);
  
  useEffect(() => {
    if (defaultValues) {
      setFilteredWoredas(woredas.filter(w => w.subCityId === defaultValues.subCityId));
      setFilteredKebeles(kebeles.filter(k => k.woredaId === defaultValues.woredaId));
    }
  }, [defaultValues, woredas, kebeles]);

  function onSubmit(values: FormValues) {
    console.log(values);
    // Here you would typically call a server action to save the data
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
                <Label>Woreda</Label>
                <Controller
                  control={form.control}
                  name="woredaId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSubCityId}>
                      <SelectTrigger><SelectValue placeholder="Select Woreda" /></SelectTrigger>
                      <SelectContent>
                        {filteredWoredas.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.woredaId && <p className="text-sm text-destructive">{form.formState.errors.woredaId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Kebele</Label>
                <Controller
                  control={form.control}
                  name="kebeleId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedWoredaId}>
                      <SelectTrigger><SelectValue placeholder="Select Kebele" /></SelectTrigger>
                      <SelectContent>
                        {filteredKebeles.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.kebeleId && <p className="text-sm text-destructive">{form.formState.errors.kebeleId.message}</p>}
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
                initialPosition={form.getValues('gps')}
                onLocationSelect={(coords) => form.setValue('gps', coords)}
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
