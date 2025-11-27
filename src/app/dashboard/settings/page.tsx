'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';

import { useUser } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const formSchema = z
  .object({
    currentPassword: z.string().min(1, 'Kata sandi saat ini diperlukan.'),
    newPassword: z.string().min(8, 'Kata sandi baru harus minimal 8 karakter.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Kata sandi baru tidak cocok.',
    path: ['confirmPassword'],
  });

export default function SettingsPage() {
  const { user, updateUserPassword } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const success = updateUserPassword(
        user.uid,
        values.currentPassword,
        values.newPassword
      );

      if (success) {
        toast({
          title: 'Berhasil!',
          description: 'Kata sandi Anda telah berhasil diperbarui.',
        });
        form.reset();
      } else {
        form.setError('currentPassword', {
          type: 'manual',
          message: 'Kata sandi saat ini salah.',
        });
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: 'Kata sandi saat ini yang Anda masukkan salah.',
        });
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">Pengaturan</h1>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Ubah Kata Sandi</CardTitle>
              <CardDescription>
                Perbarui kata sandi Anda di sini. Demi keamanan, perubahan ini tidak akan tersimpan setelah Anda me-refresh halaman (ini adalah aplikasi demo).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata Sandi Saat Ini</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata Sandi Baru</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Harus terdiri dari minimal 8 karakter.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Kata Sandi Baru</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Ubah Kata Sandi
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
