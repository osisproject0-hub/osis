'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Target, Users, BookOpen, GalleryHorizontal, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Election } from '@/lib/types';
import Image from 'next/image';


const navItems = [
    { href: '/portal/visi-misi', label: 'Visi & Misi', icon: Target },
    { href: '/portal/struktur-organisasi', label: 'Struktur Organisasi', icon: Users },
    { href: '/portal/program-kerja', label: 'Program Kerja', icon: BookOpen },
    { href: '/portal/galeri', label: 'Galeri', icon: GalleryHorizontal },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const firestore = useFirestore();

    const electionRef = useMemoFirebase(() => firestore ? doc(firestore, 'election', 'main-election') : null, [firestore]);
    const { data: election } = useDoc<Election>(electionRef);

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto flex justify-between items-center py-3 px-4 md:px-8">
                    <Link href="/portal" className="flex items-center gap-2">
                        <Image src="https://ik.imagekit.io/zco6tu2vm/images%20(1).jpeg?updatedAt=1761836341193" alt="OSIS Logo" width={40} height={40} />
                        <span className="font-headline text-xl font-bold text-foreground">OSIS SMAKDA</span>
                    </Link>
                    <div className='flex items-center gap-4'>
                        <nav className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href} passHref>
                                    <Button variant={pathname === item.href ? 'secondary' : 'ghost'}>
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                         {election?.isActive && (
                            <Link href="/portal/evoting">
                                <Button className="animate-in fade-in zoom-in-95 bg-accent text-accent-foreground hover:bg-accent/90">
                                    <Vote className="mr-2 h-4 w-4" />
                                    E-Voting Aktif!
                                </Button>
                            </Link>
                        )}
                        <Link href="/login">
                            <Button>Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-grow">
                {children}
            </main>
            <footer className="bg-primary text-primary-foreground py-8">
                <div className="container mx-auto text-center">
                    <p>&copy; 2024 OSIS SMAKDA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
