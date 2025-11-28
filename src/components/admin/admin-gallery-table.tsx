'use client';

import * as React from 'react';
import Image from 'next/image';
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import type { GalleryImage } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditGalleryImageDialog } from './edit-gallery-image-dialog';

interface AdminGalleryTableProps {
  images: GalleryImage[];
  isLoading?: boolean;
}

export function AdminGalleryTable({ images, isLoading }: AdminGalleryTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null);

  const openDeleteDialog = (image: GalleryImage) => {
    setSelectedImage(image);
    setConfirmDeleteOpen(true);
  }

  const openEditDialog = (image: GalleryImage) => {
    setSelectedImage(image);
    setEditDialogOpen(true);
  }

  const handleDelete = () => {
    if (!firestore || !selectedImage?.id) return;
    
    const imageRef = doc(firestore, 'galleryImages', selectedImage.id);
    deleteDocumentNonBlocking(imageRef);
    toast({
        title: 'Gambar Dihapus',
        description: `Gambar "${selectedImage.description}" telah dihapus dari galeri.`
    })
    setConfirmDeleteOpen(false);
    setSelectedImage(null);
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gambar</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead>Urutan</TableHead>
          <TableHead className="w-[50px]"><span className='sr-only'>Aksi</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : images?.map((image) => (
          <TableRow key={image.id}>
            <TableCell>
              <Image src={image.imageUrl} alt={image.description} width={100} height={60} className="rounded-md object-cover" />
            </TableCell>
            <TableCell className="font-semibold">{image.description}</TableCell>
            <TableCell>{image.order}</TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(image)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(image)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Hapus</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus gambar dari galeri secara permanen.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Hapus
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    {selectedImage && (
      <EditGalleryImageDialog 
        isOpen={isEditDialogOpen}
        setIsOpen={setEditDialogOpen}
        image={selectedImage}
      />
    )}
    </>
  );
}

function RowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-[60px] w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    )
}
