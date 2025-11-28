'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc } from 'firebase/firestore';

import { useAuth, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import type { Division } from '@/lib/types';
import { collection } from 'firebase/firestore';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const signupSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter.'),
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
  position: z.string({ required_error: 'Pilih posisi untuk anggota.' }),
  accessLevel: z.coerce.number().min(0).max(10),
  divisionId: z.string(),
  divisionName: z.string(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SecretSignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFirebaseReady, setIsFirebaseReady] = React.useState(false);

  const divisionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'divisions') : null, [firestore]);
  const { data: divisions, isLoading: divisionsLoading } = useCollection<Division>(divisionsQuery);

  const allPositions = React.useMemo(() => {
    if (!divisions) return [];
    const corePositions = [
        { position: 'Ketua OSIS', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 10 },
        { position: 'Wakil Ketua OSIS', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 9 },
        { position: 'Sekretaris 1', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 8 },
        { position: 'Sekretaris 2', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 8 },
        { position: 'Bendahara 1', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 8 },
        { position: 'Bendahara 2', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 8 },
    ];

    const divisionPositions = (divisions || []).flatMap(div => [
        { position: `Ketua ${div.name}`, divisionName: div.name, divisionId: div.id, accessLevel: 7 },
        { position: `Anggota ${div.name}`, divisionName: div.name, divisionId: div.id, accessLevel: 5 },
    ]);

    return [...corePositions, ...divisionPositions];
  }, [divisions]);


  React.useEffect(() => {
    if(auth && firestore) {
      setIsFirebaseReady(true);
    }
  }, [auth, firestore]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });
  
  const { watch, setValue } = form;
  const selectedPositionName = watch('position');

  React.useEffect(() => {
    const selectedPositionData = allPositions.find(p => p.position === selectedPositionName);
    if (selectedPositionData) {
      setValue('accessLevel', selectedPositionData.accessLevel);
      setValue('divisionId', selectedPositionData.divisionId);
      setValue('divisionName', selectedPositionData.divisionName);
    }
  }, [selectedPositionName, allPositions, setValue]);


  const isSubmitting = form.formState.isSubmitting;

  const handleSignup = async (data: SignupFormValues) => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase belum siap. Silakan coba lagi.',
      });
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const authUser = userCredential.user;

      // 2. Create user document in Firestore
      const userDocRef = doc(firestore, 'users', authUser.uid);
      await setDocumentNonBlocking(userDocRef, {
        uid: authUser.uid,
        email: data.email,
        name: data.name,
        photoURL: null, // Default photoURL
        position: data.position,
        divisionId: data.divisionId,
        divisionName: data.divisionName,
        accessLevel: data.accessLevel,
      }, {});

      toast({
        title: 'Akun Berhasil Dibuat',
        description: `Akun untuk ${data.name} telah berhasil dibuat.`,
      });
      form.reset();
      router.push('/login');

    } catch (error: any) {
      let description = 'Terjadi kesalahan saat membuat akun.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Alamat email ini sudah terdaftar.';
      }
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Akun',
        description: description,
      });
    }
  };

  const isLoading = isSubmitting || divisionsLoading || !isFirebaseReady;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
      <div className="relative z-10 w-full max-w-md p-4">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
             <div className="mx-auto mb-4 flex items-center justify-center">
                <Image src="https://ik.imagekit.io/zco6tu2vm/images%20(1).jpeg?updatedAt=1761836341193" alt="OSIS Logo" width={80} height={80} />
            </div>
            <CardTitle className="font-headline text-3xl">Pendaftaran Akun Rahasia</CardTitle>
            <CardDescription className="pt-2">Buat akun baru untuk anggota OSIS</CardDescription>
          </CardHeader>
          
          {!isFirebaseReady || divisionsLoading ? (
            <CardContent className="flex flex-col items-center justify-center space-y-4 h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Memuat data...</p>
            </CardContent>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama anggota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@sekolah.id" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kata Sandi</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posisi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih posisi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allPositions.map(p => (
                              <SelectItem key={p.position} value={p.position}>
                                {p.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Buat Akun'}
                  </Button>
                </CardContent>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
}
