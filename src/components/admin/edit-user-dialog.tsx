'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
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
import { mockUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { doc } from 'firebase/firestore';


const positions = [...new Map(mockUsers.map(item => [item.position, item])).values()];

const userSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter.'),
  email: z.string().email('Format email tidak valid.').optional(),
  position: z.string({ required_error: 'Pilih posisi untuk anggota.'}),
  accessLevel: z.coerce.number().min(0).max(10),
});

type UserFormValues = z.infer<typeof userSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User;
}

export function EditUserDialog({
  isOpen,
  setIsOpen,
  user
}: EditUserDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    values: {
      name: user.name,
      email: user.email || '',
      position: user.position,
      accessLevel: user.accessLevel,
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: UserFormValues) => {
    if (!firestore || !user.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore atau ID pengguna tidak ditemukan.' });
      return;
    }

    const selectedPositionData = positions.find(p => p.position === data.position);
    if (!selectedPositionData) {
        toast({ variant: 'destructive', title: 'Error', description: 'Posisi yang dipilih tidak valid.' });
        return;
    }

    const userRef = doc(firestore, 'users', user.id);
    updateDocumentNonBlocking(userRef, {
        name: data.name,
        position: data.position,
        accessLevel: data.accessLevel,
        divisionId: selectedPositionData.divisionId,
        divisionName: selectedPositionData.divisionName,
    });
    
    toast({
        title: 'Anggota Diperbarui',
        description: `Data untuk ${data.name} telah berhasil diperbarui.`
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Anggota: {user.name}</DialogTitle>
          <DialogDescription>
            Perbarui detail dan hak akses untuk anggota ini.
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
                    <Input type="email" placeholder="john.doe@sekolah.id" {...field} disabled />
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
             <FormField
              control={form.control}
              name="accessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tingkat Akses (0-10)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
