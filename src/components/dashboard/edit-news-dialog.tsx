'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { doc, serverTimestamp } from 'firebase/firestore';

import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import type { News } from '@/lib/types';
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

interface EditNewsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newsArticle: News;
}

function createSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
}

export function EditNewsDialog({
  isOpen,
  setIsOpen,
  newsArticle,
}: EditNewsDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    values: {
        title: newsArticle.title,
        content: newsArticle.content,
        imageUrl: newsArticle.imageUrl,
        imageHint: newsArticle.imageHint || '',
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: NewsFormValues) => {
    if (!firestore || !newsArticle.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore atau ID Berita tidak tersedia.' });
      return;
    }

    try {
      const newsRef = doc(firestore, 'news', newsArticle.id);
      updateDocumentNonBlocking(newsRef, {
        ...data,
        slug: createSlug(data.title),
        updatedAt: serverTimestamp(),
      });
      
      toast({
        title: 'Berita Berhasil Diperbarui',
        description: `Berita "${data.title}" telah diperbarui.`,
      });
      setIsOpen(false);

    } catch (error) {
        console.error("Error updating news: ", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Memperbarui Berita',
            description: 'Terjadi kesalahan saat memperbarui berita.'
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Artikel Berita</DialogTitle>
          <DialogDescription>
            Perbarui detail artikel berita di bawah ini.
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
                    <Input {...field} />
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
                    <Textarea {...field} rows={10} />
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
                    <Input type="url" {...field} />
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
                    <Input {...field} />
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
