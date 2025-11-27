'use client';

import { useUser } from '@/context/user-context';
import { mockUsers } from '@/lib/mock-data';
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
import { ShieldAlert } from 'lucide-react';

export default function MembersPage() {
  const { user } = useUser();

  if (!user || user.accessLevel < 9) {
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
            Berikut adalah daftar semua anggota OSIS beserta posisi dan kata sandi mereka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Kata Sandi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((member) => (
                <TableRow key={member.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={member.photoURL}
                        alt={member.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
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
                    <Badge variant="outline" className="font-code">{member.password}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
