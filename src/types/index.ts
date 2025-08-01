export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  weight: number;
  weightUnit?: 'lbs' | 'kg';
  ownerId: string;
  owner?: Owner;
  assignedDoctor?: string;
  status: 'active' | 'inactive';
  handlingDifficulty?: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  visitDate: string;
  recordType: 'vaccine' | 'surgery' | 'treatment' | 'dental';
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  veterinarian: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: ('veterinarian' | 'staff' | 'admin')[];
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface DashboardStats {
  totalPatients: number;
  totalOwners: number;
  todayAppointments: number;
  recentRecords: MedicalRecord[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  date: string;
  time: string;
  duration: number; // in minutes
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  veterinarian: string;
  createdAt: string;
}