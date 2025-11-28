'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, BookOpen, GalleryHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const featureCards = [
    {
        icon: Target,
        title: "Visi & Misi",
        description: "Lihat landasan dan tujuan yang menjadi pedoman organisasi kami.",
        href: "/portal/visi-misi"
    },
    {
        icon: Users,
        title: "Struktur Organisasi",
        description: "Kenali siapa saja yang berada di balik layar OSIS SMAKDA.",
        href: "/portal/struktur-organisasi"
    },
    {
        icon: BookOpen,
        title: "Program Kerja",
        description: "Temukan program-program unggulan yang kami jalankan.",
        href: "/portal/program-kerja"
    },
    {
        icon: GalleryHorizontal,
        title: "Galeri Kegiatan",
        description: "Jelajahi momen-momen terbaik dari berbagai acara yang telah kami selenggarakan.",
        href: "/portal/galeri"
    }
];

export default function PortalPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'login-background');
  
  return (
    <div className="animate-in fade-in-50">
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
          <div className="relative z-10 p-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h1 className="text-4xl md:text-6xl font-headline font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Selamat Datang di Portal OSIS
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
              Pusat informasi dan transparansi kegiatan Organisasi Siswa Intra Sekolah SMK LPPMRI 2 Kedungreja.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20">
            <div className="container mx-auto px-4">
                 <h2 className="text-3xl md:text-4xl font-headline text-center font-bold mb-12">
                    Jelajahi Portal Kami
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featureCards.map((feature, index) => (
                        <Card key={index} className="flex flex-col hover:shadow-lg transition-shadow duration-300 animate-in fade-in-50 slide-in-from-bottom-5" style={{animationDelay: `${index * 100}ms`}}>
                            <CardHeader className="flex-row items-start gap-4">
                                <feature.icon className="w-10 h-10 text-primary flex-shrink-0"/>
                                <div>
                                    <CardTitle>{feature.title}</CardTitle>
                                    <CardDescription className="mt-1">{feature.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Link href={feature.href} className="w-full">
                                    <Button variant="outline" className="w-full">
                                        Lihat Selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
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
