'use client';

import * as React from 'react';
import { DollarSign, PlusCircle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
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
import { collection, query } from 'firebase/firestore';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Approved: 'default',
  Pending: 'secondary',
  Rejected: 'destructive',
};

export default function FinancePage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isAddTransactionOpen, setAddTransactionOpen] = React.useState(false);

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

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl md:text-4xl">Manajemen Keuangan</h1>
        <Button onClick={() => setAddTransactionOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Pengajuan Dana</TabsTrigger>
          <TabsTrigger value="reports">Laporan Keuangan</TabsTrigger>
        </TabsList>
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
                    <TableHead>Aksi</TableHead>
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
                          <Button variant="outline" size="sm">
                            Detail
                          </Button>
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
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsLoading ? (
                    <>
                      <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                      <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
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
                        <TableCell className={`text-right font-medium ${report.type === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                          {report.type === 'Pemasukan' ? '+' : '-'} {formatCurrency(report.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Belum ada laporan keuangan.
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
    </>
  );
}
