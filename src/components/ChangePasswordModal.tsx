import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';
import { storage } from '../utils/storage';
import { UserProfile } from '../types';

interface ChangePasswordModalProps {
  show: boolean;
  user: UserProfile | null;
  forced: boolean; // true if user MUST change (default 1234), no close button
  onClose: () => void;
  onChanged: (user: UserProfile) => void;
}

export function ChangePasswordModal({ show, user, forced, onClose, onChanged }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 4) {
      setError('新密码至少 4 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次新密码不一致');
      return;
    }
    if (newPassword === '1234' || newPassword === oldPassword) {
      setError('请换一个新的密码');
      return;
    }

    setSubmitting(true);
    setError('');
    const { ok, error: err } = await api.changePassword(user.id, oldPassword, newPassword);
    setSubmitting(false);

    if (ok) {
      const updated: UserProfile = { ...user, passwordChangeRequired: false };
      storage.setUser(updated);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onChanged(updated);
    } else {
      setError(err || '修改失败');
    }
  };

  return (
    <AnimatePresence>
      {show && user && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl max-w-sm w-full shadow-2xl relative"
          >
            {!forced && (
              <button onClick={onClose} className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-500 z-10">
                <X size={20} />
              </button>
            )}

            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-800">修改密码</h3>
                  {forced && (
                    <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                      <AlertTriangle size={12} /> 首次登录必须改密码才能继续使用
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <PasswordField
                  label="当前密码"
                  placeholder={forced ? '默认是 1234' : '输入当前密码'}
                  value={oldPassword}
                  onChange={setOldPassword}
                />
                <PasswordField
                  label="新密码"
                  placeholder="至少 4 位"
                  value={newPassword}
                  onChange={setNewPassword}
                />
                <PasswordField
                  label="确认新密码"
                  placeholder="再输一次"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />

                {error && (
                  <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all"
                >
                  {submitting ? '修改中...' : '确认修改'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-zinc-500 mb-1 block">{label}</span>
      <input
        type="password"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
      />
    </label>
  );
}
