
export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  income: string;
  occupation: string;
  disability: boolean;
}

export interface UserProfile {
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  occupation?: string;
  income?: string;
  category?: 'General' | 'SC' | 'ST' | 'OBC';
  location?: string;
  district?: string;
  state?: string;
  education?: string;
  disability?: boolean;
  employmentStatus?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  profileCompletion?: number;
  familyMembers?: FamilyMember[];
  citizenPoints?: number;
}

export interface Scheme {
  id: string;
  name: string;
  provider: string; // Central / State
  description: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  applyLink: string;
  tags: string[];
}

export interface ComparisonData {
  schemeA: Scheme;
  schemeB: Scheme;
  summary: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isVoice?: boolean;
  groundingUrls?: { title: string; uri: string }[];
}

export enum AppLanguage {
  HINDI = 'Hindi',
  MARATHI = 'Marathi',
  TAMIL = 'Tamil',
  BENGALI = 'Bengali',
  TELUGU = 'Telugu',
  KANNADA = 'Kannada',
  GUJARATI = 'Gujarati',
  MALAYALAM = 'Malayalam',
  PUNJABI = 'Punjabi',
  URDU = 'Urdu',
  ENGLISH = 'English'
}

export type AppView = 'chat' | 'profile' | 'admin' | 'discovery';
