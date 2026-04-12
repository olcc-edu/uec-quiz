import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, User, School, BookOpen, Phone, ArrowRight, Info } from 'lucide-react';
import { schoolGroups, gradeOptions } from '../data/schools';
import { api } from '../utils/api';
import { storage } from '../utils/storage';
import { UserProfile } from '../types';
import { cn } from '../utils/cn';

interface RegisterPageProps {
  onRegistered: (user: UserProfile) => void;
}

export function RegisterPage({ onRegistered }: RegisterPageProps) {
  const [nickname, setNickname] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !school || !grade) {
      setError('请填写所有必填信息');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const ref = storage.getRef() || undefined;
      const user = await api.register({
        nickname: nickname.trim(),
        school,
        grade,
        whatsapp: whatsapp.trim() || undefined,
        ref,
      });
      storage.setUser(user);
      onRegistered(user);
    } catch (err) {
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
            填写真实信息，系统将匹配适合你的题目，助你高效备考统考！
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
          {/* Nickname */}
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

          {/* School */}
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
                "w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all",
                !school && "text-zinc-400"
              )}
            >
              <option value="">选择你的学校</option>
              {schoolGroups.map(group => (
                <optgroup key={group.state} label={group.state}>
                  {group.schools.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Grade */}
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
                "w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all",
                !grade && "text-zinc-400"
              )}
            >
              <option value="">选择你的年级</option>
              {gradeOptions.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> WhatsApp 号码 <span className="text-zinc-300 text-xs">（选填）</span>
              </span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="例如：60123456789"
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !nickname.trim() || !school || !grade}
            className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 mt-2"
          >
            {isSubmitting ? (
              '注册中...'
            ) : (
              <>开始刷题 <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-300 mt-6">
          UEC 刷题宝 · 助力每一位统考学子
        </p>
      </motion.div>
    </div>
  );
}
