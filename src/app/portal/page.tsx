'use client';

import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Users, Bot, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const workPrograms = [
    {
        division: "Umum",
        programs: ["Rapat Pleno", "Latihan Dasar Kepemimpinan (LDK)", "Penerimaan Anggota Baru"]
    },
    {
        division: "Divisi Keimanan & Ketaqwaan",
        programs: ["Peringatan Hari Besar Islam (PHBI)", "Pesantren Kilat", "Kultum Jumat"]
    },
    {
        division: "Divisi Kehidupan Berbangsa & Bernegara",
        programs: ["Upacara Bendera Setiap Hari Senin", "Peringatan Hari Kemerdekaan RI", "Bakti Sosial"]
    },
    {
        division: "Divisi Dokumentasi & Kesenian",
        programs: ["Pentas Seni (PENSI) Tahunan", "Lomba Fotografi & Videografi", "Mading Sekolah"]
    },
    {
        division: "Divisi Olahraga",
        programs: ["Pekan Olahraga Antar Kelas (PORKELAS)", "Classmeeting", "Latihan Rutin Ekskul Olahraga"]
    },
    {
        division: "Divisi Teknologi & Komunikasi",
        programs: ["Pengelolaan Media Sosial OSIS", "Seminar IT & Workshop Digital", "Liputan Event Sekolah"]
    }
]

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
       <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-4 px-4 md:px-8 border-b">
            <div className="container mx-auto flex justify-between items-center">
                 <Link href="/portal" className="flex items-center gap-2">
                    <Bot className="w-8 h-8 text-primary" />
                    <span className="font-headline text-xl font-bold text-foreground">Nusantara OSIS Hub</span>
                </Link>
            </div>
        </header>
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
            <h1 className="text-4xl md:text-6xl font-headline font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Selamat Datang di Portal OSIS
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
              Pusat informasi dan transparansi kegiatan Organisasi Siswa Intra Sekolah SMK LPPMRI 2 Kedungreja.
            </p>
          </div>
        </section>

        {/* Visi Misi Section */}
        <section className="py-12 md:py-20 text-center">
            <div className="container mx-auto px-4">
                 <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                    Visi & Misi
                </h2>
                <p className="text-xl text-primary font-semibold mb-6">"Mewujudkan OSIS sebagai wadah aspirasi siswa yang aktif, kreatif, dan berakhlak mulia."</p>
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <Card>
                        <CardHeader><CardTitle>Aktif</CardTitle></CardHeader>
                        <CardContent><p>Mendorong partisipasi aktif siswa dalam setiap kegiatan sekolah.</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Kreatif</CardTitle></CardHeader>
                        <CardContent><p>Menyelenggarakan program dan acara yang inovatif dan inspiratif.</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Berakhlak Mulia</CardTitle></CardHeader>
                        <CardContent><p>Menjunjung tinggi nilai-nilai moral dan etika dalam berorganisasi.</p></CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* Organization Structure Section */}
        <section id="structure" className="py-12 md:py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline text-center font-bold mb-8">
              Struktur Organisasi
            </h2>
            <div className="space-y-10">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <DivisionSkeleton key={i} />)
              ) : (
                membersByDivision.map(division => (
                  <div key={division.name}>
                    <h3 className='font-headline text-2xl mb-4 flex items-center gap-2'><Briefcase className="h-6 w-6 text-primary" /> {division.name}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {division.members.map(member => (
                        <Link key={member.uid} href={`/profile/${member.uid}`} className="block">
                            <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all text-center p-4">
                                <Avatar className="h-20 w-20 mb-2 mx-auto">
                                    <AvatarImage src={member.photoURL || ''} alt={member.name}/>
                                    <AvatarFallback>{member.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-sm">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.position}</p>
                            </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

         {/* Work Program Section */}
        <section id="work-program" className="py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-headline text-center font-bold mb-8">
              Program Kerja Unggulan
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {workPrograms.map(item => (
                <AccordionItem value={item.division} key={item.division}>
                    <AccordionTrigger className='text-lg font-semibold'>{item.division}</AccordionTrigger>
                    <AccordionContent>
                        <ul className='list-disc pl-5 space-y-2'>
                            {item.programs.map(prog => <li key={prog}>{prog}</li>)}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-12 md:py-20 bg-secondary/20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-headline text-center font-bold mb-8">
                Galeri Kegiatan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PlaceHolderImages.filter(p => p.id.startsWith('gallery-')).map(image => (
                        <Card key={image.id} className='overflow-hidden group'>
                             <div className="aspect-video relative">
                                <Image src={image.imageUrl} alt={image.description} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={image.imageHint} />
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
      <footer className="bg-primary text-primary-foreground py-8">
          <div className="container mx-auto text-center">
              <p>&copy; 2024 OSIS SMK LPPMRI 2 Kedungreja. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}

const DivisionSkeleton = () => (
    <div>
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i} className='p-4'>
                    <div className="flex flex-col items-center text-center">
                        <Skeleton className="h-20 w-20 rounded-full mb-2" />
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </Card>
            ))}
        </div>
    </div>
)

    