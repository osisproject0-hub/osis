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
import type { Candidate } from '@/lib/types';
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

interface EditCandidateDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  candidate: Candidate;
}

export function EditCandidateDialog({
  isOpen,
  setIsOpen,
  candidate,
}: EditCandidateDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    values: candidate,
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: CandidateFormValues) => {
    if (!firestore || !candidate.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore atau ID kandidat tidak ditemukan.' });
      return;
    }

    const candidateRef = doc(firestore, 'candidates', candidate.id);
    updateDocumentNonBlocking(candidateRef, data);
    
    toast({
        title: 'Kandidat Diperbarui',
        description: `Data untuk ${data.name} telah berhasil diperbarui.`
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Kandidat: {candidate.name}</DialogTitle>
          <DialogDescription>
            Perbarui detail untuk kandidat ini.
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
                    <Input {...field} />
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
                    <Textarea {...field} />
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
                    <Textarea {...field} />
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
                    <Input type="url" {...field} />
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
                    <Input {...field} />
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
