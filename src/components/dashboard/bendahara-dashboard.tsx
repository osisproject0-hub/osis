import { useUser } from '@/context/user-context';
import { mockTasks } from '@/lib/mock-data';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function BendaharaDashboard() {
  const { user } = useUser();
  const myTasks = mockTasks.filter(task => task.assignedToUID === user?.uid);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">
        Financial Flow
      </h1>
      <p className="text-muted-foreground">
        Manage fund requests and financial reports.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Fund Requests</CardTitle>
          <CardDescription>
            Review and approve pending fund requests from divisions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Feature coming soon.</p>
        </CardContent>
      </Card>
      
      <TasksTable tasks={myTasks} title="My Financial Tasks" />
    </div>
  );
}
