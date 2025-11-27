'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bot, User as UserIcon } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { useAuth, useFirestore, useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase not initialized. Please try again later.',
      });
      return;
    }
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Find the corresponding mock user to get role details
      // In a real app, you would have a user management system
      const mockUser = mockUsers.find(u => u.email.split('@')[0] === googleUser.email?.split('@')[0]);

      if (mockUser) {
        const userRef = doc(firestore, 'users', googleUser.uid);
        await setDoc(userRef, {
          uid: googleUser.uid,
          email: googleUser.email,
          name: googleUser.displayName,
          photoURL: googleUser.photoURL,
          position: mockUser.position,
          divisionId: mockUser.divisionId || null,
          divisionName: mockUser.divisionName,
          accessLevel: mockUser.accessLevel,
        }, { merge: true });
      } else {
        // Handle case where user is not in the mock data
         await setDoc(doc(firestore, 'users', googleUser.uid), {
            uid: googleUser.uid,
            email: googleUser.email,
            name: googleUser.displayName,
            photoURL: googleUser.photoURL,
            position: 'Anggota Divisi Kesehatan',
            divisionId: 'div-09',
            divisionName: 'Divisi Kesehatan',
            accessLevel: 1,
        }, { merge: true });
      }

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Masuk',
        description: error.message || 'Terjadi kesalahan saat mencoba masuk.',
      });
      setIsLoggingIn(false);
    }
  };

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  const bgImage = PlaceHolderImages.find(img => img.id === 'login-background');

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
          <CardContent>
            <Button
                onClick={handleLogin}
                disabled={isLoggingIn || isUserLoading}
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
              >
                {isLoggingIn || isUserLoading ? 'Loading...' : (
                  <>
                    <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2C313.6 113.4 283.6 96 248 96c-88.8 0-160.1 71.1-160.1 160s71.3 160 160.1 160c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                    Masuk dengan Google
                  </>
                )}
            </Button>
            <p className='text-xs text-muted-foreground text-center mt-4'>Gunakan akun email sekolah Anda untuk masuk.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
