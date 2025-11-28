'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockUsers } from '@/lib/mock-data'; // Using mock data for positions
import { doc, setDoc } from 'firebase/firestore';


// In a real app, this should come from Firestore, but for simplicity we use the mock data structure
const positions = [...new Map(mockUsers.map(item => [item.position, item])).values()];

const userSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter.'),
  email: z.string().email('Format email tidak valid.'),
  position: z.string({ required_error: 'Pilih posisi untuk anggota.'}),
});

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AddUserDialog({
  isOpen,
  setIsOpen,
}: AddUserDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: UserFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore tidak tersedia.' });
      return;
    }

    // A real implementation would call a Cloud Function to create the user in Firebase Auth
    // and then create the user document in Firestore.
    // For this example, we'll just show a success toast and log the data.
    // We cannot create a user with a password from the client side without authenticating as them.
    
    console.log("Simulating user creation with data:", data);

    const selectedPosition = positions.find(p => p.position === data.position);
    if (!selectedPosition) {
        toast({ variant: 'destructive', title: 'Error', description: 'Posisi tidak valid.' });
        return;
    }

    toast({
        title: 'Simulasi Berhasil',
        description: `Pengguna ${data.name} akan dibuat dengan email ${data.email}. Karena keterbatasan sisi klien, akun autentikasi harus dibuat secara manual. Dokumen Firestore tidak akan dibuat.`,
    });

    // In a real scenario with a backend function, you would do something like this:
    /*
    try {
        const userDocRef = doc(firestore, 'users', newUserIdFromBackend);
        await setDoc(userDocRef, {
            uid: newUserIdFromBackend,
            name: data.name,
            email: data.email,
            position: selectedPosition.position,
            divisionId: selectedPosition.divisionId,
            divisionName: selectedPosition.divisionName,
            accessLevel: selectedPosition.accessLevel,
            photoURL: null,
        });
        toast({
            title: 'Anggota Berhasil Ditambahkan',
            description: `${data.name} telah ditambahkan ke sistem.`,
        });
        form.reset();
        setIsOpen(false);
    } catch (error) {
        console.error("Error creating user document: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Membuat Dokumen',
            description: 'Gagal menyimpan data anggota ke Firestore.'
        });
    }
    */
   
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Baru</DialogTitle>
          <DialogDescription>
            Isi detail anggota untuk membuat akun baru. Kata sandi awal akan dikirim ke email mereka.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                    <Input type="email" placeholder="john.doe@sekolah.id" {...field} />
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
                      {positions.map(p => (
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
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Anggota
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
