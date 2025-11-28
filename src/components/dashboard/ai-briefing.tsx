'use client';

import * as React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { AIBriefingForKetuaInput } from '@/ai/flows/ai-briefing-for-ketua';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function AIBriefing() {
  const [briefing, setBriefing] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleGenerateBriefing = async () => {
    setIsLoading(true);
    setBriefing(null);

    const mockInput: AIBriefingForKetuaInput = {
      pendingApprovals: '3 pengajuan dana (Event 17 Agustus, Lomba Catur, Seminar IT) dan 1 proposal kegiatan (Bakti Sosial).',
      divisionProgress: 'Divisi Olahraga: 80% persiapan Porseni. Divisi Humas: 50% publikasi seminar. Divisi Keagamaan: 90% persiapan Idul Adha.',
      sentimentAnalysis: 'Sentimen netral cenderung positif. Terdapat beberapa keluhan minor mengenai jadwal ekstrakurikuler yang bentrok.',
    };

    try {
      const response = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockInput),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success && result.data) {
        setBriefing(result.data.briefing);
      } else {
        throw new Error(result.error || 'Failed to parse briefing from response.');
      }
    } catch(error: any) {
        console.error("Briefing generation failed:", error);
        toast({
            variant: 'destructive',
            title: 'Error Generating Briefing',
            description: 'Failed to generate briefing.',
        });
    }

    setIsLoading(false);
  };
  
  React.useEffect(() => {
    handleGenerateBriefing();
  }, [])

  return (
    <Card className="bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="font-headline text-2xl">AI Daily Briefing</CardTitle>
            <CardDescription>Ringkasan otomatis untuk hari ini.</CardDescription>
          </div>
        </div>
        <Button onClick={handleGenerateBriefing} disabled={isLoading} size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <BriefingSkeleton />}
        {briefing && !isLoading && (
            <div className="prose prose-sm max-w-none text-foreground animate-in fade-in-50">
              <p>{briefing}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

function BriefingSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    )
}
