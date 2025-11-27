export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
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
  | 'Ketua Divisi Teknologi dan Komunikasi'
  | 'Anggota Divisi Teknologi dan Komunikasi';

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
