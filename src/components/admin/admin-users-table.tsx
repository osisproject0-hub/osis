'use client';

import * as React from 'react';
import Image from 'next/image';
import { useFirestore, deleteDocumentNonBlocking, useUser } from '@/firebase';
import type { User } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditUserDialog } from './edit-user-dialog';


interface AdminUsersTableProps {
  users: User[];
  isLoading?: boolean;
}

export function AdminUsersTable({ users, isLoading }: AdminUsersTableProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setConfirmDeleteOpen(true);
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  }

  const handleDeleteUser = () => {
    if (!firestore || !selectedUser?.id) return;
    
    // You cannot delete yourself
    if (currentUser?.uid === selectedUser.uid) {
        toast({
            variant: "destructive",
            title: 'Aksi Dilarang',
            description: "Anda tidak dapat menghapus akun Anda sendiri."
        })
        setConfirmDeleteOpen(false);
        return;
    }
    
    const userRef = doc(firestore, 'users', selectedUser.id);
    deleteDocumentNonBlocking(userRef);
    toast({
        title: 'Anggota Dihapus',
        description: `Anggota "${selectedUser.name}" telah dihapus.`
    })
    setConfirmDeleteOpen(false);
    setSelectedUser(null);
  }


  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Posisi</TableHead>
          <TableHead>Divisi</TableHead>
          <TableHead>Tingkat Akses</TableHead>
          <TableHead className="w-[50px]"><span className='sr-only'>Aksi</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <>
            <UserRowSkeleton />
            <UserRowSkeleton />
            <UserRowSkeleton />
          </>
        ) : users?.sort((a,b) => b.accessLevel - a.accessLevel).map((user) => (
          <TableRow key={user.uid}>
            <TableCell>
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <Image
                    src={user.photoURL}
                    alt={user.name || 'Avatar'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{user.position}</TableCell>
            <TableCell>
              <Badge variant="secondary">{user.divisionName}</Badge>
            </TableCell>
            <TableCell>{user.accessLevel}</TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(user)}>
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
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pengguna secara permanen, tetapi tidak akan menghapus akun autentikasi mereka. Pengguna harus dibuat ulang.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Hapus
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    {selectedUser && (
      <EditUserDialog 
        isOpen={isEditDialogOpen}
        setIsOpen={setEditDialogOpen}
        user={selectedUser}
      />
    )}
    </>
  );
}

function UserRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </TableCell>
            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
            <TableCell><Skeleton className="h-6 w-32 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    )
}
