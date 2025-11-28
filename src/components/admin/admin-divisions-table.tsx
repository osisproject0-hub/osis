'use client';

import * as React from 'react';
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import type { Division } from '@/lib/types';
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
import { EditDivisionDialog } from './edit-division-dialog';


interface AdminDivisionsTableProps {
  divisions: Division[];
  isLoading?: boolean;
}

export function AdminDivisionsTable({ divisions, isLoading }: AdminDivisionsTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedDivision, setSelectedDivision] = React.useState<Division | null>(null);

  const openDeleteDialog = (division: Division) => {
    setSelectedDivision(division);
    setConfirmDeleteOpen(true);
  }

  const openEditDialog = (division: Division) => {
    setSelectedDivision(division);
    setEditDialogOpen(true);
  }

  const handleDelete = () => {
    if (!firestore || !selectedDivision?.id) return;
    
    const divisionRef = doc(firestore, 'divisions', selectedDivision.id);
    deleteDocumentNonBlocking(divisionRef);
    toast({
        title: 'Divisi Dihapus',
        description: `Divisi "${selectedDivision.name}" telah dihapus.`
    })
    setConfirmDeleteOpen(false);
    setSelectedDivision(null);
  }


  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Divisi</TableHead>
          <TableHead>Urutan</TableHead>
          <TableHead className="w-[50px]"><span className='sr-only'>Aksi</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : divisions?.map((division) => (
          <TableRow key={division.id}>
            <TableCell>
              <p className="font-semibold">{division.name}</p>
              <p className="text-xs text-muted-foreground">{division.description}</p>
            </TableCell>
            <TableCell>{division.order}</TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(division)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(division)}>
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
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data divisi secara permanen.
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
    {selectedDivision && (
      <EditDivisionDialog 
        isOpen={isEditDialogOpen}
        setIsOpen={setEditDialogOpen}
        division={selectedDivision}
      />
    )}
    </>
  );
}

function RowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-64" />
            </TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    )
}
