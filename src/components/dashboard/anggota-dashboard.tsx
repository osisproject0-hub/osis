import { useUser } from '@/context/user-context';
import { mockTasks, mockUsers } from '@/lib/mock-data';
import { TasksTable } from '@/components/tasks-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';

export function AnggotaDashboard() {
  const { user } = useUser();
  const myTasks = mockTasks.filter(task => task.assignedToUID === user?.uid);
  const divisionMembers = mockUsers.filter(
    (member) => member.divisionId === user?.divisionId && member.uid !== user?.uid
  );

  if (!user) {
    return null;
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
            <TasksTable tasks={myTasks} title="My Tasks" />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Division Members</CardTitle>
              <CardDescription>Your colleagues in this division.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {divisionMembers.map(member => (
                 <div key={member.uid} className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage asChild>
                            <Image src={member.photoURL} alt={member.name} width={40} height={40} />
                        </AvatarImage>
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.position}</p>
                    </div>
                 </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
