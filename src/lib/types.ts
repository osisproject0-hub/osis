export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  position: UserPosition;
  divisionId?: string;
  divisionName: string;
  accessLevel: number;
  password?: string;
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
  id: string;
  title: string;
  description: string;
  assignedToUID: string;
  assignedByName: string;
  divisionId?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
