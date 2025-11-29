'use client';

import * as React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateBriefingAction } from '@/app/actions';

export function AIBriefing() {
  const [briefing, setBriefing] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleGenerateBriefing = async () => {
    setIsLoading(true);
    setBriefing(null);

    try {
      // Call the server action directly
      const result = await generateBriefingAction();

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
            description: error.message || 'Failed to generate briefing.',
        });
    }

    setIsLoading(false);
  };
  
  React.useEffect(() => {
    handleGenerateBriefing();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
