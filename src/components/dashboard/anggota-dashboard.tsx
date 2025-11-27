import { useUser } from '@/context/user-context';
import { mockTasks } from '@/lib/mock-data';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AnggotaDashboard() {
  const { user } = useUser();
  const myTasks = mockTasks.filter(task => task.assignedToUID === user?.uid);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">
        My Tasks
      </h1>
      <p className="text-muted-foreground">
        Tasks assigned to you by your division leader.
      </p>

      <TasksTable tasks={myTasks} title={`Tasks for ${user?.name}`} />

      <Card>
        <CardHeader>
          <CardTitle>Division Forum</CardTitle>
          <CardDescription>
            Quick coordination with your division members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Feature coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
