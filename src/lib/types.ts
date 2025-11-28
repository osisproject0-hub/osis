import { DocumentReference, Timestamp } from "firebase/firestore";
import { z } from 'zod';

export interface User {
  id?: string; // Firestore document ID
  uid: string;
  email: string | null;
  name: string;
  photoURL: string | null;
  position: string;
  divisionId?: string;
  divisionName: string;
  accessLevel: number;
}

// This is no longer a strict type, as positions are now dynamically managed.
// It remains here as a reference to the kinds of positions that might exist.
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

export interface News {
    id?: string;
    title: string;
    slug: string;
    content: string;
    imageUrl: string;
    imageHint?: string;
    authorName: string;
    authorId: string;
    createdAt: Timestamp | string;
    updatedAt: Timestamp | string;
}

// AI Flow Types
export const AiNotulenForSecretariesInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio recording of the meeting, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiNotulenForSecretariesInput = z.infer<typeof AiNotulenForSecretariesInputSchema>;

export const AiNotulenForSecretariesOutputSchema = z.object({
  minutes: z
    .string()
    .describe('The draft meeting minutes generated from the audio recording.'),
});
export type AiNotulenForSecretariesOutput = z.infer<typeof AiNotulenForSecretariesOutputSchema>;

export const AiSuratResmiForSecretariesInputSchema = z.object({
  recipient: z.string().describe('The recipient of the letter (e.g., "Kepala Sekolah", "Ketua OSIS SMPN 1").'),
  subject: z.string().describe('The subject or title of the letter (e.g., "Permohonan Izin Tempat", "Undangan Rapat").'),
  bodyPoints: z.string().describe('A list of key points or the main message to be included in the letter body. Can be bullet points or a short paragraph.'),
  letterType: z.enum(['invitation', 'request', 'notification']).describe('The type of letter to be generated.'),
});
export type AiSuratResmiForSecretariesInput = z.infer<typeof AiSuratResmiForSecretariesInputSchema>;

export const AiSuratResmiForSecretariesOutputSchema = z.object({
  letter: z
    .string()
    .describe('The complete draft of the official letter, formatted in proper Indonesian, including header, body, and closing.'),
});
export type AiSuratResmiForSecretariesOutput = z.infer<typeof AiSuratResmiForSecretariesOutputSchema>;

export const AIBriefingForKetuaInputSchema = z.object({
  pendingApprovals: z.string().describe('A summary of pending approvals.'),
  divisionProgress: z.string().describe('A summary of division progress.'),
  sentimentAnalysis: z
    .string()
    .describe('A summary of sentiment analysis from public forums.'),
});
export type AIBriefingForKetuaInput = z.infer<typeof AIBriefingForKetuaInputSchema>;

export const AIBriefingForKetuaOutputSchema = z.object({
  briefing: z.string().describe('A comprehensive AI briefing for the Ketua OSIS.'),
});
export type AIBriefingForKetuaOutput = z.infer<typeof AIBriefingForKetuaOutputSchema>;
