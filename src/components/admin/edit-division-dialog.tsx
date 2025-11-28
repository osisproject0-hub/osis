'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
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
import type { Division } from '@/lib/types';
import { Textarea } from '../ui/textarea';

const divisionSchema = z.object({
  name: z.string().min(5, 'Nama divisi minimal 5 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  order: z.coerce.number().min(1, 'Urutan harus lebih dari 0.'),
});

type DivisionFormValues = z.infer<typeof divisionSchema>;

interface EditDivisionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  division: Division;
}

export function EditDivisionDialog({
  isOpen,
  setIsOpen,
  division,
}: EditDivisionDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionSchema),
    values: division,
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: DivisionFormValues) => {
    if (!firestore || !division.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore atau ID divisi tidak ditemukan.' });
      return;
    }

    const divisionRef = doc(firestore, 'divisions', division.id);
    updateDocumentNonBlocking(divisionRef, data);
    
    toast({
        title: 'Divisi Diperbarui',
        description: `Data untuk ${data.name} telah berhasil diperbarui.`
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Divisi: {division.name}</DialogTitle>
          <DialogDescription>
            Perbarui detail untuk divisi ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Divisi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Divisi Kewirausahaan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jelaskan tugas dan tanggung jawab divisi..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan Tampilan</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
