'use client';
import * as React from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { News } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AddNewsDialog } from '@/components/dashboard/add-news-dialog';
import { EditNewsDialog } from '@/components/dashboard/edit-news-dialog';

export default function ManajemenBeritaPage() {
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [isAddNewsOpen, setAddNewsOpen] = React.useState(false);
    const [isEditNewsOpen, setEditNewsOpen] = React.useState(false);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    const [selectedNews, setSelectedNews] = React.useState<News | null>(null);

    const newsQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'news'), orderBy('createdAt', 'desc')) : null
    , [firestore]);

    const { data: news, isLoading } = useCollection<News>(newsQuery);
    
    const isNewsPublisher = currentUser?.divisionName === 'Divisi Teknologi & Komunikasi' || (currentUser?.accessLevel ?? 0) >= 10;

    const formatDate = (date: Timestamp | string) => {
        if (!date) return '-';
        const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
        return format(jsDate, 'd MMMM yyyy, HH:mm', { locale: id });
    }

    const openDeleteDialog = (article: News) => {
        setSelectedNews(article);
        setConfirmDeleteOpen(true);
    }
    
    const openEditDialog = (article: News) => {
        setSelectedNews(article);
        setEditNewsOpen(true);
    }

    const handleDelete = () => {
        if (!firestore || !selectedNews?.id) return;
        
        const newsRef = doc(firestore, 'news', selectedNews.id);
        deleteDocumentNonBlocking(newsRef);
        toast({
            title: 'Berita Dihapus',
            description: `Berita "${selectedNews.title}" telah dihapus.`
        });
        setConfirmDeleteOpen(false);
        setSelectedNews(null);
    }

    if (!isNewsPublisher) {
        return (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Akses Ditolak</AlertTitle>
                <AlertDescription>
                    Hanya anggota Divisi Teknologi &amp; Komunikasi atau Admin yang dapat mengakses halaman ini.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl">Manajemen Berita</h1>
                        <p className="text-muted-foreground">Buat, edit, dan kelola semua artikel berita untuk portal publik.</p>
                    </div>
                    <Button onClick={() => setAddNewsOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Berita Baru
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Artikel Berita</CardTitle>
                        <CardDescription>
                            Berikut adalah semua berita yang telah atau akan dipublikasikan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Penulis</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead className="text-center w-[50px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-10 w-full"/></TableCell></TableRow>
                                    ))
                                ) : news && news.length > 0 ? (
                                    news.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>{item.authorName}</TableCell>
                                            <TableCell>{formatDate(item.createdAt)}</TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(item)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">
                                            Belum ada berita yang dibuat.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {currentUser && (
                <AddNewsDialog
                    isOpen={isAddNewsOpen}
                    setIsOpen={setAddNewsOpen}
                    currentUser={currentUser}
                />
            )}
            
            {currentUser && selectedNews && (
                 <EditNewsDialog
                    isOpen={isEditNewsOpen}
                    setIsOpen={setEditNewsOpen}
                    newsArticle={selectedNews}
                />
            )}
            
            <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Artikel berita akan dihapus secara permanen.
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
        </>
    )
}
