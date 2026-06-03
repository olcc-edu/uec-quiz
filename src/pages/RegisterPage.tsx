import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, User, School, BookOpen, Phone, Lock, ArrowRight, Info, IdCard, Copy, Check } from 'lucide-react';
import { schoolGroups, gradeOptions } from '../data/schools';
import { api } from '../utils/api';
import { storage } from '../utils/storage';
import { UserProfile } from '../types';
import { cn } from '../utils/cn';

interface RegisterPageProps {
  onRegistered: (user: UserProfile) => void;
  onGoLogin: () => void;
}

export function RegisterPage({ onRegistered, onGoLogin }: RegisterPageProps) {
  const [nickname, setNickname] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !school || !grade || !whatsapp.trim() || !password) {
      setError('请填写所有必填信息');
      return;
    }
    if (password.length < 4) {
      setError('密码至少 4 位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const ref = storage.getRef() || undefined;
      const { user, error: err } = await api.register({
        nickname: nickname.trim(),
        school,
        grade,
        whatsapp: whatsapp.trim(),
        password,
        ref,
      });
      if (user) {
        storage.setUser(user);
        setSuccessUser(user);
      } else {
        setError(err || '注册失败');
      }
    } catch {
      setError('注册失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 mx-auto mb-4">
            <GraduationCap size={36} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">UEC 刷题宝</h1>
          <p className="text-zinc-400 text-sm mt-1">统考复习好帮手</p>
        </div>

        {/* Info Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Info size={18} className="text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-700">
            填写真实信息 + 设置密码，下次换设备或清缓存就能用手机号直接登录。
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <User size={14} /> 昵称 <span className="text-red-400">*</span>
              </span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入你的昵称"
              maxLength={20}
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <School size={14} /> 学校 <span className="text-red-400">*</span>
              </span>
            </label>
            <select
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className={cn(
                'w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all',
                !school && 'text-zinc-400',
              )}
            >
              <option value="">选择你的学校</option>
              {schoolGroups.map((group) => (
                <optgroup key={group.state} label={group.state}>
                  {group.schools.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} /> 年级 <span className="text-red-400">*</span>
              </span>
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={cn(
                'w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all',
                !grade && 'text-zinc-400',
              )}
            >
              <option value="">选择你的年级</option>
              {gradeOptions.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> WhatsApp 号码 <span className="text-red-400">*</span>
              </span>
            </label>
            <input
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="例如：0123456789 或 60123456789"
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
            />
            <p className="text-[10px] text-zinc-400 mt-1">用作登录账号 + 客服联系方式</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Lock size={14} /> 设置密码 <span className="text-red-400">*</span>
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 4 位"
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Lock size={14} /> 确认密码 <span className="text-red-400">*</span>
              </span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再输一次"
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 mt-2"
          >
            {isSubmitting ? '注册中...' : (<>注册并开始刷题 <ArrowRight size={18} /></>)}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500 mt-6">
          已有账号？
          <button onClick={onGoLogin} className="text-emerald-600 font-medium hover:underline ml-1">
            去登录
          </button>
        </div>

        <div className="text-center text-xs text-zinc-400 mt-6 space-y-1.5">
          <p className="text-zinc-300">UEC 刷题宝 · 助力每一位统考学子</p>
          <p>
            本 app 由 <span className="font-bold text-emerald-600">毅而山教育中心</span> 赞助
          </p>
          <p>
            补习咨询：<a href="https://wa.me/60107669167" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">010-7669167</a>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {successUser && (
          <SuccessModal
            user={successUser}
            onContinue={() => {
              const u = successUser;
              setSuccessUser(null);
              onRegistered(u);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessModal({ user, onContinue }: { user: UserProfile; onContinue: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check size={28} />
          </div>
          <h3 className="text-xl font-bold">注册成功！</h3>
          <p className="text-emerald-100 text-xs mt-1">这是你的账号 ID，请截图保存</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <IdCard size={11} /> 账号 ID
            </div>
            <div className="font-mono font-bold text-zinc-800 text-sm break-all">{user.id}</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <p className="font-bold mb-1">⚠️ 重要提醒</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>万一忘记密码，可用这个 ID 找回账号</li>
              <li>建议立刻截图保存到相册</li>
              <li>请勿把这个 ID 公开分享给陌生人</li>
            </ul>
          </div>

          <button
            onClick={handleCopy}
            className="w-full bg-zinc-100 text-zinc-700 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (<><Check size={18} className="text-emerald-500" /> 已复制 ID</>) : (<><Copy size={18} /> 复制账号 ID</>)}
          </button>
          <button
            onClick={onContinue}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            我已截图，开始刷题
          </button>
        </div>
      </motion.div>
    </div>
  );
}
