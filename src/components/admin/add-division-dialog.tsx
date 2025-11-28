'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { collection } from 'firebase/firestore';

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
import { Textarea } from '../ui/textarea';

const divisionSchema = z.object({
  name: z.string().min(5, 'Nama divisi minimal 5 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  order: z.coerce.number().min(1, 'Urutan harus lebih dari 0.'),
});

type DivisionFormValues = z.infer<typeof divisionSchema>;

interface AddDivisionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AddDivisionDialog({
  isOpen,
  setIsOpen,
}: AddDivisionDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: DivisionFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore tidak tersedia.' });
      return;
    }

    try {
      const divisionsCollection = collection(firestore, 'divisions');
      addDocumentNonBlocking(divisionsCollection, data);
      
      toast({
        title: 'Divisi Berhasil Dibuat',
        description: `Divisi "${data.name}" telah ditambahkan.`,
      });
      form.reset();
      setIsOpen(false);

    } catch (error) {
        console.error("Error adding division: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Membuat Divisi',
            description: 'Terjadi kesalahan saat membuat divisi baru.'
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Divisi Baru</DialogTitle>
          <DialogDescription>
            Isi detail untuk membuat divisi OSIS baru.
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
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Divisi
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
