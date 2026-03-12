import { Apartment, Area, Task, Frequency, User } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Owner', avatar: 'https://picsum.photos/100/100' },
  { id: 'u2', name: 'Cleaner', avatar: 'https://picsum.photos/101/101' },
];

export const INITIAL_APARTMENTS: Apartment[] = [
  { id: 'apt1', name: 'Residencia Principal', address: '123 Main St' },
  { id: 'apt2', name: 'Unidad de Alquiler', address: '456 Ocean Dr' },
];

export const INITIAL_AREAS: Area[] = [
  // Apt 1
  { id: 'a1', name: 'Cocina', icon: 'fa-utensils', apartmentId: 'apt1' },
  { id: 'a2', name: 'Sala de Estar', icon: 'fa-couch', apartmentId: 'apt1' },
  { id: 'a3', name: 'Baño Principal', icon: 'fa-bath', apartmentId: 'apt1' },
  { id: 'a4', name: 'Dormitorio Principal', icon: 'fa-bed', apartmentId: 'apt1' },
  // Apt 2
  { id: 'a5', name: 'Cocineta', icon: 'fa-utensils', apartmentId: 'apt2' },
  { id: 'a6', name: 'Baño', icon: 'fa-bath', apartmentId: 'apt2' },
];

const today = new Date().toISOString();

export const INITIAL_TASKS: Task[] = [
  // Kitchen Apt 1
  {
    id: 't1',
    title: 'Limpiar Encimeras',
    frequency: Frequency.DAILY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a1',
  },
  {
    id: 't2',
    title: 'Trapear Pisos',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a1',
  },
  {
    id: 't3',
    title: 'Limpiar Interior del Refrigerador',
    frequency: Frequency.MONTHLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a1',
  },
  {
    id: 't4',
    title: 'Desengrasar Horno',
    frequency: Frequency.QUARTERLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a1',
  },
  // Living Room Apt 1
  {
    id: 't5',
    title: 'Aspirar Alfombra',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a2',
  },
  {
    id: 't6',
    title: 'Desempolvar Estantes',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a2',
  },
  // Bathroom Apt 1
  {
    id: 't7',
    title: 'Lavar Inodoro',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a3',
  },
  {
    id: 't8',
    title: 'Limpiar Espejo',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a3',
  },
  // Apt 2 tasks
  {
    id: 't9',
    title: 'Limpieza Completa',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a5',
  },
];