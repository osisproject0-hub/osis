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
import type { GalleryImage } from '@/lib/types';


const galleryImageSchema = z.object({
  description: z.string().min(5, 'Deskripsi minimal 5 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.'),
  imageHint: z.string().optional(),
  order: z.coerce.number().min(1, 'Urutan harus lebih dari 0.'),
});

type GalleryImageFormValues = z.infer<typeof galleryImageSchema>;

interface EditGalleryImageDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  image: GalleryImage;
}

export function EditGalleryImageDialog({
  isOpen,
  setIsOpen,
  image,
}: EditGalleryImageDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<GalleryImageFormValues>({
    resolver: zodResolver(galleryImageSchema),
    values: image,
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: GalleryImageFormValues) => {
    if (!firestore || !image.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore atau ID gambar tidak ditemukan.' });
      return;
    }

    const imageRef = doc(firestore, 'galleryImages', image.id);
    updateDocumentNonBlocking(imageRef, data);
    
    toast({
        title: 'Gambar Diperbarui',
        description: `Data untuk gambar "${data.description}" telah berhasil diperbarui.`
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Gambar Galeri</DialogTitle>
          <DialogDescription>
            Perbarui detail untuk gambar ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Gambar</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Upacara bendera HUT RI" {...field} />
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
                  <FormLabel>URL Gambar</FormLabel>
                  <FormControl>
                    <Input type='url' placeholder="https://images.unsplash.com/..." {...field} />
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
                  <FormLabel>Petunjuk AI (Opsional, 1-2 kata)</FormLabel>
                  <FormControl>
                    <Input placeholder="flag ceremony" {...field} />
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
