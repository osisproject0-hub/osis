'use client';
import { useUser, useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { FundRequest } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';


export default function ApprovalsPage() {
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const pendingRequestsQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'fundRequests'), where('status', '==', 'Pending')) : null
    , [firestore]);

    const { data: pendingRequests, isLoading, error } = useCollection<FundRequest>(pendingRequestsQuery);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    }
    
    const formatDate = (date: Timestamp | string) => {
        if (!date) return '-';
        const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
        return formatDistanceToNow(jsDate, { addSuffix: true, locale: id });
    }

    const handleApproval = async (requestId: string, newStatus: 'Approved' | 'Rejected') => {
        if (!firestore) return;
        const requestRef = doc(firestore, 'fundRequests', requestId);
        try {
            updateDocumentNonBlocking(requestRef, { status: newStatus });
            toast({
                title: 'Success',
                description: `Permintaan dana telah ${newStatus === 'Approved' ? 'disetujui' : 'ditolak'}.`,
            });
        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal memperbarui status permintaan.',
            });
        }
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
        <div className="space-y-6">
            <h1 className="font-headline text-3xl md:text-4xl">Persetujuan</h1>
            <p className="text-muted-foreground">
                Tinjau dan proses permintaan yang membutuhkan persetujuan Anda.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Permintaan Dana Tertunda</CardTitle>
                    <CardDescription>
                        Permintaan dana dari berbagai divisi yang menunggu persetujuan Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Divisi</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Diajukan oleh</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead className="text-right">Jumlah</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <>
                                    <TableRow><TableCell colSpan={6}><Skeleton className="h-10 w-full"/></TableCell></TableRow>
                                    <TableRow><TableCell colSpan={6}><Skeleton className="h-10 w-full"/></TableCell></TableRow>
                                </>
                            ) : pendingRequests && pendingRequests.length > 0 ? (
                                pendingRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>{req.division}</TableCell>
                                        <TableCell>{req.item}</TableCell>
                                        <TableCell>{req.requestedByName}</TableCell>
                                        <TableCell>{formatDate(req.createdAt)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(req.amount)}</TableCell>
                                        <TableCell className="flex justify-center gap-2">
                                            <Button size="icon" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApproval(req.id!, 'Approved')}>
                                                <ThumbsUp className="h-4 w-4"/>
                                            </Button>
                                            <Button size="icon" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleApproval(req.id!, 'Rejected')}>
                                                <ThumbsDown className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        Tidak ada permintaan dana yang tertunda.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
