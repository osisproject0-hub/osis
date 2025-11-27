'use client';

import { FileCheck, Users, Wallet, BarChart, PlusCircle } from 'lucide-react';
import * as React from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIBriefing } from '@/components/dashboard/ai-briefing';
import { TasksTable } from '@/components/tasks-table';
import type { Task, User as UserType } from '@/lib/types';
import { AddTaskDialog } from '../add-task-dialog';
import { Button } from '../ui/button';

export function KetuaDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const myTasksQuery = user ? query(collection(firestore!, 'tasks'), where('assignedToUID', '==', user.uid)) : null;
  const { data: myTasks, loading: tasksLoading } = useCollection<Task>(myTasksQuery);
  const usersQuery = firestore ? query(collection(firestore, 'users')) : null;
  const { data: allUsers } = useCollection<UserType>(usersQuery);

  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);

  // In a real app, these stats would come from Firestore queries
  const stats = [
    { title: 'Pending Approvals', value: '3', icon: FileCheck },
    { title: 'Active Divisions', value: '9', icon: Users },
    { title: 'Budget Remaining', value: 'Rp 15.2M', icon: Wallet },
    { title: 'Overall Progress', value: '76%', icon: BarChart },
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
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Priority Tasks</CardTitle>
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