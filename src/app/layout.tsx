import type { Metadata } from 'next';
import Link from 'next/link';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bot, LogIn } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nusantara OSIS Hub',
  description: 'Digital Command Center for OSIS SMK LPPMRI 2 KEDUNGREJA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased min-h-screen")}>
        <header className="absolute top-0 left-0 right-0 z-20 bg-transparent py-4 px-4 md:px-8">
            <div className="container mx-auto flex justify-between items-center">
                 <Link href="/portal" className="flex items-center gap-2">
                    <Bot className="w-8 h-8 text-primary" />
                    <span className="font-headline text-xl font-bold text-foreground">Nusantara OSIS Hub</span>
                </Link>
                <div className='flex items-center gap-4'>
                     <Link href="/portal">
                        <Button variant="ghost">Portal</Button>
                    </Link>
                    <Link href="/login">
                        <Button>
                            <LogIn className='mr-2'/>
                            Login
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
