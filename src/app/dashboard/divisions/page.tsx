'use client';

import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Users, Briefcase } from 'lucide-react';
import type { User as UserType, Division } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';


export default function DivisionsPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  
  const membersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users')) : null
  , [firestore]);
  const { data: members, isLoading: membersLoading } = useCollection<UserType>(membersQuery);

  const divisionsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'divisions'), orderBy('order', 'asc')) : null
  , [firestore]);
  const { data: divisions, isLoading: divisionsLoading } = useCollection<Division>(divisionsQuery);

  const isLoading = membersLoading || divisionsLoading;

  if (!currentUser || currentUser.accessLevel < 7) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Akses Ditolak</AlertTitle>
        <AlertDescription>
          Anda tidak memiliki izin untuk melihat halaman ini. Silakan hubungi administrator.
        </AlertDescription>
      </Alert>
    );
  }

  const membersByDivision = (divisionId: string) => {
    return members?.filter(member => member.divisionId === divisionId) || [];
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">Daftar Divisi</h1>
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className='h-6 w-3/4'/><Skeleton className='h-4 w-1/2'/></CardHeader><CardContent><Skeleton className='h-5 w-20'/></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {divisions?.map((division) => {
            const divisionMembers = membersByDivision(division.id);
            const ketua = divisionMembers.find(m => m.position.startsWith('Ketua'));

            return (
              <Card key={division.id}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>{division.name}</span>
                  </CardTitle>
                  {ketua ? <CardDescription>Ketua: {ketua.name}</CardDescription> : <CardDescription>Ketua belum ditentukan</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {isLoading ? <Skeleton className="h-4 w-20" /> : `${divisionMembers.length} Anggota`}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
