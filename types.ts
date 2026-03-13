export type Language = 'en' | 'es';

export enum Frequency {
  DAILY = 'Diario',
  WEEKLY = 'Semanal',
  BIWEEKLY = 'Quincenal',
  MONTHLY = 'Mensual',
  QUARTERLY = 'Trimestral'
}

export enum TaskStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue'
}

export interface Profile {
  id: string;
  email: string;
  name: string;
}

export interface ApartmentUser {
  id: string;
  apartmentId: string;
  email: string;
  userId?: string;
  status: 'pending' | 'accepted';
  profile?: Profile;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  frequency: Frequency;
  lastCompletedDate: string | null; // ISO Date string
  nextDueDate: string; // ISO Date string
  assignedTo?: string; // profile ID
  areaId: string;
}

export interface Area {
  id: string;
  name: string;
  icon: string; // FontAwesome icon class
  apartmentId: string;
}

export interface Apartment {
  id: string;
  name: string;
  address?: string;
  ownerId?: string;
  cleaningFrequency?: Frequency;
}

export interface AppState {
  apartments: Apartment[];
  areas: Area[];
  tasks: Task[];
  apartmentUsers: ApartmentUser[];
  profiles: Profile[];
  currentUser: Profile | null;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}