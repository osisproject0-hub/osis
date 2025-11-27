import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
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
import { Timestamp } from 'firebase/firestore';

interface TasksTableProps {
  tasks: Task[];
  title?: string;
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

const formatDate = (date: Timestamp | string) => {
    if (!date) return '-';
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true, locale: id });
}

export function TasksTable({ tasks, title, isLoading }: TasksTableProps) {
  const content = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tugas</TableHead>
          <TableHead className="hidden sm:table-cell">Untuk</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead>Prioritas</TableHead>
          <TableHead className="text-right">Tenggat</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
            <>
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
            </>
        ) : tasks.length > 0 ? tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground hidden md:inline">{task.description}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{task.assignedToName}</TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant={statusVariant[task.status]} className="capitalize">{task.status.replace('-', ' ')}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={priorityVariant[task.priority]} className="capitalize">{task.priority}</Badge>
            </TableCell>
            <TableCell className="text-right">{formatDate(task.dueDate)}</TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                    Tidak ada tugas yang ditemukan.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (title) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    )
  }
  return content;
}

function TaskSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-6 w-20 rounded-full" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
             <TableCell className="text-right">
                <Skeleton className="h-5 w-24" />
            </TableCell>
        </TableRow>
    )
}