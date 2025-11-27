'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bot, ChevronRight } from 'lucide-react';

import { useUser } from '@/context/user-context';
import { mockUsers } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = () => {
    if (selectedUser && password) {
      setIsLoading(true);
      const loginSuccess = login(selectedUser, password);

      setTimeout(() => {
        if (loginSuccess) {
          router.push('/dashboard');
        } else {
          toast({
            variant: 'destructive',
            title: 'Gagal Masuk',
            description: 'Profil atau kata sandi tidak cocok.',
          });
          setIsLoading(false);
        }
      }, 500);
    }
  };
  
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">Profil Pengguna</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user-select" className="h-12 text-base">
                    <SelectValue placeholder="Pilih profil untuk masuk..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.uid} value={user.uid}>
                        <div className="flex items-center gap-3">
                          <Image
                            src={user.photoURL}
                            alt={user.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.position}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={!selectedUser || !password || isLoading}
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
              >
                {isLoading ? 'Loading...' : 'Masuk ke Dashboard'}
                {!isLoading && <ChevronRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
