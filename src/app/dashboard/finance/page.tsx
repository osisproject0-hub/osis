'use client';

import { DollarSign, PlusCircle } from 'lucide-react';

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

const fundRequests = [
  { id: 'FR001', division: 'Divisi Olahraga', item: 'Peralatan Porseni', amount: 'Rp 2.500.000', status: 'Approved' },
  { id: 'FR002', division: 'Divisi Humas', item: 'Biaya Publikasi Seminar', amount: 'Rp 1.200.000', status: 'Pending' },
  { id: 'FR003', division: 'Divisi Keagamaan', item: 'Perlengkapan Idul Adha', amount: 'Rp 3.000.000', status: 'Rejected' },
  { id: 'FR004', division: 'Divisi Dokumentasi & Kesenian', item: 'Sewa Kamera', amount: 'Rp 800.000', status: 'Pending' },
];

const financialReports = [
    { id: 'TRX001', date: '2024-07-20', description: 'Dana Awal OSIS', type: 'Pemasukan', amount: 'Rp 25.500.000' },
    { id: 'TRX002', date: '2024-07-21', description: 'Pembelian ATK Sekretariat', type: 'Pengeluaran', amount: '- Rp 500.000' },
    { id: 'TRX003', date: '2024-07-22', description: 'Persetujuan Dana Porseni', type: 'Pengeluaran', amount: '- Rp 2.500.000' },
    { id: 'TRX004', date: '2024-07-23', description: 'Sponsor Acara Seminar', type: 'Pemasukan', amount: 'Rp 5.000.000' },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Approved: 'default',
  Pending: 'secondary',
  Rejected: 'destructive',
};

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl md:text-4xl">Finance Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Fund Requests</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Fund Requests</CardTitle>
              <CardDescription>Review and approve pending fund requests from divisions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fundRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{request.division}</TableCell>
                      <TableCell>{request.item}</TableCell>
                      <TableCell>{request.amount}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[request.status]}>{request.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
        <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Detailed list of all income and expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        <Badge variant={report.type === 'Pemasukan' ? 'default' : 'secondary'}>
                            {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${report.type === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                        {report.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
