'use client';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useParams } from "next/navigation";
import type { User, Task } from "@/lib/types";
import { doc, collection, query, where } from "firebase/firestore";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TasksTable } from "@/components/tasks-table";
import { Mail, Briefcase, Users } from "lucide-react";

export default function UserProfilePage() {
    const params = useParams();
    const uid = params.uid as string;
    const firestore = useFirestore();

    const userRef = useMemoFirebase(() => 
        firestore && uid ? doc(firestore, 'users', uid) : null
    , [firestore, uid]);
    const {data: user, isLoading: isUserLoading} = useDoc<User>(userRef);

    const tasksQuery = useMemoFirebase(() =>
        firestore && uid ? query(collection(firestore, 'tasks'), where('assignedToUID', '==', uid)) : null
    , [firestore, uid]);
    const { data: tasks, isLoading: isTasksLoading } = useCollection<Task>(tasksQuery);


    if (isUserLoading || !user) {
        return <ProfileSkeleton />;
    }

    const fallbackInitials = user.name?.split(' ').map((n) => n[0]).join('').substring(0, 2);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 mt-20">
            <header className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-28 w-28 border-4 border-primary/20">
                    {user.photoURL && <AvatarImage asChild src={user.photoURL}><Image src={user.photoURL} alt={user.name} width={112} height={112} /></AvatarImage>}
                    <AvatarFallback className="text-4xl">{fallbackInitials}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                    <h1 className="font-headline text-4xl md:text-5xl">{user.name}</h1>
                    <p className="text-xl text-muted-foreground">{user.position}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 justify-center md:justify-start">
                        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4"/> {user.email}</span>
                        <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4"/> {user.divisionName}</span>
                    </div>
                </div>
            </header>
            <main>
                <TasksTable tasks={tasks || []} isLoading={isTasksLoading} title="Tugas Aktif"/>
            </main>
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 mt-20">
             <header className="flex flex-col md:flex-row items-center gap-6">
                <Skeleton className="h-28 w-28 rounded-full" />
                <div className="space-y-2 text-center md:text-left">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
            </header>
             <main>
                <Card>
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
