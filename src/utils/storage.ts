import { Question, QuizResult, UserProfile, DailyUsage } from '../types';

const KEYS = {
  QUESTIONS: 'uec_questions',
  HISTORY: 'uec_history',
  VERSION: 'uec_version',
  USER: 'uec_user',
  DAILY_USAGE: 'uec_daily_usage',
  REF: 'uec_ref',
} as const;

export const storage = {
  // Questions
  getQuestions(): Question[] {
    const saved = localStorage.getItem(KEYS.QUESTIONS);
    return saved ? JSON.parse(saved) : [];
  },
  setQuestions(questions: Question[]) {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },
  getVersion(): string | null {
    return localStorage.getItem(KEYS.VERSION);
  },
  setVersion(v: string) {
    localStorage.setItem(KEYS.VERSION, v);
  },

  // History
  getHistory(): QuizResult[] {
    const saved = localStorage.getItem(KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  },
  setHistory(history: QuizResult[]) {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  },
  clearHistory() {
    localStorage.removeItem(KEYS.HISTORY);
  },

  // User
  getUser(): UserProfile | null {
    const saved = localStorage.getItem(KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  },
  setUser(user: UserProfile) {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem(KEYS.USER);
  },

  // Daily Usage (free tier)
  getDailyUsage(): DailyUsage {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(KEYS.DAILY_USAGE);
    if (saved) {
      const usage: DailyUsage = JSON.parse(saved);
      if (usage.date === today) return usage;
    }
    return { date: today, chaptersUsed: [] };
  },
  addChapterUsage(chapterKey: string) {
    const usage = this.getDailyUsage();
    if (!usage.chaptersUsed.includes(chapterKey)) {
      usage.chaptersUsed.push(chapterKey);
    }
    localStorage.setItem(KEYS.DAILY_USAGE, JSON.stringify(usage));
  },
  canUseChapter(chapterKey: string, isPaid: boolean): boolean {
    if (isPaid) return true;
    const usage = this.getDailyUsage();
    // Free users: 1 chapter per day, OR the chapter they already started
    return usage.chaptersUsed.length === 0 || usage.chaptersUsed.includes(chapterKey);
  },

  // Referral tracking
  getRef(): string | null {
    return localStorage.getItem(KEYS.REF);
  },
  setRef(ref: string) {
    localStorage.setItem(KEYS.REF, ref);
  },
};
