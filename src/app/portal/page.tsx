'use client';

import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Users } from 'lucide-react';
import Link from 'next/link';

// Pre-defined division order
const divisionOrder = [
  'Pengurus Inti',
  'Divisi Keimanan & Ketaqwaan',
  'Divisi Organisasi & Arganisasi',
  'Divisi Kehidupan Berbangsa & Bernegara',
  'Divisi Dokumentasi & Kesenian',
  'Divisi Olahraga',
  'Divisi Hubungan Masyarakat',
  'Divisi Teknologi & Komunikasi',
  'Divisi Keamanan & Ketertiban',
  'Divisi Kesehatan',
];

export default function PortalPage() {
  const firestore = useFirestore();
  const heroImage = PlaceHolderImages.find(p => p.id === 'login-background');
  
  const usersQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users'), orderBy('accessLevel', 'desc')) : null
  , [firestore]);

  const { data: members, isLoading } = useCollection<User>(usersQuery);

  const membersByDivision = divisionOrder.map(divisionName => ({
      name: divisionName,
      members: members?.filter(m => m.divisionName === divisionName) || []
  })).filter(d => d.members.length > 0);

  return (
    <div className="bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center text-center text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-shadow-lg">
              Selamat Datang di Portal OSIS
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-shadow">
              Pusat informasi dan transparansi kegiatan Organisasi Siswa Intra Sekolah SMK LPPMRI 2 Kedungreja.
            </p>
          </div>
        </section>

        {/* Organization Structure Section */}
        <section id="structure" className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline text-center font-bold mb-8">
              Struktur Organisasi
            </h2>
            <div className="space-y-10">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <DivisionSkeleton key={i} />)
              ) : (
                membersByDivision.map(division => (
                  <Card key={division.name}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-6 w-6 text-primary" />
                        {division.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {division.members.map(member => (
                        <Link key={member.uid} href={`/profile/${member.uid}`} className="block">
                            <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all">
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <Avatar className="h-20 w-20 mb-4">
                                        <AvatarImage src={member.photoURL || ''} alt={member.name}/>
                                        <AvatarFallback>{member.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.position}</p>
                                </CardContent>
                            </Card>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-12 md:py-20 bg-secondary/50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-headline text-center font-bold mb-8">
                Galeri Kegiatan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PlaceHolderImages.filter(p => p.id.startsWith('gallery-')).map(image => (
                        <Card key={image.id} className='overflow-hidden'>
                             <div className="aspect-video relative">
                                <Image src={image.imageUrl} alt={image.description} fill className="object-cover" data-ai-hint={image.imageHint} />
                             </div>
                             <CardContent className='p-4'>
                                 <p className='font-semibold'>{image.description}</p>
                             </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

const DivisionSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i}>
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Skeleton className="h-20 w-20 rounded-full mb-4" />
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </CardContent>
                </Card>
            ))}
        </CardContent>
    </Card>
)
