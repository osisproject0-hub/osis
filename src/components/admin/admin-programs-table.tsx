'use client';

import * as React from 'react';
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import type { WorkProgram } from '@/lib/types';
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
import { EditProgramDialog } from './edit-program-dialog';


interface AdminProgramsTableProps {
  programs: WorkProgram[];
  isLoading?: boolean;
}

export function AdminProgramsTable({ programs, isLoading }: AdminProgramsTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState<WorkProgram | null>(null);

  const openDeleteDialog = (program: WorkProgram) => {
    setSelectedProgram(program);
    setConfirmDeleteOpen(true);
  }

  const openEditDialog = (program: WorkProgram) => {
    setSelectedProgram(program);
    setEditDialogOpen(true);
  }

  const handleDelete = () => {
    if (!firestore || !selectedProgram?.id) return;
    
    const programRef = doc(firestore, 'workPrograms', selectedProgram.id);
    deleteDocumentNonBlocking(programRef);
    toast({
        title: 'Program Kerja Dihapus',
        description: `Program kerja untuk "${selectedProgram.division}" telah dihapus.`
    })
    setConfirmDeleteOpen(false);
    setSelectedProgram(null);
  }


  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Divisi</TableHead>
          <TableHead>Program</TableHead>
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
        ) : programs?.map((program) => (
          <TableRow key={program.id}>
            <TableCell className="font-semibold">{program.division}</TableCell>
            <TableCell>
              <ul className="list-disc list-inside">
                {program.programs.map(p => <li key={p}>{p}</li>)}
              </ul>
            </TableCell>
            <TableCell>{program.order}</TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(program)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(program)}>
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
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data program kerja secara permanen.
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
    {selectedProgram && (
      <EditProgramDialog 
        isOpen={isEditDialogOpen}
        setIsOpen={setEditDialogOpen}
        program={selectedProgram}
      />
    )}
    </>
  );
}

function RowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    )
}
