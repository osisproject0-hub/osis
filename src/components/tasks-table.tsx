import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Task } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface TasksTableProps {
  tasks: Task[];
  title: string;
  isLoading?: boolean;
}

const priorityVariant: { [key in Task['priority']]: 'default' | 'secondary' | 'destructive' } = {
  low: 'secondary',
  medium: 'default',
  high: 'default',
  urgent: 'destructive',
};

const statusVariant: { [key in Task['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  pending: 'secondary',
  'in-progress': 'default',
  completed: 'outline',
  overdue: 'destructive',
};


export function TasksTable({ tasks, title, isLoading }: TasksTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead className="hidden md:table-cell">Assigned By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <>
                    <TaskSkeleton />
                    <TaskSkeleton />
                    <TaskSkeleton />
                </>
            ) : tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground hidden md:inline">{task.description}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{task.assignedByName}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[task.status]} className="capitalize">{task.status.replace('-', ' ')}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariant[task.priority]} className="capitalize">{task.priority}</Badge>
                </TableCell>
                <TableCell>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</TableCell>
              </TableRow>
            ))}
             {!isLoading && tasks.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No tasks found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TaskSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
             <TableCell>
                <Skeleton className="h-5 w-24" />
            </TableCell>
        </TableRow>
    )
}
