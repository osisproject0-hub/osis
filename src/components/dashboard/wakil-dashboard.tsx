'use client';

import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { TasksTable } from '@/components/tasks-table';

export function WakilDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const myTasksQuery = user ? query(collection(firestore!, 'tasks'), where('assignedToUID', '==', user.uid)) : null;
  const { data: myTasks, loading: myTasksLoading } = useCollection<Task>(myTasksQuery);

  const allOngoingTasksQuery = firestore ? query(collection(firestore, 'tasks'), where('status', '!=', 'completed')) : null;
  const { data: allOngoingTasks, loading: allTasksLoading } = useCollection<Task>(allOngoingTasksQuery);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">
        Coordination Hub
      </h1>
      <p className="text-muted-foreground">
        Monitoring synchronization and delegated tasks.
      </p>

      <TasksTable tasks={myTasks || []} title="My Delegated Tasks" isLoading={myTasksLoading} />
      <TasksTable tasks={allOngoingTasks || []} title="All Ongoing Tasks" isLoading={allTasksLoading} />
    </div>
  );
}

    