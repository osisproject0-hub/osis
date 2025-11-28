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
import { Textarea } from '@/components/ui/textarea';

const candidateSchema = z.object({
  name: z.string().min(3, 'Nama kandidat minimal 3 karakter.'),
  vision: z.string().min(10, 'Visi minimal 10 karakter.'),
  mission: z.string().min(10, 'Misi minimal 10 karakter.'),
  photoURL: z.string().url('URL foto tidak valid.'),
  photoHint: z.string().optional(),
  order: z.coerce.number().min(1, 'Urutan harus lebih dari 0.'),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

interface AddCandidateDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AddCandidateDialog({
  isOpen,
  setIsOpen,
}: AddCandidateDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: CandidateFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore tidak tersedia.' });
      return;
    }

    try {
      const candidatesCollection = collection(firestore, 'candidates');
      addDocumentNonBlocking(candidatesCollection, {
          ...data,
          voteCount: 0, // Initialize vote count
      });
      
      toast({
        title: 'Kandidat Berhasil Ditambahkan',
        description: `Kandidat "${data.name}" telah ditambahkan.`,
      });
      form.reset();
      setIsOpen(false);

    } catch (error) {
        console.error("Error adding candidate: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Menambah Kandidat',
            description: 'Terjadi kesalahan saat menambah kandidat baru.'
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Kandidat Baru</DialogTitle>
          <DialogDescription>
            Isi detail untuk menambahkan kandidat baru ke pemilihan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kandidat</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="vision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jelaskan visi kandidat..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Misi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jelaskan misi kandidat..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Foto</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://images.unsplash.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="photoHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Petunjuk AI Foto (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="student portrait" {...field} />
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
                  <FormLabel>Nomor Urut</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Kandidat
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
