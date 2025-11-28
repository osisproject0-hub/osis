'use client';

import * as React from 'react';
import Image from 'next/image';
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import type { Candidate } from '@/lib/types';
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
import { EditCandidateDialog } from './edit-candidate-dialog';

interface AdminCandidatesTableProps {
  candidates: Candidate[];
  isLoading?: boolean;
}

export function AdminCandidatesTable({ candidates, isLoading }: AdminCandidatesTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);

  const openDeleteDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setConfirmDeleteOpen(true);
  }

  const openEditDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEditDialogOpen(true);
  }

  const handleDelete = () => {
    if (!firestore || !selectedCandidate?.id) return;
    
    const candidateRef = doc(firestore, 'candidates', selectedCandidate.id);
    deleteDocumentNonBlocking(candidateRef);
    toast({
        title: 'Kandidat Dihapus',
        description: `Kandidat "${selectedCandidate.name}" telah dihapus.`
    })
    setConfirmDeleteOpen(false);
    setSelectedCandidate(null);
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Kandidat</TableHead>
          <TableHead>Visi</TableHead>
          <TableHead>Urutan</TableHead>
          <TableHead>Jumlah Suara</TableHead>
          <TableHead className="w-[50px]"><span className='sr-only'>Aksi</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : candidates?.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Image src={candidate.photoURL} alt={candidate.name} width={40} height={40} className="rounded-full object-cover" />
                <span className="font-semibold">{candidate.name}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-xs truncate">{candidate.vision}</TableCell>
            <TableCell>{candidate.order}</TableCell>
            <TableCell className="font-bold">{candidate.voteCount || 0}</TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(candidate)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(candidate)}>
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
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data kandidat secara permanen.
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
    {selectedCandidate && (
      <EditCandidateDialog 
        isOpen={isEditDialogOpen}
        setIsOpen={setEditDialogOpen}
        candidate={selectedCandidate}
      />
    )}
    </>
  );
}

function RowSkeleton() {
    return (
        <TableRow>
            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    )
}
