export interface Question {
  id: string;
  level: 'Junior' | 'Senior';
  subject: string;
  chapter: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  level: string;
  subject: string;
  chapter: string;
  score: number;
  total: number;
  date: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  school: string;
  grade: string;
  whatsapp?: string;
  ref?: string; // channel tracking
  registeredAt: string;
  isPaid: boolean;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  chaptersUsed: string[]; // chapter keys like "Junior|科学|光学"
}

export type ViewType = 'register' | 'home' | 'subject' | 'chapter' | 'quiz' | 'admin';
