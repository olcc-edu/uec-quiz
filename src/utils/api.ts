import { QuizResult, UserProfile } from '../types';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://script.google.com/macros/s/AKfycbxPjmzY5Q5r8i_wyAgwVxw_t6ojBoWWaiccUlrmvobBpFsYWncCfjZW38UhJc5vwryr/exec';

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
    passwordChangeRequired: false,
  };
}

async function callApi(action: string, params: Record<string, string>): Promise<any> {
  const search = new URLSearchParams({ action, ...params });
  const url = `${API_BASE}?${search.toString()}`;
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  return JSON.parse(text);
}

export const api = {
  async register(data: {
    nickname: string;
    school: string;
    grade: string;
    whatsapp: string;
    password: string;
    ref?: string;
  }): Promise<{ user?: UserProfile; error?: string }> {
    if (!API_BASE) return { user: makeLocalUser(data) };
    try {
      const result = await callApi('register', {
        nickname: data.nickname,
        school: data.school,
        grade: data.grade,
        whatsapp: data.whatsapp,
        password: data.password,
        ref: data.ref || '',
      });
      if (result.success) return { user: result.user as UserProfile };
      return { error: result.error || '注册失败' };
    } catch (err) {
      console.warn('Register API unavailable, falling back to local mode:', err);
      return { user: makeLocalUser(data) };
    }
  },

  async loginByPhone(phone: string, password: string): Promise<{ user?: UserProfile; error?: string }> {
    try {
      const result = await callApi('loginByPhone', { phone, password });
      if (result.success) return { user: result.user as UserProfile };
      return { error: result.error || '登录失败' };
    } catch (err) {
      return { error: '网络错误，请稍后重试' };
    }
  },

  async loginById(userId: string): Promise<{ user?: UserProfile; error?: string }> {
    try {
      const result = await callApi('loginById', { userId });
      if (result.success) return { user: result.user as UserProfile };
      return { error: result.error || '登录失败' };
    } catch (err) {
      return { error: '网络错误，请稍后重试' };
    }
  },

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ ok?: boolean; error?: string }> {
    try {
      const result = await callApi('changePassword', {
        userId,
        oldPassword,
        newPassword,
      });
      if (result.success) return { ok: true };
      return { error: result.error || '修改密码失败' };
    } catch (err) {
      return { error: '网络错误，请稍后重试' };
    }
  },

  async recoverLocalUser(localUser: UserProfile): Promise<UserProfile | null> {
    if (!API_BASE) return null;
    if (!localUser.id.startsWith('local_')) return null;
    // 本地用户没有密码，无法走 register 流程恢复，需要联系客服处理
    return null;
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

  async refreshUser(userId: string): Promise<UserProfile | null> {
    if (!API_BASE) return null;
    try {
      const result = await callApi('checkStatus', { userId });
      if (result.success && result.user) return result.user as UserProfile;
      return null;
    } catch {
      return null;
    }
  },

  async saveHistory(userId: string, result: QuizResult): Promise<void> {
    if (!userId || userId.startsWith('local_')) return;
    try {
      await callApi('saveHistory', {
        userId,
        date: result.date,
        level: result.level,
        subject: result.subject,
        chapter: result.chapter,
        score: String(result.score),
        total: String(result.total),
      });
    } catch (err) {
      console.warn('Failed to sync history to server:', err);
    }
  },

  async adminResetPassword(
    adminPassword: string,
    query: string,
  ): Promise<{ user?: { id: string; nickname: string; phoneNormalized: string }; error?: string }> {
    try {
      const result = await callApi('adminResetPassword', {
        password: adminPassword,
        query,
      });
      if (result.success) return { user: result.user };
      return { error: result.error || '重置失败' };
    } catch (err) {
      return { error: '网络错误，请稍后重试' };
    }
  },

  async getHistory(userId: string): Promise<QuizResult[] | null> {
    if (!userId || userId.startsWith('local_')) return null;
    try {
      const result = await callApi('getHistory', { userId });
      if (result.success && Array.isArray(result.history)) {
        return result.history as QuizResult[];
      }
      return null;
    } catch {
      return null;
    }
  },
};
