'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { collection, serverTimestamp } from 'firebase/firestore';

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
import { Textarea } from '../ui/textarea';

const newsSchema = z.object({
  title: z.string().min(10, 'Judul minimal 10 karakter.'),
  content: z.string().min(50, 'Konten berita minimal 50 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.'),
  imageHint: z.string().optional(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface AddNewsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: User;
}

function createSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
}

export function AddNewsDialog({
  isOpen,
  setIsOpen,
  currentUser,
}: AddNewsDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: NewsFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore tidak tersedia.' });
      return;
    }

    try {
      const newsCollection = collection(firestore, 'news');
      addDocumentNonBlocking(newsCollection, {
        ...data,
        slug: createSlug(data.title),
        authorName: currentUser.name,
        authorId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast({
        title: 'Berita Berhasil Dibuat',
        description: `Berita "${data.title}" telah ditambahkan.`,
      });
      form.reset();
      setIsOpen(false);

    } catch (error) {
        console.error("Error adding news: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Membuat Berita',
            description: 'Terjadi kesalahan saat membuat berita baru.'
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambah Artikel Berita Baru</DialogTitle>
          <DialogDescription>
            Tulis dan publikasikan berita atau pengumuman untuk portal publik.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Berita</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: OSIS SMAKDA Menang Lomba Futsal Tingkat Kabupaten" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Isi Berita</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tulis isi artikel berita di sini. Anda dapat menggunakan format Markdown." {...field} rows={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Gambar Utama</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://images.unsplash.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Petunjuk AI Gambar (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="futsal competition" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publikasikan Berita
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
