'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth, useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [isFirebaseReady, setIsFirebaseReady] = React.useState(false);

  React.useEffect(() => {
    if(auth) {
      setIsFirebaseReady(true);
    }
  }, [auth]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleLogin = async (data: LoginFormValues) => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase belum siap. Silakan coba lagi.',
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard');
      toast({
        title: 'Berhasil Masuk',
        description: 'Selamat datang kembali!',
      });
    } catch (error: any) {
      let description = 'Terjadi kesalahan saat mencoba masuk.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'Email atau kata sandi yang Anda masukkan salah.';
      }
      toast({
        variant: 'destructive',
        title: 'Gagal Masuk',
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
  
  const isLoading = isSubmitting || isUserLoading || !isFirebaseReady;

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
            <CardTitle className="font-headline text-4xl">Nusantara OSIS Hub</CardTitle>
            <CardDescription className="pt-2">Digital Command Center</CardDescription>
          </CardHeader>
          
          {!isFirebaseReady ? (
            <CardContent className="flex flex-col items-center justify-center space-y-4 h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Menginisialisasi...</p>
            </CardContent>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                  <CardContent className="space-y-4">
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
                    <Button type="submit" disabled={isLoading} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Masuk'}
                    </Button>
                  </CardContent>
                </form>
              </Form>
              <CardFooter className="flex flex-col items-center justify-center text-sm">
                <p className="text-muted-foreground text-center">
                    Hanya untuk anggota OSIS. <br/>
                    Jika Anda anggota dan belum memiliki akun, silakan hubungi admin.
                </p>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
