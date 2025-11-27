'use client';
import Link from 'next/link';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { DollarSign } from 'lucide-react';

export function BendaharaDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const myTasksQuery = user ? query(collection(firestore!, 'tasks'), where('assignedToUID', '==', user.uid)) : null;
  const { data: myTasks, loading: tasksLoading } = useCollection<Task>(myTasksQuery);

  const stats = [
    { title: 'Total Dana Masuk', value: 'Rp 25.5M' },
    { title: 'Total Dana Keluar', value: 'Rp 10.3M' },
    { title: 'Sisa Anggaran', value: 'Rp 15.2M' },
    { title: 'Pengajuan Diproses', value: '3' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl">
                Financial Flow
            </h1>
            <p className="text-muted-foreground">
                Manage fund requests and financial reports.
            </p>
        </div>
        <Link href="/dashboard/finance">
            <Button>
                <DollarSign className="mr-2 h-4 w-4" />
                Go to Finance Page
            </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <TasksTable tasks={myTasks || []} title="My Financial Tasks" isLoading={tasksLoading} />
    </div>
  );
}

    