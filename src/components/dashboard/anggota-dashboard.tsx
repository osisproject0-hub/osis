'use client';

import { useCollection, useUser, useFirestore } from '@/firebase';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { collection, query, where } from 'firebase/firestore';
import type { Task, User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { CheckCircle2, ListTodo, Loader } from 'lucide-react';

export function AnggotaDashboard() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();

  const myTasksQuery = user ? query(collection(firestore!, 'tasks'), where('assignedToUID', '==', user.uid)) : null;
  const { data: myTasks, loading: tasksLoading } = useCollection<Task>(myTasksQuery);
  
  const divisionMembersQuery = user && user.divisionId ? query(collection(firestore!, 'users'), where('divisionId', '==', user.divisionId)) : null;
  const { data: divisionMembers, loading: membersLoading } = useCollection<User>(divisionMembersQuery);

  const otherDivisionMembers = divisionMembers?.filter(member => member.uid !== user?.uid);
  
  const taskStats = React.useMemo(() => {
    if (!myTasks) return { pending: 0, inProgress: 0, completed: 0 };
    return {
      pending: myTasks.filter(t => t.status === 'pending').length,
      inProgress: myTasks.filter(t => t.status === 'in-progress').length,
      completed: myTasks.filter(t => t.status === 'completed').length,
    }
  }, [myTasks]);


  if (isUserLoading || !user) {
    return <DashboardSkeleton />;
  }

  const divisionName = user.position.startsWith('Ketua') 
    ? user.divisionName
    : user.divisionName.replace('Anggota ', '');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">
          {divisionName}
        </h1>
        <p className="text-muted-foreground">
          Dashboard untuk {user.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tugas Tertunda</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{tasksLoading ? <Skeleton className="h-8 w-10"/> : taskStats.pending}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tugas Dikerjakan</CardTitle>
                <Loader className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{tasksLoading ? <Skeleton className="h-8 w-10"/> : taskStats.inProgress}</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tugas Selesai</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{tasksLoading ? <Skeleton className="h-8 w-10"/> : taskStats.completed}</div>
            </CardContent>
        </Card>
      </div>


      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <TasksTable tasks={myTasks || []} title="My Tasks" isLoading={tasksLoading} />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Anggota Divisi</CardTitle>
              <CardDescription>Rekan kerja Anda di divisi ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {membersLoading ? (
                <>
                  <MemberSkeleton />
                  <MemberSkeleton />
                </>
              ) : (otherDivisionMembers || []).map(member => (
                 <div key={member.uid} className="flex items-center gap-3">
                    <Avatar>
                        {member.photoURL && <AvatarImage asChild>
                            <Image src={member.photoURL} alt={member.name} width={40} height={40} />
                        </AvatarImage>}
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.position}</p>
                    </div>
                 </div>
              ))}
              {(!otherDivisionMembers || otherDivisionMembers.length === 0) && !membersLoading && (
                <p className='text-sm text-muted-foreground'>Tidak ada anggota lain di divisi ini.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-6 w-3/4" />
       <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><Skeleton className="h-12 w-full"/></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-12 w-full"/></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-12 w-full"/></CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className='h-8 w-1/3' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-32 w-full' />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className='h-8 w-1/2' />
              <Skeleton className='h-4 w-3/4' />
            </CardHeader>
            <CardContent className="space-y-4">
              <MemberSkeleton />
              <MemberSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MemberSkeleton() {
    return (
        <div className="flex items-center gap-3">
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-3 w-32' />
            </div>
        </div>
    )
}