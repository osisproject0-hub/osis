'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, PlusCircle, UserPlus, Briefcase, BookOpen, GalleryHorizontal } from 'lucide-react';
import type { User, Division, WorkProgram, GalleryImage } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { AddUserDialog } from '@/components/admin/add-user-dialog';
import { AdminDivisionsTable } from '@/components/admin/admin-divisions-table';
import { AdminProgramsTable } from '@/components/admin/admin-programs-table';
import { AdminGalleryTable } from '@/components/admin/admin-gallery-table';
import { AddDivisionDialog } from '@/components/admin/add-division-dialog';
import { AddProgramDialog } from '@/components/admin/add-program-dialog';
import { AddGalleryImageDialog } from '@/components/admin/add-gallery-image-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


export default function AdminPage() {
    const { user: currentUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    // State for dialogs
    const [isAddUserOpen, setAddUserOpen] = React.useState(false);
    const [isAddDivisionOpen, setAddDivisionOpen] = React.useState(false);
    const [isAddProgramOpen, setAddProgramOpen] = React.useState(false);
    const [isAddGalleryOpen, setAddGalleryOpen] = React.useState(false);

    // Data fetching
    const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
    const { data: allUsers, isLoading: usersLoading } = useCollection<User>(usersQuery);

    const divisionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'divisions'), orderBy('order', 'asc')) : null, [firestore]);
    const { data: divisions, isLoading: divisionsLoading } = useCollection<Division>(divisionsQuery);
    
    const programsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'workPrograms'), orderBy('order', 'asc')) : null, [firestore]);
    const { data: programs, isLoading: programsLoading } = useCollection<WorkProgram>(programsQuery);

    const galleryQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'galleryImages'), orderBy('order', 'asc')) : null, [firestore]);
    const { data: galleryImages, isLoading: galleryLoading } = useCollection<GalleryImage>(galleryQuery);


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
                </div>

                <Tabs defaultValue="users">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="users"><UserPlus className="mr-2" /> Anggota</TabsTrigger>
                        <TabsTrigger value="divisions"><Briefcase className="mr-2"/> Divisi</TabsTrigger>
                        <TabsTrigger value="programs"><BookOpen className="mr-2"/> Program Kerja</TabsTrigger>
                        <TabsTrigger value="gallery"><GalleryHorizontal className="mr-2"/> Galeri</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Manajemen Anggota</CardTitle>
                                    <CardDescription>Tambah, edit, atau hapus data anggota OSIS.</CardDescription>
                                </div>
                                <Button onClick={() => setAddUserOpen(true)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Tambah Anggota
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <AdminUsersTable users={allUsers || []} isLoading={usersLoading} divisions={divisions || []} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="divisions">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Manajemen Divisi</CardTitle>
                                    <CardDescription>Kelola semua divisi yang ada di dalam OSIS.</CardDescription>
                                </div>
                                <Button onClick={() => setAddDivisionOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Divisi
                                </Button>
                            </CardHeader>
                            <CardContent>
                               <AdminDivisionsTable divisions={divisions || []} isLoading={divisionsLoading} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="programs">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Manajemen Program Kerja</CardTitle>
                                    <CardDescription>Atur program kerja unggulan yang tampil di halaman publik.</CardDescription>
                                </div>
                                <Button onClick={() => setAddProgramOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Program
                                </Button>
                            </CardHeader>
                            <CardContent>
                               <AdminProgramsTable programs={programs || []} isLoading={programsLoading} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="gallery">
                        <Card>
                             <CardHeader className="flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Manajemen Galeri</CardTitle>
                                    <CardDescription>Kelola gambar yang ditampilkan di galeri halaman publik.</CardDescription>
                                </div>
                                <Button onClick={() => setAddGalleryOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Gambar
                                </Button>
                            </CardHeader>
                            <CardContent>
                               <AdminGalleryTable images={galleryImages || []} isLoading={galleryLoading} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            
            {divisions && (
                 <AddUserDialog isOpen={isAddUserOpen} setIsOpen={setAddUserOpen} divisions={divisions} />
            )}
            <AddDivisionDialog isOpen={isAddDivisionOpen} setIsOpen={setAddDivisionOpen} />
            <AddProgramDialog isOpen={isAddProgramOpen} setIsOpen={setAddProgramOpen} />
            <AddGalleryImageDialog isOpen={isAddGalleryOpen} setIsOpen={setAddGalleryOpen} />
        </>
    )
}
