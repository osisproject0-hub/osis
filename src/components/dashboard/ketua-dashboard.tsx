import { FileCheck, Users, Wallet, BarChart } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { mockTasks } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIBriefing } from '@/components/dashboard/ai-briefing';
import { TasksTable } from '@/components/tasks-table';

export function KetuaDashboard() {
  const { user } = useUser();
  const myTasks = mockTasks.filter(task => task.assignedToUID === user?.uid);

  const stats = [
    { title: 'Pending Approvals', value: '3', icon: FileCheck },
    { title: 'Active Divisions', value: '8', icon: Users },
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

        <TasksTable tasks={myTasks} title="My Priority Tasks" />
      </div>
    </div>
  );
}
