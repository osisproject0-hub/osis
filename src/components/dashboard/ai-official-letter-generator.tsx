'use client';

import * as React from 'react';
import { Loader2, Sparkles, Bot, Clipboard, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateSuratResmiAction } from '@/app/actions';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const letterSchema = z.object({
  recipient: z.string().min(3, { message: 'Tujuan surat harus diisi.' }),
  subject: z.string().min(3, { message: 'Perihal surat harus diisi.' }),
  bodyPoints: z.string().min(10, { message: 'Isi surat harus diisi, minimal 10 karakter.' }),
  letterType: z.enum(['invitation', 'request', 'notification'], { required_error: 'Pilih jenis surat.' }),
});

type LetterFormValues = z.infer<typeof letterSchema>;

export function AIOfficialLetterGenerator() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedLetter, setGeneratedLetter] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<LetterFormValues>({
    resolver: zodResolver(letterSchema),
    defaultValues: {
        letterType: 'invitation',
    }
  });
  
  const handleGenerate = async (data: LetterFormValues) => {
    setIsLoading(true);
    setGeneratedLetter('');

    const result = await generateSuratResmiAction(data);

    if (result.success && result.data) {
      setGeneratedLetter(result.data.letter);
      toast({
        title: 'Surat Berhasil Dibuat',
        description: 'Draf surat resmi telah berhasil dibuat oleh AI.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Surat',
        description: result.error,
      });
    }
    setIsLoading(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setIsCopied(true);
    toast({ title: 'Teks disalin ke clipboard!'});
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className='grid md:grid-cols-2 gap-6'>
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Generator Surat Resmi</CardTitle>
                <CardDescription>Isi detail di bawah ini untuk membuat draf surat resmi secara otomatis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleGenerate)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name="letterType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Jenis Surat</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis surat" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="invitation">Undangan</SelectItem>
                                        <SelectItem value="request">Permohonan</SelectItem>
                                        <SelectItem value="notification">Pemberitahuan</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="recipient"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tujuan Surat</FormLabel>
                                    <FormControl><Input placeholder='Contoh: Yth. Kepala Sekolah...' {...field}/></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Perihal</FormLabel>
                                    <FormControl><Input placeholder='Contoh: Undangan Rapat OSIS' {...field}/></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bodyPoints"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Poin-Poin Isi Surat</FormLabel>
                                    <FormControl><Textarea placeholder='Contoh: Mengundang untuk rapat pada hari Sabtu, 10 Agustus 2024, jam 10:00 di Ruang OSIS untuk membahas...' rows={5} {...field}/></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type='submit' disabled={isLoading} className='w-full'>
                            {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Sparkles className="mr-2 h-4 w-4" /> )}
                            Buat Draf Surat
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>Draf Surat Dihasilkan AI</CardTitle>
                <CardDescription>Tinjau, salin, dan gunakan draf surat yang dibuat oleh AI di bawah ini.</CardDescription>
            </CardHeader>
            <CardContent>
                {generatedLetter && (
                    <div className='relative'>
                        <Button size='icon' variant='outline' className='absolute top-2 right-2 h-7 w-7' onClick={copyToClipboard} disabled={isCopied}>
                            {isCopied ? <ClipboardCheck className='h-4 w-4 text-green-600'/> : <Clipboard className='h-4 w-4'/>}
                        </Button>
                        <Textarea
                            value={generatedLetter}
                            readOnly
                            rows={24}
                            className="font-code bg-secondary"
                        />
                    </div>
                )}
                 {!generatedLetter && !isLoading && (
                    <div className='flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg'>
                        <Bot className='h-10 w-10 mb-2'/>
                        <p>Draf surat akan muncul di sini setelah dibuat.</p>
                    </div>
                )}
                {isLoading && (
                     <div className='flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg'>
                        <Loader2 className='h-10 w-10 mb-2 animate-spin'/>
                        <p>AI sedang menulis surat...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
