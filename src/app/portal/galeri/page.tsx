'use client';

import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { GalleryImage } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function GaleriPage() {
    const firestore = useFirestore();
    
    const galleryQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'galleryImages'), orderBy('order', 'asc')) : null
    , [firestore]);
    const { data: galleryImages, isLoading: galleryLoading } = useCollection<GalleryImage>(galleryQuery);

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                    Galeri Kegiatan
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Momen-momen berharga dari berbagai kegiatan dan acara yang telah kami selenggarakan. Setiap gambar bercerita tentang kerja keras, kebersamaan, dan semangat kami.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryLoading ? (
                    Array.from({length: 6}).map((_, i) => (
                        <Card key={i} className='overflow-hidden group'>
                            <div className="aspect-video relative">
                            <Skeleton className='h-full w-full' />
                            </div>
                            <CardContent className='p-4 space-y-2'>
                                <Skeleton className='h-5 w-3/4' />
                            </CardContent>
                    </Card>
                    ))
                ) : (
                    galleryImages?.map((image, index) => (
                        <Card key={image.id} className='overflow-hidden group transition-all duration-300 hover:shadow-xl animate-in fade-in-50' style={{animationDelay: `${index * 100}ms`}}>
                            <div className="aspect-video relative">
                                <Image src={image.imageUrl} alt={image.description} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={image.imageHint} />
                            </div>
                            <CardContent className='p-4'>
                                <p className='font-semibold'>{image.description}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
