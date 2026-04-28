'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { User } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  phoneNumber: z.string().optional(),
  language: z.enum(['English', 'Amharic']).default('English'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileForm() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(
    () => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  const { data: userProfile, isLoading } = useDoc<User>(userDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      language: 'English',
    }
  });
  
  const lang = form.watch('language');

  useEffect(() => {
    if (userProfile) {
      form.reset({
        fullName: userProfile.fullName || '',
        phoneNumber: userProfile.phoneNumber || '',
        language: userProfile.language || 'English',
      });
    }
  }, [userProfile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    if (!userDocRef) return;
    updateDocumentNonBlocking(userDocRef, { ...data, updatedAt: serverTimestamp() });
    toast({
      title: lang === 'Amharic' ? 'መገለጫ ተዘምኗል' : 'Profile updated',
      description: lang === 'Amharic' ? 'የእርስዎ መገለጫ በተሳካ ሁኔታ ተዘምኗል።' : "Your profile has been successfully updated.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your public profile and language preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32 mt-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lang === 'Amharic' ? 'ፕሮፋይል' : 'Profile'}</CardTitle>
        <CardDescription>{lang === 'Amharic' ? 'የእርስዎን ይፋዊ መገለጫ እና የቋንቋ ምርጫዎች ያስተዳድሩ።' : 'Manage your public profile and language preferences.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{lang === 'Amharic' ? 'ሙሉ ስም' : 'Name'}</Label>
            <Input id="fullName" {...form.register('fullName')} />
            {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{lang === 'Amharic' ? 'ኢሜይል' : 'Email'}</Label>
            <Input id="email" type="email" value={userProfile?.email || ''} readOnly disabled />
          </div>
           <div className="space-y-2">
            <Label htmlFor="phoneNumber">{lang === 'Amharic' ? 'ስልክ ቁጥር' : 'Phone Number'}</Label>
            <Input id="phoneNumber" {...form.register('phoneNumber')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">{lang === 'Amharic' ? 'ቋንቋ' : 'Language'}</Label>
            <Controller
              control={form.control}
              name="language"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Amharic">አማርኛ (Amharic)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>{lang === 'Amharic' ? 'ለውጦችን ያስቀምጡ' : 'Save Changes'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function SettingsPage() {
  // We can't get user here because ProfileForm needs to be a client component to use hooks.
  // So we pass lang down or each component gets it. For now, getting it in the component is fine.
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
      <ProfileForm />
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password. This requires a recent login.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <Button disabled>Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
