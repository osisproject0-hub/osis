'use client';

import { useCollection, useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { User as UserType } from '@/lib/types';

export default function MembersPage() {
  const { user: currentUser } = useUser();
  const { data: members, loading } = useCollection<UserType>('users');

  if (!currentUser || currentUser.accessLevel < 9) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Akses Ditolak</AlertTitle>
        <AlertDescription>
          Anda tidak memiliki izin untuk melihat halaman ini. Silakan hubungi administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl md:text-4xl">Manajemen Anggota</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Anggota OSIS</CardTitle>
          <CardDescription>
            Berikut adalah daftar semua anggota OSIS beserta posisi dan divisi mereka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead>Tingkat Akses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.sort((a, b) => b.accessLevel - a.accessLevel).map((member) => (
                  <TableRow key={member.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {member.photoURL && (
                          <Image
                            src={member.photoURL}
                            alt={member.name || 'Avatar'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.divisionName}</Badge>
                    </TableCell>
                    <TableCell>
                        {member.accessLevel}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
