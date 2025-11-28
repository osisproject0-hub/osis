'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, PlusCircle, UserPlus } from 'lucide-react';
import type { User } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { AddUserDialog } from '@/components/admin/add-user-dialog';

export default function AdminPage() {
    const { user: currentUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [isAddUserOpen, setAddUserOpen] = React.useState(false);

    const usersQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'users')) : null
    , [firestore]);
    const { data: allUsers, isLoading: usersLoading } = useCollection<User>(usersQuery);

    if (isUserLoading) {
        return <div>Loading...</div>;
    }
    
    if (!currentUser || currentUser.accessLevel < 10) {
        return (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Akses Ditolak</AlertTitle>
                <AlertDescription>
                    Hanya Ketua OSIS yang dapat mengakses halaman ini.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl">Admin Panel</h1>
                        <p className="text-muted-foreground">Kelola pengguna, hak akses, dan data penting lainnya.</p>
                    </div>
                     <Button onClick={() => setAddUserOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Tambah Anggota
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Manajemen Anggota</CardTitle>
                        <CardDescription>Tambah, edit, atau hapus data anggota OSIS.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdminUsersTable users={allUsers || []} isLoading={usersLoading} />
                    </CardContent>
                </Card>
            </div>
            {allUsers && (
                 <AddUserDialog isOpen={isAddUserOpen} setIsOpen={setAddUserOpen} />
            )}
        </>
    )
}
