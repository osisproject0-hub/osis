import { DocumentReference, Timestamp } from "firebase/firestore";

export interface User {
  id?: string; // Firestore document ID
  uid: string;
  email: string | null;
  name: string;
  photoURL: string | null;
  position: UserPosition;
  divisionId?: string;
  divisionName: string;
  accessLevel: number;
}

export type UserPosition =
  | 'Ketua OSIS'
  | 'Wakil Ketua OSIS'
  | 'Sekretaris 1'
  | 'Sekretaris 2'
  | 'Bendahara 1'
  | 'Bendahara 2'
  | 'Ketua Divisi Keimanan & Ketaqwaan'
  | 'Anggota Divisi Keimanan & Ketaqwaan'
  | 'Ketua Divisi Organisasi & Arganisasi'
  | 'Anggota Divisi Organisasi & Arganisasi'
  | 'Ketua Divisi Kehidupan Berbangsa & Bernegara'
  | 'Anggota Divisi Kehidupan Berbangsa & Bernegara'
  | 'Ketua Divisi Dokumentasi & Kesenian'
  | 'Anggota Divisi Dokumentasi & Kesenian'
  | 'Ketua Divisi Olahraga'
  | 'Anggota Divisi Olahraga'
  | 'Ketua Divisi Hubungan Masyarakat'
  | 'Anggota Divisi Hubungan Masyarakat'
  | 'Ketua Divisi Teknologi & Komunikasi'
  | 'Anggota Divisi Teknologi & Komunikasi'
  | 'Ketua Divisi Keamanan & Ketertiban'
  | 'Anggota Divisi Keamanan & Ketertiban'
  | 'Ketua Divisi Kesehatan'
  | 'Anggota Divisi Kesehatan';

export interface Task {
  id?: string; // Firestore document ID
  title: string;
  description: string;
  assignedToUID: string;
  assignedToName: string;
  assignedByName: string;
  divisionId?: string;
  dueDate: Timestamp | string; // Can be a string when creating, but is a Timestamp from Firestore
  createdAt: Timestamp;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface FundRequest {
  id?: string;
  division: string;
  item: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: DocumentReference<User>;
  requestedByName: string;
  createdAt: Timestamp;
}

export interface FinancialReport {
    id?: string;
    date: Timestamp | string;
    description: string;
    type: 'Pemasukan' | 'Pengeluaran';
    amount: number;
    recordedBy: DocumentReference<User>;
    recordedByName: string;
}