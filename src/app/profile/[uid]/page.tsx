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
import { Mail, Briefcase, Users, Bot, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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


    if (isUserLoading) {
        return <ProfileSkeleton />;
    }
    
    if (!user) {
        return (
             <div className="container mx-auto p-4 md:p-8 text-center mt-20">
                <h1 className="text-2xl font-bold">Pengguna tidak ditemukan</h1>
                <p className="text-muted-foreground">Profil yang Anda cari tidak ada atau telah dihapus.</p>
                 <Link href="/portal" className="mt-4 inline-block">
                    <Button>Kembali ke Portal</Button>
                </Link>
            </div>
        )
    }

    const fallbackInitials = user.name?.split(' ').map((n) => n[0]).join('').substring(0, 2);

    return (
        <>
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-4 px-4 md:px-8 border-b">
            <div className="container mx-auto flex justify-between items-center">
                 <Link href="/portal" className="flex items-center gap-2">
                    <Bot className="w-8 h-8 text-primary" />
                    <span className="font-headline text-xl font-bold text-foreground">Nusantara OSIS Hub</span>
                </Link>
            </div>
        </header>
        <div className="container mx-auto p-4 md:p-8 mt-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <aside className="md:col-span-1 space-y-6">
                    <Card className="text-center">
                        <CardContent className="pt-6">
                             <Avatar className="h-32 w-32 border-4 border-primary/20 mx-auto">
                                {user.photoURL && <AvatarImage asChild src={user.photoURL}><Image src={user.photoURL} alt={user.name} width={128} height={128} /></AvatarImage>}
                                <AvatarFallback className="text-5xl">{fallbackInitials}</AvatarFallback>
                            </Avatar>
                            <h1 className="font-headline text-3xl mt-4">{user.name}</h1>
                            <p className="text-lg text-primary font-semibold">{user.position}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Kontak & Divisi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                             <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="h-5 w-5"/> 
                                <span>{user.email}</span>
                            </div>
                             <div className="flex items-center gap-3 text-muted-foreground">
                                <Briefcase className="h-5 w-5"/> 
                                <span>{user.divisionName}</span>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
                <main className="md:col-span-2">
                    <TasksTable tasks={tasks || []} isLoading={isTasksLoading} title="Tugas Aktif"/>
                </main>
           </div>
        </div>
        </>
    )
}

function ProfileSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8 mt-20">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <aside className="md:col-span-1 space-y-6">
                     <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <Skeleton className="h-8 w-48 mt-4" />
                            <Skeleton className="h-6 w-32 mt-2" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                        </CardContent>
                    </Card>
                 </aside>
                <main className="md:col-span-2">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                        <CardContent>
                            <Skeleton className="h-40 w-full" />
                        </CardContent>
                    </Card>
                </main>
             </div>
        </div>
    )
}
