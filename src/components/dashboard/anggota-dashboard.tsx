'use client';

import { useCollection, useUser } from '@/firebase';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { query, where } from 'firebase/firestore';
import type { Task, User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function AnggotaDashboard() {
  const { user, isLoading: isUserLoading } = useUser();
  const { data: myTasks, loading: tasksLoading } = useCollection<Task>(
    user ? query('tasks', where('assignedToUID', '==', user.uid)) : null
  );
  
  const { data: divisionMembers, loading: membersLoading } = useCollection<User>(
    user && user.divisionId ? query('users', where('divisionId', '==', user.divisionId)) : null
  );

  const otherDivisionMembers = divisionMembers?.filter(member => member.uid !== user?.uid);

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
          Dashboard for {user.name}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <TasksTable tasks={myTasks || []} title="My Tasks" isLoading={tasksLoading} />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Division Members</CardTitle>
              <CardDescription>Your colleagues in this division.</CardDescription>
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
                <p className='text-sm text-muted-foreground'>No other members in this division.</p>
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
