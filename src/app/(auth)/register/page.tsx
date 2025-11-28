'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth, useFirestore, useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { mockUsers } from '@/lib/mock-data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  name: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const firebaseReady = !!auth && !!firestore;
  const isRegistering = form.formState.isSubmitting;

  const handleRegister = async (data: RegisterFormValues) => {
    if (!firebaseReady) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase not initialized. Please try again later.',
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(newUser, {
        displayName: data.name,
      });

      // Check if user email is in mock data to assign a role
      const mockUser = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      
      const userRef = doc(firestore, 'users', newUser.uid);

      if (mockUser) {
        await setDoc(userRef, {
          uid: newUser.uid,
          email: newUser.email,
          name: data.name,
          photoURL: null,
          position: mockUser.position,
          divisionId: mockUser.divisionId || '',
          divisionName: mockUser.divisionName,
          accessLevel: mockUser.accessLevel,
        });
      } else {
        // Default role for new users not in the mock list
        await setDoc(userRef, {
          uid: newUser.uid,
          email: newUser.email,
          name: data.name,
          photoURL: null,
          position: 'Anggota Divisi Kesehatan', // Default role
          divisionId: 'div-09',
          divisionName: 'Divisi Kesehatan',
          accessLevel: 1, // Lowest access level
        });
      }

      router.push('/dashboard');
      toast({
        title: 'Pendaftaran Berhasil',
        description: 'Akun Anda telah berhasil dibuat.',
      });

    } catch (error: any) {
      let description = 'Terjadi kesalahan saat mendaftar.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Alamat email ini sudah terdaftar. Silakan coba masuk.';
      } else if (error.code === 'auth/configuration-not-found') {
        description = 'Konfigurasi Firebase tidak ditemukan. Silakan refresh dan coba lagi.';
      }
      console.error("Registration Error: ", error);
      toast({
        variant: 'destructive',
        title: 'Gagal Mendaftar',
        description: description,
      });
    }
  };

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const bgImage = PlaceHolderImages.find(img => img.id === 'login-background');
  
  const isLoading = isRegistering || isUserLoading;
  
  const getButtonContent = () => {
    if (!firebaseReady) {
      return (
        <>
          <Loader2 className="animate-spin" />
          Initializing Firebase...
        </>
      );
    }
    if (isLoading) {
      return (
        <>
          <Loader2 className="animate-spin" />
          Mendaftar...
        </>
      );
    }
    return 'Daftar';
  };


  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover"
          data-ai-hint={bgImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="relative z-10 w-full max-w-md p-4">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Bot className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-4xl">Buat Akun</CardTitle>
            <CardDescription className="pt-2">Daftar untuk mengakses Nusantara OSIS Hub</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Anda" {...field} />
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
                        <Input placeholder="email@sekolah.id" {...field} />
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
                 <Button type="submit" disabled={isLoading || !firebaseReady} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                   {getButtonContent()}
                </Button>
              </CardContent>
            </form>
          </Form>
          <CardFooter className="flex flex-col items-center justify-center text-sm">
             <p className="text-muted-foreground">
                Sudah punya akun?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Masuk di sini
                </Link>
             </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
