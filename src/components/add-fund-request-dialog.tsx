'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { collection, serverTimestamp, Timestamp } from 'firebase/firestore';

import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import type { User } from '@/lib/types';
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
import { Textarea } from './ui/textarea';

const fundRequestSchema = z.object({
  item: z.string().min(3, 'Nama item/keperluan minimal 3 karakter.'),
  amount: z.coerce.number().min(1000, 'Jumlah minimal Rp 1.000.'),
});

type FundRequestFormValues = z.infer<typeof fundRequestSchema>;

interface AddFundRequestDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: User;
}

export function AddFundRequestDialog({
  isOpen,
  setIsOpen,
  currentUser,
}: AddFundRequestDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<FundRequestFormValues>({
    resolver: zodResolver(fundRequestSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: FundRequestFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore tidak tersedia.' });
      return;
    }

    try {
      const requestsCollection = collection(firestore, 'fundRequests');
      addDocumentNonBlocking(requestsCollection, {
        ...data,
        division: currentUser.divisionName,
        requestedBy: currentUser.uid,
        requestedByName: currentUser.name,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: 'Pengajuan Dana Terkirim',
        description: `Pengajuan untuk "${data.item}" telah berhasil dikirim untuk ditinjau.`,
      });
      form.reset({ item: '', amount: 0 });
      setIsOpen(false);

    } catch (error) {
        console.error("Error adding fund request: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Mengajukan Dana',
            description: 'Terjadi kesalahan saat mengirim pengajuan dana.'
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajukan Dana</DialogTitle>
          <DialogDescription>
            Isi detail keperluan dana untuk divisi Anda. Pengajuan akan ditinjau oleh Ketua OSIS.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Item/Keperluan</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Spanduk untuk acara..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Biaya (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Pengajuan
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
