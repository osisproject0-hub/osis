'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { WorkProgram } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ProgramKerjaPage() {
  const firestore = useFirestore();
  
  const workProgramsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'workPrograms'), orderBy('order', 'asc')) : null
  , [firestore]);
  const { data: workPrograms, isLoading: programsLoading } = useCollection<WorkProgram>(workProgramsQuery);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-headline font-bold mb-4">
            Program Kerja Unggulan
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Ini adalah beberapa program kerja unggulan yang dirancang oleh setiap divisi untuk mendukung visi dan misi OSIS serta memajukan kegiatan siswa.</p>
        </div>
        
        {programsLoading ? (
            <div className='space-y-4'>
                <Skeleton className='h-14 w-full' />
                <Skeleton className='h-14 w-full' />
                <Skeleton className='h-14 w-full' />
                <Skeleton className='h-14 w-full' />
            </div>
        ) : (
            <Accordion type="single" collapsible className="w-full">
            {workPrograms?.map((item, index) => (
                <AccordionItem value={item.id} key={item.id} className="animate-in fade-in-50 slide-in-from-bottom-5" style={{animationDelay: `${index * 100}ms`}}>
                    <AccordionTrigger className='text-lg font-semibold hover:no-underline'>
                        <span className='text-left'>{item.division}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className='list-disc pl-5 space-y-2 text-muted-foreground'>
                            {item.programs.map(prog => <li key={prog}>{prog}</li>)}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        )}
    </div>
  );
}
