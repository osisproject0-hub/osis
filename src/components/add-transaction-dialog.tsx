'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const transactionSchema = z.object({
  description: z.string().min(3, 'Deskripsi minimal 3 karakter.'),
  type: z.enum(['Pemasukan', 'Pengeluaran']),
  amount: z.coerce.number().min(1, 'Jumlah harus lebih dari 0.'),
  date: z.date({ required_error: 'Tentukan tanggal transaksi.' }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: User;
}

export function AddTransactionDialog({
  isOpen,
  setIsOpen,
  currentUser,
}: AddTransactionDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'Pengeluaran',
      date: new Date(),
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: TransactionFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore tidak tersedia.' });
      return;
    }

    try {
      const reportsCollection = collection(firestore, 'financialReports');
      addDocumentNonBlocking(reportsCollection, {
        ...data,
        date: data.date.toISOString(),
        recordedBy: currentUser.uid,
        recordedByName: currentUser.name,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: 'Transaksi Berhasil Dicatat',
        description: `Transaksi "${data.description}" telah ditambahkan.`,
      });
      form.reset({type: 'Pengeluaran', date: new Date(), description: '', amount: 0});
      setIsOpen(false);

    } catch (error) {
        console.error("Error adding transaction: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Mencatat Transaksi',
            description: 'Terjadi kesalahan saat mencatat transaksi baru.'
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Catat Transaksi Baru</DialogTitle>
          <DialogDescription>
            Isi detail transaksi pemasukan atau pengeluaran.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Pembelian spanduk untuk acara..." {...field} />
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
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipe Transaksi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                            <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel className='mb-2'>Tanggal Transaksi</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                            {field.value ? format(field.value, 'PPP') : <span>Pilih tanggal</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Transaksi
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
