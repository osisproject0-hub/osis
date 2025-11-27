'use client';

import { DollarSign, PlusCircle } from 'lucide-react';
import { useCollection } from '@/firebase';
import type { FinancialReport, FundRequest } from '@/lib/types';
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
import { useFirestore } from '@/firebase';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Approved: 'default',
  Pending: 'secondary',
  Rejected: 'destructive',
};

export default function FinancePage() {
  const firestore = useFirestore();
  const fundRequestsQuery = firestore ? query(collection(firestore, 'fundRequests')) : null;
  const financialReportsQuery = firestore ? query(collection(firestore, 'financialReports')) : null;

  const { data: fundRequests, loading: requestsLoading } = useCollection<FundRequest>(fundRequestsQuery);
  const { data: financialReports, loading: reportsLoading } = useCollection<FinancialReport>(financialReportsQuery);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  }

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
                    <TableHead>Division</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsLoading ? (
                    <>
                      <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                      <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    </>
                  ) : fundRequests?.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.division}</TableCell>
                      <TableCell>{request.item}</TableCell>
                      <TableCell>{formatCurrency(request.amount)}</TableCell>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsLoading ? (
                    <>
                      <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                      <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    </>
                  ) : financialReports?.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        <Badge variant={report.type === 'Pemasukan' ? 'default' : 'secondary'}>
                            {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${report.type === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(report.amount)}
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

    