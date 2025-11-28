'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { News } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { ArrowRight, Calendar, User } from 'lucide-react';

export default function BeritaPage() {
    const firestore = useFirestore();
    
    const newsQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'news'), orderBy('createdAt', 'desc')) : null
    , [firestore]);
    const { data: news, isLoading } = useCollection<News>(newsQuery);
    
    const formatDate = (date: Timestamp | string) => {
        if (!date) return '-';
        const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
        return format(jsDate, 'd MMMM yyyy', { locale: id });
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                    Berita &amp; Pengumuman
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Ikuti terus informasi terbaru, pengumuman penting, dan liputan kegiatan dari OSIS SMAKDA.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => <NewsCardSkeleton key={i} />)
                ) : news && news.length > 0 ? (
                    news.map((item, index) => (
                        <Card key={item.id} className='flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-xl animate-in fade-in-50' style={{animationDelay: `${index * 100}ms`}}>
                            <div className="aspect-video relative">
                                <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={item.imageHint} />
                            </div>
                            <CardHeader>
                                <CardTitle className="leading-tight group-hover:text-primary transition-colors">
                                     <Link href={`/portal/berita/${item.slug}`}>{item.title}</Link>
                                </CardTitle>
                                 <CardDescription className='flex items-center gap-4 pt-2 text-xs'>
                                    <span className='flex items-center gap-1.5'><User className='h-3 w-3'/> {item.authorName}</span>
                                    <span className='flex items-center gap-1.5'><Calendar className='h-3 w-3'/> {formatDate(item.createdAt)}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                               <p className='text-sm text-muted-foreground line-clamp-3'>{item.content}</p>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/portal/berita/${item.slug}`} className='text-sm font-semibold text-primary group-hover:underline flex items-center'>
                                    Baca Selengkapnya <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <p>Belum ada berita yang dipublikasikan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function NewsCardSkeleton() {
    return (
        <Card className='flex flex-col overflow-hidden'>
            <div className="aspect-video relative">
                <Skeleton className='h-full w-full' />
            </div>
            <CardHeader>
                <Skeleton className='h-6 w-full mb-2' />
                <Skeleton className='h-6 w-3/4' />
                 <Skeleton className='h-4 w-1/2 mt-2' />
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
               <Skeleton className='h-4 w-full' />
               <Skeleton className='h-4 w-full' />
               <Skeleton className='h-4 w-5/6' />
            </CardContent>
            <CardFooter>
                <Skeleton className='h-5 w-28' />
            </CardFooter>
        </Card>
    )
}
