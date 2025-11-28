'use client';

import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Users, Briefcase } from 'lucide-react';
import type { User as UserType } from '@/lib/types';
import { collection, query } from 'firebase/firestore';

const divisions = [
  { id: 'div-01', name: 'Divisi Keimanan & Ketaqwaan' },
  { id: 'div-02', name: 'Divisi Organisasi & Arganisasi' },
  { id: 'div-03', name: 'Divisi Kehidupan Berbangsa & Bernegara' },
  { id: 'div-04', name: 'Divisi Dokumentasi & Kesenian' },
  { id: 'div-05', name: 'Divisi Olahraga' },
  { id: 'div-06', name: 'Divisi Hubungan Masyarakat' },
  { id: 'div-07', name: 'Divisi Teknologi & Komunikasi' },
  { id: 'div-08', name: 'Divisi Keamanan & Ketertiban' },
  { id: 'div-09', name: 'Divisi Kesehatan' },
];

export default function DivisionsPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  
  const membersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users')) : null
  , [firestore]);
  
  const { data: members, isLoading } = useCollection<UserType>(membersQuery);

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
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {divisions.map((division) => {
          const divisionMembers = membersByDivision(division.id);
          const ketua = divisionMembers.find(m => m.position.startsWith('Ketua'));

          return (
            <Card key={division.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  {division.name}
                </CardTitle>
                {ketua && <CardDescription>Ketua: {ketua.name}</CardDescription>}
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
    </div>
  );
}
