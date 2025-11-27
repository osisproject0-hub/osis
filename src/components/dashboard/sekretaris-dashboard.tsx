'use client';

import Link from 'next/link';
import { useUser, useCollection } from '@/firebase';
import { query, where } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText } from 'lucide-react';

export function SekretarisDashboard() {
  const { user } = useUser();
  const { data: myTasks, loading: tasksLoading } = useCollection<Task>(
    user ? query('tasks', where('assignedToUID', '==', user.uid)) : null
  );

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">
        Documentation Central
      </h1>
      <p className="text-muted-foreground">
        Manage minutes, official letters, and reports.
      </p>
      
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
    </div>
  );
}
