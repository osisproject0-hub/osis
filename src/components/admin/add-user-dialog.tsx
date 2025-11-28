'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
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
import type { Division } from '@/lib/types';

const userSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter.'),
  email: z.string().email('Format email tidak valid.'),
  position: z.string({ required_error: 'Pilih posisi untuk anggota.' }),
  accessLevel: z.coerce.number().min(0).max(10),
  divisionId: z.string(),
  divisionName: z.string(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  divisions: Division[];
}

export function AddUserDialog({
  isOpen,
  setIsOpen,
  divisions,
}: AddUserDialogProps) {
  const { toast } = useToast();
  
  const allPositions = React.useMemo(() => {
    const corePositions = [
        { position: 'Ketua OSIS', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 10 },
        { position: 'Wakil Ketua OSIS', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 9 },
        { position: 'Sekretaris 1', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 8 },
        { position: 'Sekretaris 2', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 8 },
        { position: 'Bendahara 1', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 8 },
        { position: 'Bendahara 2', divisionName: 'Pengurus Inti', divisionId: 'inti', accessLevel: 8 },
    ];

    const divisionPositions = divisions.flatMap(div => [
        { position: `Ketua ${div.name}`, divisionName: div.name, divisionId: div.id, accessLevel: 7 },
        { position: `Anggota ${div.name}`, divisionName: div.name, divisionId: div.id, accessLevel: 5 },
    ]);

    return [...corePositions, ...divisionPositions];
  }, [divisions]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
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

  const onSubmit = async (data: UserFormValues) => {
    // In a real app, this should call a Cloud Function to create the user in Firebase Auth
    // and then create the user document in Firestore.
    // For this example, we'll just show a success toast and log the data.
    
    console.log("Simulating user creation with data:", data);

    toast({
        title: 'Simulasi Berhasil',
        description: `Pengguna ${data.name} akan dibuat. Akun otentikasi harus dibuat secara manual karena keterbatasan sisi klien.`,
    });
   
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Baru</DialogTitle>
          <DialogDescription>
            Isi detail anggota untuk membuat akun baru. Kata sandi awal harus dikomunikasikan secara terpisah.
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
