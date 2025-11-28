'use client';

import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import * as React from 'react';
import { collection, query, where } from 'firebase/firestore';
import type { Task, User as UserType } from '@/lib/types';
import { TasksTable } from '@/components/tasks-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddTaskDialog } from '@/components/add-task-dialog';

export function WakilDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const myTasksQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'tasks'), where('assignedToUID', '==', user.uid)) : null
  , [firestore, user]);
  const { data: myTasks, isLoading: myTasksLoading } = useCollection<Task>(myTasksQuery);

  const allOngoingTasksQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'tasks'), where('status', '!=', 'completed')) : null
  , [firestore]);
  const { data: allOngoingTasks, isLoading: allTasksLoading } = useCollection<Task>(allOngoingTasksQuery);

  const usersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users')) : null
  , [firestore]);
  const { data: allUsers } = useCollection<UserType>(usersQuery);

  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl">
                Coordination Hub
            </h1>
            <p className="text-muted-foreground">
                Monitoring synchronization and delegated tasks.
            </p>
        </div>
        <Button onClick={() => setIsAddTaskOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Tugas Baru
        </Button>
      </div>

       <TasksTable tasks={myTasks || []} title="My Delegated Tasks" isLoading={myTasksLoading} />
       <TasksTable tasks={allOngoingTasks || []} title="All Ongoing Tasks" isLoading={allTasksLoading} />
      
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
