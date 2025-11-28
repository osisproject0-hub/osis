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
  assignedByUID: string;
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
  requestedBy: string; // UID of the user
  requestedByName: string;
  createdAt: Timestamp;
}

export interface FinancialReport {
    id?: string;
    date: string; // Using ISO string for date
    description: string;
    type: 'Pemasukan' | 'Pengeluaran';
    amount: number;
    recordedBy: string; // UID of the user
    recordedByName: string;
}

export interface Division {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface WorkProgram {
  id: string;
  division: string;
  programs: string[];
  order: number;
}

export interface GalleryImage {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
    order: number;
}

export interface Candidate {
    id: string;
    name: string;
    vision: string;
    mission: string;
    photoURL: string;
    photoHint: string;
    voteCount: number;
    order: number;
}

export interface Vote {
    id?: string;
    voterId: string;
    candidateId: string;
    votedAt: Timestamp;
}

export interface Election {
    id?: string;
    title: string;
    isActive: boolean;
    startDate?: Timestamp;
    endDate?: Timestamp;
}
