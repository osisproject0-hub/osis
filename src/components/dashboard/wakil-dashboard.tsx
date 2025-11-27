import { useUser } from '@/context/user-context';
import { mockTasks } from '@/lib/mock-data';
import { TasksTable } from '@/components/tasks-table';

export function WakilDashboard() {
  const { user } = useUser();
  const myTasks = mockTasks.filter(task => task.assignedToUID === user?.uid);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">
        Coordination Hub
      </h1>
      <p className="text-muted-foreground">
        Monitoring synchronization and delegated tasks.
      </p>

      <TasksTable tasks={myTasks} title="My Delegated Tasks" />
      <TasksTable tasks={mockTasks.filter(t => t.status !== 'completed')} title="All Ongoing Tasks" />
    </div>
  );
}
