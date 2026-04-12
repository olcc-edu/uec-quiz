import { UserProfile } from '../types';

// User will replace this with their deployed Apps Script URL
const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  async register(data: {
    nickname: string;
    school: string;
    grade: string;
    whatsapp?: string;
    ref?: string;
  }): Promise<UserProfile> {
    if (!API_BASE) {
      // Offline mode: create local-only user
      const user: UserProfile = {
        id: 'local_' + Date.now().toString(36),
        nickname: data.nickname,
        school: data.school,
        grade: data.grade,
        whatsapp: data.whatsapp,
        ref: data.ref,
        registeredAt: new Date().toISOString(),
        isPaid: false,
      };
      return user;
    }

    try {
      // Use GET request with redirect follow for Apps Script
      const params = new URLSearchParams({
        action: 'register',
        nickname: data.nickname,
        school: data.school,
        grade: data.grade,
        whatsapp: data.whatsapp || '',
        ref: data.ref || '',
      });
      const url = `${API_BASE}?${params.toString()}`;
      const res = await fetch(url, { redirect: 'follow' });
      const text = await res.text();
      const result = JSON.parse(text);
      if (result.success) {
        return result.user as UserProfile;
      }
      throw new Error(result.error || 'Registration failed');
    } catch (err) {
      // Fallback to local if API fails
      console.warn('API unavailable, using local mode:', err);
      const user: UserProfile = {
        id: 'local_' + Date.now().toString(36),
        nickname: data.nickname,
        school: data.school,
        grade: data.grade,
        whatsapp: data.whatsapp,
        ref: data.ref,
        registeredAt: new Date().toISOString(),
        isPaid: false,
      };
      return user;
    }
  },

  async checkPaidStatus(userId: string): Promise<boolean> {
    if (!API_BASE) return false;
    try {
      const res = await fetch(`${API_BASE}?action=checkStatus&userId=${encodeURIComponent(userId)}`);
      const result = await res.json();
      return result.isPaid === true;
    } catch {
      return false;
    }
  },
};
