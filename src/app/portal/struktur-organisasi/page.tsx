'use client';

import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { User, Division } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function StrukturOrganisasiPage() {
  const firestore = useFirestore();
  
  const usersQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users'), orderBy('accessLevel', 'desc')) : null
  , [firestore]);
  const { data: members, isLoading: membersLoading } = useCollection<User>(usersQuery);

  const divisionsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'divisions'), orderBy('order', 'asc')) : null
  , [firestore]);
  const { data: divisions, isLoading: divisionsLoading } = useCollection<Division>(divisionsQuery);
  
  const membersByDivision = (divisions || []).map(division => ({
      ...division,
      members: members?.filter(m => m.divisionId === division.id) || []
  })).filter(d => d.members.length > 0);

  const isLoading = membersLoading || divisionsLoading;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-4">
          Struktur Organisasi
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Kenali tim yang berdedikasi di balik semua kegiatan OSIS SMAKDA. Mereka adalah para pemimpin masa depan yang bekerja keras untuk mewujudkan aspirasi siswa.</p>
      </div>

      <div className="space-y-12">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <DivisionSkeleton key={i} />)
        ) : (
          membersByDivision.map((division, index) => (
            <div key={division.id} className="animate-in fade-in-50 slide-in-from-bottom-5" style={{animationDelay: `${index * 150}ms`}}>
              <h3 className='font-headline text-2xl mb-4 flex items-center gap-3'><Briefcase className="h-6 w-6 text-primary" /> {division.name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {division.members.map(member => (
                  <Link key={member.uid} href={`/profile/${member.uid}`} className="block group">
                      <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all text-center p-4 transform hover:-translate-y-1 duration-300">
                          <CardContent className="p-0">
                          <Avatar className="h-28 w-28 mb-3 mx-auto border-4 border-muted group-hover:border-primary transition-colors duration-300">
                              <AvatarImage src={member.photoURL || ''} alt={member.name} className="object-cover"/>
                              <AvatarFallback className="text-3xl">{member.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</AvatarFallback>
                          </Avatar>
                          <p className="font-semibold text-md leading-tight">{member.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{member.position}</p>
                          </CardContent>
                      </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const DivisionSkeleton = () => (
    <div>
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i} className='p-4'>
                    <CardContent className="p-0 flex flex-col items-center text-center">
                        <Skeleton className="h-28 w-28 rounded-full mb-3" />
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
)
