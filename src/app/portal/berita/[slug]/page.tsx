'use client';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useParams } from "next/navigation";
import type { News } from "@/lib/types";
import { collection, query, where, Timestamp } from "firebase/firestore";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Basic markdown to HTML renderer
function MarkdownRenderer({ content }: { content: string }) {
    const htmlContent = content
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  
    return <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

export default function NewsArticlePage() {
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();

    const newsQuery = useMemoFirebase(() => 
        firestore && slug ? query(collection(firestore, 'news'), where('slug', '==', slug)) : null
    , [firestore, slug]);
    
    const {data: newsData, isLoading} = useCollection<News>(newsQuery);
    const article = newsData?.[0];

    const formatDate = (date: Timestamp | string | undefined) => {
        if (!date) return '-';
        const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
        return format(jsDate, 'EEEE, d MMMM yyyy', { locale: id });
    }

    if (isLoading) {
        return <ArticleSkeleton />;
    }
    
    if (!article) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-muted-foreground text-lg mt-2">Artikel tidak ditemukan.</p>
                 <Link href="/portal/berita" className="mt-6">
                    <Button variant="outline">Kembali ke Daftar Berita</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
            <article>
                <header className="mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 leading-tight">{article.title}</h1>
                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1.5'><User className='h-4 w-4'/> {article.authorName}</span>
                        <span className='flex items-center gap-1.5'><Calendar className='h-4 w-4'/> {formatDate(article.createdAt)}</span>
                    </div>
                </header>

                <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
                    <Image src={article.imageUrl} alt={article.title} fill className="object-cover" data-ai-hint={article.imageHint} />
                </div>

                <MarkdownRenderer content={article.content} />
            </article>
        </div>
    )
}

function ArticleSkeleton() {
    return (
         <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
            <header className="mb-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
            </header>
             <Skeleton className="aspect-video w-full mb-8 rounded-lg" />
             <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <br />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/6" />
             </div>
        </div>
    )
}
