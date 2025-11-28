'use client';
import * as React from 'react';
import type { Candidate, Election } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Play, Square, BarChart2 } from 'lucide-react';
import { AdminCandidatesTable } from './admin-candidates-table';
import { AddCandidateDialog } from './add-candidate-dialog';
import { useFirestore, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface AdminEvotingPanelProps {
    candidates: Candidate[];
    election: Election | null;
    isLoading: boolean;
}

export function AdminEvotingPanel({ candidates, election, isLoading }: AdminEvotingPanelProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isAddCandidateOpen, setAddCandidateOpen] = React.useState(false);
    
    const handleToggleElection = async () => {
        if (!firestore) return;
        const electionRef = doc(firestore, 'election', 'main-election');
        const newStatus = !election?.isActive;
        
        try {
            if (election) {
                updateDocumentNonBlocking(electionRef, { isActive: newStatus });
            } else {
                // If no election doc exists, create one
                setDocumentNonBlocking(electionRef, {
                    title: 'Pemilihan Ketua OSIS',
                    isActive: newStatus,
                }, {});
            }
            toast({
                title: `Pemilihan ${newStatus ? 'Dimulai' : 'Dihentikan'}`,
                description: `Status pemungutan suara telah diperbarui.`,
            });
        } catch (error) {
            console.error("Error toggling election state:", error);
            toast({
                variant: 'destructive',
                title: 'Gagal Mengubah Status',
                description: 'Terjadi kesalahan saat memperbarui status pemilihan.',
            });
        }
    };
    
    const totalVotes = React.useMemo(() => {
        return candidates.reduce((acc, c) => acc + (c.voteCount || 0), 0);
    }, [candidates]);

    return (
        <>
            <div className="grid gap-6">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Kontrol Pemilihan</CardTitle>
                            <CardDescription>Mulai atau hentikan proses pemungutan suara.</CardDescription>
                        </div>
                        <Button onClick={handleToggleElection} variant={election?.isActive ? 'destructive' : 'default'}>
                            {election?.isActive ? <Square className="mr-2"/> : <Play className="mr-2"/>}
                            {election?.isActive ? 'Hentikan Pemilihan' : 'Mulai Pemilihan'}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <p>Status Saat Ini: <span className={`font-bold ${election?.isActive ? 'text-green-600' : 'text-red-600'}`}>{election?.isActive ? 'AKTIF' : 'TIDAK AKTIF'}</span></p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><BarChart2/> Hasil Suara Langsung</CardTitle>
                         <CardDescription>Total Suara Masuk: <strong>{totalVotes}</strong></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {candidates.sort((a,b) => b.voteCount - a.voteCount).map(candidate => {
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
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Manajemen Kandidat</CardTitle>
                            <CardDescription>Tambah, edit, atau hapus data kandidat pemilihan.</CardDescription>
                        </div>
                        <Button onClick={() => setAddCandidateOpen(true)}>
                            <PlusCircle className="mr-2" />
                            Tambah Kandidat
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <AdminCandidatesTable candidates={candidates || []} isLoading={isLoading} />
                    </CardContent>
                </Card>
            </div>
            <AddCandidateDialog isOpen={isAddCandidateOpen} setIsOpen={setAddCandidateOpen} />
        </>
    );
}
