'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useCollection, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, runTransaction, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { Candidate, Election, Vote as VoteType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vote, CheckCircle, BarChart, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function EVotingPage() {
  const { user, authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);

  const candidatesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'candidates'), orderBy('order', 'asc')) : null, [firestore]);
  const { data: candidates, isLoading: candidatesLoading } = useCollection<Candidate>(candidatesQuery);

  const electionRef = useMemoFirebase(() => firestore ? doc(firestore, 'election', 'main-election') : null, [firestore]);
  const { data: election, isLoading: electionLoading } = useDoc<Election>(electionRef);

  const userVoteRef = useMemoFirebase(() => firestore && authUser ? doc(firestore, 'votes', authUser.uid) : null, [firestore, authUser]);
  const { data: userVote, isLoading: voteLoading } = useDoc<VoteType>(userVoteRef);
  
  const isLoading = candidatesLoading || electionLoading || isUserLoading || voteLoading;

  const handleVote = async () => {
    if (!firestore || !authUser || !selectedCandidate) return;

    try {
        await runTransaction(firestore, async (transaction) => {
            const voteRef = doc(firestore, 'votes', authUser.uid);
            const candidateRef = doc(firestore, 'candidates', selectedCandidate.id);
            const userVoteDoc = await transaction.get(voteRef);

            if (userVoteDoc.exists()) {
                throw new Error("Anda sudah memberikan suara.");
            }

            const candidateDoc = await transaction.get(candidateRef);
            if (!candidateDoc.exists()) {
                throw new Error("Kandidat tidak ditemukan.");
            }
            
            const newVoteCount = (candidateDoc.data().voteCount || 0) + 1;
            
            transaction.set(voteRef, {
                voterId: authUser.uid,
                candidateId: selectedCandidate.id,
                votedAt: serverTimestamp(),
            });
            
            transaction.update(candidateRef, { voteCount: newVoteCount });
        });
        
        toast({
            title: "Suara Berhasil Dicatat!",
            description: `Anda telah memilih ${selectedCandidate.name}. Terima kasih atas partisipasi Anda!`,
        });

    } catch (error: any) {
        console.error("Voting failed: ", error);
        toast({
            variant: "destructive",
            title: "Gagal Memberikan Suara",
            description: error.message || "Terjadi kesalahan saat mencatat suara Anda.",
        });
    } finally {
        setSelectedCandidate(null);
    }
  };

  const totalVotes = React.useMemo(() => {
    return candidates?.reduce((acc, c) => acc + c.voteCount, 0) || 0;
  }, [candidates]);

  if (isLoading) {
    return <VotingSkeleton />;
  }

  if (!election) {
     return <MessageScreen icon={XCircle} title="Pemilihan Belum Dikonfigurasi" message="Halaman e-voting belum disiapkan oleh administrator." />;
  }
  
  const hasVoted = !!userVote;
  const isElectionActive = election?.isActive === true;


  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-4 px-4 md:px-8 border-b">
          <div className="container mx-auto flex justify-between items-center">
                <Link href="/portal" className="flex items-center gap-2">
                  <Image src="https://ik.imagekit.io/zco6tu2vm/images%20(1).jpeg?updatedAt=1761836341193" alt="OSIS Logo" width={32} height={32} className="rounded-full object-cover"/>
                  <span className="font-headline text-xl font-bold text-foreground">OSIS SMAKDA</span>
              </Link>
              {authUser && <span className="text-sm text-muted-foreground">Masuk sebagai {authUser.email}</span>}
          </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">{election.title}</h1>
            <p className="text-muted-foreground mt-2">Gunakan hak suara Anda untuk memilih pemimpin masa depan.</p>
        </div>

        {!authUser && (
             <Alert className="max-w-xl mx-auto">
                <Vote className="h-4 w-4" />
                <AlertTitle>Anda Belum Masuk</AlertTitle>
                <AlertDescription>
                    Untuk memberikan suara, Anda harus <Link href="/login" className="font-bold underline text-primary">masuk</Link> terlebih dahulu.
                </AlertDescription>
            </Alert>
        )}

        {authUser && !isElectionActive && (
            <Alert variant="destructive" className="max-w-xl mx-auto">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Pemilihan Ditutup</AlertTitle>
                <AlertDescription>
                    Periode pemungutan suara saat ini tidak aktif.
                </AlertDescription>
            </Alert>
        )}

        {isElectionActive && authUser && hasVoted && (
             <Alert variant="default" className="max-w-xl mx-auto bg-green-50 border-green-200 text-green-800 [&>svg]:text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Terima Kasih!</AlertTitle>
                <AlertDescription>
                    Anda telah berpartisipasi dalam pemilihan ini. Suara Anda telah dicatat.
                </AlertDescription>
            </Alert>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {candidates?.map((candidate) => (
                <Card key={candidate.id} className={`transition-all ${userVote?.candidateId === candidate.id ? 'border-primary shadow-lg' : ''}`}>
                    <CardHeader className="text-center">
                        <Image src={candidate.photoURL} alt={candidate.name} width={120} height={120} className="rounded-full mx-auto border-4 border-secondary object-cover h-32 w-32" data-ai-hint={candidate.photoHint} />
                        <CardTitle className="mt-4 font-headline text-2xl">{candidate.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <h4 className="font-semibold mb-1">Visi</h4>
                         <p className="text-sm text-muted-foreground mb-3">{candidate.vision}</p>
                         <h4 className="font-semibold mb-1">Misi</h4>
                         <p className="text-sm text-muted-foreground">{candidate.mission}</p>
                    </CardContent>
                    <CardFooter>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    className="w-full" 
                                    disabled={!isElectionActive || !authUser || hasVoted} 
                                    onClick={() => setSelectedCandidate(candidate)}
                                >
                                    <Vote className="mr-2" />
                                    {userVote?.candidateId === candidate.id ? 'Pilihan Anda' : 'Pilih Kandidat Ini'}
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Pilihan Anda</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin memilih <strong>{selectedCandidate?.name}</strong>? Pilihan ini tidak dapat diubah setelah dikonfirmasi.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setSelectedCandidate(null)}>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleVote}>Ya, Saya Yakin</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            ))}
        </div>

        {!isElectionActive && (
            <div className="mt-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart/> Hasil Akhir Pemilihan</CardTitle>
                        <CardDescription>Total Suara Masuk: {totalVotes}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {candidates?.sort((a,b) => b.voteCount - a.voteCount).map(candidate => {
                            const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                            return (
                                <div key={candidate.id}>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-semibold">{candidate.name}</span>
                                        <span className="text-muted-foreground">{candidate.voteCount} Suara ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <Progress value={percentage} />
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        )}
      </main>
    </div>
  );
}

function MessageScreen({ icon: Icon, title, message }: { icon: React.ElementType, title: string, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <Icon className="w-16 h-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{message}</p>
            <Link href="/portal" className="mt-4">
                <Button variant="outline">Kembali ke Portal</Button>
            </Link>
        </div>
    )
}

function VotingSkeleton() {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-5 w-3/4 mx-auto mt-2" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {Array.from({length: 3}).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="text-center items-center">
                        <Skeleton className="h-32 w-32 rounded-full" />
                        <Skeleton className="h-8 w-40 mt-4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-20 mt-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    )
}
