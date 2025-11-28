'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

import { useFirestore } from '@/firebase';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDocumentNonBlocking } from '@/firebase';

const taskSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter.'),
  description: z.string().optional(),
  assignedToUID: z.string({ required_error: 'Pilih anggota yang akan ditugaskan.' }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.date({ required_error: 'Tentukan tanggal tenggat.' }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: User;
  allUsers: User[];
}

export function AddTaskDialog({
  isOpen,
  setIsOpen,
  currentUser,
  allUsers,
}: AddTaskDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: TaskFormValues) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore tidak tersedia.',
      });
      return;
    }

    try {
      const assignedToUser = allUsers.find(u => u.uid === data.assignedToUID);
      if (!assignedToUser) throw new Error("Pengguna yang ditugaskan tidak ditemukan.");

      const tasksCollection = collection(firestore, 'tasks');
      addDocumentNonBlocking(tasksCollection, {
        title: data.title,
        description: data.description || '',
        assignedToUID: data.assignedToUID,
        assignedToName: assignedToUser.name,
        assignedByName: currentUser.name,
        assignedByUID: currentUser.uid,
        divisionId: assignedToUser.divisionId || '',
        dueDate: Timestamp.fromDate(data.dueDate),
        priority: data.priority,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: 'Tugas Berhasil Dibuat',
        description: `Tugas "${data.title}" telah diberikan kepada ${assignedToUser.name}.`,
      });
      form.reset();
      setIsOpen(false);

    } catch (error) {
        console.error("Error adding task: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Membuat Tugas',
            description: 'Terjadi kesalahan saat membuat tugas baru.'
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Tugas Baru</DialogTitle>
          <DialogDescription>
            Isi detail tugas dan berikan kepada anggota OSIS.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Tugas</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Buat proposal untuk event..." {...field} />
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
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Berikan detail lebih lanjut tentang tugas..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedToUID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tugaskan Kepada</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih anggota" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allUsers
                        .sort((a,b) => a.name.localeCompare(b.name))
                        .map(user => (
                        <SelectItem key={user.uid} value={user.uid}>
                          {user.name} - ({user.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prioritas</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih prioritas" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="low">Rendah</SelectItem>
                            <SelectItem value="medium">Sedang</SelectItem>
                            <SelectItem value="high">Tinggi</SelectItem>
                            <SelectItem value="urgent">Sangat Mendesak</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel className='mb-2'>Tenggat Waktu</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? (
                                format(field.value, 'PPP')
                            ) : (
                                <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date('1900-01-01')}
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
              Buat Tugas
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
