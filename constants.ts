import { Apartment, Area, Task, Frequency, User } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Owner', avatar: 'https://picsum.photos/100/100' },
  { id: 'u2', name: 'Cleaner', avatar: 'https://picsum.photos/101/101' },
];

export const INITIAL_APARTMENTS: Apartment[] = [
  { id: 'apt1', name: 'Main Residence', address: '123 Main St' },
  { id: 'apt2', name: 'Rental Unit', address: '456 Ocean Dr' },
];

export const INITIAL_AREAS: Area[] = [
  // Apt 1
  { id: 'a1', name: 'Kitchen', icon: 'fa-utensils', apartmentId: 'apt1' },
  { id: 'a2', name: 'Living Room', icon: 'fa-couch', apartmentId: 'apt1' },
  { id: 'a3', name: 'Master Bathroom', icon: 'fa-bath', apartmentId: 'apt1' },
  { id: 'a4', name: 'Master Bedroom', icon: 'fa-bed', apartmentId: 'apt1' },
  // Apt 2
  { id: 'a5', name: 'Kitchenette', icon: 'fa-utensils', apartmentId: 'apt2' },
  { id: 'a6', name: 'Bathroom', icon: 'fa-bath', apartmentId: 'apt2' },
];

const today = new Date().toISOString();

export const INITIAL_TASKS: Task[] = [
  // Kitchen Apt 1
  {
    id: 't1',
    title: 'Clean Countertops',
    frequency: Frequency.DAILY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a1',
  },
  {
    id: 't2',
    title: 'Mop Floors',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a1',
  },
  {
    id: 't3',
    title: 'Clean Fridge Interior',
    frequency: Frequency.MONTHLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a1',
  },
  {
    id: 't4',
    title: 'Degrease Oven',
    frequency: Frequency.QUARTERLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a1',
  },
  // Living Room Apt 1
  {
    id: 't5',
    title: 'Vacuum Carpet',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a2',
  },
  {
    id: 't6',
    title: 'Dust Shelves',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a2',
  },
  // Bathroom Apt 1
  {
    id: 't7',
    title: 'Scrub Toilet',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a3',
  },
  {
    id: 't8',
    title: 'Clean Mirror',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a3',
  },
  // Apt 2 tasks
  {
    id: 't9',
    title: 'Full Clean',
    frequency: Frequency.WEEKLY,
    lastCompletedDate: null,
    nextDueDate: today,
    areaId: 'a5',
  },
];