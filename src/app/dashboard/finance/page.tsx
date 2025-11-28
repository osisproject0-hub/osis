'use client';

import * as React from 'react';
import { DollarSign, PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, deleteDocumentNonBlocking } from '@/firebase';
import type { FinancialReport, FundRequest, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, doc } from 'firebase/firestore';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { EditTransactionDialog } from '@/components/edit-transaction-dialog';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Approved: 'default',
  Pending: 'secondary',
  Rejected: 'destructive',
};

export default function FinancePage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isAddTransactionOpen, setAddTransactionOpen] = React.useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [isEditTransactionOpen, setEditTransactionOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<FinancialReport | null>(null);
  const {toast} = useToast();

  const fundRequestsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'fundRequests')) : null
  , [firestore]);
  
  const financialReportsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'financialReports')) : null
  , [firestore]);

  const { data: fundRequests, isLoading: requestsLoading } = useCollection<FundRequest>(fundRequestsQuery);
  const { data: financialReports, isLoading: reportsLoading } = useCollection<FinancialReport>(financialReportsQuery);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  }

  const openDeleteDialog = (report: FinancialReport) => {
    setSelectedReport(report);
    setConfirmDeleteOpen(true);
  }

  const handleDeleteReport = () => {
    if (!firestore || !selectedReport || !selectedReport.id) return;
    const reportRef = doc(firestore, 'financialReports', selectedReport.id);
    deleteDocumentNonBlocking(reportRef);
    toast({
        title: 'Transaksi Dihapus',
        description: `Transaksi "${selectedReport.description}" telah dihapus.`
    })
    setConfirmDeleteOpen(false);
    setSelectedReport(null);
  }

  const openEditDialog = (report: FinancialReport) => {
    setSelectedReport(report);
    setEditTransactionOpen(true);
  };


  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl md:text-4xl">Manajemen Keuangan</h1>
        {user?.position?.includes('Bendahara') && (
            <Button onClick={() => setAddTransactionOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Transaksi
            </Button>
        )}
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Laporan Keuangan</TabsTrigger>
          <TabsTrigger value="requests">Pengajuan Dana</TabsTrigger>
        </TabsList>
        <TabsContent value="reports">
        <Card>
            <CardHeader>
              <CardTitle>Laporan Keuangan</CardTitle>
              <CardDescription>Daftar terperinci semua pemasukan dan pengeluaran.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Dicatat Oleh</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    {user?.position?.includes('Bendahara') && <TableHead className="w-[50px]">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsLoading ? (
                    <>
                      <TableRow><TableCell colSpan={user?.position?.includes('Bendahara') ? 6 : 5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                      <TableRow><TableCell colSpan={user?.position?.includes('Bendahara') ? 6 : 5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    </>
                  ) : financialReports?.length ? (
                    financialReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{new Date(report.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})}</TableCell>
                        <TableCell>{report.description}</TableCell>
                        <TableCell>
                          <Badge variant={report.type === 'Pemasukan' ? 'default' : 'secondary'}>
                              {report.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.recordedByName}</TableCell>
                        <TableCell className={`text-right font-medium ${report.type === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                          {report.type === 'Pemasukan' ? '+' : '-'} {formatCurrency(report.amount)}
                        </TableCell>
                        {user?.position?.includes('Bendahara') && (
                             <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Buka menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openEditDialog(report)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(report)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Hapus</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={user?.position?.includes('Bendahara') ? 6 : 5} className="h-24 text-center">
                        Belum ada laporan keuangan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Pengajuan Dana</CardTitle>
              <CardDescription>Tinjau semua pengajuan dana dari divisi.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"><span className='sr-only'>Aksi</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsLoading ? (
                    <>
                      <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                      <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    </>
                  ) : fundRequests?.length ? (
                    fundRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.division}</TableCell>
                        <TableCell>{request.item}</TableCell>
                        <TableCell>{formatCurrency(request.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[request.status]}>{request.status}</Badge>
                        </TableCell>
                        <TableCell>
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Buka menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        Lihat Detail
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                   ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Belum ada pengajuan dana.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    {user && (
        <AddTransactionDialog 
            isOpen={isAddTransactionOpen}
            setIsOpen={setAddTransactionOpen}
            currentUser={user}
        />
    )}
    {user && selectedReport && (
      <EditTransactionDialog
        isOpen={isEditTransactionOpen}
        setIsOpen={setEditTransactionOpen}
        transaction={selectedReport}
      />
    )}
    <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data transaksi secara permanen.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Hapus
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
