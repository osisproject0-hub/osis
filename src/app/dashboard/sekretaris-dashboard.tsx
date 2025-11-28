'use client';

import Link from 'next/link';
import * as React from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Task, User as UserType } from '@/lib/types';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText, PlusCircle } from 'lucide-react';
import { AddTaskDialog } from '@/components/add-task-dialog';

export function SekretarisDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const myTasksQuery = user ? query(collection(firestore!, 'tasks'), where('assignedToUID', '==', user.uid)) : null;
  const { data: myTasks, loading: tasksLoading } = useCollection<Task>(myTasksQuery);
  const usersQuery = firestore ? query(collection(firestore, 'users')) : null;
  const { data: allUsers } = useCollection<UserType>(usersQuery);
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl">
                    Documentation Central
                </h1>
                <p className="text-muted-foreground">
                    Manage minutes, official letters, and reports.
                </p>
            </div>
            <Button onClick={() => setIsAddTaskOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Tugas Baru
            </Button>
        </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Notulen</CardTitle>
          <CardDescription>
            Automatically transcribe and create draft meeting minutes from audio recordings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/notulen">
            <Button>
              <BookText className="mr-2 h-4 w-4" />
              Go to AI Notulen
            </Button>
          </Link>
        </CardContent>
      </Card>

      <TasksTable tasks={myTasks || []} title="My Documentation Tasks" isLoading={tasksLoading} />

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
