'use client';
import Link from 'next/link';
import * as React from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Task, User as UserType, FundRequest, FinancialReport } from '@/lib/types';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, PlusCircle } from 'lucide-react';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  pemasukan: {
    label: "Pemasukan",
    color: "hsl(var(--chart-2))",
  },
  pengeluaran: {
    label: "Pengeluaran",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function BendaharaDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const myTasksQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'tasks'), where('assignedToUID', '==', user.uid)) : null
  , [firestore, user]);
  const { data: myTasks, isLoading: tasksLoading } = useCollection<Task>(myTasksQuery);

  const usersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users')) : null
  , [firestore]);
  const { data: allUsers } = useCollection<UserType>(usersQuery);
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);

  const fundRequestsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'fundRequests'), where('status', '==', 'Pending')) : null
  , [firestore]);
  const { data: pendingRequests, isLoading: requestsLoading } = useCollection<FundRequest>(fundRequestsQuery);
  
  const financialReportsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'financialReports'), orderBy('date', 'asc')) : null
  , [firestore]);
  const { data: financialReports, isLoading: reportsLoading } = useCollection<FinancialReport>(financialReportsQuery);

  const financialStats = React.useMemo(() => {
    if (!financialReports) return { totalIn: 0, totalOut: 0, balance: 0 };
    const totalIn = financialReports.filter(r => r.type === 'Pemasukan').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOut = financialReports.filter(r => r.type === 'Pengeluaran').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIn - totalOut;
    return { totalIn, totalOut, balance };
  }, [financialReports]);

  const chartData = React.useMemo(() => {
    if (!financialReports) return [];
    const monthlyData: {[key: string]: {pemasukan: number, pengeluaran: number}} = {};

    financialReports.forEach(report => {
        const month = new Date(report.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
            monthlyData[month] = { pemasukan: 0, pengeluaran: 0 };
        }
        if (report.type === 'Pemasukan') {
            monthlyData[month].pemasukan += report.amount;
        } else {
            monthlyData[month].pengeluaran += report.amount;
        }
    });

    return Object.keys(monthlyData).map(month => ({
        month,
        ...monthlyData[month]
    })).slice(-6); // show last 6 months
  }, [financialReports]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  const stats = [
    { title: 'Total Dana Masuk', value: formatCurrency(financialStats.totalIn), isLoading: reportsLoading },
    { title: 'Total Dana Keluar', value: formatCurrency(financialStats.totalOut), isLoading: reportsLoading },
    { title: 'Sisa Anggaran', value: formatCurrency(financialStats.balance), isLoading: reportsLoading },
    { title: 'Pengajuan Diproses', value: pendingRequests?.length ?? 0, isLoading: requestsLoading },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl">
                Financial Flow
            </h1>
            <p className="text-muted-foreground">
                Kelola pengajuan dana dan laporan keuangan.
            </p>
        </div>
        <div className="flex gap-2">
            <Link href="/dashboard/finance">
                <Button>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Buka Halaman Keuangan
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {stat.isLoading ? <Skeleton className="h-8 w-3/4"/> : <div className="text-2xl font-bold">{stat.value}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Tren Keuangan 6 Bulan Terakhir</CardTitle>
              <CardDescription>Visualisasi pemasukan dan pengeluaran.</CardDescription>
          </CardHeader>
          <CardContent>
              {reportsLoading ? (
                  <Skeleton className="h-[250px] w-full" />
              ) : (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `Rp${Number(value) / 1000000} Jt`}/>
                        <Tooltip content={<ChartTooltipContent formatter={(value, name) => <div>{chartConfig[name as keyof typeof chartConfig].label}: {formatCurrency(Number(value))}</div>} />} />
                        <Area type="monotone" dataKey="pemasukan" fill="var(--color-pemasukan)" fillOpacity={0.4} stroke="var(--color-pemasukan)" />
                        <Area type="monotone" dataKey="pengeluaran" fill="var(--color-pengeluaran)" fillOpacity={0.4} stroke="var(--color-pengeluaran)" />
                    </AreaChart>
                </ChartContainer>
              )}
          </CardContent>
      </Card>

      <TasksTable tasks={myTasks || []} title="My Financial Tasks" isLoading={tasksLoading} showAddButton />

      {user && allUsers && (
        <AddTaskDialog 
            isOpen={isAddTaskOpen}
            setIsOpen={setIsAddTaskOpen}
            currentUser={user}
            allUsers={allUsers}
        />
      )}
    </div>
  );
}
