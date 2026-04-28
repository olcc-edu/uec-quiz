import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, User, School, BookOpen, Phone, IdCard, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountModalProps {
  show: boolean;
  user: UserProfile | null;
  onClose: () => void;
}

export function AccountModal({ show, user, onClose }: AccountModalProps) {
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const accountText =
    `昵称：${user.nickname}\n` +
    `学校：${user.school}\n` +
    `年级：${user.grade}\n` +
    (user.whatsapp ? `WhatsApp：${user.whatsapp}\n` : '') +
    `账号 ID：${user.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = accountText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappMessage = `你好！我想咨询关于 UEC 刷题宝。\n\n我的账号信息：\n${accountText}`;
  const whatsappLink = `https://wa.me/60165789873?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-500"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-zinc-800 mb-1">我的账号</h3>
            <p className="text-xs text-zinc-400 mb-5">联系客服时可点击下方按钮自动带上账号</p>

            <div className="space-y-3 mb-5">
              <InfoRow icon={<User size={16} />} label="昵称" value={user.nickname} />
              <InfoRow icon={<School size={16} />} label="学校" value={user.school} />
              <InfoRow icon={<BookOpen size={16} />} label="年级" value={user.grade} />
              {user.whatsapp && (
                <InfoRow icon={<Phone size={16} />} label="WhatsApp" value={user.whatsapp} />
              )}
              <InfoRow
                icon={<IdCard size={16} />}
                label="账号 ID"
                value={user.id}
                mono
              />
              <InfoRow
                icon={user.isPaid ? <Check size={16} /> : <X size={16} />}
                label="账号状态"
                value={user.isPaid ? '✨ 完整版' : '免费版'}
                highlight={user.isPaid}
              />
            </div>

            {/* 升级提示（仅对免费用户显示） */}
            {!user.isPaid && (
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">升级完整版</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">无限刷题 · 解锁所有章节</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 line-through">RM 19.90</span>
                    <div className="text-lg font-black text-emerald-600 leading-none">
                      RM 9.90
                    </div>
                    <span className="text-[9px] text-amber-600 font-bold">首月特惠</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleCopy}
                className="w-full bg-zinc-100 text-zinc-700 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-emerald-500" /> 已复制
                  </>
                ) : (
                  <>
                    <Copy size={18} /> 复制账号信息
                  </>
                )}
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> WhatsApp 联系客服
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
      <span className="text-zinc-400">{icon}</span>
      <span className="text-xs text-zinc-400 w-20 shrink-0">{label}</span>
      <span
        className={`text-sm flex-1 text-right ${
          highlight ? 'text-emerald-600 font-bold' : 'text-zinc-700'
        } ${mono ? 'font-mono text-xs break-all' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
