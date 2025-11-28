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

const programSchema = z.object({
  division: z.string().min(3, 'Nama divisi minimal 3 karakter.'),
  programs: z.string().min(10, 'Sebutkan setidaknya satu program. Pisahkan dengan baris baru jika lebih dari satu.'),
  order: z.coerce.number().min(1, 'Urutan harus lebih dari 0.'),
});

type ProgramFormValues = z.infer<typeof programSchema>;

interface AddProgramDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AddProgramDialog({
  isOpen,
  setIsOpen,
}: AddProgramDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: ProgramFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore tidak tersedia.' });
      return;
    }

    try {
      const programsCollection = collection(firestore, 'workPrograms');
      addDocumentNonBlocking(programsCollection, {
        division: data.division,
        programs: data.programs.split('\n').filter(p => p.trim() !== ''),
        order: data.order,
      });
      
      toast({
        title: 'Program Kerja Ditambahkan',
        description: `Program kerja untuk "${data.division}" telah ditambahkan.`,
      });
      form.reset();
      setIsOpen(false);

    } catch (error) {
        console.error("Error adding program: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Menambah Program',
            description: 'Terjadi kesalahan saat menambah program kerja.'
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Program Kerja</DialogTitle>
          <DialogDescription>
            Isi detail program kerja untuk ditampilkan di halaman publik.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Divisi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Divisi Teknologi & Komunikasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="programs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Kerja</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Satu program per baris..." {...field} rows={5} />
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
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Program
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
