import { UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbxPjmzY5Q5r8i_wyAgwVxw_t6ojBoWWaiccUlrmvobBpFsYWncCfjZW38UhJc5vwryr/exec';

function makeLocalUser(data: {
  nickname: string;
  school: string;
  grade: string;
  whatsapp?: string;
  ref?: string;
}): UserProfile {
  return {
    id: 'local_' + Date.now().toString(36),
    nickname: data.nickname,
    school: data.school,
    grade: data.grade,
    whatsapp: data.whatsapp,
    ref: data.ref,
    registeredAt: new Date().toISOString(),
    isPaid: false,
  };
}

export const api = {
  async register(data: {
    nickname: string;
    school: string;
    grade: string;
    whatsapp?: string;
    ref?: string;
  }): Promise<UserProfile> {
    if (!API_BASE) return makeLocalUser(data);

    try {
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
      console.warn('API unavailable, using local mode:', err);
      return makeLocalUser(data);
    }
  },

  /**
   * Recover an orphaned local user (id starts with `local_`) by re-registering
   * them on the server. Returns the new server-side user with a `u_xxx` id,
   * or null if recovery failed (network error, etc).
   */
  async recoverLocalUser(localUser: UserProfile): Promise<UserProfile | null> {
    if (!API_BASE) return null;
    if (!localUser.id.startsWith('local_')) return null;

    try {
      const params = new URLSearchParams({
        action: 'register',
        nickname: localUser.nickname,
        school: localUser.school,
        grade: localUser.grade,
        whatsapp: localUser.whatsapp || '',
        ref: (localUser.ref || '') + '_recovered',
      });
      const url = `${API_BASE}?${params.toString()}`;
      const res = await fetch(url, { redirect: 'follow' });
      const text = await res.text();
      const result = JSON.parse(text);
      if (result.success && result.user) {
        return result.user as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('Recovery failed, will retry next time:', err);
      return null;
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
