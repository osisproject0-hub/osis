'use client';

import * as React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

export default function SettingsPage() {
  const { user, isLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/login');
      toast({
        title: 'Berhasil Keluar',
        description: 'Anda telah berhasil keluar dari akun Anda.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Keluar',
        description: 'Terjadi kesalahan saat mencoba keluar.',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>No user data found.</div>
  }

  const fallbackInitials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">Pengaturan Akun</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profil Pengguna</CardTitle>
          <CardDescription>
            Informasi ini diambil dari akun Google Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user.photoURL && (
                <AvatarImage asChild src={user.photoURL}>
                  <Image src={user.photoURL} alt={user.name || 'Avatar'} width={80} height={80} />
                </AvatarImage>
              )}
              <AvatarFallback>{fallbackInitials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm font-medium text-primary">{user.position}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline">
                <UserIcon className="mr-2 h-4 w-4" />
                Lihat Profil Lengkap
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
