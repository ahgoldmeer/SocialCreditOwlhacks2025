import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SCHOOL_OPTIONS = [
  { value: 'temple', label: 'Temple University', colors: ['temple-red'] },
  { value: 'lasalle', label: 'La Salle University', colors: ['lasalle-blue', 'lasalle-gold'] },
  { value: 'upenn', label: 'University of Pennsylvania', colors: ['upenn-blue', 'upenn-red'] },
  { value: 'drexel', label: 'Drexel University', colors: ['drexel-navy', 'drexel-yellow'] },
  { value: 'cccp', label: 'Community College of Philadelphia', colors: ['cccp-green'] },
];

export type SchoolId = typeof SCHOOL_OPTIONS[number]['value'];
