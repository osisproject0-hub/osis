'use client';

import * as React from 'react';
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
import type { Task, User } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Timestamp, doc, collection } from 'firebase/firestore';
import { MoreHorizontal, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useFirestore, useUser, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { EditTaskDialog } from './edit-task-dialog';
import { AddTaskDialog } from './add-task-dialog';


interface TasksTableProps {
  tasks: Task[];
  title?: string;
  isLoading?: boolean;
  showAddButton?: boolean;
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

export function TasksTable({ tasks, title, isLoading, showAddButton }: TasksTableProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'users') : null
  , [firestore]);
  const { data: allUsers } = useCollection<User>(usersQuery);

  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [isEditOpen, setEditOpen] = React.useState(false);
  const [isAddOpen, setAddOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const canPerformAction = (task: Task) => {
    if (!currentUser) return false;
    // President can do anything
    if (currentUser.accessLevel >= 10) return true;
    // User who assigned the task can edit/delete
    if (currentUser.uid === task.assignedByUID) return true;
    return false;
  }

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setConfirmDeleteOpen(true);
  }

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditOpen(true);
  }

  const handleDeleteTask = () => {
    if (!firestore || !selectedTask || !selectedTask.id) return;
    const taskRef = doc(firestore, 'tasks', selectedTask.id);
    deleteDocumentNonBlocking(taskRef);
    toast({
        title: 'Tugas Dihapus',
        description: `Tugas "${selectedTask.title}" telah berhasil dihapus.`
    })
    setConfirmDeleteOpen(false);
    setSelectedTask(null);
  }

  const content = (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tugas</TableHead>
            <TableHead className="hidden sm:table-cell">Untuk</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead>Prioritas</TableHead>
            <TableHead className="text-right">Tenggat</TableHead>
            <TableHead className="w-[50px]"><span className='sr-only'>Aksi</span></TableHead>
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
              <TableCell>
                {canPerformAction(task) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem className='text-red-600' onClick={() => openDeleteDialog(task)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          )) : (
              <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                      Tidak ada tugas yang ditemukan.
                  </TableCell>
              </TableRow>
          )}
        </TableBody>
      </Table>
      
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tugas secara permanen.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Hapus
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>
        
       {selectedTask && allUsers && (
        <EditTaskDialog 
            isOpen={isEditOpen}
            setIsOpen={setEditOpen}
            task={selectedTask}
            allUsers={allUsers}
        />
       )}
       {currentUser && allUsers && (
        <AddTaskDialog
            isOpen={isAddOpen}
            setIsOpen={setAddOpen}
            currentUser={currentUser}
            allUsers={allUsers}
        />
       )}
    </>
  );

  if (title) {
    return (
        <Card>
            <CardHeader className='flex-row items-center justify-between'>
                <CardTitle>{title}</CardTitle>
                {showAddButton && (
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <PlusCircle className='h-4 w-4 mr-2'/>
                        Tambah Tugas
                    </Button>
                )}
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
             <TableCell>
                <Skeleton className="h-8 w-8" />
            </TableCell>
        </TableRow>
    )
}
