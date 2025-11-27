'use client';

import * as React from 'react';
import { Upload, Sparkles, Loader2, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateNotulenAction } from '@/app/actions';

export function AINotulenGenerator() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [minutes, setMinutes] = React.useState('');
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please upload an audio file first.',
      });
      return;
    }

    setIsLoading(true);
    setMinutes('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const audioDataUri = reader.result as string;
      const result = await generateNotulenAction({ audioDataUri });

      if (result.success && result.data) {
        setMinutes(result.data.minutes);
        toast({
            title: 'Minutes Generated',
            description: 'Draft meeting minutes have been created successfully.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Generating Minutes',
          description: result.error,
        });
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Notulen Generator</CardTitle>
        <CardDescription>Upload an audio recording of a meeting to automatically generate draft minutes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Audio File
            </Button>
            {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !file}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Minutes
        </Button>
        
        {minutes && (
          <div className="space-y-2 pt-4">
            <h3 className="flex items-center gap-2 font-semibold"><Bot className="h-5 w-5"/> Generated Draft Minutes</h3>
            <Textarea
              value={minutes}
              readOnly
              rows={15}
              className="font-code"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
