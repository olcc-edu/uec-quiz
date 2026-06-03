import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Phone, Lock, ArrowRight, IdCard, MessageCircle } from 'lucide-react';
import { api } from '../utils/api';
import { storage } from '../utils/storage';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoggedIn: (user: UserProfile) => void;
  onGoRegister: () => void;
}

export function LoginPage({ onLoggedIn, onGoRegister }: LoginPageProps) {
  const [mode, setMode] = useState<'phone' | 'userId'>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) {
      setError('请填写手机号和密码');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const { user, error: err } = await api.loginByPhone(phone.trim(), password);
    setIsSubmitting(false);
    if (user) {
      storage.setUser(user);
      onLoggedIn(user);
    } else {
      setError(err || '登录失败');
    }
  };

  const handleIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdInput.trim()) {
      setError('请输入账号 ID');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const { user, error: err } = await api.loginById(userIdInput.trim());
    setIsSubmitting(false);
    if (user) {
      storage.setUser(user);
      onLoggedIn(user);
    } else {
      setError(err || '登录失败');
    }
  };

  const helpLink = `https://wa.me/60165789873?text=${encodeURIComponent(
    '你好，我忘了 UEC 刷题宝的登录密码，请协助重置。',
  )}`;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 mx-auto mb-4">
            <GraduationCap size={36} />
          </div>
          <h1 className="text-2xl font-black text-zinc-800">UEC 刷题宝</h1>
          <p className="text-sm text-zinc-500 mt-1">登录你的账号继续刷题</p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
          {/* Tabs */}
          <div className="flex bg-zinc-100 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('phone');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'phone' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500'
              }`}
            >
              手机号登录
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('userId');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'userId' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500'
              }`}
            >
              账号 ID 找回
            </button>
          </div>

          {mode === 'phone' ? (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <Field
                icon={<Phone size={16} />}
                label="手机号 (WhatsApp)"
                placeholder="例如 0123456789"
                type="tel"
                value={phone}
                onChange={setPhone}
                inputMode="tel"
              />
              <Field
                icon={<Lock size={16} />}
                label="密码"
                placeholder="至少 4 位"
                type="password"
                value={password}
                onChange={setPassword}
              />
              {error && (
                <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
              >
                {isSubmitting ? '登录中...' : (<>登录 <ArrowRight size={18} /></>)}
              </button>
              <p className="text-[11px] text-zinc-400 text-center">
                老用户首次登录的默认密码是 <span className="font-mono font-bold text-zinc-600">1234</span>，
                登录后会被要求改密码
              </p>
            </form>
          ) : (
            <form onSubmit={handleIdLogin} className="space-y-4">
              <Field
                icon={<IdCard size={16} />}
                label="账号 ID"
                placeholder="u_xxxxxxxxxxxx"
                value={userIdInput}
                onChange={setUserIdInput}
                mono
              />
              {error && (
                <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
              >
                {isSubmitting ? '登录中...' : (<>用 ID 登录 <ArrowRight size={18} /></>)}
              </button>
              <p className="text-[11px] text-zinc-400 text-center">
                如果你之前截图保存了 u_ 开头的账号 ID，可以用它直接找回账号
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 space-y-3 text-center">
          <button
            onClick={onGoRegister}
            className="text-sm text-emerald-600 font-medium hover:underline"
          >
            还没账号？立即注册 →
          </button>
          <a
            href={helpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-600"
          >
            <MessageCircle size={12} />
            忘了密码？联系客服
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  inputMode,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: 'tel' | 'text';
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-zinc-500 flex items-center gap-1.5 mb-1.5">
        <span className="text-zinc-400">{icon}</span>
        {label}
      </span>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm ${
          mono ? 'font-mono' : ''
        }`}
      />
    </label>
  );
}
