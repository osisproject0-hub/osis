'use client';

import { FileCheck, Users, Wallet, BarChart, PlusCircle } from 'lucide-react';
import * as React from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AIBriefing } from '@/components/dashboard/ai-briefing';
import { TasksTable } from '@/components/tasks-table';
import type { Task, User as UserType, FundRequest, FinancialReport, Division } from '@/lib/types';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';


const chartConfig = {
  progress: {
    label: "Progress",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export function KetuaDashboard() {
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
  
  const divisionsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'divisions')) : null
  , [firestore]);
  const { data: divisionsData, isLoading: divisionsLoading } = useCollection<Division>(divisionsQuery);
  
  const financialReportsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'financialReports')) : null
  , [firestore]);
  const { data: financialReports, isLoading: reportsLoading } = useCollection<FinancialReport>(financialReportsQuery);

  const allTasksQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'tasks')) : null
  , [firestore]);
  const { data: allTasks, isLoading: allTasksLoading } = useCollection<Task>(allTasksQuery);

  const financialStats = React.useMemo(() => {
    if (!financialReports) return { balance: 0 };
    const totalIn = financialReports.filter(r => r.type === 'Pemasukan').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOut = financialReports.filter(r => r.type === 'Pengeluaran').reduce((acc, curr) => acc + curr.amount, 0);
    return { balance: totalIn - totalOut };
  }, [financialReports]);

  const progressStats = React.useMemo(() => {
    if (!allTasks || allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / allTasks.length) * 100);
  }, [allTasks]);

  const divisionProgressChartData = React.useMemo(() => {
    if (!allTasks || !allUsers) return [];

    const tasksByDivision: { [key: string]: { total: number, completed: number } } = {};

    allTasks.forEach(task => {
        const member = allUsers.find(u => u.uid === task.assignedToUID);
        if (member && member.divisionName) {
            if (!tasksByDivision[member.divisionName]) {
                tasksByDivision[member.divisionName] = { total: 0, completed: 0 };
            }
            tasksByDivision[member.divisionName].total++;
            if (task.status === 'completed') {
                tasksByDivision[member.divisionName].completed++;
            }
        }
    });

    return Object.keys(tasksByDivision).map(divisionName => ({
        division: divisionName.replace('Divisi ', '').replace('Pengurus ', ''),
        progress: tasksByDivision[divisionName].total > 0
            ? Math.round((tasksByDivision[divisionName].completed / tasksByDivision[divisionName].total) * 100)
            : 0,
    }));
  }, [allTasks, allUsers]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  const stats = [
    { title: 'Persetujuan Tertunda', value: pendingRequests?.length ?? 0, icon: FileCheck, isLoading: requestsLoading },
    { title: 'Divisi Aktif', value: allUsers?.map(u => u.divisionId).filter((v, i, a) => a.indexOf(v) === i).length ?? 0, icon: Users, isLoading: !allUsers },
    { title: 'Sisa Anggaran', value: formatCurrency(financialStats.balance), icon: Wallet, isLoading: reportsLoading },
    { title: 'Progres Keseluruhan', value: `${progressStats}%`, icon: BarChart, isLoading: allTasksLoading },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">
        Command Center
      </h1>
      
      <div className="space-y-6">
        <AIBriefing />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stat.isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{stat.value}</div>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Progres Kinerja per Divisi</CardTitle>
                <CardDescription>Persentase tugas yang telah diselesaikan oleh setiap divisi.</CardDescription>
            </CardHeader>
            <CardContent>
                {allTasksLoading || !allUsers ? (
                    <Skeleton className="h-[250px] w-full" />
                ) : (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={divisionProgressChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="division" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" height={60} />
                                <YAxis unit="%" />
                                <Tooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                                <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tugas Prioritas Saya</CardTitle>
                 <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Tambah Tugas Baru
                </Button>
            </CardHeader>
            <CardContent>
                 <TasksTable tasks={myTasks || []} isLoading={tasksLoading} />
            </CardContent>
        </Card>
      </div>
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
